import type { Metadata } from "next";

export const SITE_URL = "https://www.orozpharm.hr";
export const SITE_NAME = "Oroz PHARM";
export const DEFAULT_OG_IMAGE = "/images/og-default.jpg";

/**
 * Zajednička polja za Open Graph. Next.js ne spaja openGraph roditelja i djeteta,
 * nego dijete zamijeni cijeli objekt, pa svaka stranica mora poslati i ova polja.
 */
export function openGraph(og: {
  title: string;
  description?: string;
  url?: string;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  images?: string | string[];
}): Metadata["openGraph"] {
  const images = og.images
    ? (Array.isArray(og.images) ? og.images : [og.images]).filter(Boolean)
    : [];
  return {
    siteName: SITE_NAME,
    locale: "hr_HR",
    type: "website",
    ...og,
    images: images.length > 0 ? images : [DEFAULT_OG_IMAGE],
  } as Metadata["openGraph"];
}

/** Skraćuje tekst za meta description na granici riječi (Google prikazuje oko 155 znakova). */
export function metaDescription(text: string | null | undefined, max = 155): string | undefined {
  if (!text) return undefined;
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return `${cut.slice(0, lastSpace > 80 ? lastSpace : max).replace(/[\s,.;:–-]+$/, "")}…`;
}

/** schema.org BreadcrumbList. Putanje su relativne (npr. "/proizvodi"). */
export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.path === "/" ? "" : item.path}`,
    })),
  };
}
