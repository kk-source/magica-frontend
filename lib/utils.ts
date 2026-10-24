import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Galaxy-style credit amounts (29.07M, 0.40M). App credits are 1,000 Magica microcredits each,
 * and Galaxy shows microcredits in millions, so 1 app credit = 0.001M.
 */
export function formatCredits(credits: number) {
  const millions = credits / 1_000;
  return `${millions.toFixed(millions !== 0 && Math.abs(millions) < 0.01 ? 3 : 2)}M`;
}
