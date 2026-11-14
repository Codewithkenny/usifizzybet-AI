"use client";

import PicksCatalog from "@/components/picks/PicksCatalog";
import { useMyBetCodeFeed } from "@/hooks/useMyBetCodeFeed";

export default function PicksPage() {
  const feed = useMyBetCodeFeed();

  return (
    <PicksCatalog
      picks={feed.picks}
      loading={feed.loading}
      error={feed.error}
      picksError={feed.picksError}
      fixturesError={feed.fixturesError}
    />
  );
}
