import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { getPayload } from "payload";
import config from "@payload-config";
import { ArrowLeft } from "lucide-react";
import { RichText } from "@payloadcms/richtext-lexical/react";
import type { SerializedEditorState } from "lexical";
import { getImageUrl } from "@/lib/utils";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80";

interface Props {
  params: Promise<{ category: string; product: string }>;
}

// ISR: render on first request, cache for 60s, refresh in background
export const revalidate = 60;
export const dynamicParams = true;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { product: slug } = await params;
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
  };
}

export default async function ProductPage({ params }: Props) {
  const { category: categorySlug, product: productSlug } = await params;
  const payload = await getPayload({ config });

  const { docs } = await payload.find({
    collection: "products",
    where: { slug: { equals: productSlug } },
    depth: 1,
    limit: 1,
  });

  const doc = docs[0];
  if (!doc) notFound();

  const image = getImageUrl(doc.image, FALLBACK_IMAGE);
  const manufacturerName =
    typeof doc.manufacturer === "object" && doc.manufacturer !== null
      ? doc.manufacturer.name
      : null;

  return (
    <>
      {/* Hero */}
      <div className="relative h-[40vh] min-h-80 overflow-hidden">
        <Image
          src={image}
          alt={doc.name}
          fill
          sizes="100vw"
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-linear-to-t from-green-900/85 via-green-900/40 to-transparent" />
        <div className="absolute inset-0 flex items-end pb-12">
          <div className="max-w-4xl mx-auto px-4 md:px-8 w-full">
            <Link
              href={`/proizvodi/${categorySlug}`}
              className="inline-flex items-center gap-1 text-green-300 text-sm mb-4 hover:text-white transition-colors"
            >
              <ArrowLeft size={16} /> Natrag na kategoriju
            </Link>
            {manufacturerName && (
              <p className="text-green-300 text-sm font-semibold uppercase tracking-wide mb-2">
                {manufacturerName}
              </p>
            )}
            <h1 className="text-3xl md:text-5xl font-bold text-white font-heading">
              {doc.name}
            </h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <article className="max-w-4xl mx-auto px-4 md:px-8 py-12 md:py-16">
        {doc.description && (
          <p className="text-lg text-gray-600 leading-relaxed mb-10 pb-10 border-b border-green-100">
            {doc.description}
          </p>
        )}

        {doc.instructions && (
          <>
            <h2 className="text-2xl font-bold text-green-900 mb-6 font-heading">
              Upute za primjenu
            </h2>
            <div className="prose-blog">
              <RichText data={doc.instructions as SerializedEditorState} />
            </div>
          </>
        )}
      </article>
    </>
  );
}
