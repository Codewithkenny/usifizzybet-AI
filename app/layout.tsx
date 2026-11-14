import * as React from "react";
import Providers from "@/components/Providers";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import StructuredData from "@/components/StructuredData";
import { siteUrl } from "@/lib/siteUrl";
import "@/app/globals.css";
import type { Metadata } from "next";

const siteName = "BetCode9ja";
const siteDescription =
  "Football and basketball sports analysis with available picks and a public results ledger. Predictions are uncertain and are not betting advice or guarantees.";

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: {
    default: "Football & Basketball Sports Picks and Results",
    template: "%s | BetCode9ja",
  },
  description: siteDescription,
  applicationName: siteName,
  category: "sports",
  icons: {
    icon: "/icon.svg",
  },
  openGraph: {
    type: "website",
    locale: "en_NG",
    url: siteUrl,
    siteName,
    title: "Football & Basketball Sports Picks and Results | BetCode9ja",
    description: siteDescription,
  },
  twitter: {
    card: "summary",
    title: "Football & Basketball Sports Picks and Results | BetCode9ja",
    description: siteDescription,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background font-sans antialiased">
        <StructuredData
          data={{
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "Organization",
                "@id": new URL("/#organization", siteUrl).toString(),
                name: siteName,
                url: siteUrl.toString(),
                logo: new URL("/icon.svg", siteUrl).toString(),
                description: siteDescription,
              },
              {
                "@type": "WebSite",
                "@id": new URL("/#website", siteUrl).toString(),
                name: siteName,
                url: siteUrl.toString(),
                publisher: {
                  "@id": new URL("/#organization", siteUrl).toString(),
                },
                inLanguage: "en",
              },
            ],
          }}
        />
        <Providers>
          <div className="flex min-h-screen flex-col">
            <SiteHeader />
            <main className="flex-1">{children}</main>
            <SiteFooter />
          </div>
        </Providers>
      </body>
    </html>
  );
}
