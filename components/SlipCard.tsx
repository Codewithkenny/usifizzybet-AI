import * as React from "react";
import { fmtOdds } from "@/lib/format";
import StatusBadge from "@/components/StatusBadge";
import PickLockPrompt from "@/components/PickLockPrompt";
import { Layers } from "lucide-react";

interface SlipLeg {
  match: string;
  selection: string;
  odds: string | number;
}

interface SlipData {
  id?: string;
  sport?: string;
  title: string;
  status?: string;
  target_odds?: string | number;
  total_odds: string | number;
  legs?: SlipLeg[];
}

interface SlipCardProps {
  slip: SlipData;
  locked?: boolean;
}

export default function SlipCard({ slip, locked = false }: SlipCardProps) {
  const legs = Array.isArray(slip.legs) ? slip.legs : [];

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
            {slip.target_odds}x
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
            {legs.length}
          </p>
        </div>
      </div>

      <div className="flex-1 px-5 py-4">
        {locked ? (
          <PickLockPrompt
            label={`${legs.length} legs hidden — sign in to reveal every leg of this tip`}
          />
        ) : legs.length ? (
          <ul className="space-y-2.5">
            {legs.map((leg, index) => (
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
                </div>
                <span className="shrink-0 font-mono text-xs text-muted-foreground">
                  {fmtOdds(leg.odds)}
                </span>
              </li>
            ))}
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
