"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usifizzyClient } from "@/api/usifizzyClient";
import { useAuth } from "@/lib/AuthContext";
import { winRate } from "@/lib/format";
import Hero from "@/components/home/Hero";
import StatsRow from "@/components/home/StatsRow";
import HowItWorks from "@/components/home/HowItWorks";
import RecordList from "@/components/home/RecordList";
import PickCard from "@/components/PickCard";
import { Button } from "@/components/ui/button";

export default function EntryHomePage() {
  const { user } = useAuth();
  const [picks, setPicks] = useState<any[]>([]);
  const [graded, setGraded] = useState<any[]>([]);
  const [stats, setStats] = useState({ won: 0, lost: 0, pending: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [pendingPage, gradedPage, wonRes, lostRes, pendingRes] =
          await Promise.all([
            usifizzyClient.entities.Pick.filter(
              { status: "Pending" },
              { sort: "kickoff", limit: 3 },
            ),
            usifizzyClient.entities.Pick.filter(
              { status: { $in: ["Won", "Lost"] } },
              { sort: "-kickoff", limit: 6 },
            ),
            usifizzyClient.entities.Pick.count({ status: "Won" }),
            usifizzyClient.entities.Pick.count({ status: "Lost" }),
            usifizzyClient.entities.Pick.count({ status: "Pending" }),
          ]);

        setPicks(pendingPage?.items || []);
        setGraded(gradedPage?.items || []);

        // FIXED: Extract the numeric value out of the Supabase count object structure securely
        const wonCount =
          typeof wonRes === "number" ? wonRes : ((wonRes as any)?.count ?? 0);
        const lostCount =
          typeof lostRes === "number"
            ? lostRes
            : ((lostRes as any)?.count ?? 0);
        const pendingCount =
          typeof pendingRes === "number"
            ? pendingRes
            : ((pendingRes as any)?.count ?? 0);

        setStats({ won: wonCount, lost: lostCount, pending: pendingCount });
      } catch (error) {
        console.error("Home data fetch transaction failed:", error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const locked = !user;

  return (
    <div>
      <Hero featured={picks[0]} locked={locked} pendingCount={stats.pending} />
      <StatsRow won={stats.won} lost={stats.lost} pending={stats.pending} />

      <section className="border-b border-border bg-background">
        <div className="mx-auto max-w-6xl px-5 py-16 md:py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Today's slate</p>
              <h2 className="mt-3 font-display text-3xl font-medium tracking-[-0.02em] text-foreground md:text-4xl">
                The picks on the board
              </h2>
            </div>
            <Link
              href="/picks"
              className="font-display text-sm text-primary hover:underline"
            >
              View all picks →
            </Link>
          </div>

          {loading ? (
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-64 animate-pulse rounded-2xl border border-border bg-card/60"
                />
              ))}
            </div>
          ) : picks.length ? (
            <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {picks.map((pick) => (
                <PickCard key={pick.id} pick={pick} locked={locked} />
              ))}
            </div>
          ) : (
            <p className="mt-10 rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground bg-card/30">
              No live picks on the board right now — the next slate lands
              shortly.
            </p>
          )}
        </div>
      </section>

      <HowItWorks />

      <section className="border-b border-border bg-background">
        <div className="mx-auto max-w-6xl px-5 py-16 md:py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">The public record</p>
              <h2 className="mt-3 font-display text-3xl font-medium tracking-[-0.02em] text-foreground md:text-4xl">
                {winRate(stats.won, stats.lost)} win rate, in the open
              </h2>
              <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground">
                Every settled pick stays on the record: {stats.won} won,{" "}
                {stats.lost} lost. Judge the analysis on the full ledger, not
                the highlight reel.
              </p>
            </div>
            <Link
              href="/results"
              className="font-display text-sm text-primary hover:underline"
            >
              Full results ledger →
            </Link>
          </div>
          <div className="mt-8">
            <RecordList picks={graded} />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 md:py-20 bg-background">
        <div className="overflow-hidden rounded-3xl border border-primary/25 bg-gradient-to-br from-primary/[0.09] via-card to-card px-7 py-12 text-center md:px-16">
          <p className="eyebrow">Members unlock</p>
          <h2 className="mx-auto mt-3 max-w-2xl font-display text-3xl font-medium tracking-[-0.02em] text-foreground md:text-4xl">
            Every selection, confidence score and reasoning — free with an
            account.
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground">
            Browsing is open to everyone. A free account reveals the full
            analysis and the daily SafeBets tips.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {user ? (
              <Button size="lg" className="font-display font-semibold" asChild>
                <Link href="/dashboard">Open my dashboard</Link>
              </Button>
            ) : (
              <>
                <Button
                  size="lg"
                  className="font-display font-semibold"
                  asChild
                >
                  <Link href="/register">Create free account</Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="font-display"
                  asChild
                >
                  <Link href="/login">I already have one</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
