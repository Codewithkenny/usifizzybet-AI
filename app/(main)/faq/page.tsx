import * as React from "react";
import { pageMetadata } from "@/lib/pageMetadata";
import StructuredData from "@/components/StructuredData";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata = pageMetadata({
  title: "Sports Picks, Membership & Results FAQs",
  description:
    "Clear answers about BetCode9ja sports predictions, confidence and risk labels, results, membership pricing and payment.",
  path: "/faq",
});

const FAQ_ITEMS = [
  {
    q: "Is BetCode9ja a betting site?",
    a: "No. BetCode9ja is a sports prediction and analysis service. We publish tips, confidence scores and written reasoning. We take no stakes, hold no balances, run no betting accounts and are not affiliated with any operator. Nothing on this site is a prompt to place money on anything.",
  },
  {
    q: "How does the AI analysis work?",
    a: "BetCode9ja does not currently publish a proprietary, independently calibrated prediction model. When picks are available, analysis and labels may come from the configured sports-data source; they can be wrong or incomplete.",
  },
  {
    q: "Where do the picks come from?",
    a: "Picks appear only when a sports-data source is configured and has selections available. MyBetCode is an optional integration that may be connected later. We do not claim every selection is independently verified or human-reviewed.",
  },
  {
    q: "What do confidence and risk mean?",
    a: "Confidence and risk labels are informational and are not independently calibrated probabilities or guarantees. Actual outcomes can differ substantially from either score.",
  },
  {
    q: "Do you guarantee results?",
    a: "No. Predictions are uncertain and may be wrong. The public results ledger shows published outcomes where available, but it may be incomplete and does not guarantee future results.",
  },
  {
    q: "How are results graded?",
    a: "Results should be checked against final match results. A complete independently verified grading process is not currently available, so the public ledger may be incomplete.",
  },
  {
    q: "What is a SafeBets slip?",
    a: "SafeBets is a multi-leg tip at a target combined price. Each added leg increases the chance that the overall selection fails; it is not safer or guaranteed.",
  },
  {
    q: "What do I get for free, and what does membership add?",
    a: "The public results ledger is open to everyone. Fixture updates, live scores and pending picks depend on the sports-data source being configured and having data available. Paid membership changes access to available picks; it does not guarantee that picks will be published.",
  },
  {
    q: "How does billing work, and can I cancel?",
    a: "Payments are processed by Paystack. Each successful payment grants one month of access; plans do not auto-renew, and you can renew manually from the membership page.",
  },
  {
    q: "What sports and leagues do you cover?",
    a: "The service is intended to cover football and basketball. Current fixtures and league coverage depend on the data available for each slate.",
  },
];

export default function FaqPage() {
  return (
    <>
      <StructuredData
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQ_ITEMS.map((item) => ({
            "@type": "Question",
            name: item.q,
            acceptedAnswer: {
              "@type": "Answer",
              text: item.a,
            },
          })),
        }}
      />
      <section className="mx-auto max-w-3xl px-5 py-16 md:py-24">
        <div className="mb-12 text-center">
          <p className="eyebrow">Help desk</p>
          <h1 className="mt-3 font-display text-4xl font-medium tracking-[-0.02em] text-foreground sm:text-5xl">
            Frequently Asked Questions
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground">
            Clear answers about sports analysis, results, membership access, and
            the limits of AI-generated predictions.
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
              <AccordionTrigger className="py-4 font-display text-base font-medium text-foreground transition-colors hover:text-primary hover:no-underline">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="pr-6 pb-4 pt-1 text-sm leading-relaxed text-muted-foreground">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </>
  );
}
