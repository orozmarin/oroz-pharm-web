import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { getPayload } from "payload";
import config from "@payload-config";
import { ChevronRight, BookOpen } from "lucide-react";
import { RichText } from "@payloadcms/richtext-lexical/react";
import type { SerializedEditorState } from "lexical";
import { getImageUrl } from "@/lib/utils";
import type { Product } from "@/types/views";
import RelatedProductsSlider from "@/components/products/RelatedProductsSlider";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80";

interface Props {
  params: Promise<{ category: string; product: string }>;
}

// ISR: render on first request, cache for 60s, refresh in background
export const revalidate = 60;
export const dynamicParams = true;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category, product: slug } = await params;
  const payload = await getPayload({ config });
  const { docs } = await payload.find({
    collection: "products",
    where: { slug: { equals: slug } },
    limit: 1,
  });
  const doc = docs[0];
  if (!doc) return {};
  return {
    title: doc.name,
    description: doc.description ?? undefined,
    alternates: { canonical: `/proizvodi/${category}/${slug}` },
  };
}

export default async function ProductPage({ params }: Props) {
  const { category: categorySlug, product: productSlug } = await params;
  const payload = await getPayload({ config });

  const [{ docs }, { docs: relatedDocs }] = await Promise.all([
    payload.find({
      collection: "products",
      where: { slug: { equals: productSlug } },
      depth: 1,
      limit: 1,
    }),
    payload.find({
      collection: "products",
      where: {
        and: [
          { "category.slug": { equals: categorySlug } },
          { slug: { not_equals: productSlug } },
        ],
      },
      depth: 1,
      limit: 11,
      sort: "name",
    }),
  ]);

  const doc = docs[0];
  if (!doc) notFound();

  const image = getImageUrl(doc.image, FALLBACK_IMAGE);
  const categoryName =
    typeof doc.category === "object" && doc.category !== null
      ? doc.category.name
      : categorySlug;
  const manufacturerName =
    typeof doc.manufacturer === "object" && doc.manufacturer !== null
      ? doc.manufacturer.name
      : null;

  const relatedProducts: Product[] = relatedDocs.map((p) => ({
    id: String(p.id),
    slug: p.slug,
    categorySlug,
    subcategoryId:
      typeof p.subcategory === "object" && p.subcategory !== null
        ? String(p.subcategory.id)
        : String(p.subcategory ?? ""),
    name: p.name,
    manufacturer:
      typeof p.manufacturer === "object" && p.manufacturer !== null
        ? p.manufacturer.name
        : "",
    description: p.description ?? "",
    instructions: p.instructions,
    image: getImageUrl(p.image, FALLBACK_IMAGE),
  }));

  return (
    <>
      {/* Breadcrumb */}
      <nav className="max-w-6xl mx-auto px-4 md:px-8 pt-4 pb-2">
        <ol className="flex items-center gap-1 text-sm flex-wrap">
          <li>
            <Link
              href="/proizvodi"
              className="text-green-600 hover:text-green-800 transition-colors"
            >
              Proizvodi
            </Link>
          </li>
          <li className="flex items-center text-gray-400">
            <ChevronRight size={14} />
          </li>
          <li>
            <Link
              href={`/proizvodi/${categorySlug}`}
              className="text-green-600 hover:text-green-800 transition-colors"
            >
              {categoryName}
            </Link>
          </li>
          <li className="hidden sm:flex items-center text-gray-400">
            <ChevronRight size={14} />
          </li>
          <li className="hidden sm:block text-gray-500 truncate max-w-xs">
            {doc.name}
          </li>
        </ol>
      </nav>

      {/* Product detail: image + info */}
      <section className="max-w-6xl mx-auto px-4 md:px-8 pt-4 pb-10 md:pt-6 md:pb-14">
        <div className="grid md:grid-cols-2 gap-10 md:gap-14 items-start">
          {/* Image */}
          <div className="md:sticky md:top-28">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-white border border-green-100 shadow-sm">
              <Image
                src={image}
                alt={doc.name}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-contain mix-blend-multiply"
                priority
              />
            </div>
          </div>

          {/* Info */}
          <div className="flex flex-col gap-4">
            {manufacturerName && (
              <span className="text-sm text-green-600 uppercase tracking-wide">
                {manufacturerName}
              </span>
            )}
            <h1 className="text-3xl md:text-4xl font-bold text-green-900 font-heading leading-tight">
              {doc.name}
            </h1>
            {doc.description && (
              <p className="text-gray-600 text-lg leading-relaxed">
                {doc.description}
              </p>
            )}
            {doc.instructions && (
              <div className="bg-green-900 rounded-2xl px-6 py-5 mt-2">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="bg-green-600 rounded-lg p-1.5 shrink-0">
                    <BookOpen size={16} className="text-white" />
                  </div>
                  <h2 className="text-base font-semibold text-white font-heading">
                    Upute za primjenu
                  </h2>
                </div>
                <div className="prose-blog text-sm [&_h2]:text-white [&_h2]:text-lg [&_h3]:text-green-200 [&_h3]:text-base [&_p]:text-white/85 [&_p]:mb-3 [&_li]:text-white/85 [&_ul]:mb-3 [&_blockquote]:text-white/70 [&_blockquote]:border-green-400">
                  <RichText data={doc.instructions as SerializedEditorState} />
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Related products */}
      {relatedProducts.length > 0 && (
        <section className="border-t border-green-100">
          <div className="max-w-6xl mx-auto px-4 md:px-8 py-12 md:py-16">
            <RelatedProductsSlider
              products={relatedProducts}
              categorySlug={categorySlug}
              categoryName={categoryName}
            />
          </div>
        </section>
      )}
    </>
  );
}
