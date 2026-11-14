import { NextRequest, NextResponse } from "next/server";
import type { PickRecord } from "@/lib/entityTypes";
import {
  getMembership,
  hasActiveMembership,
  type Membership,
} from "@/lib/membership";
import {
  enforceRateLimit,
  rateLimitIdentity,
} from "@/lib/rateLimit";
import { readBoundedText } from "@/lib/requestBody";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

interface FeedPick extends PickRecord {
  provider_locked: boolean;
  live_status?: string | null;
  minute_label?: string | null;
  live_updated_at?: string | null;
  fixture_id?: number | null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringValue(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function numberValue(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function normalizedStatus(value: string): string {
  switch (value.toLowerCase()) {
    case "won":
    case "win":
    case "success":
      return "Won";
    case "lost":
    case "loss":
      return "Lost";
    case "void":
    case "cancelled":
      return "Void";
    default:
      return "Pending";
  }
}

function readFeedData(value: unknown, key: "picks") {
  if (
    !isRecord(value) ||
    value.message !== "success" ||
    !isRecord(value.data) ||
    !Array.isArray(value.data[key])
  ) {
    throw new Error(`MyBetCode returned an invalid ${key} response`);
  }
  return value.data[key];
}

async function fetchProviderData(
  endpoint: "picks",
  apiKey: string,
) {
  const url = new URL(
    `https://api.mybetcode.com/api/v1/data/${endpoint}`,
  );
  url.searchParams.set("day", "today");
  url.searchParams.set("timezone", "Africa/Lagos");

  const response = await fetch(url, {
    headers: { "X-API-Key": apiKey },
    next: { revalidate: 8 * 60 * 60 },
    signal: AbortSignal.timeout(12_000),
  });
  if (!response.ok) {
    console.error(`MyBetCode ${endpoint} request returned HTTP`, response.status);
    if (response.status === 429) {
      throw new Error(
        "MyBetCode daily or monthly request limit reached. Check API usage or upgrade your plan.",
      );
    }
    if (response.status === 403) {
      throw new Error(
        "MyBetCode denied access. Check that your plan includes the Data Feed and that your API key is active.",
      );
    }
    if (response.status === 401) {
      throw new Error("MyBetCode rejected the API key. Check your server configuration.");
    }
    throw new Error("MyBetCode feed request failed");
  }
  const body = await readBoundedText(response, 2_000_000);
  if (body === null) {
    throw new Error("MyBetCode feed response exceeded the size limit");
  }
  try {
    return JSON.parse(body) as unknown;
  } catch {
    throw new Error("MyBetCode returned invalid JSON");
  }
}

function normalizePick(
  value: unknown,
  canAccess: boolean,
): FeedPick | null {
  if (
    !isRecord(value) ||
    (typeof value.id !== "number" && typeof value.id !== "string") ||
    typeof value.home_team !== "string" ||
    typeof value.away_team !== "string" ||
    typeof value.starts_at !== "string" ||
    typeof value.result_status !== "string"
  ) {
    return null;
  }

  const resultStatus = normalizedStatus(value.result_status);
  const providerLocked = value.locked === true;
  const locked =
    providerLocked || (!canAccess && resultStatus === "Pending");
  const live = isRecord(value.live) ? value.live : null;
  const liveStatus = live ? stringValue(live.status) : null;
  const selection = locked
    ? undefined
    : stringValue(value.selection_name) ?? undefined;
  const confidence = locked
    ? undefined
    : numberValue(value.confidence_score) ?? undefined;
  const reasoning = locked
    ? undefined
    : stringValue(value.headline_reason) ?? undefined;
  const risk = stringValue(value.risk_level);

  return {
    id: `mybetcode-${value.id}`,
    sport: stringValue(value.sport) ?? "Football",
    league: stringValue(value.league_name) ?? stringValue(value.sport) ?? "Football",
    home_team: value.home_team,
    away_team: value.away_team,
    kickoff: value.starts_at,
    market: locked ? undefined : stringValue(value.market_name) ?? undefined,
    selection,
    odds: locked
      ? null
      : typeof value.odds === "number" || typeof value.odds === "string"
        ? value.odds
        : null,
    confidence,
    risk_level: risk ? risk[0].toUpperCase() + risk.slice(1).toLowerCase() : undefined,
    reasoning,
    status: resultStatus,
    home_score: live ? numberValue(live.home_score) : null,
    away_score: live ? numberValue(live.away_score) : null,
    provider_locked: locked,
    live_status: liveStatus,
    minute_label: live ? stringValue(live.minute_label) : null,
    live_updated_at: live ? stringValue(live.updated_at) : null,
    fixture_id: numberValue(value.fixture_id),
  };
}

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const rateLimit = await enforceRateLimit(
    request,
    "mybetcode-feed",
    rateLimitIdentity(request, user?.id),
    30,
    60,
  );
  if (rateLimit) return rateLimit;

  let membership: Membership | null = null;
  try {
    membership = user ? await getMembership(user.id) : null;
  } catch {
    return NextResponse.json(
      { error: "Membership service is unavailable" },
      { status: 503, headers: { "Cache-Control": "private, no-store" } },
    );
  }
  const canAccess = hasActiveMembership(membership);

  const myBetCodeApiKey = process.env.MYBETCODE_API_KEY;
  let picks: FeedPick[] = [];
  let picksError: string | null = null;
  let picksAvailable = false;

  if (myBetCodeApiKey) {
    try {
      const picksResponse = await fetchProviderData("picks", myBetCodeApiKey);
      const allPicks = readFeedData(picksResponse, "picks")
        .map((pick) => normalizePick(pick, canAccess))
        .filter((pick): pick is FeedPick => pick !== null);
      let pendingCount = 0;
      picks =
        canAccess && membership?.plan_id === "Pro"
          ? allPicks.filter(
              (pick) => pick.status !== "Pending" || pendingCount++ < 3,
            )
          : allPicks;
      picksAvailable = true;
    } catch (error) {
      console.error("MyBetCode picks feed unavailable:", error);
      picksError =
        error instanceof Error &&
        (error.message.startsWith("MyBetCode daily") ||
          error.message.startsWith("MyBetCode denied") ||
          error.message.startsWith("MyBetCode rejected"))
          ? error.message
          : "AI picks from the configured provider are temporarily unavailable.";
    }
  } else {
    picksError = "AI picks are not configured.";
  }

  if (!picksAvailable) {
    return NextResponse.json(
      {
        error:
          picksError ??
          "AI picks from the configured provider are temporarily unavailable.",
        picksError,
      },
      { status: 502, headers: { "Cache-Control": "private, no-store" } },
    );
  }

  return NextResponse.json(
    {
      picks,
      picksError,
      fetchedAt: new Date().toISOString(),
    },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
