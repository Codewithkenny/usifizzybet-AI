import Link from "next/link";
import {
  Activity,
  ArrowRight,
  ListChecks,
  ShieldCheck,
} from "lucide-react";

const ADVERTS = [
  {
    eyebrow: "01 · THE BOARD",
    title: "Keep the whole matchday in view.",
    body: "Follow fixtures, live clocks and picks together instead of chasing updates across tabs.",
    href: "/picks",
    cta: "Explore the live board",
    signal: "SCORES · CLOCKS · PICKS",
    Icon: Activity,
    tone: "from-primary/15 via-primary/[0.04] to-transparent",
  },
  {
    eyebrow: "02 · THE RECORD",
    title: "Read the results, not just the headline.",
    body: "Review settled selections and see wins and losses in the same public ledger.",
    href: "/results",
    cta: "Open the record",
    signal: "A CLEARER VIEW",
    Icon: ListChecks,
    tone: "from-accent/15 via-accent/[0.04] to-transparent",
  },
  {
    eyebrow: "03 · YOUR ACCESS",
    title: "Choose how much analysis you need.",
    body: "Compare monthly plans in naira. Membership renews manually; no automatic charges.",
    href: "/membership",
    cta: "Compare plans",
    signal: "₦5,000 · ₦15,000 / MONTH",
    Icon: ShieldCheck,
    tone: "from-secondary via-secondary/20 to-transparent",
  },
];

export default function AdStrip() {
  return (
    <section className="border-b border-border bg-secondary/20">
      <div className="mx-auto max-w-6xl px-5 py-14 md:py-16">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="eyebrow">The Usiffizybet matchday desk</p>
            <h2 className="mt-2 font-display text-2xl font-medium text-foreground">
              A little less noise. A lot more context.
            </h2>
          </div>
          <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground">
            Product highlights · no third-party ads
          </span>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {ADVERTS.map(({ Icon, ...ad }) => (
            <Link
              key={ad.eyebrow}
              href={ad.href}
              className="group overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-1 hover:border-primary/40"
            >
              <div
                className={`relative min-h-[170px] overflow-hidden border-b border-border bg-gradient-to-br ${ad.tone} p-5`}
              >
                <div
                  aria-hidden="true"
                  className="absolute -right-10 -top-14 h-44 w-44 rounded-full border border-foreground/[0.08]"
                />
                <div
                  aria-hidden="true"
                  className="absolute -right-2 -top-6 h-28 w-28 rounded-full border border-foreground/[0.08]"
                />
                <span className="relative inline-flex items-center gap-2 rounded-full border border-border/80 bg-background/70 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.15em] text-muted-foreground backdrop-blur">
                  <Icon className="h-3 w-3 text-primary" aria-hidden="true" />
                  {ad.eyebrow}
                </span>
                <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between">
                  <p className="font-mono text-[9px] uppercase tracking-[0.17em] text-primary">
                    {ad.signal}
                  </p>
                  <span className="grid h-10 w-10 place-items-center rounded-xl border border-border/80 bg-background/60 text-primary transition-transform group-hover:rotate-6">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-display text-lg font-semibold leading-snug tracking-tight text-foreground">
                  {ad.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {ad.body}
                </p>
                <span className="mt-5 inline-flex items-center gap-1.5 font-display text-xs font-semibold text-primary">
                  {ad.cta}
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
