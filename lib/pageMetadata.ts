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
  const fullTitle = `${title} | Usiffizybet`;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      locale: "en_NG",
      siteName: "Usiffizybet",
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
