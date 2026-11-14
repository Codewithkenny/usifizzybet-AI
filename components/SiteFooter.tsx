"use client";

import * as React from "react";
import Link from "next/link";
import { Brand } from "@/components/SiteHeader";
import { HeartHandshake } from "lucide-react";

export default function SiteFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-6xl px-5 py-14">
        <section
          aria-labelledby="responsible-play-heading"
          className="mb-12 rounded-3xl border border-primary/20 bg-primary/[0.06] p-6 sm:p-8"
        >
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex gap-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-primary/20 bg-background text-primary">
                <HeartHandshake className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <p className="eyebrow">Play with perspective · 18+</p>
                <h2
                  id="responsible-play-heading"
                  className="mt-2 font-display text-xl font-medium text-foreground"
                >
                  Sport is unpredictable. Keep your limits.
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                  Our analysis is information, not a promise of results. Decide
                  your limits in advance, take a break when you need one, and
                  never try to win back losses.
                </p>
              </div>
            </div>
            <nav aria-label="Responsible play support" className="sm:pt-1">
              <p className="mb-2 text-xs font-medium text-foreground">
                Looking for support?
              </p>
              <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
                <a
                  href="https://gamblersanonymous.org/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary underline-offset-4 hover:underline"
                >
                  Gamblers Anonymous
                </a>
                <a
                  href="https://www.gamcare.org.uk/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary underline-offset-4 hover:underline"
                >
                  GamCare (UK)
                </a>
              </div>
            </nav>
          </div>
        </section>
        <div className="flex flex-col gap-10 md:flex-row md:justify-between">
          <div className="max-w-sm">
            <Brand />
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              AI-assisted sports analysis for football and basketball. We aim
              to publish a transparent record; coverage depends on available
              match data.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-10 text-sm sm:grid-cols-3">
            <div className="space-y-3">
              <p className="eyebrow">Product</p>
              <Link
                href="/picks"
                className="block text-muted-foreground hover:text-foreground"
              >
                Today&apos;s picks
              </Link>
              <Link
                href="/safe-bets"
                className="block text-muted-foreground hover:text-foreground"
              >
                SafeBets
              </Link>
              <Link
                href="/results"
                className="block text-muted-foreground hover:text-foreground"
              >
                Results
              </Link>
              <Link
                href="/membership"
                className="block text-muted-foreground hover:text-foreground"
              >
                Membership
              </Link>
              <Link
                href="/faq"
                className="block text-muted-foreground hover:text-foreground"
              >
                FAQ
              </Link>
            </div>
            <div className="space-y-3">
              <p className="eyebrow">Account</p>
              <Link
                href="/login"
                className="block text-muted-foreground hover:text-foreground"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="block text-muted-foreground hover:text-foreground"
              >
                Create account
              </Link>
              <Link
                href="/dashboard"
                className="block text-muted-foreground hover:text-foreground"
              >
                Dashboard
              </Link>
              <Link
                href="/profile"
                className="block text-muted-foreground hover:text-foreground"
              >
                Profile
              </Link>
            </div>
          </div>
        </div>
        <div className="mt-12 border-t border-border pt-6">
          <p className="text-xs leading-relaxed text-muted-foreground">
            BetCode9ja publishes prediction tips and probabilistic analysis
            only. We take no stakes, hold no balances and run no betting
            accounts. Tips are opinions, not guarantees — past results never
            predict future outcomes. 18+.
          </p>
          <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            © {new Date().getFullYear()} BetCode9ja
          </p>
        </div>
      </div>
    </footer>
  );
}
