"use client";

import { useEffect, useState } from "react";
import type { PickRecord } from "@/lib/entityTypes";

export interface MyBetCodePick extends PickRecord {
  provider_locked: boolean;
  live_status?: string | null;
  minute_label?: string | null;
  live_updated_at?: string | null;
  fixture_id?: number | null;
}

export interface LiveFixture {
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

export interface MyBetCodeFeedState {
  picks: MyBetCodePick[];
  fixtures: LiveFixture[];
  loading: boolean;
  error: string;
  fixturesError: string;
  picksError: string;
}

const PICKS_REFRESH_INTERVAL_MS = 15 * 60 * 1000;
const FIXTURES_REFRESH_INTERVAL_MS = 60 * 1000;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function useMyBetCodeFeed(): MyBetCodeFeedState {
  const [state, setState] = useState<MyBetCodeFeedState>({
    picks: [],
    fixtures: [],
    loading: true,
    error: "",
    fixturesError: "",
    picksError: "",
  });

  useEffect(() => {
    let active = true;
    let picksTimer: ReturnType<typeof setTimeout>;
    let fixturesTimer: ReturnType<typeof setTimeout>;
    let picksLoaded = false;
    let fixturesLoaded = false;

    const loadPicks = async () => {
      let picks: MyBetCodePick[] | null = null;
      let errorMessage = "";
      try {
        const response = await fetch("/api/feed", { cache: "no-store" });
        const responseBody: unknown = await response.json();
        if (!response.ok) {
          const message =
            isRecord(responseBody) && typeof responseBody.error === "string"
              ? responseBody.error
              : "Live picks and scores are temporarily unavailable";
          throw new Error(message);
        }
        if (
          !isRecord(responseBody) ||
          !Array.isArray(responseBody.picks)
        ) {
          throw new Error("The picks feed returned an invalid response");
        }
        picks = responseBody.picks as MyBetCodePick[];
      } catch (error) {
        errorMessage =
          error instanceof Error
            ? error.message
            : "AI picks are temporarily unavailable";
        console.error("Unable to load MyBetCode picks:", error);
      }

      picksLoaded = true;
      if (active) {
        setState((current) => ({
          ...current,
          ...(picks ? { picks } : {}),
          loading: !(picksLoaded && fixturesLoaded),
          error: errorMessage,
          picksError: errorMessage,
        }));
        picksTimer = setTimeout(
          () => void loadPicks(),
          PICKS_REFRESH_INTERVAL_MS,
        );
      }
    };

    const loadFixtures = async () => {
      let fixtures: LiveFixture[] | null = null;
      let errorMessage = "";
      try {
        const response = await fetch("/api/football/fixtures", {
          cache: "no-store",
        });
        const responseBody: unknown = await response.json();
        if (!response.ok) {
          const message =
            isRecord(responseBody) && typeof responseBody.error === "string"
              ? responseBody.error
              : "Football fixtures are temporarily unavailable";
          throw new Error(message);
        }
        if (!isRecord(responseBody) || !Array.isArray(responseBody.fixtures)) {
          throw new Error("The fixtures feed returned an invalid response");
        }
        fixtures = responseBody.fixtures as LiveFixture[];
      } catch (error) {
        if (active) {
          console.error("Unable to load API-Football fixtures:", error);
        }
        errorMessage =
          error instanceof Error
            ? error.message
            : "Football fixtures are temporarily unavailable";
      }

      fixturesLoaded = true;
      if (active) {
        setState((current) => ({
          ...current,
          ...(fixtures ? { fixtures } : {}),
          loading: !(picksLoaded && fixturesLoaded),
          fixturesError: errorMessage,
        }));
        fixturesTimer = setTimeout(
          () => void loadFixtures(),
          FIXTURES_REFRESH_INTERVAL_MS,
        );
      }
    };

    void loadPicks();
    void loadFixtures();
    return () => {
      active = false;
      clearTimeout(picksTimer);
      clearTimeout(fixturesTimer);
    };
  }, []);

  return state;
}
