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
        Choose a monthly plan in naira. Payments are securely processed by
        Paystack; access starts after payment verification and renews only when
        you choose to pay again.
      </p>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {PLANS.map((plan) => (
          <article
            key={plan.id}
            className="rounded-2xl border border-border bg-card p-6"
          >
            <h2 className="font-display text-xl font-medium text-foreground">
              {plan.name}
            </h2>
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
        risk; only stake what you can afford to lose.
      </p>
    </section>
  );
}
