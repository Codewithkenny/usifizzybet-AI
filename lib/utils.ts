import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// SSR safety check: ensures window operations only execute on the client side, preventing errors during server-side rendering.
export const isIframe =
  typeof window !== "undefined" ? window.self !== window.top : false;
