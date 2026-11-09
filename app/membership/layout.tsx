import { pageMetadata } from "@/lib/pageMetadata";

export const metadata = pageMetadata({
  title: "Membership Plans & Pricing",
  description:
    "Compare Usiffizybet membership plans priced in Nigerian naira. Payments cover one month and do not renew automatically.",
  path: "/membership",
});

export default function MembershipLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
