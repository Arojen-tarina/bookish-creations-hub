/**
 * utils.ts — Yleiskäyttöiset apufunktiot
 *
 * cn() — Yhdistää Tailwind-luokkia älykkäästi (clsx + tailwind-merge).
 */
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
