import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/siteUrl";

const PUBLIC_ROUTES = [
  { path: "/", priority: 1 },
  { path: "/picks", priority: 0.9 },
  { path: "/results", priority: 0.8 },
  { path: "/safe-bets", priority: 0.8 },
  { path: "/membership", priority: 0.7 },
  { path: "/faq", priority: 0.7 },
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  return PUBLIC_ROUTES.map(({ path, priority }) => ({
    url: new URL(path, siteUrl).toString(),
    changeFrequency: path === "/" ? "daily" : "weekly",
    priority,
  }));
}
