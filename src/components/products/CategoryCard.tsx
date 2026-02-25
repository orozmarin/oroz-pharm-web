import Link from "next/link";
import Image from "next/image";
import { ProductCategory } from "@/types/views";
import { ArrowRight } from "lucide-react";

interface Props {
  category: ProductCategory;
  mobile?: boolean;
}

export default function CategoryCard({ category, mobile }: Props) {
  return (
    <div
      className="animate-on-scroll anim-scale-in"
      style={mobile ? undefined : { gridArea: category.gridArea }}
    >
      <Link
        href={`/proizvodi/${category.slug}`}
        id={category.slug}
        className="group relative block h-full min-h-[180px] md:min-h-[240px] rounded-2xl overflow-hidden"
      >
        {/* Background image */}
        <Image
          src={category.image}
          alt={category.name}
          fill
          sizes="(max-width: 768px) 100vw, 25vw"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-green-900/90 via-green-900/40 to-transparent group-hover:from-green-900/80 transition-colors duration-300" />

        {/* Content */}
        <div className={`absolute inset-0 flex flex-col p-5 md:p-6 ${
          category.subcategories.length === 0
            ? "justify-center items-start text-left"
            : "justify-end"
        }`}>
          <h3 className="text-white font-bold text-xl md:text-2xl mb-1 font-[family-name:var(--font-heading)]">
            {category.name}
          </h3>
          <p className="text-white/70 text-sm line-clamp-2 mb-3 hidden md:block">
            {category.description}
          </p>

          {/* Subcategory pills - visible on mobile, slide up on hover for desktop */}
          {category.subcategories.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3 md:opacity-0 md:translate-y-4 md:group-hover:opacity-100 md:group-hover:translate-y-0 transition-[opacity,transform] duration-300">
              {category.subcategories.slice(0, 4).map((sub) => (
                <span
                  key={sub.id}
                  className="text-xs bg-white/25 text-white px-2.5 py-1 rounded-full"
                >
                  {sub.name}
                </span>
              ))}
              {category.subcategories.length > 4 && (
                <span className="text-xs text-white/60 px-1 py-1">
                  +{category.subcategories.length - 4}
                </span>
              )}
            </div>
          )}

          {/* Brand strip */}
          {category.brands.length > 0 && (
            <div className="flex items-center gap-2 text-xs text-white/50">
              {category.brands.slice(0, 3).map((b) => (
                <span key={b.id}>{b.name}</span>
              ))}
            </div>
          )}

          {/* Arrow */}
          <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/15 flex items-center justify-center md:opacity-0 md:group-hover:opacity-100 md:translate-x-4 md:group-hover:translate-x-0 transition-[opacity,transform] duration-300">
            <ArrowRight size={16} className="text-white" />
          </div>
        </div>
      </Link>
    </div>
  );
}
