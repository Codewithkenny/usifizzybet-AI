"use client";

import MyBetCodeBoard from "@/components/home/MyBetCodeBoard";
import { useMyBetCodeFeed } from "@/hooks/useMyBetCodeFeed";

export default function PicksPage() {
  const feed = useMyBetCodeFeed();

  return (
    <div>
      <section className="mx-auto max-w-6xl px-5 pb-0 pt-14 md:pt-20">
        <p className="eyebrow">Daily board</p>
        <h1 className="mt-3 font-display text-4xl font-medium text-foreground">
          Today&apos;s picks
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Picks and match updates depend on an available sports-data source.
          Predictions are uncertain, may be wrong, and are not guarantees.
        </p>
      </section>
      <MyBetCodeBoard feed={feed} />
    </div>
  );
}
