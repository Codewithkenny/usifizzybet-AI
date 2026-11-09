import * as React from "react";
import { cn } from "@/lib/utils";
import { fmtKickoff, fmtOdds } from "@/lib/format";
import StatusBadge, { RiskBadge } from "@/components/StatusBadge";
import PickLockPrompt from "@/components/PickLockPrompt";
import type { PickRecord } from "@/lib/entityTypes";

interface PickCardProps {
  pick: PickRecord;
  locked?: boolean;
  className?: string;
}

export default function PickCard({
  pick,
  locked = false,
  className = "",
}: PickCardProps) {
  const hasScore = pick.home_score != null && pick.away_score != null;
  const confidence = Number(pick.confidence) || 0;

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/40",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          {pick.league || pick.sport || "Football"}
        </span>
        <StatusBadge status={pick.status} />
      </div>

      <h3 className="mt-4 font-display text-[17px] font-medium leading-snug tracking-tight text-foreground">
        {pick.home_team} <span className="text-muted-foreground">vs</span>{" "}
        {pick.away_team}
      </h3>
      <p className="mt-1 font-mono text-[11px] text-muted-foreground">
        {fmtKickoff(pick.kickoff)}
      </p>
      {pick.home_score != null && pick.away_score != null && (
        <p className="mt-2 inline-flex items-center gap-2 font-mono text-xs text-primary">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
          {pick.home_score} – {pick.away_score}
          {pick.minute_label && <span>· {pick.minute_label}</span>}
          {pick.live_updated_at && (
            <span className="text-muted-foreground">live score</span>
          )}
        </p>
      )}

      <div className="mt-4 flex items-end justify-between gap-4 rounded-xl border border-border/70 bg-background/50 px-3.5 py-3">
        <div className="min-w-0">
          <p className="eyebrow">{pick.market || "Selection"}</p>
          <p
            className={cn(
              "mt-1 truncate font-display text-base font-medium text-foreground",
              locked && "select-none blur-[6px]",
            )}
          >
            {locked ? "Secret pick" : pick.selection || "—"}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="eyebrow">Odds</p>
          <p className="mt-1 font-mono text-lg font-medium text-primary">
            {locked ? "—" : fmtOdds(pick.odds)}
          </p>
        </div>
      </div>

      {locked ? (
        <PickLockPrompt />
      ) : (
        <>
          <div className="mt-4 flex items-center gap-3">
            <div className="h-1 flex-1 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-primary"
                style={{
                  width: `${Math.min(100, Math.max(4, confidence))}%`,
                }}
              />
            </div>
            <span className="font-mono text-[11px] text-primary">
              {confidence ? `${confidence}%` : "—"}
            </span>
            <RiskBadge level={pick.risk_level} />
          </div>

          {pick.reasoning && (
            <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
              {pick.reasoning}
            </p>
          )}

          <div className="mt-auto flex items-center justify-between gap-3 border-t border-border/70 pt-3.5">
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              {hasScore
                ? `${
                    pick.live_status === "finished" ||
                    pick.status === "Won" ||
                    pick.status === "Lost"
                      ? "Final"
                      : "Score"
                  } ${pick.home_score} – ${pick.away_score}`
                : "Matchline analysis"}
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              Tip only — no stake
            </span>
          </div>
        </>
      )}
    </article>
  );
}
