"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usifizzyClient } from "@/api/usifizzyClient";
import type { PickRecord } from "@/lib/entityTypes";
import { useAuth } from "@/lib/AuthContext";
import { useMembership } from "@/hooks/useMembership";
import { useMyBetCodeFeed } from "@/hooks/useMyBetCodeFeed";
import { winRate } from "@/lib/format";
import Hero from "@/components/home/Hero";
import PromoBanner from "@/components/home/PromoBanner";
import StatsRow from "@/components/home/StatsRow";
import MyBetCodeBoard from "@/components/home/MyBetCodeBoard";
import AdStrip from "@/components/home/AdStrip";
import VideoAd from "@/components/home/VideoAd";
import HowItWorks from "@/components/home/HowItWorks";
import RecordList from "@/components/home/RecordList";
import { Button } from "@/components/ui/button";

export default function EntryHomePage() {
  const { user } = useAuth();
  const membership = useMembership();
  const feed = useMyBetCodeFeed();
  const [graded, setGraded] = useState<PickRecord[]>([]);
  const [stats, setStats] = useState({ won: 0, lost: 0 });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoadError("");
        const [gradedPage, wonRes, lostRes] = await Promise.all([
          usifizzyClient.entities.Pick.filter(
            { status: { $in: ["Won", "Lost"] } },
            { sort: "-kickoff", limit: 6 },
          ),
          usifizzyClient.entities.Pick.count({ status: "Won" }),
          usifizzyClient.entities.Pick.count({ status: "Lost" }),
        ]);

        setGraded(gradedPage || []);
        setStats({ won: wonRes.count, lost: lostRes.count });
      } catch (error) {
        console.error("Home results fetch failed:", error);
        setLoadError("We couldn't load the public results ledger.");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const pendingCount = feed.picks.filter(
    (pick) => pick.status === "Pending",
  ).length;
  const locked = !membership.active;

  return (
    <div>
      <Hero
        featured={feed.picks[0]}
        locked={locked || Boolean(feed.picks[0]?.provider_locked)}
        pendingCount={pendingCount}
        feedLoading={feed.loading}
      />
      <StatsRow won={stats.won} lost={stats.lost} pending={pendingCount} />
      <PromoBanner />
      {loadError && (
        <p
          role="alert"
          className="mx-auto max-w-6xl px-5 py-4 text-sm text-destructive"
        >
          {loadError}
        </p>
      )}

      <MyBetCodeBoard feed={feed} compact />
      <VideoAd />
      <AdStrip />

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
                Available settled picks currently show {stats.won} won and{" "}
                {stats.lost} lost. The results archive comes from our published
                ledger and may not include every upstream selection.
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
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading results…</p>
            ) : (
              <RecordList picks={graded} />
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 md:py-20 bg-background">
        <div className="overflow-hidden rounded-3xl border border-primary/25 bg-gradient-to-br from-primary/[0.09] via-card to-card px-7 py-12 text-center md:px-16">
          <p className="eyebrow">Membership</p>
          <h2 className="mx-auto mt-3 max-w-2xl font-display text-3xl font-medium tracking-[-0.02em] text-foreground md:text-4xl">
            Unlock the picks and analysis that make sense for you.
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground">
            Pro unlocks up to three picks each day. Elite unlocks all picks
            available through our feed plan. Live scores and the public record
            remain open.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {user && membership.active ? (
              <Button size="lg" className="font-display font-semibold" asChild>
                <Link href="/dashboard">Open my dashboard</Link>
              </Button>
            ) : user ? (
              <Button size="lg" className="font-display font-semibold" asChild>
                <Link href="/membership">Compare membership plans</Link>
              </Button>
            ) : (
              <>
                <Button
                  size="lg"
                  className="font-display font-semibold"
                  asChild
                >
                  <Link href="/membership">Compare membership plans</Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="font-display"
                  asChild
                >
                  <Link href="/register">Create a free account</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
