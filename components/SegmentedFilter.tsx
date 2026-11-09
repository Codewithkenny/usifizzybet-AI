"use client"; // Required as this component handles active button interactions

import * as React from "react";

// Using a generic interface so your values can be strictly typed strings or numbers
interface FilterOption<T> {
  value: T;
  label: string;
}

interface SegmentedFilterProps<T> {
  options: FilterOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

export default function SegmentedFilter({
  options,
  value,
  onChange,
}: SegmentedFilterProps<string | number>) {
  return (
    <div className="inline-flex flex-wrap items-center gap-1 rounded-full border border-border bg-card/60 p-1">
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`rounded-full px-3.5 py-1.5 font-display text-xs font-medium transition-colors ${
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
