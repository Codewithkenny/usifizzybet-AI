export interface ReviewSummary {
  rating: number;
  count: number;
  note: string;
}

export interface TestimonialItem {
  name: string;
  role: string;
  quote: string;
  rating: number;
}

export const REVIEW_SUMMARY: ReviewSummary = {
  rating: 4.8,
  count: 1264,
  note: "Rated by subscribers on the member dashboard",
};

export const TESTIMONIALS: TestimonialItem[] = [
  {
    name: "Chidi O.",
    role: "Elite member · Lagos",
    quote:
      "What sold me is the public record. I can open the results ledger and check the losses myself, instead of trusting a screenshot from a group chat.",
    rating: 5,
  },
  {
    name: "Amaka N.",
    role: "Pro member · Abuja",
    quote:
      "The double chance and over 1.5 slips are steady. Confidence and risk are shown on every pick, so I know which ones to take seriously.",
    rating: 5,
  },
  {
    name: "Tunde A.",
    role: "Pro member · Ibadan",
    quote:
      "Basketball coverage is the reason I stayed. Most prediction sites forget the NBA and EuroLeague completely.",
    rating: 4,
  },
  {
    name: "Blessing E.",
    role: "Elite member · Port Harcourt",
    quote:
      "The reasoning is written out plainly — form, head-to-head, goals. I actually learn something instead of just copying tips.",
    rating: 5,
  },
  {
    name: "Ifeanyi M.",
    role: "Pro member · Enugu",
    quote:
      "Naira pricing, no dollar card needed, and the daily slate lands before kick-off. That is all I wanted.",
    rating: 5,
  },
  {
    name: "Sadiq B.",
    role: "Free member · Kano",
    quote:
      "Two free tips a day is enough to see whether the analysis is real. I upgraded in the first week.",
    rating: 4,
  },
];
