import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import PickCard from "@/components/PickCard";
import { ArrowRight } from "lucide-react";

interface FeaturedPick {
  id?: string;
  league?: string;
  sport?: string;
  status?: string;
  home_team: string;
  away_team: string;
  kickoff: string | Date;
  market?: string;
  selection?: string;
  odds?: string | number;
  confidence?: number;
  risk_level?: string;
  reasoning?: string;
  home_score?: number | null;
  away_score?: number | null;
}

interface HeroProps {
  featured: FeaturedPick | null | undefined;
  locked: boolean;
  pendingCount: number;
}

export default function Hero({ featured, locked, pendingCount }: HeroProps) {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="pointer-events-none absolute -top-48 left-1/2 h-[460px] w-[760px] -translate-x-1/2 rounded-full bg-primary/[0.08] blur-3xl" />
      <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-5 py-16 md:py-24 lg:grid-cols-[1.08fr_0.92fr]">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1.5">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
            <span className="eyebrow">
              usifizzybet · AI sports intelligence
            </span>
          </span>
          <h1 className="mt-7 font-display text-[2.9rem] font-bold leading-[1.04] tracking-[-0.035em] text-foreground sm:text-6xl">
            Less guesswork.
            <br />
            <span className="text-primary">More intelligence.</span>
          </h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground">
            Football and basketball predictions with clear reasoning, confidence
            scores and risk grades. Follow the analysis and judge every result —
            wins and losses — in public.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button size="lg" className="font-display font-semibold">
              <Link href="/picks" className="flex items-center">
                See today's picks <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="font-display">
              <Link href="/results">Public record</Link>
            </Button>
          </div>
          <p className="eyebrow mt-5">
            {pendingCount
              ? `${pendingCount} picks on the board`
              : "Football & basketball only"}{" "}
            · 18+ · no guaranteed wins
          </p>
        </div>

        <div className="relative">
          <div className="mb-3 flex items-center justify-between">
            <span className="eyebrow">Latest selection</span>
            <Link
              href="/picks"
              className="font-mono text-[10px] uppercase tracking-[0.16em] text-primary"
            >
              View all
            </Link>
          </div>
          {featured ? (
            <PickCard
              pick={featured}
              locked={locked}
              className="shadow-2xl shadow-black/40"
            />
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-card/50 p-10 text-center">
              <p className="font-display text-base text-foreground">
                The next slate is being built
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Check back shortly — picks appear as soon as the AI finishes
                scanning fixtures.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
