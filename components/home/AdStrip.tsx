"use client";

import React from "react";
import Link from "next/link";
import { Image } from "@/components/ui/image";
import { ArrowRight } from "lucide-react";

interface AdvertItem {
  eyebrow: string;
  title: string;
  body: string;
  href: string;
  cta: string;
  src: string;
  alt: string;
}

const ADVERTS: AdvertItem[] = [
  {
    eyebrow: "Sponsored-style promo",
    title: "SafeBets at 10, 20 and 50 odds",
    body: "Low-variance multi-leg tips built from the day's strongest reads.",
    href: "/safe-bets",
    cta: "Open SafeBets",
    src: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=900&q=80&auto=format&fit=crop",
    alt: "Footballer striking the ball",
  },
  {
    eyebrow: "Membership",
    title: "Unlock every pick, every day",
    body: "Full reasoning, confidence grades and all SafeBets slips in Naira.",
    href: "/membership",
    cta: "See plans",
    src: "https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?w=900&q=80&auto=format&fit=crop",
    alt: "Stadium under floodlights",
  },
  {
    eyebrow: "Public record",
    title: "Check the ledger before you trust it",
    body: "Every settled pick is graded in the open — wins and losses both.",
    href: "/results",
    cta: "View results",
    src: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=900&q=80&auto=format&fit=crop",
    alt: "Basketball court detail",
  },
];

export default function AdStrip() {
  return (
    <section className="border-b border-border bg-secondary/20">
      <div className="mx-auto max-w-6xl px-5 py-14 md:py-16">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <p className="eyebrow">Inside usifizzybet</p>
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            Promotions for members
          </span>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {ADVERTS.map((ad) => (
            <Link
              key={ad.title}
              href={ad.href}
              className="group overflow-hidden rounded-2xl border border-border bg-card transition-colors hover:border-primary/40 block"
            >
              <div className="relative aspect-[16/9] overflow-hidden">
                <Image
                  src={ad.src}
                  alt={ad.alt}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent" />
                <span className="absolute left-3 top-3 rounded-full bg-background/70 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.16em] text-primary backdrop-blur">
                  {ad.eyebrow}
                </span>
              </div>
              <div className="p-5">
                <h3 className="font-display text-lg font-bold leading-snug tracking-tight text-foreground">
                  {ad.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {ad.body}
                </p>
                <span className="mt-4 inline-flex items-center gap-1.5 font-display text-xs font-semibold text-primary">
                  {ad.cta} <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
