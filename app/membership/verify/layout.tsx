import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verifying Membership Payment",
  robots: { index: false, follow: false },
  alternates: { canonical: "/membership/verify" },
};

export default function MembershipVerificationLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
