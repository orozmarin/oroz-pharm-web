import { getPayload } from "payload";
import config from "@payload-config";
import type { Pool } from "pg";
import type { Product } from "@/types/views";
import { getImageUrl } from "@/lib/utils";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&q=80";
const SIMILARITY_THRESHOLD = 0.3;

export interface SearchResult {
  products: Product[];
  total: number;
}

const MATCH_SQL = `
  SELECT p.id AS id
  FROM products p
  LEFT JOIN manufacturers m ON p.manufacturer_id = m.id
  WHERE p.name ILIKE '%' || $1 || '%'
     OR m.name ILIKE '%' || $1 || '%'
     OR similarity(p.name, $1) > $2
  ORDER BY GREATEST(similarity(p.name, $1), COALESCE(similarity(m.name, $1), 0)) DESC, p.name ASC
  LIMIT $3 OFFSET $4
`;

const COUNT_SQL = `
  SELECT COUNT(*)::int AS total
  FROM products p
  LEFT JOIN manufacturers m ON p.manufacturer_id = m.id
  WHERE p.name ILIKE '%' || $1 || '%'
     OR m.name ILIKE '%' || $1 || '%'
     OR similarity(p.name, $1) > $2
`;

export async function searchProducts(
  rawQuery: string,
  { limit = 8, offset = 0 }: { limit?: number; offset?: number } = {}
): Promise<SearchResult> {
  const q = rawQuery.trim();
  if (q.length < 2) return { products: [], total: 0 };

  const payload = await getPayload({ config });
  const pool = (payload.db as unknown as { pool: Pool }).pool;

  const [matchRes, countRes] = await Promise.all([
    pool.query<{ id: number }>(MATCH_SQL, [q, SIMILARITY_THRESHOLD, limit, offset]),
    pool.query<{ total: number }>(COUNT_SQL, [q, SIMILARITY_THRESHOLD]),
  ]);

  const ids = matchRes.rows.map((r) => r.id);
  const total = countRes.rows[0]?.total ?? 0;
  if (ids.length === 0) return { products: [], total };

  // Hidracija kroz Payload radi reuse-a media/URL logike (R2) i relacija.
  const { docs } = await payload.find({
    collection: "products",
    where: { id: { in: ids } },
    depth: 1,
    limit: ids.length,
  });

  // Sačuvaj SQL poredak (relevantnost).
  const byId = new Map(docs.map((d) => [Number(d.id), d]));
  const products: Product[] = ids
    .map((id) => byId.get(id))
    .filter((d): d is NonNullable<typeof d> => Boolean(d))
    .map((doc) => ({
      id: String(doc.id),
      slug: doc.slug,
      categorySlug:
        typeof doc.category === "object" && doc.category !== null
          ? doc.category.slug
          : "",
      subcategoryId:
        typeof doc.subcategory === "object" && doc.subcategory !== null
          ? String(doc.subcategory.id)
          : String(doc.subcategory ?? ""),
      name: doc.name,
      manufacturer:
        typeof doc.manufacturer === "object" && doc.manufacturer !== null
          ? doc.manufacturer.name
          : "",
      description: doc.description ?? "",
      instructions: doc.instructions,
      image: getImageUrl(doc.image, FALLBACK_IMAGE),
    }));

  return { products, total };
}
