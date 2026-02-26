import type { Metadata } from "next";
import Image from "next/image";
import { getPayload } from "payload";
import config from "@payload-config";
import BrandMarquee from "@/components/products/BrandMarquee";
import CategoryGrid from "@/components/products/CategoryGrid";
import type { ProductCategory } from "@/types/views";
import { getImageUrl } from "@/lib/utils";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80";

// Cache the rendered page for 60 seconds (ISR).
// After 60s, the next request triggers a background re-render;
// the stale page is still served instantly while the new one builds.
export const revalidate = 60;

export const metadata: Metadata = {
  title: "Proizvodi",
  description: "Pregledajte naš asortiman od preko 12.000 artikala - zaštita bilja, gnojiva, sjeme, navodnjavanje, stočna hrana i još mnogo toga.",
};

export default async function ProductsPage() {
  const payload = await getPayload({ config });
  const [{ docs }, { docs: subcategoryDocs }] = await Promise.all([
    payload.find({ collection: "categories", depth: 1, limit: 100 }),
    payload.find({ collection: "subcategories", depth: 0, limit: 1000 }),
  ]);

  // Group subcategories by their parent category ID
  const subsByCategoryId = new Map<string, { id: string; name: string }[]>();
  for (const sub of subcategoryDocs) {
    const catId = String(typeof sub.category === "object" ? sub.category.id : sub.category);
    if (!subsByCategoryId.has(catId)) subsByCategoryId.set(catId, []);
    subsByCategoryId.get(catId)!.push({ id: String(sub.id), name: sub.name });
  }

  const categories: ProductCategory[] = docs.map((doc) => ({
    id: String(doc.id),
    slug: doc.slug,
    name: doc.name,
    description: doc.description ?? "",
    icon: doc.icon ?? "",
    image: getImageUrl(doc.image, FALLBACK_IMAGE),
    gridArea: doc.gridArea ?? "",
    subcategories: subsByCategoryId.get(String(doc.id)) ?? [],
    brands: [],
  }));

  return (
    <>
      {/* Hero banner */}
      <div className="relative h-[50vh] min-h-100 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1920&q=80"
          alt="Poljoprivredno polje"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-linear-to-t from-green-900/80 via-green-900/40 to-transparent" />
        <div className="absolute inset-0 flex items-end pb-16">
          <div className="max-w-7xl mx-auto px-4 md:px-8 w-full">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-3 font-heading">
              Naš asortiman
            </h1>
            <p className="text-white/80 text-lg max-w-xl">
              Preko 12.000 artikala za sve vaše poljoprivredne potrebe, organizirano u{" "}
              <span className="text-green-300 font-semibold">13 kategorija</span> s vodećim svjetskim brandovima.
            </p>
          </div>
        </div>
      </div>

      <BrandMarquee />

      <section className="py-16 md:py-24">
        <CategoryGrid categories={categories} />
      </section>
    </>
  );
}
