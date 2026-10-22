import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Galaxy-style credit amounts: 29.07M, 0.40M, or a plain count for small values. */
export function formatCredits(credits: number) {
  return credits >= 10_000 ? `${(credits / 1_000_000).toFixed(2)}M` : Math.round(credits).toLocaleString();
}
