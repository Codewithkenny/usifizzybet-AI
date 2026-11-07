export const CURRENCY = "NGN";

// Strict type literal for your application subscription tiers
export type PlanId = "Free" | "Pro" | "Elite";

export interface Plan {
  id: PlanId | string;
  name: string;
  price: number | null;
  cadence: string;
  tagline: string;
  features: string[];
  cta: string;
  highlight?: boolean;
}

export const PLANS: Plan[] = [
  {
    id: "Free",
    name: "Free",
    price: 0,
    cadence: "free forever",
    tagline: "Follow the public record",
    features: [
      "Today's football and basketball picks",
      "Confidence score and risk grade on every pick",
      "The public results ledger — wins and losses",
      "The 5.00 SafeBets tip of the day",
    ],
    cta: "Create free account",
  },
  {
    id: "Pro",
    name: "Pro",
    price: null,
    cadence: "per month",
    tagline: "Every pick, fully unlocked",
    highlight: true,
    features: [
      "Everything in Free",
      "Full written reasoning on every selection",
      "All three SafeBets tips — 5.00, 10.00 and 50.00",
      "The full results archive with league filters",
      "Email alert before each kick-off",
    ],
    cta: "Choose Pro",
  },
  {
    id: "Elite",
    name: "Elite",
    price: null,
    cadence: "per month",
    tagline: "The whole desk",
    features: [
      "Everything in Pro",
      "Every league and market we cover",
      "Early access to the slate, 24 hours ahead",
      "Weekly model performance report",
      "Priority analysis requests",
    ],
    cta: "Choose Elite",
  },
];

export const planById = (id: PlanId | string | null | undefined): Plan =>
  PLANS.find((plan) => plan.id === id) || PLANS[0];
