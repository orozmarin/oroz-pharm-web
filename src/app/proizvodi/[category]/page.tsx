import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { categories } from "@/data/categories";
import Button from "@/components/shared/Button";
import CategoryDetailClient from "@/components/products/CategoryDetailClient";
import { ArrowLeft } from "lucide-react";

interface Props {
  params: Promise<{ category: string }>;
}

export async function generateStaticParams() {
  return categories.map((cat) => ({ category: cat.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category: slug } = await params;
  const cat = categories.find((c) => c.slug === slug);
  if (!cat) return {};
  return {
    title: cat.name,
    description: cat.description,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { category: slug } = await params;
  const category = categories.find((c) => c.slug === slug);
  if (!category) notFound();

  const related = categories.filter((c) => c.id !== category.id).slice(0, 3);

  return (
    <>
      {/* Hero */}
      <div className="relative h-[40vh] min-h-[320px] overflow-hidden">
        <Image
          src={category.image}
          alt={category.name}
          fill
          sizes="100vw"
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-green-900/80 via-green-900/40 to-transparent" />
        <div className="absolute inset-0 flex items-end pb-12">
          <div className="max-w-7xl mx-auto px-4 md:px-8 w-full">
            <Link
              href="/proizvodi"
              className="inline-flex items-center gap-1 text-green-300 text-sm mb-4 hover:text-white transition-colors"
            >
              <ArrowLeft size={16} /> Svi proizvodi
            </Link>
            <h1 className="text-4xl md:text-5xl font-bold text-white font-[family-name:var(--font-heading)]">
              {category.name}
            </h1>
            <p className="text-white/70 text-lg mt-2 max-w-2xl">{category.description}</p>
          </div>
        </div>
      </div>

      <CategoryDetailClient category={category} />

      {/* Related categories */}
      <section className="py-16 bg-green-50 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-green-900 mb-8 font-[family-name:var(--font-heading)]">
            Možda vas zanima
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {related.map((cat) => (
              <Link
                key={cat.id}
                href={`/proizvodi/${cat.slug}`}
                className="group relative h-48 rounded-2xl overflow-hidden"
              >
                <Image src={cat.image} alt={cat.name} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-green-900/80 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <h3 className="text-white font-bold text-lg font-[family-name:var(--font-heading)]">{cat.name}</h3>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-8">
            <Button href="/proizvodi" variant="outline">Sve kategorije</Button>
          </div>
        </div>
      </section>
    </>
  );
}
