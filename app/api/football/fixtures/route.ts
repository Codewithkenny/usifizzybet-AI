import { NextRequest, NextResponse } from "next/server";
import { apiFootball } from "@/lib/football/client";
import {
  enforceRateLimit,
  rateLimitIdentity,
} from "@/lib/rateLimit";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

interface ApiFootballFixture {
  fixture: {
    id: number;
    date: string;
    status: {
      short: string;
      elapsed: number | null;
    };
  };
  league: {
    name: string;
  };
  teams: {
    home: { name: string };
    away: { name: string };
  };
  goals: {
    home: number | null;
    away: number | null;
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isApiFootballFixture(value: unknown): value is ApiFootballFixture {
  if (!isRecord(value)) return false;
  const fixture = value.fixture;
  const league = value.league;
  const teams = value.teams;
  const goals = value.goals;
  if (
    !isRecord(fixture) ||
    !isRecord(fixture.status) ||
    !isRecord(league) ||
    !isRecord(teams) ||
    !isRecord(teams.home) ||
    !isRecord(teams.away) ||
    !isRecord(goals)
  ) {
    return false;
  }

  return (
    typeof fixture.id === "number" &&
    typeof fixture.date === "string" &&
    typeof fixture.status.short === "string" &&
    (typeof fixture.status.elapsed === "number" ||
      fixture.status.elapsed === null) &&
    typeof league.name === "string" &&
    typeof teams.home.name === "string" &&
    typeof teams.away.name === "string" &&
    (typeof goals.home === "number" || goals.home === null) &&
    (typeof goals.away === "number" || goals.away === null)
  );
}

function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
}

function lagosDate(): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Lagos",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const part = (type: string) =>
    parts.find((item) => item.type === type)?.value;
  const year = part("year");
  const month = part("month");
  const day = part("day");
  if (!year || !month || !day) {
    throw new Error("Unable to determine the Lagos match date");
  }
  return `${year}-${month}-${day}`;
}

function normalizeFixture(
  fixture: ApiFootballFixture,
  updatedAt: string,
) {
  const statusCode = fixture.fixture.status.short;
  const liveCodes = new Set(["1H", "2H", "ET", "P", "LIVE", "BT", "INT"]);
  const finishedCodes = new Set(["FT", "AET", "PEN"]);
  const cancelledCodes = new Set(["PST", "CANC", "ABD", "AWD", "WO", "SUSP"]);
  const status = liveCodes.has(statusCode)
    ? "live"
    : statusCode === "HT"
      ? "halftime"
      : finishedCodes.has(statusCode)
        ? "finished"
        : cancelledCodes.has(statusCode)
          ? "cancelled"
          : "scheduled";
  const elapsed = fixture.fixture.status.elapsed;

  return {
    id: fixture.fixture.id,
    sport: "Football",
    league: fixture.league.name,
    home_team: fixture.teams.home.name,
    away_team: fixture.teams.away.name,
    kickoff: fixture.fixture.date,
    status,
    home_score: fixture.goals.home,
    away_score: fixture.goals.away,
    minute_label:
      status === "halftime"
        ? "HT"
        : status === "live"
          ? elapsed === null
            ? statusCode
            : `${elapsed}'`
          : null,
    live_updated_at: updatedAt,
  };
}

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const rateLimit = await enforceRateLimit(
    request,
    "api-football-fixtures",
    rateLimitIdentity(request, user?.id),
    30,
    60,
  );
  if (rateLimit) return rateLimit;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const league = searchParams.get("league");
  const season = searchParams.get("season");
  const date = searchParams.get("date");
  const live = searchParams.get("live");
  const timezone = searchParams.get("timezone") ?? "Africa/Lagos";

  const hasLeague = league !== null;
  const hasSeason = season !== null;
  const hasDate = date !== null;
  const hasLive = live !== null;
  const hasId = id !== null;
  const selectorsValid =
    hasId
      ? !hasLeague && !hasSeason && !hasDate && !hasLive
      : hasLive
        ? live === "all" && !hasLeague && !hasSeason && !hasDate
        : hasLeague === hasSeason &&
          (!hasDate || (date !== null && isValidDate(date)));
  if (
    !selectorsValid ||
    (id !== null && !/^[1-9]\d{0,9}$/.test(id)) ||
    (league !== null && !/^[1-9]\d{0,5}$/.test(league)) ||
    (season !== null && !/^\d{4}$/.test(season)) ||
    timezone.length > 64
  ) {
    return NextResponse.json(
      {
        error:
          "Use id, live=all, date, or league and season (optionally with date).",
      },
      { status: 400 },
    );
  }
  try {
    new Intl.DateTimeFormat("en", { timeZone: timezone });
  } catch {
    return NextResponse.json({ error: "Invalid timezone." }, { status: 400 });
  }

  const params: Record<string, string | number> = { timezone };
  if (id) params.id = id;
  else if (live) params.live = "all";
  else {
    if (league) params.league = league;
    if (season) params.season = season;
    params.date = date ?? (league ? "" : lagosDate());
    if (!params.date) delete params.date;
  }

  try {
    const result = await apiFootball<ApiFootballFixture[]>("/fixtures", params);
    if (!Array.isArray(result.response)) {
      throw new Error("API-Football returned an invalid fixtures list");
    }

    const updatedAt = new Date().toISOString();
    const fixtures = result.response
      .filter(isApiFootballFixture)
      .map((fixture) => normalizeFixture(fixture, updatedAt));

    return NextResponse.json(
      { fixtures, fetchedAt: updatedAt },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    console.error("API-Football fixtures error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error &&
          error.message === "API_FOOTBALL_API_KEY is not configured"
            ? "Football data is not configured."
            : "Football fixtures are temporarily unavailable.",
      },
      { status: 503, headers: { "Cache-Control": "private, no-store" } },
    );
  }
}
