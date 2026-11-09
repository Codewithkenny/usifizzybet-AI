import { pageMetadata } from "@/lib/pageMetadata";

export const metadata = pageMetadata({
  title: "Multi-Selection Sports Tips",
  description:
    "Review multi-selection sports tips and their combined odds. Every added selection increases the chance the full slip loses.",
  path: "/safe-bets",
});

export default function SafeBetsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
