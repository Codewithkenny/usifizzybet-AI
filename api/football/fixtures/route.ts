import { NextResponse } from "next/server";
import { apiFootball } from "@/lib/football/client";

type FixtureResponse = {
  response: Array<{
    fixture: {
      id: number;
      date: string;
      status: {
        short: string;
        long: string;
        elapsed: number | null;
      };
    };
    league: {
      id: number;
      name: string;
      country: string;
      logo: string;
      round: string;
    };
    teams: {
      home: {
        id: number;
        name: string;
        logo: string;
        winner: boolean | null;
      };
      away: {
        id: number;
        name: string;
        logo: string;
        winner: boolean | null;
      };
    };
    goals: {
      home: number | null;
      away: number | null;
    };
  }>;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const fixtureId = searchParams.get("id");
  const leagueId = searchParams.get("league");
  const season = searchParams.get("season");
  const date = searchParams.get("date");
  const live = searchParams.get("live");
  const next = searchParams.get("next");
  const timezone = searchParams.get("timezone") ?? "Africa/Lagos";

  try {
    if (fixtureId) {
      const data = await apiFootball<FixtureResponse["response"]>("/fixtures", {
        id: fixtureId,
        timezone,
      });

      return NextResponse.json(data);
    }

    if (live) {
      const data = await apiFootball<FixtureResponse["response"]>("/fixtures", {
        live,
        timezone,
      });

      return NextResponse.json(data);
    }

    if (!leagueId || !season) {
      return NextResponse.json(
        {
          error: "Provide either id, live, or both league and season.",
        },
        { status: 400 },
      );
    }

    const params: Record<string, string | number> = {
      league: leagueId,
      season,
      timezone,
    };

    if (date) params.date = date;
    if (next) params.next = next;

    const data = await apiFootball<FixtureResponse["response"]>(
      "/fixtures",
      params,
    );

    return NextResponse.json(data);
  } catch (error) {
    console.error("API-Football fixtures error:", error);

    return NextResponse.json(
      { error: "Football fixtures are temporarily unavailable" },
      { status: 503 },
    );
  }
}
