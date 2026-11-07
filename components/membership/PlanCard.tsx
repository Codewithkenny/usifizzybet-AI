"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { fmtMoney } from "@/lib/format";

interface PlanData {
  id: string | number;
  name: string;
  tagline: string;
  price: number | null;
  cadence: string;
  features: string[];
  highlight?: boolean;
  cta: string;
}

interface PlanCardProps {
  plan: PlanData;
  current?: boolean;
  onChoose: (plan: PlanData) => void;
}

export default function PlanCard({
  plan,
  current = false,
  onChoose,
}: PlanCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col rounded-2xl border bg-card p-6",
        plan.highlight
          ? "border-primary/50 shadow-[0_0_0_1px_hsl(var(--primary)/0.15)]"
          : "border-border",
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="font-display text-lg font-medium text-foreground">
          {plan.name}
        </p>
        {plan.highlight && (
          <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-primary">
            Most popular
          </span>
        )}
      </div>
      <p className="mt-1 text-sm text-muted-foreground">{plan.tagline}</p>

      <div className="mt-5 flex items-baseline gap-1.5">
        <span className="font-display text-3xl font-medium tracking-tight text-foreground">
          {plan.price == null ? "Price pending" : fmtMoney(plan.price)}
        </span>
        <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
          {plan.cadence}
        </span>
      </div>

      <ul className="mt-5 flex-1 space-y-2.5">
        {plan.features.map((feature) => (
          <li
            key={feature}
            className="flex gap-2.5 text-sm leading-relaxed text-muted-foreground"
          >
            <Check
              className="mt-0.5 h-4 w-4 shrink-0 text-primary"
              aria-hidden="true"
            />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <Button
        onClick={() => onChoose(plan)}
        variant={plan.highlight ? "default" : "outline"}
        disabled={current || plan.price == null}
        className="mt-6 w-full font-display font-semibold"
      >
        {current
          ? "Your current plan"
          : plan.price == null
            ? "Payments not live"
            : plan.cta}
      </Button>
    </div>
  );
}
