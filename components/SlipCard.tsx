import * as React from "react";
import { fmtOdds } from "@/lib/format";
import StatusBadge from "@/components/StatusBadge";
import PickLockPrompt from "@/components/PickLockPrompt";
import { Layers } from "lucide-react";
import type { SlipRecord } from "@/lib/entityTypes";
import type { LiveFixture } from "@/hooks/useMyBetCodeFeed";
import { matchFixture } from "@/lib/liveScoreMatch";

interface SlipCardProps {
  slip: SlipRecord;
  locked?: boolean;
  liveFixtures?: LiveFixture[];
}

export default function SlipCard({
  slip,
  locked = false,
  liveFixtures = [],
}: SlipCardProps) {
  const legs = Array.isArray(slip.legs) ? slip.legs : [];
  const legCount = legs.length || slip.legs_count || 0;

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card">
      <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
        <div>
          <p className="eyebrow">{slip.sport || "Football"} multi-leg tip</p>
          <h3 className="mt-1.5 font-display text-lg font-medium tracking-tight text-foreground">
            {slip.title}
          </h3>
        </div>
        <StatusBadge status={slip.status} />
      </div>

      <div className="grid grid-cols-3 divide-x divide-border border-b border-border">
        <div className="px-5 py-3">
          <p className="eyebrow">Target</p>
          <p className="mt-1 font-mono text-base text-foreground">
            {slip.target_odds ?? "—"}x
          </p>
        </div>
        <div className="px-5 py-3">
          <p className="eyebrow">Combined</p>
          <p className="mt-1 font-mono text-base text-primary">
            {fmtOdds(slip.total_odds)}
          </p>
        </div>
        <div className="px-5 py-3">
          <p className="eyebrow">Legs</p>
          <p className="mt-1 font-mono text-base text-foreground">
            {legCount}
          </p>
        </div>
      </div>

      <div className="flex-1 px-5 py-4">
        {locked ? (
          <PickLockPrompt
            label={`${legCount} legs hidden — unlock them with a paid membership`}
          />
        ) : legs.length ? (
          <ul className="space-y-2.5">
            {legs.map((leg, index) => {
              const fixture = matchFixture(
                leg.match,
                liveFixtures,
                leg.kickoff,
              );
              return (
                <li
                  key={index}
                  className="flex items-start justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm text-foreground">
                      {leg.match}
                    </p>
                    <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      {leg.selection}
                    </p>
                    {fixture &&
                      fixture.home_score != null &&
                      fixture.away_score != null && (
                        <p className="mt-1 font-mono text-[10px] text-primary">
                          {fixture.home_score} – {fixture.away_score}
                          {fixture.minute_label && ` · ${fixture.minute_label}`}
                        </p>
                      )}
                  </div>
                  <span className="shrink-0 font-mono text-xs text-muted-foreground">
                    {fmtOdds(leg.odds)}
                  </span>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Layers className="h-4 w-4" /> Legs are being finalised
          </p>
        )}
      </div>
    </article>
  );
}
