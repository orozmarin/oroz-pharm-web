"use client";

import { useState, useMemo, useCallback } from "react";
import type { ProductCategory, Product } from "@/types/views";
import ProductCard from "./ProductCard";

interface Props {
  category: ProductCategory;
  products: Product[];
}

export default function CategoryDetailClient({ category, products }: Props) {
  const [activeSubs, setActiveSubs] = useState<Set<string>>(new Set());
  const [activeMfrs, setActiveMfrs] = useState<Set<string>>(new Set());

  const toggleSub = useCallback((id: string) => {
    setActiveSubs((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setActiveMfrs(new Set());
  }, []);

  const toggleMfr = useCallback((name: string) => {
    setActiveMfrs((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
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

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-16">
      {/* Subcategory filter tabs */}
      {category.subcategories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => { setActiveSubs(new Set()); setActiveMfrs(new Set()); }}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
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
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeSubs.has(sub.id)
                  ? "bg-green-700 text-white"
                  : "bg-white border border-green-200 text-green-800 hover:bg-green-50"
              }`}
            >
              {sub.name}
            </button>
          ))}
        </div>
      )}

      {/* Manufacturer filter pills */}
      {manufacturers.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8 pb-8 border-b border-green-100">
          <button
            onClick={() => setActiveMfrs(new Set())}
            className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-colors ${
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
              className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                activeMfrs.has(mfr)
                  ? "bg-earth-500 text-white"
                  : "bg-earth-100 text-earth-700 hover:bg-earth-200"
              }`}
            >
              {mfr}
            </button>
          ))}
        </div>
      )}

      {/* Product grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
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
