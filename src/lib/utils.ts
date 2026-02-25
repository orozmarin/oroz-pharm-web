import type { Media } from "@/payload-types";

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("hr-HR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function getImageUrl(
  media: number | Media | null | undefined,
  fallback: string
): string {
  if (typeof media === "object" && media !== null && media.url) {
    return media.url;
  }
  return fallback;
}
