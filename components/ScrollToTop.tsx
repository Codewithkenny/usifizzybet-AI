"use client"; // Required since we track client navigation and use browser window elements

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const getHashId = (hash: string) => {
  const rawId = hash.slice(1);
  try {
    return decodeURIComponent(rawId);
  } catch {
    return rawId;
  }
};

export default function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    // Read the current hashtag string directly from the browser window object
    const hash = window.location.hash;

    if (hash) {
      const id = getHashId(hash);
      const timer = window.setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      }, 50);
      return () => window.clearTimeout(timer);
    }
  }, [pathname]); // Fires cleanly every single time the path changes

  return null;
}
