import * as React from "react";
import Link from "next/link";
import { BadgeCheck } from "lucide-react";
import { fmtDate, fmtMoney } from "@/lib/format";

interface PlanMetrics {
  id: string | number;
  name: string;
  cadence: string;
  price?: number | null;
}

interface SubscriptionMetrics {
  status?: string;
  price_monthly?: number | null;
  currency?: string;
  started_date?: string | Date;
  current_period_end?: string | Date;
}

interface MembershipCardProps {
  plan: PlanMetrics;
  subscription?: SubscriptionMetrics | null;
}

export default function MembershipCard({
  plan,
  subscription,
}: MembershipCardProps) {
  const status = subscription?.status || "free account";
  const active = status === "active" || status === "trialing";

  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <p className="eyebrow">Membership</p>
      <div className="mt-3 flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-medium text-foreground">
            {plan.name}
          </h2>
          <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
            {active ? plan.cadence : "no card on file"}
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-primary">
          <BadgeCheck className="h-3 w-3" aria-hidden="true" />
          {status.replace("_", " ")}
        </span>
      </div>

      <dl className="mt-5 space-y-2.5 border-t border-border pt-4 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Monthly price</dt>
          <dd className="font-mono text-foreground">
            {plan.id === "Free"
              ? "Free"
              : subscription?.price_monthly != null
                ? fmtMoney(subscription.price_monthly, subscription.currency)
                : plan.price == null
                  ? "Price pending"
                  : fmtMoney(plan.price)}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Member since</dt>
          <dd className="font-mono text-foreground">
            {fmtDate(subscription?.started_date)}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Access ends</dt>
          <dd className="font-mono text-foreground">
            {active ? fmtDate(subscription?.current_period_end) : "—"}
          </dd>
        </div>
      </dl>

      <Link
        href="/membership" // Converted from 'to' into 'href'
        className="mt-5 inline-flex items-center rounded-full bg-primary px-4 py-2 font-display text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90"
      >
        {plan.id === "Free" ? "See plans" : "Change plan"}
      </Link>
    </section>
  );
}
