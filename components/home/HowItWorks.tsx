import * as React from "react";

interface StepItem {
  id: string;
  title: string;
  body: string;
}

const STEPS: StepItem[] = [
  {
    id: "01",
    title: "Reads the fixtures",
    body: "The AI searches the web for upcoming football and basketball fixtures, recent form, head-to-head records and available team news.",
  },
  {
    id: "02",
    title: "Scores the risk",
    body: "Each selection carries an estimated probability, a risk grade and written reasoning. Web research is not a real-time sports data feed.",
  },
  {
    id: "03",
    title: "Grades in public",
    body: "When a game finishes, the pick is marked won, lost or void. Nothing is edited and nothing is quietly deleted.",
  },
];

export default function HowItWorks() {
  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-6xl px-5 py-16 md:py-20">
        <p className="eyebrow">How it works</p>
        <h2 className="mt-3 max-w-xl font-display text-3xl font-medium tracking-[-0.02em] text-foreground md:text-4xl">
          Analysis you can actually audit.
        </h2>
        <div className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-3">
          {STEPS.map((step) => (
            <div key={step.id} className="bg-card p-7">
              <span className="font-mono text-xs text-primary">{step.id}</span>
              <h3 className="mt-4 font-display text-lg font-medium text-foreground">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
