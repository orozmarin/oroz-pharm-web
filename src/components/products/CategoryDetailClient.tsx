"use client";

import { useState, useMemo, useCallback, useRef } from "react";
import type { ProductCategory, Product } from "@/types/views";
import ProductCard from "./ProductCard";

const PAGE_SIZE = 16; // 4 rows × 4 columns

interface Props {
  category: ProductCategory;
  products: Product[];
}

export default function CategoryDetailClient({ category, products }: Props) {
  const [activeSubs, setActiveSubs] = useState<Set<string>>(new Set());
  const [activeMfrs, setActiveMfrs] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const gridRef = useRef<HTMLDivElement>(null);

  const goToPage = useCallback((n: number) => {
    setPage(n);
    if (gridRef.current) {
      const top = gridRef.current.getBoundingClientRect().top + window.scrollY - 140;
      window.scrollTo({ top, behavior: "smooth" });
    }
  }, []);

  const toggleSub = useCallback((id: string) => {
    setActiveSubs((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setActiveMfrs(new Set());
    setPage(1);
  }, []);

  const toggleMfr = useCallback((name: string) => {
    setActiveMfrs((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
    setPage(1);
  }, []);

  const filteredBySubcategory = useMemo(
    () =>
      activeSubs.size === 0
        ? products
        : products.filter((p) => activeSubs.has(p.subcategoryId)),
    [products, activeSubs]
  );

  const manufacturers = useMemo(() => {
    const set = new Set(
      filteredBySubcategory
        .map((p) => p.manufacturer)
        .filter((m) => m.length > 0)
    );
    return Array.from(set).sort();
  }, [filteredBySubcategory]);

  const filtered = useMemo(() => {
    const list =
      activeMfrs.size === 0
        ? filteredBySubcategory
        : filteredBySubcategory.filter((p) => activeMfrs.has(p.manufacturer));

    return [...list].sort((a, b) => {
      const mfr = a.manufacturer.localeCompare(b.manufacturer, "hr");
      return mfr !== 0 ? mfr : a.name.localeCompare(b.name, "hr");
    });
  }, [filteredBySubcategory, activeMfrs]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div ref={gridRef} className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-16">
      {/* Subcategory filter tabs */}
      {category.subcategories.length > 0 && (
        <div className="overflow-x-auto pb-1 mb-6 scrollbar-none">
          <div className="flex gap-2">
            <button
              onClick={() => { setActiveSubs(new Set()); setActiveMfrs(new Set()); setPage(1); }}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeSubs.size === 0
                  ? "bg-green-700 text-white"
                  : "bg-white border border-green-200 text-green-800 hover:bg-green-50"
              }`}
            >
              Sve
            </button>
            {category.subcategories.map((sub) => (
              <button
                key={sub.id}
                onClick={() => toggleSub(sub.id)}
                className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeSubs.has(sub.id)
                    ? "bg-green-700 text-white"
                    : "bg-white border border-green-200 text-green-800 hover:bg-green-50"
                }`}
              >
                {sub.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Manufacturer filter pills */}
      {manufacturers.length > 0 && (
        <div className="overflow-x-auto pb-3 mb-8 border-b border-green-100 scrollbar-none">
          <div className="flex gap-2">
            <button
              onClick={() => { setActiveMfrs(new Set()); setPage(1); }}
              className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                activeMfrs.size === 0
                  ? "bg-earth-500 text-white"
                  : "bg-earth-100 text-earth-700 hover:bg-earth-200"
              }`}
            >
              Svi proizvođači
            </button>
            {manufacturers.map((mfr) => (
              <button
                key={mfr}
                onClick={() => toggleMfr(mfr)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                  activeMfrs.has(mfr)
                    ? "bg-earth-500 text-white"
                    : "bg-earth-100 text-earth-700 hover:bg-earth-200"
                }`}
              >
                {mfr}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Product grid */}
      {filtered.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {paginated.map((product, i) => (
              <ProductCard key={product.id} product={product} priority={i < 8} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <button
                onClick={() => goToPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-4 py-2 rounded-lg text-sm font-medium border border-green-200 text-green-800 hover:bg-green-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                ← Prethodna
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => goToPage(n)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                    n === page
                      ? "bg-green-700 text-white"
                      : "border border-green-200 text-green-800 hover:bg-green-50"
                  }`}
                >
                  {n}
                </button>
              ))}

              <button
                onClick={() => goToPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 rounded-lg text-sm font-medium border border-green-200 text-green-800 hover:bg-green-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Sljedeća →
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="py-20 text-center">
          <p className="text-gray-500 text-lg">Uskoro dostupno.</p>
          <p className="text-gray-400 text-sm mt-2">
            Posjetite nas u poslovnici za detaljan pregled ponude i stručno savjetovanje.
          </p>
          <a
            href="/kontakt"
            className="inline-block mt-6 text-green-700 font-medium text-sm hover:underline"
          >
            Kontaktirajte nas →
          </a>
        </div>
      )}
    </div>
  );
}
