import type { MetadataRoute } from "next";
import { getPayload } from "payload";
import config from "@payload-config";

const BASE_URL = "https://www.orozpharm.hr";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const payload = await getPayload({ config });

  const [{ docs: categories }, { docs: blogs }, { docs: products }] = await Promise.all([
    payload.find({ collection: "categories", limit: 200, depth: 0 }),
    payload.find({ collection: "blogs", limit: 200, depth: 0 }),
    payload.find({ collection: "products", limit: 2000, depth: 1 }),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE_URL}/proizvodi`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/o-nama`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/kontakt`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${BASE_URL}/proizvodi/${cat.slug}`,
    lastModified: new Date(cat.updatedAt),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const blogRoutes: MetadataRoute.Sitemap = blogs.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.updatedAt),
    changeFrequency: "yearly",
    priority: 0.6,
  }));

  const productRoutes: MetadataRoute.Sitemap = products.flatMap((product) => {
    const categorySlug =
      typeof product.category === "object" && product.category !== null
        ? product.category.slug
        : null;
    if (!categorySlug) return [];
    return [{
      url: `${BASE_URL}/proizvodi/${categorySlug}/${product.slug}`,
      lastModified: new Date(product.updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }];
  });

  return [...staticRoutes, ...categoryRoutes, ...blogRoutes, ...productRoutes];
}
