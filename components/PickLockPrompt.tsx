import * as React from "react";
import Link from "next/link"; // Swapped to Next.js optimized router link
import { Lock } from "lucide-react";

interface PickLockPromptProps {
  label?: string;
}

export default function PickLockPrompt({
  label = "Selection, odds and reasoning are for members",
}: PickLockPromptProps) {
  return (
    <div className="mt-4 rounded-xl border border-dashed border-primary/30 bg-primary/[0.04] p-4 text-center">
      <Lock className="mx-auto h-4 w-4 text-primary" aria-hidden="true" />
      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
        {label}
      </p>
      <Link
        href="/register" // Converted from 'to' attribute to Next.js 'href'
        className="mt-3 inline-flex items-center rounded-full bg-primary px-4 py-2 font-display text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90"
      >
        Unlock free
      </Link>
    </div>
  );
}
