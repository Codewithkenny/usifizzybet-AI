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
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function useMyBetCodeFeed(): MyBetCodeFeedState {
  const [state, setState] = useState<MyBetCodeFeedState>({
    picks: [],
    fixtures: [],
    loading: true,
    error: "",
  });

  useEffect(() => {
    let active = true;
    let timer: ReturnType<typeof setTimeout>;

    const load = async () => {
      try {
        const response = await fetch("/api/feed", { cache: "no-store" });
        const result: unknown = await response.json();
        if (!response.ok) {
          const message =
            isRecord(result) && typeof result.error === "string"
              ? result.error
              : "Live picks and scores are temporarily unavailable";
          throw new Error(message);
        }
        if (
          !isRecord(result) ||
          !Array.isArray(result.picks) ||
          !Array.isArray(result.fixtures)
        ) {
          throw new Error("The live feed returned an invalid response");
        }
        if (active) {
          setState({
            picks: result.picks as MyBetCodePick[],
            fixtures: result.fixtures as LiveFixture[],
            loading: false,
            error: "",
          });
        }
      } catch (error) {
        if (active) {
          console.error("Unable to load MyBetCode feed:", error);
          setState((current) => ({
            ...current,
            loading: false,
            error:
              error instanceof Error
                ? error.message
                : "Live picks and scores are temporarily unavailable",
          }));
        }
      } finally {
        if (active) timer = setTimeout(() => void load(), 60_000);
      }
    };

    void load();
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, []);

  return state;
}
