import Link from "next/link";
import { ArrowRight } from "lucide-react";

const FEATURES = ["Daily picks", "Live scores", "Public results"];

export default function PromoBanner() {
  return (
    <section className="px-5 pt-5 md:pt-8">
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl border border-primary/30 bg-[radial-gradient(ellipse_at_top_left,hsl(var(--primary)/0.28),transparent_55%),linear-gradient(120deg,hsl(var(--card)),hsl(var(--background)))] px-6 py-8 shadow-[0_20px_80px_-40px_hsl(var(--primary)/0.45)] md:px-10 md:py-10">
        <div
          aria-hidden="true"
          className="absolute -right-20 -top-32 h-72 w-72 rounded-full border border-primary/20"
        />
        <div
          aria-hidden="true"
          className="absolute -right-8 -top-20 h-48 w-48 rounded-full border border-primary/15"
        />
        <div className="relative grid items-center gap-7 md:grid-cols-[1fr_auto]">
          <div>
            <p className="eyebrow text-primary">The matchday, made clearer</p>
            <h2 className="mt-3 max-w-2xl font-display text-3xl font-bold leading-tight tracking-[-0.03em] text-foreground md:text-4xl">
              More than a tip.
              <span className="block text-primary">The context around it.</span>
            </h2>
            <div className="mt-5 flex flex-wrap gap-2">
              {FEATURES.map((feature) => (
                <span
                  key={feature}
                  className="rounded-full border border-primary/35 bg-background/45 px-3 py-1.5 font-display text-xs font-medium text-foreground"
                >
                  {feature}
                </span>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-3 md:max-w-48 md:flex-col">
            <Link
              href="/membership"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-5 font-display text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
            >
              Explore membership <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/picks"
              className="inline-flex min-h-12 items-center justify-center rounded-xl border border-border bg-background/50 px-5 font-display text-sm font-semibold text-foreground transition-colors hover:border-primary/50"
            >
              Browse today&apos;s picks
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
