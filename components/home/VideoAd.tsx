"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Image } from "@/components/ui/image";
import { Play, Pause, ArrowRight } from "lucide-react";

interface FrameItem {
  src: string;
  alt: string;
  kicker: string;
  line: string;
}

const FRAMES: FrameItem[] = [
  {
    src: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=1600&q=80&auto=format&fit=crop",
    alt: "Floodlit football stadium at night",
    kicker: "Football",
    line: "Every fixture scanned before kick-off",
  },
  {
    src: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=1600&q=80&auto=format&fit=crop",
    alt: "Basketball going through a hoop",
    kicker: "Basketball",
    line: "Totals and spreads, modelled the same way",
  },
  {
    src: "https://images.unsplash.com/photo-1517927033932-b3d18e61fb3a?w=1600&q=80&auto=format&fit=crop",
    alt: "Stadium crowd under floodlights",
    kicker: "Confidence",
    line: "Risk and confidence graded on every pick",
  },
  {
    src: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1600&q=80&auto=format&fit=crop",
    alt: "Football on the pitch",
    kicker: "Accountability",
    line: "Wins and losses stay on the public ledger",
  },
];

const DURATION = 4200;

export default function VideoAd() {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(
      () => setIndex((i) => (i + 1) % FRAMES.length),
      DURATION,
    );
    return () => clearInterval(timer);
  }, [playing]);

  const frame = FRAMES[index];

  return (
    <section className="border-b border-border bg-background">
      <div className="mx-auto max-w-6xl px-5 py-14 md:py-16">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-card">
          <div className="relative aspect-[4/5] w-full sm:aspect-[16/9] lg:aspect-[21/9]">
            {FRAMES.map((item, i) => (
              <div
                key={item.src}
                className={`absolute inset-0 h-full w-full transition-opacity duration-1000 ${
                  i === index ? "opacity-100 z-10" : "opacity-0 z-0"
                }`}
              >
                <Image
                  src={item.src}
                  alt={item.alt}
                  fittingType="fill"
                  className="h-full w-full object-cover"
                />
              </div>
            ))}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/20 z-20" />

            <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full border border-border/70 bg-background/60 px-3 py-1.5 backdrop-blur z-30">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-foreground">
                BetCode9ja intro
              </span>
            </div>
            <span className="absolute right-5 top-5 hidden font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground sm:block z-30">
              AI sports intelligence
            </span>

            <div className="absolute inset-x-0 bottom-0 p-5 md:p-8 z-30">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
                {frame.kicker} · {String(index + 1).padStart(2, "0")}/
                {String(FRAMES.length).padStart(2, "0")}
              </p>
              <h2 className="mt-2 max-w-xl font-display text-2xl font-bold leading-tight tracking-[-0.02em] text-foreground md:text-4xl">
                {frame.line}
              </h2>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setPlaying((p) => !p)}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 font-display text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                  aria-label={playing ? "Pause the intro" : "Play the intro"}
                >
                  {playing ? (
                    <Pause className="h-3.5 w-3.5" />
                  ) : (
                    <Play className="h-3.5 w-3.5" />
                  )}
                  {playing ? "Pause" : "Play"}
                </button>
                <Link
                  href="/picks"
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-background/60 px-4 py-2 font-display text-xs font-semibold text-foreground backdrop-blur transition-colors hover:border-primary/50"
                >
                  See today&apos;s tips <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            <div className="absolute inset-x-5 bottom-0 hidden justify-end pb-8 lg:flex z-30">
              <div className="rounded-xl border border-border/70 bg-background/70 px-4 py-3 backdrop-blur">
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  Risk · Confidence
                </p>
                <p className="mt-1 font-mono text-sm text-primary">Low · 78%</p>
              </div>
            </div>
          </div>

          <div className="flex gap-1.5 px-5 pb-4">
            {FRAMES.map((item, i) => (
              <button
                key={item.src}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Show scene ${i + 1}`}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  i === index ? "bg-primary" : "bg-border"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
