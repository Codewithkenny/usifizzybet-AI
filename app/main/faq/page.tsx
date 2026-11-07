import * as React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// Strictly-typed FAQ matrix imported directly from your content arrays
export const FAQ_ITEMS = [
  {
    q: "Is usiffizybet a betting site?",
    a: "No. usiffizybet is a sports prediction and analysis service. We publish tips, confidence scores and written reasoning. We take no stakes, hold no balances, run no betting accounts and are not affiliated with any operator. Nothing on this site is a prompt to place money on anything.",
  },
  {
    q: "How does the AI analysis work?",
    a: "Our model searches live fixture lists for the next two days, then scores each match on recent form, head-to-head history, goals for and against, and any confirmed team news it can verify. That probability is converted into a fair price and compared with the market. Only selections that clear a minimum edge make the slate.",
  },
  {
    q: "Where do the picks come from?",
    a: "Every pick is generated from verifiable fixture data — never invented. A human editor reviews the slate on the desk before it is published, and anything ungrounded is removed.",
  },
  {
    q: "What do confidence and risk mean?",
    a: "Confidence is the model's estimated probability that the selection lands, shown as a percentage. Risk grade reflects price and volatility: Low risk sits on short, stable markets, High risk carries wider variance. High confidence and low risk are not the same thing.",
  },
  {
    q: "Do you guarantee results?",
    a: "No, and no honest service can. Every pick is a probability, published before kick-off and graded in public afterwards — including the losses. Our full results ledger is open to everyone.",
  },
  {
    q: "How are results graded?",
    a: "The desk grades each pick against the official final score once the match ends. A pick is Won only if the selection actually came in. Graded records are never edited or deleted.",
  },
  {
    q: "What is a SafeBets slip?",
    a: "SafeBets is a multi-leg tip at a target combined price — 5.00, 10.00 or 50.00. We build it from lower-variance markets such as double chance, over 1.5 goals or under 3.5 goals, so the legs are steadier than a long-odds guess.",
  },
  {
    q: "What do I get for free, and what does membership add?",
    a: "A free account shows today's picks with confidence grades, the public results ledger and the 5.00 SafeBets tip. Pro adds the full reasoning on every selection, all three SafeBets slips, the filterable results archive and kick-off alerts. Elite adds every league we cover, early slate access, the weekly model report and priority requests.",
  },
  {
    q: "How does billing work, and can I cancel?",
    a: "Membership is a monthly subscription billed by our payment provider, who handle your card directly — we never see or store card details. You can cancel at any time from your profile and stay on until the end of the paid period.",
  },
  {
    q: "What sports and leagues do you cover?",
    a: "Football and basketball, focused on the major European leagues, European competitions, and the main US basketball competitions. Elite members get access to every league we model.",
  },
];

export default function FaqPage() {
  return (
    <section className="mx-auto max-w-3xl px-5 py-16 md:py-24">
      <div className="text-center mb-12">
        <p className="eyebrow">Help desk</p>
        <h1 className="mt-3 font-display text-4xl font-medium tracking-[-0.02em] text-foreground sm:text-5xl">
          Frequently Asked Questions
        </h1>
        <p className="mt-4 text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
          Everything you need to know about the prediction engines, record
          verification algorithms, and tier access.
        </p>
      </div>

      <Accordion
        type="single"
        collapsible
        className="w-full border-t border-border"
      >
        {FAQ_ITEMS.map((item, index) => (
          <AccordionItem
            key={index}
            value={`item-${index}`}
            className="border-b border-border py-2"
          >
            <AccordionTrigger className="font-display font-medium text-base text-foreground hover:no-underline hover:text-primary transition-colors py-4">
              {item.q}
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-4 pt-1 pr-6">
              {item.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
