"server-only";

const API_FOOTBALL_BASE = "https://v3.football.api-sports.io";
const REVALIDATE_SECONDS = 60;

export type ApiFootballResponse<T> = {
  response: T;
  errors: unknown;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function apiFootball<T>(
  path: string,
  params: Record<string, string | number> = {},
): Promise<ApiFootballResponse<T>> {
  const apiKey = process.env.API_FOOTBALL_API_KEY;

  if (!apiKey) {
    throw new Error("API_FOOTBALL_API_KEY is not configured");
  }

  const url = new URL(`${API_FOOTBALL_BASE}${path}`);

  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, String(value));
  }

  const response = await fetch(url, {
    headers: {
      "x-apisports-key": apiKey.trim(),
    },
    next: { revalidate: REVALIDATE_SECONDS },
    signal: AbortSignal.timeout(12_000),
  });

  if (!response.ok) {
    throw new Error(`API-Football request failed: ${response.status}`);
  }

  const body: unknown = await response.json();
  if (!isRecord(body) || !("response" in body) || !("errors" in body)) {
    throw new Error("API-Football returned an invalid response");
  }

  const errors = body.errors;
  const hasErrors = Array.isArray(errors)
    ? errors.length > 0
    : isRecord(errors)
      ? Object.keys(errors).length > 0
      : Boolean(errors);
  if (hasErrors) {
    throw new Error("API-Football rejected the request");
  }

  return body as ApiFootballResponse<T>;
}