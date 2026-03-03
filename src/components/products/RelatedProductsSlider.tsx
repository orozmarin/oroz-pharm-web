"use client";

import { useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import ProductCard from "./ProductCard";
import type { Product } from "@/types/views";

interface Props {
  products: Product[];
  categorySlug: string;
  categoryName: string;
}

export default function RelatedProductsSlider({
  products,
  categorySlug,
  categoryName,
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    scrollRef.current?.scrollBy({
      left: direction === "left" ? -1120 : 1120,
      behavior: "smooth",
    });
  };

  return (
    <div>
      {/* Header row with arrow controls */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-green-900 font-heading">
          Slični proizvodi
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => scroll("left")}
            className="w-9 h-9 flex items-center justify-center rounded-full border border-green-200 hover:border-green-400 hover:bg-green-50 transition-all"
            aria-label="Pomakni lijevo"
          >
            <ChevronLeft size={18} className="text-green-700" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="w-9 h-9 flex items-center justify-center rounded-full border border-green-200 hover:border-green-400 hover:bg-green-50 transition-all"
            aria-label="Pomakni desno"
          >
            <ChevronRight size={18} className="text-green-700" />
          </button>
        </div>
      </div>

      {/* Scrollable cards */}
      <div
        ref={scrollRef}
        className="flex gap-5 overflow-x-auto snap-x snap-mandatory pb-2 [&::-webkit-scrollbar]:h-0"
        style={{ scrollbarWidth: "none" }}
      >
        {products.map((p) => (
          <div key={p.id} className="snap-start shrink-0 w-65">
            <ProductCard product={p} />
          </div>
        ))}

        {/* CTA — link to category */}
        <div className="snap-start shrink-0 w-40 self-center">
          <Link
            href={`/proizvodi/${categorySlug}`}
            className="flex flex-col items-center gap-3 p-4 text-center group"
          >
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center group-hover:bg-green-200 transition-colors">
              <ArrowRight size={20} className="text-green-700" />
            </div>
            <span className="text-green-800 font-semibold text-sm leading-snug">
              Svi proizvodi —<br />
              {categoryName}
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
