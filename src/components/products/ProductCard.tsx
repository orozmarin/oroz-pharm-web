import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/types/views";

interface Props {
  product: Product;
}

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&q=80";

export default function ProductCard({ product }: Props) {
  return (
    <Link
      href={`/proizvodi/${product.categorySlug}/${product.slug}`}
      className="group flex flex-col bg-white rounded-xl border border-green-100 overflow-hidden hover:shadow-lg hover:border-green-200 transition-all duration-300"
    >
      <div className="relative aspect-4/3 overflow-hidden bg-gray-100">
        <Image
          src={product.image || FALLBACK_IMAGE}
          alt=""
          fill
          aria-hidden="true"
          className="object-cover scale-110 blur-md opacity-50"
        />
        <Image
          src={product.image || FALLBACK_IMAGE}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-contain group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="flex flex-col gap-2 p-4 flex-1">
        {product.manufacturer && (
          <span className="text-xs font-semibold text-green-700 uppercase tracking-wide">
            {product.manufacturer}
          </span>
        )}
        <h3 className="font-semibold text-green-900 text-base leading-snug group-hover:text-green-700 transition-colors">
          {product.name}
        </h3>
        {product.description && (
          <p className="text-gray-500 text-sm line-clamp-2 flex-1">
            {product.description}
          </p>
        )}
        <span className="text-green-700 text-sm font-medium mt-1">
          Detalji →
        </span>
      </div>
    </Link>
  );
}
