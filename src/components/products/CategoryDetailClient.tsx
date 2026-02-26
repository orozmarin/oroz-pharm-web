"use client";

import { useState, useMemo } from "react";
import type { ProductCategory, Product } from "@/types/views";
import ProductCard from "./ProductCard";

interface Props {
  category: ProductCategory;
  products: Product[];
}

export default function CategoryDetailClient({ category, products }: Props) {
  const [activeSub, setActiveSub] = useState("sve");
  const [activeMfr, setActiveMfr] = useState("svi");

  const filteredBySubcategory = useMemo(
    () =>
      activeSub === "sve"
        ? products
        : products.filter((p) => p.subcategoryId === activeSub),
    [products, activeSub]
  );

  const manufacturers = useMemo(() => {
    const set = new Set(
      filteredBySubcategory
        .map((p) => p.manufacturer)
        .filter((m) => m.length > 0)
    );
    return Array.from(set).sort();
  }, [filteredBySubcategory]);

  const filtered = useMemo(
    () =>
      activeMfr === "svi"
        ? filteredBySubcategory
        : filteredBySubcategory.filter((p) => p.manufacturer === activeMfr),
    [filteredBySubcategory, activeMfr]
  );

  function handleSubChange(slug: string) {
    setActiveSub(slug);
    setActiveMfr("svi");
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-16">
      {/* Subcategory filter tabs */}
      {category.subcategories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => handleSubChange("sve")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeSub === "sve"
                ? "bg-green-700 text-white"
                : "bg-white border border-green-200 text-green-800 hover:bg-green-50"
            }`}
          >
            Sve
          </button>
          {category.subcategories.map((sub) => (
            <button
              key={sub.id}
              onClick={() => handleSubChange(sub.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeSub === sub.id
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
            onClick={() => setActiveMfr("svi")}
            className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-colors ${
              activeMfr === "svi"
                ? "bg-earth-500 text-white"
                : "bg-earth-100 text-earth-700 hover:bg-earth-200"
            }`}
          >
            Svi proizvođači
          </button>
          {manufacturers.map((mfr) => (
            <button
              key={mfr}
              onClick={() => setActiveMfr(mfr)}
              className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                activeMfr === mfr
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
