export const CURRENCY = "NGN";

export type PlanId = "Free" | "Pro" | "Elite";

export interface Plan {
  id: PlanId;
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
    cadence: "no expiry",
    tagline: "Follow the public record",
    features: [
      "The public results ledger — wins and losses",
      "Fixture and score updates when a data source is available",
      "Preview of current pick details when available",
    ],
    cta: "Create free account",
  },
  {
    id: "Pro",
    name: "Pro",
    price: 5000,
    cadence: "one calendar month",
    tagline: "Today's picks, with the analysis",
    highlight: true,
    features: [
      "Up to 3 available pending picks per day",
      "Selection and analysis when provided by the source",
      "Fixture and score updates when available",
      "Public results ledger — wins and losses",
      "One month of access; renew manually",
    ],
    cta: "Choose Pro",
  },
  {
    id: "Elite",
    name: "Elite",
    price: 15000,
    cadence: "one calendar month",
    tagline: "The complete available analysis slate",
    features: [
      "All available pending picks from the configured source",
      "Selection and analysis when provided by the source",
      "Fixture and score updates when available",
      "Public results ledger — wins and losses",
      "One month of access; renew manually",
    ],
    cta: "Choose Elite",
  },
];

export const planById = (id: PlanId | string | null | undefined): Plan =>
  PLANS.find((plan) => plan.id === id) || PLANS[0];
