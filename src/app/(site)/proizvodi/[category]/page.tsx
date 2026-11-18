import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { getPayload } from "payload";
import config from "@payload-config";
import Button from "@/components/shared/Button";
import CategoryDetailClient from "@/components/products/CategoryDetailClient";
import PoultryGrid from "@/components/products/PoultryGrid";
import BrandSpotlight from "@/components/products/BrandSpotlight";
import RelatedCategoriesGrid from "@/components/products/RelatedCategoriesGrid";
import { ArrowLeft } from "lucide-react";
import type { ProductCategory, Product, Subcategory } from "@/types/views";
import type { Category } from "@/payload-types";
import { getImageUrl } from "@/lib/utils";
import { categoryContent } from "@/data/categoryContent";
import { locations } from "@/data/locations";
import JsonLd from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, metaDescription, openGraph } from "@/lib/seo";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80";

function normalizeCategory(
  doc: Category,
  subcategories: Subcategory[] = []
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
  // notFound() ovdje (a ne samo u stranici) daje pravi HTTP 404 umjesto 200.
  if (!cat) notFound();
  const description = metaDescription(cat.description);
  return {
    title: cat.name,
    description,
    alternates: { canonical: `/proizvodi/${slug}` },
    openGraph: openGraph({
      title: cat.name,
      description,
      url: `/proizvodi/${slug}`,
      images: getImageUrl(cat.image, ""),
    }),
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
      depth: 1,
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
  const subsByCategoryId = new Map<string, Subcategory[]>();
  for (const sub of subcategoryDocs) {
    const catId = String(typeof sub.category === "object" ? sub.category.id : sub.category);
    if (!subsByCategoryId.has(catId)) subsByCategoryId.set(catId, []);
    subsByCategoryId.get(catId)!.push({
      id: String(sub.id),
      slug: sub.slug,
      name: sub.name,
      description: sub.description ?? undefined,
      isShowcase: sub.isShowcase ?? undefined,
      image: getImageUrl(sub.image, ""),
    });
  }

  const subcategories: Subcategory[] = subsByCategoryId.get(String(rawCat.id)) ?? [];

  const category: ProductCategory = normalizeCategory(rawCat, subcategories);
  const content = categoryContent[slug];

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
    age: doc.age ?? undefined,
    purpose: doc.purpose ?? undefined,
    instructions: doc.instructions,
    // Za perad se šalje prazan string kad fotke nema, jer PoultryGrid ima
    // vlastiti placeholder za taj slučaj. Za sve ostale kategorije ostaje
    // stari wheat-field fallback (ProductCard nema kontrolu nad tim).
    image: getImageUrl(doc.image, slug === "perad" ? "" : FALLBACK_IMAGE),
  }));

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Početna", path: "/" },
          { name: "Proizvodi", path: "/proizvodi" },
          { name: category.name, path: `/proizvodi/${slug}` },
        ])}
      />
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

      {category.slug === "oprema-za-pcelarstvo" && (
        <div className="max-w-7xl mx-auto px-4 md:px-8 w-full mt-10">
          <BrandSpotlight
            logoSrc="/images/brands/medin-san.png"
            logoAlt="Medin san"
            eyebrow="Pčelarstvo"
            title="Pčelarska oprema Medin san"
            text="Cijeli asortiman pčelarske opreme Medin san, od košnica i alata do zaštite pčelara i sredstava za zdravlje zajednica."
            primaryHref="/kontakt"
            primaryLabel="Zatražite ponudu"
            secondaryHref="/poslovnice"
            secondaryLabel="Posjetite trgovinu"
          />
        </div>
      )}

      {category.slug === "perad" ? (
        <PoultryGrid subcategories={category.subcategories} products={products} />
      ) : (
        <CategoryDetailClient category={category} products={products} />
      )}

      {content && (
        <section className="border-t border-green-100 px-4 md:px-8 py-16 md:py-20">
          {/* Mobitel: naslov, tekst, poslovnice. Desktop: naslov i poslovnice lijevo, tekst desno. */}
          <div className="max-w-6xl mx-auto grid gap-8 lg:grid-cols-12 lg:grid-rows-[auto_1fr] lg:gap-x-16 lg:gap-y-8">
            <h2 className="lg:col-span-5 font-heading text-3xl md:text-4xl leading-tight font-bold text-green-900 text-balance">
              {content.heading}
            </h2>

            <div className="lg:col-span-7 lg:row-span-2 max-w-[62ch] space-y-5 lg:pt-2">
              {content.paragraphs.map((p, i) => (
                <p
                  key={i}
                  className={
                    i === 0
                      ? "text-xl leading-relaxed text-gray-800"
                      : "text-lg leading-relaxed text-gray-600"
                  }
                >
                  {p}
                </p>
              ))}
            </div>

            {/* Nema web shopa, pa je poziv na akciju poslovnica */}
            <div className="lg:col-span-5 self-start rounded-2xl bg-earth-100 p-6">
              <h3 className="text-lg font-bold text-green-900">Kupite u poslovnici</h3>
              <ul className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-1">
                {locations.map((loc) => (
                  <li key={loc.id} className="text-sm leading-snug">
                    <Link
                      href={`/poslovnice/${loc.slug}`}
                      className="font-semibold text-green-800 underline decoration-earth-400 decoration-2 underline-offset-4 hover:text-green-600 hover:decoration-green-600"
                    >
                      {loc.cityName}
                    </Link>
                    <span className="block text-gray-600 mt-1">{loc.address}</span>
                    <a
                      href={`tel:${loc.phone.replace(/\s/g, "")}`}
                      className="text-gray-600 tabular-nums hover:text-green-700"
                    >
                      {loc.phone}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

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
