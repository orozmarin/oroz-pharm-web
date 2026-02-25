"use client";

import { useInView } from "@/lib/useInView";
import type { ProductCategory } from "@/types/views";
import CategoryCard from "./CategoryCard";

interface Props {
  categories: ProductCategory[];
}

export default function RelatedCategoriesGrid({ categories }: Props) {
  const ref = useInView<HTMLDivElement>("-50px");

  return (
    <div
      ref={ref}
      className="stagger-children grid grid-cols-1 md:grid-cols-3 gap-4"
    >
      {categories.map((cat) => (
        <CategoryCard key={cat.id} category={cat} mobile />
      ))}
    </div>
  );
}
