import Image from "next/image";

export default function BrandLoader() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading BetCode9ja"
      className="fixed inset-0 z-[100] grid place-items-center bg-background"
    >
      <div className="flex flex-col items-center">
        <div className="flex items-center gap-3">
          <Image
            src="/betcode9ja-logo.png"
            alt="BetCode9ja"
            width={320}
            height={128}
            className="h-28 w-64 object-contain"
            priority
          />
        </div>
        <div
          aria-hidden="true"
          className="mt-8 h-1 w-36 overflow-hidden rounded-full bg-muted"
        >
          <div className="h-full w-1/2 animate-pulse rounded-full bg-primary motion-reduce:animate-none" />
        </div>
        <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          Preparing your matchday
        </p>
      </div>
    </div>
  );
}
