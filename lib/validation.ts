import { z } from "zod";

export function isSafeHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export const httpUrlSchema = z.url().max(500).refine(isSafeHttpUrl, "Usa una URL http o https.");
