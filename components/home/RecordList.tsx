import * as React from "react";
import { fmtDate, fmtOdds } from "@/lib/format";
import StatusBadge from "@/components/StatusBadge";

interface PickRecordItem {
  id: string | number;
  home_team: string;
  away_team: string;
  league?: string;
  sport?: string;
  kickoff: string | Date;
  market: string;
  selection: string;
  odds: string | number;
  home_score?: number | null;
  away_score?: number | null;
  status: string;
}

interface RecordListProps {
  picks?: PickRecordItem[];
}

export default function RecordList({ picks = [] }: RecordListProps) {
  if (!picks.length) {
    return (
      <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        No results graded yet. The record starts with the first settled pick.
      </p>
    );
  }

  return (
    <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border">
      {picks.map((pick) => (
        <div
          key={pick.id}
          className="grid grid-cols-[1fr_auto] items-center gap-4 bg-card px-5 py-4 md:grid-cols-[1.6fr_1fr_0.6fr_auto]"
        >
          <div className="min-w-0">
            <p className="truncate text-sm text-foreground">
              {pick.home_team} <span className="text-muted-foreground">vs</span>{" "}
              {pick.away_team}
            </p>
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              {pick.league || pick.sport} · {fmtDate(pick.kickoff)}
            </p>
          </div>
          <p className="hidden truncate text-sm text-muted-foreground md:block">
            {pick.market}:{" "}
            <span className="text-foreground">{pick.selection}</span>
          </p>
          <p className="hidden font-mono text-sm text-foreground md:block">
            {fmtOdds(pick.odds)}
          </p>
          <div className="flex items-center gap-3">
            {pick.home_score != null && pick.away_score != null && (
              <span className="font-mono text-xs text-muted-foreground">
                {pick.home_score}–{pick.away_score}
              </span>
            )}
            <StatusBadge status={pick.status} />
          </div>
        </div>
      ))}
    </div>
  );
}
