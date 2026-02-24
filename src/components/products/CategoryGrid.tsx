"use client";

import { useInView } from "@/lib/useInView";
import { categories } from "@/data/categories";
import CategoryCard from "./CategoryCard";

export default function CategoryGrid() {
  const desktopRef = useInView<HTMLDivElement>("-50px");
  const mobileRef = useInView<HTMLDivElement>("-50px");

  return (
    <>
      {/* Desktop bento grid (md+) */}
      <div
        ref={desktopRef}
        className="stagger-children max-w-7xl mx-auto px-4 md:px-8 hidden md:grid gap-3 md:gap-4"
        style={{
          gridTemplateColumns: "repeat(4, 1fr)",
          gridTemplateAreas: `
            "zastita zastita gnojivo gnojivo"
            "sjeme sjeme stocna stocna"
            "sadni sadni substr substr"
            "navod pcelar ulja enolog"
            "stroj stroj alati stocar"
            "kucni kucni kolinje gume"
            "vrt vrt roba eko"
          `,
        }}
      >
        {categories.map((cat) => (
          <CategoryCard key={cat.id} category={cat} />
        ))}
      </div>

      {/* Mobile stack (sm) */}
      <div
        ref={mobileRef}
        className="stagger-children md:hidden px-4 grid grid-cols-1 gap-3"
      >
        {categories.map((cat) => (
          <CategoryCard key={cat.id} category={cat} mobile />
        ))}
      </div>
    </>
  );
}
