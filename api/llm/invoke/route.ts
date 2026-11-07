import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Which model to use. The old `model` value sent by the app is ignored.
const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-5-5";

export async function POST(req: NextRequest) {
  // Only signed-in users may spend your API credits
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { prompt, response_json_schema, add_context_from_internet } =
    await req.json();

  if (!prompt || typeof prompt !== "string") {
    return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
  }

  const system =
    "You are a sports analysis assistant. Reply with ONLY a single JSON value, " +
    "no markdown and no commentary, that matches this JSON schema:\n" +
    JSON.stringify(response_json_schema ?? {});

  const body: Record<string, any> = {
    model: MODEL,
    max_tokens: 2000,
    system,
    messages: [{ role: "user", content: prompt }],
  };

  // Lets the model look up current form, injuries, fixtures, etc.
  if (add_context_from_internet) {
    body.tools = [{ type: "web_search_20250305", name: "web_search" }];
  }

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY!,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    return NextResponse.json(
      { error: `LLM provider error (${res.status})` },
      { status: 502 },
    );
  }

  const data = await res.json();
  const text: string = (data.content ?? [])
    .map((b: { type: string; text?: string }) =>
      b.type === "text" ? b.text : "",
    )
    .join("");

  try {
    // Take from the first { or [ in case the model added any preamble
    const start = text.search(/[\[{]/);
    const cleaned = text
      .slice(start)
      .replace(/```json|```/g, "")
      .trim();
    return NextResponse.json(JSON.parse(cleaned));
  } catch {
    return NextResponse.json(
      { error: "Model did not return valid JSON" },
      { status: 502 },
    );
  }
}
