import { pageMetadata } from "@/lib/pageMetadata";

export const metadata = pageMetadata({
  title: "Today's Football & Basketball Picks",
  description:
    "View available football and basketball picks with match details and analysis when a sports-data source is available. Predictions are uncertain and not guaranteed.",
  path: "/picks",
});

export default function PicksLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
