import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Server-only client with the service role key (never expose this to the browser)
const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-5-5";

type Tip = {
  predicted_home: number;
  predicted_away: number;
  outcome: "home" | "draw" | "away";
  confidence: number;
  reasoning: string;
};

async function getTip(match: {
  competition: string | null;
  home_team: string;
  away_team: string;
  kickoff_at: string;
}): Promise<Tip> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY!,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODEL,
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
            `Kickoff: ${match.kickoff_at}\n` +
            "Give your predicted score.",
        },
      ],
    }),
  });

  if (!res.ok) throw new Error(`Anthropic API ${res.status}`);
  const data = await res.json();
  const text: string = data.content
    .map((b: { type: string; text?: string }) =>
      b.type === "text" ? b.text : "",
    )
    .join("");
  return JSON.parse(text.replace(/```json|```/g, "").trim()) as Tip;
}

export async function GET(req: NextRequest) {
  // Protect the route: call it with  Authorization: Bearer <CRON_SECRET>
  if (
    req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const weekAhead = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  // Upcoming matches in the next 7 days
  const { data: matches, error } = await admin
    .from("matches")
    .select("id, competition, home_team, away_team, kickoff_at, ai_tips(id)")
    .eq("status", "scheduled")
    .gt("kickoff_at", now.toISOString())
    .lt("kickoff_at", weekAhead.toISOString());

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  // Only matches that don't have a tip yet
  const todo = (matches ?? []).filter(
    (m) => !m.ai_tips || m.ai_tips.length === 0,
  );

  let created = 0;
  const failed: number[] = [];

  for (const m of todo) {
    try {
      const tip = await getTip(m);
      const { error: insertError } = await admin.from("ai_tips").insert({
        match_id: m.id,
        predicted_home: tip.predicted_home,
        predicted_away: tip.predicted_away,
        outcome: tip.outcome,
        confidence: tip.confidence,
        reasoning: tip.reasoning,
        model: MODEL,
      });
      if (insertError) throw insertError;
      created++;
    } catch {
      failed.push(m.id);
    }
  }

  return NextResponse.json({ checked: todo.length, created, failed });
}
