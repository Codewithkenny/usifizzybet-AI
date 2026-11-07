import * as React from "react";

interface StatTileProps {
  value: string | number;
  label: string;
  hint?: string;
}

export default function StatTile({ value, label, hint }: StatTileProps) {
  return (
    <div className="rounded-2xl border border-border bg-card/60 px-5 py-5">
      <p className="font-display text-3xl font-medium tracking-tight text-foreground">
        {value}
      </p>
      <p className="mt-1 text-sm text-foreground/80">{label}</p>
      {hint && <p className="eyebrow mt-2">{hint}</p>}
    </div>
  );
}
