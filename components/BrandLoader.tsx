export default function BrandLoader() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading Usiffizybet"
      className="fixed inset-0 z-[100] grid place-items-center bg-background"
    >
      <div className="flex flex-col items-center">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary font-display text-xl font-bold text-primary-foreground shadow-lg shadow-primary/25">
            U
          </span>
          <span className="font-display text-xl font-semibold tracking-tight text-foreground">
            usiffizybet
            <span className="ml-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-primary">
              AI
            </span>
          </span>
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
