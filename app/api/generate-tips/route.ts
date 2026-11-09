import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  enforceRateLimit,
  rateLimitIdentity,
} from "@/lib/rateLimit";

type Tip = {
  predicted_home: number;
  predicted_away: number;
  outcome: "home" | "draw" | "away";
  confidence: number;
  reasoning: string;
};

function isTip(value: unknown): value is Tip {
  if (!value || typeof value !== "object") return false;
  const tip = value as Partial<Tip>;
  const expectedOutcome =
    tip.predicted_home === tip.predicted_away
      ? "draw"
      : Number(tip.predicted_home) > Number(tip.predicted_away)
        ? "home"
        : "away";

  return (
    Number.isInteger(tip.predicted_home) &&
    Number(tip.predicted_home) >= 0 &&
    Number.isInteger(tip.predicted_away) &&
    Number(tip.predicted_away) >= 0 &&
    tip.outcome === expectedOutcome &&
    Number.isInteger(tip.confidence) &&
    Number(tip.confidence) >= 0 &&
    Number(tip.confidence) <= 100 &&
    typeof tip.reasoning === "string" &&
    tip.reasoning.length <= 1000
  );
}

async function getTip(
  match: {
    competition: string | null;
    home_team: string;
    away_team: string;
    kickoff_at: string;
  },
  model: string,
): Promise<Tip> {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY!,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 400,
      system:
        "You are a sports prediction assistant. Reply with ONLY a JSON object, no markdown, " +
        'with keys: predicted_home (int), predicted_away (int), outcome ("home"|"draw"|"away"), ' +
        "confidence (int 0-100), reasoning (max 2 short sentences). " +
        "The outcome must be consistent with the predicted score.",
      messages: [
        {
          role: "user",
          content:
            `Competition: ${match.competition ?? "unknown"}\n` +
            `Match: ${match.home_team} vs ${match.away_team}\n` +
            `Kickoff: ${match.kickoff_at}\nGive your predicted score.`,
        },
      ],
    }),
    signal: AbortSignal.timeout(45_000),
  });

  if (!response.ok) throw new Error(`AI provider HTTP ${response.status}`);
  const data = await response.json();
  const text = (data.content ?? [])
    .map((block: { type: string; text?: string }) =>
      block.type === "text" ? block.text ?? "" : "",
    )
    .join("")
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "");
  const tip: unknown = JSON.parse(text);
  if (!isTip(tip)) throw new Error("AI provider returned an invalid tip");
  return tip;
}

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const model = process.env.ANTHROPIC_MODEL;

  if (!secret || !supabaseUrl || !serviceRoleKey || !apiKey || !model) {
    return NextResponse.json(
      { error: "Tip generation is not configured" },
      { status: 503 },
    );
  }
  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rateLimit = await enforceRateLimit(
    request,
    "generate-tips",
    rateLimitIdentity(request),
    5,
    60,
  );
  if (rateLimit) return rateLimit;

  const admin = createClient(supabaseUrl, serviceRoleKey);
  const now = new Date();
  const weekAhead = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const { data: matches, error } = await admin
    .from("matches")
    .select("id, competition, home_team, away_team, kickoff_at, ai_tips(id)")
    .eq("status", "scheduled")
    .gt("kickoff_at", now.toISOString())
    .lt("kickoff_at", weekAhead.toISOString())
    .limit(10);

  if (error) {
    console.error("Failed to load scheduled matches:", error.message);
    return NextResponse.json(
      { error: "Unable to load scheduled matches" },
      { status: 500 },
    );
  }

  const todo = (matches ?? []).filter(
    (match) => !match.ai_tips || match.ai_tips.length === 0,
  );
  let created = 0;
  const failed: string[] = [];

  for (const match of todo) {
    try {
      const tip = await getTip(match, model);
      const { error: insertError } = await admin.from("ai_tips").insert({
        match_id: match.id,
        predicted_home: tip.predicted_home,
        predicted_away: tip.predicted_away,
        outcome: tip.outcome,
        confidence: tip.confidence,
        reasoning: tip.reasoning,
        model,
      });
      if (insertError) throw insertError;
      created++;
    } catch (generationError) {
      console.error(`Tip generation failed for match ${match.id}:`, generationError);
      failed.push(String(match.id));
    }
  }

  return NextResponse.json({ checked: todo.length, created, failed });
}
