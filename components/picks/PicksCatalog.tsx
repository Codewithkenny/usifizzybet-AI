"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { useMembership } from "@/hooks/useMembership";
import type { MyBetCodePick } from "@/hooks/useMyBetCodeFeed";
import PickCard from "@/components/PickCard";
import { Button } from "@/components/ui/button";

type PickFilter = "all" | "pending" | "settled";
type PickSort = "kickoff-asc" | "kickoff-desc" | "confidence";

const PAGE_SIZE = 9;

interface PicksCatalogProps {
  picks: MyBetCodePick[];
  loading: boolean;
  error: string;
  picksError: string;
  fixturesError: string;
}

function getPageNumbers(currentPage: number, pageCount: number): number[] {
  if (pageCount <= 5) {
    return Array.from({ length: pageCount }, (_, index) => index + 1);
  }
  if (currentPage <= 3) return [1, 2, 3, 4, 5];
  if (currentPage >= pageCount - 2) {
    return Array.from({ length: 5 }, (_, index) => pageCount - 4 + index);
  }
  return [
    currentPage - 2,
    currentPage - 1,
    currentPage,
    currentPage + 1,
    currentPage + 2,
  ];
}

export default function PicksCatalog({
  picks,
  loading,
  error,
  picksError,
  fixturesError,
}: PicksCatalogProps) {
  const membership = useMembership();
  const [filter, setFilter] = useState<PickFilter>("all");
  const [sort, setSort] = useState<PickSort>("kickoff-asc");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const counts = useMemo(
    () => ({
      all: picks.length,
      pending: picks.filter((pick) => pick.status === "Pending").length,
      settled: picks.filter((pick) => pick.status !== "Pending").length,
    }),
    [picks],
  );

  const filteredPicks = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return picks
      .filter((pick) => {
        if (filter === "pending" && pick.status !== "Pending") return false;
        if (filter === "settled" && pick.status === "Pending") return false;
        if (!query) return true;
        return [
          pick.home_team,
          pick.away_team,
          pick.league,
          pick.market,
          pick.selection,
        ]
          .filter(Boolean)
          .some((value) => value?.toLocaleLowerCase().includes(query));
      })
      .sort((a, b) => {
        if (sort === "confidence") {
          return (Number(b.confidence) || 0) - (Number(a.confidence) || 0);
        }
        const difference =
          new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime();
        return sort === "kickoff-asc" ? difference : -difference;
      });
  }, [filter, picks, search, sort]);

  const pageCount = Math.ceil(filteredPicks.length / PAGE_SIZE);
  const safePage = Math.min(currentPage, Math.max(1, pageCount));
  const firstItem = filteredPicks.length ? (safePage - 1) * PAGE_SIZE + 1 : 0;
  const lastItem = Math.min(safePage * PAGE_SIZE, filteredPicks.length);
  const visiblePicks = filteredPicks.slice(firstItem - 1, lastItem);

  function updateFilter(nextFilter: PickFilter) {
    setFilter(nextFilter);
    setCurrentPage(1);
  }

  function updateSearch(value: string) {
    setSearch(value);
    setCurrentPage(1);
  }

  return (
    <section className="mx-auto max-w-6xl px-5 pb-16 pt-8 md:pb-20">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <p className="eyebrow">Daily board</p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            Today&apos;s picks
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Browse the analysis at your pace. Predictions are uncertain and are
            not guarantees.
          </p>
        </div>
        <Link
          href="/results"
          className="font-display text-sm text-primary hover:underline"
        >
          View settled results →
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-2 sm:max-w-xl sm:gap-3">
        {[
          { label: "Total picks", value: counts.all },
          { label: "Pending", value: counts.pending },
          { label: "Settled", value: counts.settled },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-border bg-card/60 px-3 py-3 sm:px-4"
          >
            <p className="font-mono text-lg font-semibold text-foreground">
              {stat.value}
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {error && (
        <p
          role="alert"
          className="mt-6 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive"
        >
          {error}
        </p>
      )}
      {picksError && (
        <p
          role="status"
          className="mt-6 rounded-xl border border-border bg-card/60 p-4 text-sm text-muted-foreground"
        >
          {picksError}
        </p>
      )}

      <div className="mt-8 rounded-2xl border border-border bg-card/50 p-3 sm:p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2" aria-label="Filter picks">
            {(
              [
                ["all", "All picks", counts.all],
                ["pending", "Pending", counts.pending],
                ["settled", "Settled", counts.settled],
              ] as const
            ).map(([value, label, count]) => (
              <button
                key={value}
                type="button"
                aria-pressed={filter === value}
                onClick={() => updateFilter(value)}
                className={`min-h-10 rounded-lg px-3.5 text-xs font-medium transition-colors ${
                  filter === value
                    ? "bg-primary text-primary-foreground"
                    : "border border-border bg-background/60 text-muted-foreground hover:text-foreground"
                }`}
              >
                {label}
                <span className="ml-1.5 opacity-75">{count}</span>
              </button>
            ))}
          </div>

          <div className="grid gap-2 sm:grid-cols-[minmax(12rem,1fr)_auto] lg:w-[27rem]">
            <label className="relative block">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <input
                type="search"
                value={search}
                onChange={(event) => updateSearch(event.target.value)}
                placeholder="Search teams or market"
                aria-label="Search picks by team, league, or market"
                className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </label>
            <label className="sr-only" htmlFor="picks-sort">
              Sort picks
            </label>
            <select
              id="picks-sort"
              value={sort}
              onChange={(event) => {
                setSort(event.target.value as PickSort);
                setCurrentPage(1);
              }}
              className="h-10 rounded-lg border border-border bg-background px-3 text-xs text-foreground outline-none focus:border-primary"
            >
              <option value="kickoff-asc">Kickoff: earliest</option>
              <option value="kickoff-desc">Kickoff: latest</option>
              <option value="confidence">Confidence: highest</option>
            </select>
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-2">
        <p
          className="font-mono text-[11px] text-muted-foreground"
          aria-live="polite"
        >
          {loading
            ? "Loading picks…"
            : error || picksError
              ? "Picks are temporarily unavailable"
              : filteredPicks.length
                ? `Showing ${firstItem}–${lastItem} of ${filteredPicks.length} picks`
                : "No picks match these filters"}
        </p>
        {!membership.active &&
          filteredPicks.some((pick) => pick.provider_locked) && (
            <Link
              href="/membership"
              className="font-mono text-[10px] uppercase tracking-[0.12em] text-primary hover:underline"
            >
              Compare membership plans
            </Link>
          )}
      </div>

      {loading ? (
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <div
              key={index}
              className="h-64 animate-pulse rounded-2xl border border-border bg-card/60"
            />
          ))}
        </div>
      ) : visiblePicks.length ? (
        <div className="mt-4 grid items-stretch gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visiblePicks.map((pick) => (
            <PickCard
              key={pick.id}
              pick={pick}
              locked={pick.provider_locked}
            />
          ))}
        </div>
      ) : !error && !picksError ? (
        <div className="mt-4 rounded-2xl border border-dashed border-border p-10 text-center">
          <p className="font-display text-base text-foreground">
            {search
              ? "No picks match your search."
              : "No picks in this section yet."}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Try changing the filter or search terms.
          </p>
        </div>
      ) : null}

      {pageCount > 1 && (
        <nav
          aria-label="Pick pages"
          className="mt-8 flex flex-wrap items-center justify-center gap-2"
        >
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={safePage === 1}
            onClick={() => setCurrentPage(safePage - 1)}
          >
            Previous
          </Button>
          <div className="flex items-center gap-1">
            {safePage > 3 && pageCount > 5 && (
              <>
                <PageButton
                  page={1}
                  currentPage={safePage}
                  onSelect={setCurrentPage}
                />
                <span className="px-1 text-muted-foreground" aria-hidden="true">
                  …
                </span>
              </>
            )}
            {getPageNumbers(safePage, pageCount).map((page) => (
              <PageButton
                key={page}
                page={page}
                currentPage={safePage}
                onSelect={setCurrentPage}
              />
            ))}
            {safePage < pageCount - 2 && pageCount > 5 && (
              <>
                <span className="px-1 text-muted-foreground" aria-hidden="true">
                  …
                </span>
                <PageButton
                  page={pageCount}
                  currentPage={safePage}
                  onSelect={setCurrentPage}
                />
              </>
            )}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={safePage === pageCount}
            onClick={() => setCurrentPage(safePage + 1)}
          >
            Next
          </Button>
        </nav>
      )}

      {fixturesError && (
        <p className="mt-8 text-center text-xs text-muted-foreground">
          Live scores and match clocks aren&apos;t available right now.
        </p>
      )}
    </section>
  );
}

function PageButton({
  page,
  currentPage,
  onSelect,
}: {
  page: number;
  currentPage: number;
  onSelect: (page: number) => void;
}) {
  const active = page === currentPage;
  return (
    <button
      type="button"
      aria-label={`Go to page ${page}`}
      aria-current={active ? "page" : undefined}
      onClick={() => onSelect(page)}
      className={`grid h-9 min-w-9 place-items-center rounded-lg px-2 font-mono text-xs transition-colors ${
        active
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-card hover:text-foreground"
      }`}
    >
      {page}
    </button>
  );
}
