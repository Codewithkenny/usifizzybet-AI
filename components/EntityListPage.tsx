"use client";

import { useEffect, useState } from "react";
import { usifizzyClient } from "@/api/usifizzyClient";
import { useMembership } from "@/hooks/useMembership";
import { useMyBetCodeFeed } from "@/hooks/useMyBetCodeFeed";
import PickCard from "@/components/PickCard";
import SlipCard from "@/components/SlipCard";
import RecordList from "@/components/home/RecordList";
import type { PickRecord, SlipRecord } from "@/lib/entityTypes";
import { matchFixture } from "@/lib/liveScoreMatch";

type EntityName = "Pick" | "Slip";

interface EntityListPageProps {
  entity: EntityName;
  title: string;
  description: string;
  status?: string | { $in: string[] };
}

export default function EntityListPage({
  entity,
  title,
  description,
  status,
}: EntityListPageProps) {
  const membership = useMembership();
  const feed = useMyBetCodeFeed();
  const statusList = typeof status === "string" ? [status] : status?.$in;
  const statusKey = statusList?.join("|") ?? "";
  const [records, setRecords] = useState<Array<PickRecord | SlipRecord>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const recordsWithLiveScores = records.map((record) => {
    if (!("home_team" in record)) return record;
    const fixture = matchFixture(
      `${record.home_team} vs ${record.away_team}`,
      feed.fixtures,
      record.kickoff,
    );
    if (!fixture) return record;
    return {
      ...record,
      home_score: fixture.home_score ?? record.home_score,
      away_score: fixture.away_score ?? record.away_score,
      live_status: fixture.status,
      minute_label: fixture.minute_label,
      live_updated_at: fixture.live_updated_at,
    };
  });

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const values = statusKey ? statusKey.split("|") : [];
        const result = await usifizzyClient.entities[entity].filter(
          values.length
            ? {
                status:
                  values.length === 1 ? values[0] : { $in: values },
              }
            : {},
          { sort: entity === "Pick" ? "-kickoff" : "-created_date", limit: 100 },
        );
        if (active) setRecords(result);
      } catch (loadError) {
        console.error(
          `Unable to load ${entity.toLowerCase()} records:`,
          loadError,
        );
        if (active) setError("We couldn't load this list. Please try again.");
      } finally {
        if (active) setLoading(false);
      }
    };

    void load();
    return () => {
      active = false;
    };
  }, [entity, statusKey]);

  return (
    <section className="mx-auto max-w-6xl px-5 py-14 md:py-20">
      <p className="eyebrow">BetCode9ja</p>
      <h1 className="mt-3 font-display text-4xl font-medium text-foreground">
        {title}
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>

      {feed.fixturesError && (entity === "Slip" || status !== "Pending") && (
        <p className="mt-4 text-xs text-muted-foreground">
          Live score overlays are unavailable right now: {feed.fixturesError}
        </p>
      )}

      {error && (
        <p
          role="alert"
          className="mt-8 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive"
        >
          {error}
        </p>
      )}
      {loading ? (
        <p className="mt-8 text-sm text-muted-foreground">Loading...</p>
      ) : entity === "Slip" ? (
        records.length ? (
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {recordsWithLiveScores
              .filter((record): record is SlipRecord => "legs" in record)
              .map((slip) => (
                <SlipCard
                  key={slip.id}
                  slip={slip}
                  locked={!membership.active}
                  liveFixtures={feed.fixtures}
                />
              ))}
          </div>
        ) : (
          <p className="mt-8 rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No SafeBets tips are currently available.
          </p>
        )
      ) : status === "Pending" ? (
        records.length ? (
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {records
              .filter((record): record is PickRecord => "home_team" in record)
              .map((pick) => (
                <PickCard
                  key={pick.id}
                  pick={pick}
                  locked={!membership.active}
                />
              ))}
          </div>
        ) : (
          <p className="mt-8 rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No picks are currently available.
          </p>
        )
      ) : (
        <div className="mt-8">
          <RecordList
            picks={recordsWithLiveScores.filter(
              (record): record is PickRecord => "home_team" in record,
            )}
          />
        </div>
      )}
    </section>
  );
}
