import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { enforceRateLimit, rateLimitIdentity } from "@/lib/rateLimit";
import { readJsonBody } from "@/lib/requestBody";

const MODEL = process.env.ANTHROPIC_MODEL;
const MAX_PROMPT_LENGTH = 12_000;
const MAX_SCHEMA_LENGTH = 16_000;

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: auth, error: authError } = await supabase.auth.getUser();
  if (authError || !auth.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const rateLimit = await enforceRateLimit(
    request,
    "llm-invoke",
    rateLimitIdentity(request, auth.user.id),
    10,
    60,
  );
  if (rateLimit) return rateLimit;

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", auth.user.id)
    .maybeSingle();
  if (profileError) {
    console.error("Unable to verify AI access:", profileError.message);
    return NextResponse.json(
      { error: "Unable to verify AI access" },
      { status: 500 },
    );
  }
  if (profile?.is_admin !== true) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!process.env.ANTHROPIC_API_KEY || !MODEL) {
    return NextResponse.json(
      { error: "AI service is not configured" },
      { status: 503 },
    );
  }

  const parsedBody = await readJsonBody(
    request,
    MAX_PROMPT_LENGTH + MAX_SCHEMA_LENGTH + 1024,
  );
  if (!parsedBody.ok) {
    return NextResponse.json(
      { error: parsedBody.error },
      { status: parsedBody.status },
    );
  }
  if (
    !parsedBody.value ||
    typeof parsedBody.value !== "object" ||
    Array.isArray(parsedBody.value)
  ) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  const input = parsedBody.value as {
    prompt?: unknown;
    response_json_schema?: unknown;
    add_context_from_internet?: unknown;
  };

  if (typeof input.prompt !== "string" || !input.prompt.trim()) {
    return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
  }
  if (input.prompt.length > MAX_PROMPT_LENGTH) {
    return NextResponse.json({ error: "Prompt is too long" }, { status: 413 });
  }

  const schemaText = JSON.stringify(input.response_json_schema ?? {});
  if (schemaText.length > MAX_SCHEMA_LENGTH) {
    return NextResponse.json(
      { error: "Response schema is too large" },
      { status: 413 },
    );
  }

  const body: Record<string, unknown> = {
    model: MODEL,
    max_tokens: 2000,
    system:
      "You are a sports analysis assistant. Reply with ONLY a single JSON value, " +
      "no markdown and no commentary, that matches this JSON schema:\n" +
      schemaText,
    messages: [{ role: "user", content: input.prompt }],
  };

  if (input.add_context_from_internet === true) {
    body.tools = [{ type: "web_search_20250305", name: "web_search" }];
  }

  let response: Response;
  try {
    response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(45_000),
    });
  } catch (error) {
    console.error("AI provider request failed:", error);
    return NextResponse.json(
      { error: "AI provider is temporarily unavailable" },
      { status: 502 },
    );
  }

  if (!response.ok) {
    console.error("AI provider returned HTTP", response.status);
    return NextResponse.json(
      { error: `AI provider error (${response.status})` },
      { status: 502 },
    );
  }

  let data: { content?: Array<{ type: string; text?: string }> };
  try {
    data = await response.json();
  } catch {
    return NextResponse.json(
      { error: "AI provider returned an invalid response" },
      { status: 502 },
    );
  }

  const text = (data.content ?? [])
    .map((block) => (block.type === "text" ? block.text ?? "" : ""))
    .join("")
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "");

  try {
    return NextResponse.json(JSON.parse(text));
  } catch {
    return NextResponse.json(
      { error: "Model did not return valid JSON" },
      { status: 502 },
    );
  }
}
