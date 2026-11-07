"use client";

import React from "react";
import { Star } from "lucide-react";
import { TESTIMONIALS, REVIEW_SUMMARY } from "@/lib/Testimonials";

interface StarsProps {
  count: number;
}

function Stars({ count }: StarsProps) {
  return (
    <div className="flex gap-0.5" aria-label={`${count} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={
            n <= count
              ? "h-3.5 w-3.5 fill-primary text-primary"
              : "h-3.5 w-3.5 text-muted-foreground/40"
          }
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

export default function Testimonials() {
  return (
    <section className="border-b border-border bg-background">
      <div className="mx-auto max-w-6xl px-5 py-16 md:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Reviews</p>
            <h2 className="mt-3 max-w-xl font-display text-3xl font-bold tracking-[-0.02em] text-foreground md:text-4xl">
              What members say about the analysis.
            </h2>
          </div>
          <div className="rounded-2xl border border-border bg-card px-5 py-4">
            <div className="flex items-center gap-2">
              <span className="font-display text-2xl font-bold text-foreground">
                {REVIEW_SUMMARY.rating}
              </span>
              <Stars count={5} />
            </div>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              {REVIEW_SUMMARY.count.toLocaleString()} reviews
            </p>
          </div>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map((item) => (
            <figure
              key={item.name}
              className="flex flex-col rounded-2xl border border-border bg-card p-5"
            >
              <Stars count={item.rating} />
              <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-foreground">
                “{item.quote}”
              </blockquote>
              <figcaption className="mt-4 border-t border-border/70 pt-3">
                <p className="font-display text-sm font-semibold text-foreground">
                  {item.name}
                </p>
                <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  {item.role}
                </p>
              </figcaption>
            </figure>
          ))}
        </div>
        <p className="mt-6 text-xs text-muted-foreground">
          Reviews are member feedback. Predictions are opinions, not guarantees
          — past results never predict future outcomes.
        </p>
      </div>
    </section>
  );
}
