import * as React from "react";
import StatTile from "@/components/StatTile";
import { winRate } from "@/lib/format";

interface StatsRowProps {
  won?: number;
  lost?: number;
  pending?: number;
}

export default function StatsRow({
  won = 0,
  lost = 0,
  pending = 0,
}: StatsRowProps) {
  const graded = won + lost;
  return (
    <section className="border-b border-border">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-3 px-5 py-10 lg:grid-cols-4">
        <StatTile
          value={winRate(won, lost)}
          label="Public win rate"
          hint="all graded picks"
        />
        <StatTile
          value={graded}
          label="Picks settled"
          hint="wins and losses shown"
        />
        <StatTile value={pending} label="Picks live" hint="awaiting kick-off" />
        <StatTile
          value={won}
          label="Winning picks"
          hint="tracked, never deleted"
        />
      </div>
    </section>
  );
}
