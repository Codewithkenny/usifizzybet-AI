import { PLANS } from "@/lib/plans";
import CheckoutButton from "@/components/membership/CheckoutButton";

export default function MembershipPage() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-14 md:py-20">
      <p className="eyebrow">Membership</p>
      <h1 className="mt-3 font-display text-4xl font-medium text-foreground">
        Choose your access
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        Compare what each plan unlocks before you pay. Paid access lasts for
        one calendar month from payment confirmation and never auto-renews.
        Payments are securely processed by Paystack.
      </p>
      <p className="mt-3 max-w-2xl text-xs leading-relaxed text-muted-foreground">
        The public results ledger remains open to everyone. Available picks,
        fixtures and score updates depend on data-source coverage and
        availability.
      </p>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {PLANS.map((plan) => (
          <article
            key={plan.id}
            className={`rounded-2xl border bg-card p-6 ${
              plan.highlight
                ? "border-primary/50 shadow-[0_0_0_1px_hsl(var(--primary)/0.15)]"
                : "border-border"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <h2 className="font-display text-xl font-medium text-foreground">
                {plan.name}
              </h2>
              <span className="rounded-full border border-border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                {plan.cadence}
              </span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{plan.tagline}</p>
            <p className="mt-5 font-display text-2xl text-foreground">
              {plan.price === null
                ? "Not available"
                : plan.price === 0
                  ? "Free"
                  : `₦${plan.price.toLocaleString("en-NG")}`}
            </p>
            <ul className="mt-5 space-y-2 text-sm text-muted-foreground">
              {plan.features.map((feature) => (
                <li key={feature}>• {feature}</li>
              ))}
            </ul>
            <CheckoutButton planId={plan.id} label={plan.cta} />
          </article>
        ))}
      </div>
      <p className="mt-8 max-w-3xl text-xs leading-relaxed text-muted-foreground">
        Membership provides sports information, not betting advice or
        guaranteed results. You must be 18 or older. Betting involves financial
        risk; only stake what you can afford to lose. Access does not promise a
        specific number of picks or match coverage.
      </p>
    </section>
  );
}
