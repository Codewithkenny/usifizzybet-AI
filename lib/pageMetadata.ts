import type { Metadata } from "next";
import { siteUrl } from "@/lib/siteUrl";

interface PageMetadataInput {
  title: string;
  description: string;
  path: string;
}

export function pageMetadata({
  title,
  description,
  path,
}: PageMetadataInput): Metadata {
  const fullTitle = `${title} | BetCode9ja`;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      locale: "en_NG",
      siteName: "BetCode9ja",
      url: new URL(path, siteUrl),
      title: fullTitle,
      description,
    },
    twitter: {
      card: "summary",
      title: fullTitle,
      description,
    },
  };
}
