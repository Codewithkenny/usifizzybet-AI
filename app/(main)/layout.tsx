import type { ReactNode } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function MainLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
