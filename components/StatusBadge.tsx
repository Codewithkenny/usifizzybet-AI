import * as React from "react";

// Explicit string literals matching your betting tip lifecycle outcomes
type BadgeStatus = "Won" | "Lost" | "Void" | "Pending";
type RiskLevel = "Low" | "Medium" | "High";

const STYLES: Record<BadgeStatus, string> = {
  Won: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
  Lost: "border-rose-400/30 bg-rose-400/10 text-rose-300",
  Void: "border-border bg-secondary text-muted-foreground",
  Pending: "border-primary/30 bg-primary/10 text-primary",
};

interface StatusBadgeProps {
  status?: BadgeStatus | string;
  className?: string;
}

export default function StatusBadge({
  status = "Pending",
  className = "",
}: StatusBadgeProps) {
  // Gracefully fallback to Pending style properties if a status falls out of boundary
  const normalizedStatus = (
    STYLES[status as BadgeStatus] ? status : "Pending"
  ) as BadgeStatus;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] ${
        STYLES[normalizedStatus]
      } ${className}`}
    >
      <span className="h-1 w-1 rounded-full bg-current" />
      {status}
    </span>
  );
}

interface RiskBadgeProps {
  level?: RiskLevel | string;
}

export function RiskBadge({ level = "Medium" }: RiskBadgeProps) {
  const tone =
    level === "Low"
      ? "text-emerald-300"
      : level === "High"
        ? "text-rose-300"
        : "text-amber-300";

  return (
    <span
      className={`font-mono text-[10px] uppercase tracking-[0.16em] ${tone}`}
    >
      {level} risk
    </span>
  );
}
