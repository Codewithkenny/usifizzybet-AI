"use client";

import Link from "next/link";
import { Activity, Radio } from "lucide-react";
import PickCard from "@/components/PickCard";
import { useMembership } from "@/hooks/useMembership";
import type {
  LiveFixture,
  MyBetCodeFeedState,
} from "@/hooks/useMyBetCodeFeed";

interface MyBetCodeBoardProps {
  feed: MyBetCodeFeedState;
  compact?: boolean;
}

function FixtureCard({ fixture }: { fixture: LiveFixture }) {
  const live = fixture.status === "live" || fixture.status === "halftime";
  return (
    <article className="relative overflow-hidden rounded-xl border border-border bg-background/70 p-4">
      {live && (
        <span className="absolute right-3 top-3 inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.16em] text-accent">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
          {fixture.minute_label || "Live"}
        </span>
      )}
      <p className="truncate pr-16 font-mono text-[9px] uppercase tracking-[0.15em] text-muted-foreground">
        {fixture.league}
      </p>
      <p className="mt-3 truncate font-display text-sm font-medium text-foreground">
        {fixture.home_team}
      </p>
      <div className="my-1 flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground">vs</span>
        {fixture.home_score != null && fixture.away_score != null ? (
          <span className="font-mono text-sm font-semibold text-primary">
            {fixture.home_score} – {fixture.away_score}
          </span>
        ) : (
          <span className="font-mono text-[10px] text-muted-foreground">
            {fixture.status === "scheduled" ? "UP NEXT" : fixture.status}
          </span>
        )}
      </div>
      <p className="truncate font-display text-sm font-medium text-foreground">
        {fixture.away_team}
      </p>
    </article>
  );
}

export default function MyBetCodeBoard({
  feed,
  compact = false,
}: MyBetCodeBoardProps) {
  const membership = useMembership();
  const picks = compact ? feed.picks.slice(0, 3) : feed.picks;
  const liveFixtures = feed.fixtures.filter(
    (fixture) => fixture.status === "live" || fixture.status === "halftime",
  );
  const fixtures = (liveFixtures.length ? liveFixtures : feed.fixtures).slice(
    0,
    compact ? 3 : 6,
  );

  return (
    <section className="border-b border-border bg-background">
      <div className="mx-auto max-w-6xl px-5 py-14 md:py-18">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Sports data · matchday feed</p>
            <h2 className="mt-3 font-display text-3xl font-medium tracking-[-0.02em] text-foreground md:text-4xl">
              Picks with the match in motion
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
              Available selections, scores and match clocks depend on the
              configured data source. Scores remain visible when picks are
              locked.
            </p>
          </div>
          {compact && (
            <Link
              href="/picks"
              className="font-display text-sm text-primary hover:underline"
            >
              Open full board →
            </Link>
          )}
        </div>

        {feed.error && (
          <p
            role="alert"
            className="mt-8 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive"
          >
            {feed.error}
          </p>
        )}

        <div className="mt-9">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-accent" aria-hidden="true" />
            <h3 className="font-display text-sm font-semibold text-foreground">
              Live scores & fixtures
            </h3>
            <span className="font-mono text-[10px] text-muted-foreground">
              {liveFixtures.length
                ? `${liveFixtures.length} in play`
                : `${feed.fixtures.length} fixtures today`}
            </span>
          </div>
          {feed.loading ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map((index) => (
                <div
                  key={index}
                  className="h-32 animate-pulse rounded-xl border border-border bg-card/60"
                />
              ))}
            </div>
          ) : fixtures.length ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {fixtures.map((fixture) => (
                <FixtureCard key={fixture.id} fixture={fixture} />
              ))}
            </div>
          ) : (
            <p className="mt-4 rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">
              No fixture updates are available right now.
            </p>
          )}
        </div>

        <div className="mt-10 flex items-center gap-2">
          <Radio className="h-4 w-4 text-primary" aria-hidden="true" />
          <h3 className="font-display text-sm font-semibold text-foreground">
            Today&apos;s picks
          </h3>
          <span className="font-mono text-[10px] text-muted-foreground">
            {feed.picks.length} on the board
          </span>
          {!membership.active && (
            <Link
              href="/membership"
              className="ml-auto font-mono text-[10px] uppercase tracking-[0.14em] text-primary hover:underline"
            >
              Unlock with membership
            </Link>
          )}
        </div>
        {feed.loading ? (
          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((index) => (
              <div
                key={index}
                className="h-64 animate-pulse rounded-2xl border border-border bg-card/60"
              />
            ))}
          </div>
        ) : picks.length ? (
          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {picks.map((pick) => (
              <PickCard
                key={pick.id}
                pick={pick}
                locked={pick.provider_locked || !membership.active}
              />
            ))}
          </div>
        ) : !feed.error ? (
          <p className="mt-4 rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No picks are on today&apos;s board yet.
          </p>
        ) : null}
      </div>
    </section>
  );
}
