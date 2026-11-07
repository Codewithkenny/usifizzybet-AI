"use client";

import * as React from "react";
import Link from "next/link";
import { Brand } from "@/components/SiteHeader";

export default function SiteFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-6xl px-5 py-14">
        <div className="flex flex-col gap-10 md:flex-row md:justify-between">
          <div className="max-w-sm">
            <Brand />
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              AI-assisted sports analysis for football and basketball. Every
              pick is scored, published and graded in public.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-10 text-sm sm:grid-cols-3">
            <div className="space-y-3">
              <p className="eyebrow">Product</p>
              <Link
                href="/picks"
                className="block text-muted-foreground hover:text-foreground"
              >
                Today's picks
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
            <div className="space-y-3">
              <p className="eyebrow">Desk</p>
              <Link
                href="/admin"
                className="block text-muted-foreground hover:text-foreground"
              >
                Admin
              </Link>
            </div>
          </div>
        </div>
        <div className="mt-12 border-t border-border pt-6">
          <p className="text-xs leading-relaxed text-muted-foreground">
            usifizzybet AI publishes prediction tips and probabilistic analysis
            only. We take no stakes, hold no balances and run no betting
            accounts. Tips are opinions, not guarantees — past results never
            predict future outcomes. 18+.
          </p>
          <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            © {new Date().getFullYear()} usifizzybet AI
          </p>
        </div>
      </div>
    </footer>
  );
}
