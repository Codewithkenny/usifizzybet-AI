import { pageMetadata } from "@/lib/pageMetadata";

export const metadata = pageMetadata({
  title: "Public Results Ledger",
  description:
    "Review published sports prediction results and settled picks. Past results do not guarantee future outcomes.",
  path: "/results",
});

export default function ResultsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
