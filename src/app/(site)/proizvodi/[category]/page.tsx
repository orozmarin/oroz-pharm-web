import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { getPayload } from "payload";
import config from "@payload-config";
import Button from "@/components/shared/Button";
import CategoryDetailClient from "@/components/products/CategoryDetailClient";
import RelatedCategoriesGrid from "@/components/products/RelatedCategoriesGrid";
import { ArrowLeft } from "lucide-react";
import type { ProductCategory, Product, Subcategory } from "@/types/views";
import type { Category } from "@/payload-types";
import { getImageUrl } from "@/lib/utils";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80";

function normalizeCategory(
  doc: Category,
  subcategories: { id: string; name: string }[] = []
): ProductCategory {
  return {
    id: String(doc.id),
    slug: doc.slug,
    name: doc.name,
    description: doc.description ?? "",
    icon: doc.icon ?? "",
    image: getImageUrl(doc.image, FALLBACK_IMAGE),
    gridArea: doc.gridArea ?? "",
    subcategories,
    brands: [],
  };
}

interface Props {
  params: Promise<{ category: string }>;
}

export const revalidate = 60;
export const dynamicParams = true;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category: slug } = await params;
  const payload = await getPayload({ config });
  const { docs } = await payload.find({
    collection: "categories",
    where: { slug: { equals: slug } },
    limit: 1,
  });
  const cat = docs[0];
  if (!cat) return {};
  return {
    title: cat.name,
    description: cat.description ?? undefined,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { category: slug } = await params;
  const payload = await getPayload({ config });

  const [
    { docs: catDocs },
    { docs: relatedDocs },
    { docs: subcategoryDocs },
    { docs: productDocs },
  ] = await Promise.all([
    payload.find({
      collection: "categories",
      where: { slug: { equals: slug } },
      depth: 2,
      limit: 1,
    }),
    payload.find({
      collection: "categories",
      where: { slug: { not_equals: slug } },
      depth: 1,
      limit: 3,
    }),
    payload.find({
      collection: "subcategories",
      depth: 0,
      sort: "name",
      limit: 1000,
    }),
    payload.find({
      collection: "products",
      where: { "category.slug": { equals: slug } },
      depth: 1,
      limit: 500,
      sort: "name",
    }),
  ]);

  const rawCat = catDocs[0];
  if (!rawCat) notFound();

  // Group all subcategories by their parent category ID
  const subsByCategoryId = new Map<string, { id: string; name: string }[]>();
  for (const sub of subcategoryDocs) {
    const catId = String(typeof sub.category === "object" ? sub.category.id : sub.category);
    if (!subsByCategoryId.has(catId)) subsByCategoryId.set(catId, []);
    subsByCategoryId.get(catId)!.push({ id: String(sub.id), name: sub.name });
  }

  const subcategories: Subcategory[] = subsByCategoryId.get(String(rawCat.id)) ?? [];

  const category: ProductCategory = normalizeCategory(rawCat, subcategories);

  // Use manually curated related categories if set; otherwise fall back to auto-generated
  const relatedCategoryDocs: Category[] =
    rawCat.relatedCategories && rawCat.relatedCategories.length > 0
      ? (rawCat.relatedCategories as (number | Category)[]).filter(
          (c): c is Category => typeof c === "object"
        )
      : relatedDocs;

  const related = relatedCategoryDocs.map((doc) =>
    normalizeCategory(doc, subsByCategoryId.get(String(doc.id)) ?? [])
  );

  const products: Product[] = productDocs.map((doc) => ({
    id: String(doc.id),
    slug: doc.slug,
    categorySlug: slug,
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

  return (
    <>
      {/* Hero */}
      <div className="relative h-[40vh] min-h-80 overflow-hidden">
        <Image
          src={category.image}
          alt={category.name}
          fill
          sizes="100vw"
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-linear-to-t from-green-900/80 via-green-900/40 to-transparent" />
        <div className="absolute inset-0 flex items-end pb-12">
          <div className="max-w-7xl mx-auto px-4 md:px-8 w-full">
            <Link
              href="/proizvodi"
              className="inline-flex items-center gap-1 text-green-300 text-sm mb-4 hover:text-white transition-colors"
            >
              <ArrowLeft size={16} /> Svi proizvodi
            </Link>
            <h1 className="text-4xl md:text-5xl font-bold text-white font-heading">
              {category.name}
            </h1>
            <p className="text-white/70 text-lg mt-2 max-w-2xl">{category.description}</p>
          </div>
        </div>
      </div>

      <CategoryDetailClient category={category} products={products} />

      {/* Related categories */}
      <section className="py-16 bg-green-50 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-green-900 mb-8 text-center font-heading">
            Možda vas zanima
          </h2>
          <RelatedCategoriesGrid categories={related} />
          <div className="text-center mt-8">
            <Button href="/proizvodi" variant="outline">Sve kategorije</Button>
          </div>
        </div>
      </section>
    </>
  );
}
