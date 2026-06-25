import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ProductCard from "@/components/products/ProductCard";
import { searchProducts } from "@/lib/search";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 24;

export const metadata: Metadata = {
  title: "Pretraga proizvoda",
  robots: { index: false, follow: true },
};

interface Props {
  searchParams: Promise<{ q?: string; page?: string }>;
}

export default async function SearchPage({ searchParams }: Props) {
  const { q = "", page = "1" } = await searchParams;
  const query = q.trim();
  const currentPage = Math.max(1, parseInt(page, 10) || 1);
  const offset = (currentPage - 1) * PAGE_SIZE;

  const { products, total } =
    query.length >= 2
      ? await searchProducts(query, { limit: PAGE_SIZE, offset })
      : { products: [], total: 0 };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 pt-8 md:pt-12 pb-16 min-h-[60vh]">
      <Link
        href="/proizvodi"
        className="inline-flex items-center gap-1 text-green-700 text-sm mb-6 hover:text-green-900 transition-colors"
      >
        <ArrowLeft size={16} /> Svi proizvodi
      </Link>

      <h1 className="text-3xl md:text-4xl font-bold text-green-900 font-heading mb-2">
        Rezultati pretrage
      </h1>
      {query.length >= 2 ? (
        <p className="text-gray-500 mb-10">
          {total} {total === 1 ? "rezultat" : "rezultata"} za "{query}"
        </p>
      ) : (
        <p className="text-gray-500 mb-10">
          Upišite pojam za pretragu (najmanje 2 znaka).
        </p>
      )}

      {products.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {products.map((p, i) => (
              <ProductCard key={p.id} product={p} priority={i < 8} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex flex-wrap items-center justify-center gap-2 mt-12">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <Link
                  key={n}
                  href={`/proizvodi/pretraga?q=${encodeURIComponent(query)}&page=${n}`}
                  className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                    n === currentPage
                      ? "bg-green-700 text-white"
                      : "border border-green-200 text-green-800 hover:bg-green-50"
                  }`}
                >
                  {n}
                </Link>
              ))}
            </div>
          )}
        </>
      ) : query.length >= 2 ? (
        <div className="py-16 text-center">
          <p className="text-gray-500 text-lg">Nema rezultata za "{query}".</p>
          <p className="text-gray-400 text-sm mt-2">
            Provjerite pravopis ili nas kontaktirajte za pomoć pri pronalasku proizvoda.
          </p>
          <Link
            href="/kontakt"
            className="inline-block mt-6 text-green-700 font-medium text-sm hover:underline"
          >
            Kontaktirajte nas →
          </Link>
        </div>
      ) : null}
    </div>
  );
}
