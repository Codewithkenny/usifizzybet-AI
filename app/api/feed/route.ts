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

interface Fixture {
  id: number;
  sport: string;
  league: string;
  home_team: string;
  away_team: string;
  kickoff: string;
  status: string;
  home_score: number | null;
  away_score: number | null;
  minute_label: string | null;
  live_updated_at: string | null;
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

function readFeedData(value: unknown, key: "picks" | "fixtures") {
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
  endpoint: "picks" | "fixtures",
  apiKey: string,
) {
  const url = new URL(
    `https://api.mybetcode.com/api/v1/data/${endpoint}`,
  );
  url.searchParams.set("day", "today");
  url.searchParams.set("timezone", "Africa/Lagos");

  const response = await fetch(url, {
    headers: { "X-API-Key": apiKey },
    next: { revalidate: 45 },
    signal: AbortSignal.timeout(12_000),
  });
  if (!response.ok) {
    console.error(`MyBetCode ${endpoint} request returned HTTP`, response.status);
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

function normalizeFixture(value: unknown): Fixture | null {
  if (
    !isRecord(value) ||
    typeof value.id !== "number" ||
    typeof value.home_team !== "string" ||
    typeof value.away_team !== "string" ||
    typeof value.starts_at !== "string" ||
    typeof value.status !== "string"
  ) {
    return null;
  }

  return {
    id: value.id,
    sport: stringValue(value.sport) ?? "Football",
    league: stringValue(value.league_name) ?? stringValue(value.sport) ?? "Football",
    home_team: value.home_team,
    away_team: value.away_team,
    kickoff: value.starts_at,
    status: value.status,
    home_score: numberValue(value.home_score),
    away_score: numberValue(value.away_score),
    minute_label: stringValue(value.minute_label),
    live_updated_at: stringValue(value.live_updated_at),
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

  const apiKey = process.env.MYBETCODE_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "MyBetCode feed is not configured" },
      { status: 503, headers: { "Cache-Control": "private, no-store" } },
    );
  }

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

  try {
    const [picksResponse, fixturesResponse] = await Promise.all([
      fetchProviderData("picks", apiKey),
      fetchProviderData("fixtures", apiKey),
    ]);
    const allPicks = readFeedData(picksResponse, "picks")
      .map((pick) => normalizePick(pick, canAccess))
      .filter((pick): pick is FeedPick => pick !== null);
    let pendingCount = 0;
    const picks =
      canAccess && membership?.plan_id === "Pro"
        ? allPicks.filter(
            (pick) =>
              pick.status !== "Pending" || pendingCount++ < 3,
          )
        : allPicks;
    const fixtures = readFeedData(fixturesResponse, "fixtures")
      .map(normalizeFixture)
      .filter((fixture): fixture is Fixture => fixture !== null);

    return NextResponse.json(
      { picks, fixtures, fetchedAt: new Date().toISOString() },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    console.error("MyBetCode feed unavailable:", error);
    return NextResponse.json(
      { error: "Live picks and scores are temporarily unavailable" },
      { status: 502, headers: { "Cache-Control": "private, no-store" } },
    );
  }
}
