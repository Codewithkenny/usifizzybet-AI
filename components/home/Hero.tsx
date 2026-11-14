import Link from "next/link";
import { Activity, ArrowRight, CircleDot, ShieldCheck } from "lucide-react";
import PickCard from "@/components/PickCard";
import { Button } from "@/components/ui/button";
import type { PickRecord } from "@/lib/entityTypes";

interface HeroProps {
  featured: PickRecord | null | undefined;
  locked: boolean;
  pendingCount: number;
  feedLoading?: boolean;
}

function MatchdayArtwork() {
  return (
    <div className="relative flex min-h-56 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-[#12111f]/75">
      <div
        aria-hidden="true"
        className="absolute h-56 w-56 rounded-full bg-primary/30 blur-3xl"
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(153,138,255,0.12),transparent_65%)]" />
      <svg
        aria-hidden="true"
        viewBox="0 0 180 180"
        className="relative h-44 w-44 drop-shadow-[0_0_35px_rgba(153,138,255,0.3)]"
        fill="none"
      >
        <defs>
          <linearGradient id="hero-ball" x1="30" y1="24" x2="145" y2="155">
            <stop stopColor="#b1a5ff" />
            <stop offset=".52" stopColor="#998aff" />
            <stop offset="1" stopColor="#806bf2" />
          </linearGradient>
        </defs>
        <circle
          cx="90"
          cy="90"
          r="69"
          fill="url(#hero-ball)"
          fillOpacity=".16"
          stroke="url(#hero-ball)"
          strokeOpacity=".8"
          strokeWidth="1.5"
        />
        <circle
          cx="90"
          cy="90"
          r="57"
          stroke="white"
          strokeOpacity=".18"
          strokeWidth="1"
        />
        <path
          d="m90 62 18 13-7 21H79l-7-21 18-13Zm0 0-5-17m23 30 17-5m-24 26 11 15m-44-15-11 15m15-36-17-5"
          stroke="white"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeOpacity=".9"
          strokeWidth="3"
        />
        <path
          d="m90 62 18 13-7 21H79l-7-21 18-13Z"
          fill="white"
          fillOpacity=".12"
        />
        <path
          d="M37 118c17 23 43 35 70 31m37-83c-10-24-31-40-57-45"
          stroke="url(#hero-ball)"
          strokeLinecap="round"
          strokeWidth="2"
        />
      </svg>
      <span className="absolute bottom-4 left-4 font-mono text-[9px] uppercase tracking-[0.18em] text-white/50">
        The match is more than a score
      </span>
    </div>
  );
}

export default function Hero({
  featured,
  locked,
  pendingCount,
  feedLoading = false,
}: HeroProps) {
  return (
    <section className="relative isolate overflow-hidden border-b border-border">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-48 top-0 h-[34rem] w-[34rem] rounded-full bg-primary/[0.12] blur-[120px]"
      />
      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 py-14 md:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:py-24">
        <div className="relative z-10">
          <p className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/[0.08] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.17em] text-primary">
            <CircleDot className="h-3.5 w-3.5" aria-hidden="true" />
            Football · Basketball · Matchday insight
          </p>
          <h1 className="mt-7 max-w-2xl font-display text-[2.85rem] font-bold leading-[1.02] tracking-[-0.05em] text-foreground sm:text-6xl lg:text-[4.35rem]">
            Make every
            <br />
            match make
            <br />
            <span className="bg-gradient-to-r from-[#b1a5ff] via-[#998aff] to-[#806bf2] bg-clip-text text-transparent">
              more sense.
            </span>
          </h1>
          <p className="mt-6 max-w-lg text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
            Thoughtful football and basketball analysis, clear risk labels, and
            a results record you can check for yourself.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button size="lg" className="h-12 rounded-xl px-5 font-display" asChild>
              <Link href="/picks">
                Explore today&apos;s picks
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 rounded-xl px-5 font-display"
              asChild
            >
              <Link href="/results">See the public record</Link>
            </Button>
          </div>
          <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
              No guaranteed outcomes
            </span>
            <span>18+ only</span>
            {pendingCount > 0 && (
              <span className="inline-flex items-center gap-1.5">
                <Activity className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                {pendingCount} picks available
              </span>
            )}
          </div>
        </div>

        <div className="relative">
          <div
            aria-hidden="true"
            className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-primary/20 via-transparent to-primary/10 blur-2xl"
          />
          <div className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-card/90 p-4 shadow-2xl shadow-black/30 backdrop-blur sm:p-5">
            <div className="mb-4 flex items-center justify-between px-1">
              <div>
                <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
                  BetCode9ja
                </p>
                <p className="mt-1 font-display text-sm font-semibold text-foreground">
                  {featured ? "Featured analysis" : "Your matchday, in focus"}
                </p>
              </div>
              <span className="rounded-full border border-primary/25 bg-primary/[0.08] px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.12em] text-primary">
                {feedLoading ? "Loading board" : "18+ · Play responsibly"}
              </span>
            </div>
            {featured ? (
              <PickCard
                pick={featured}
                locked={locked}
                className="border-white/10 bg-background/70 shadow-none"
              />
            ) : (
              <>
                <MatchdayArtwork />
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-border/80 bg-background/60 p-3.5">
                    <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
                      The analysis
                    </p>
                    <p className="mt-1.5 font-display text-sm font-medium text-foreground">
                      Context, not certainty
                    </p>
                  </div>
                  <div className="rounded-xl border border-border/80 bg-background/60 p-3.5">
                    <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
                      The record
                    </p>
                    <p className="mt-1.5 font-display text-sm font-medium text-foreground">
                      Results in the open
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
