import Image from "next/image";
import Link from "next/link";
import { Bird } from "lucide-react";
import Button from "@/components/shared/Button";
import type { Product, Subcategory } from "@/types/views";

/** Redoslijed grupa je eksplicitan. Abecedni sort iz upita slučajno daje isto,
 *  ali na to se ne vežemo. Nepoznate podkategorije idu na kraj. */
const GROUP_ORDER = ["jednodnevna-perad", "podrasla-perad"];

const PURPOSE_LABEL: Record<string, string> = {
  tov: "Za tov",
  jaja: "Za jaja",
};

interface Props {
  subcategories: Subcategory[];
  products: Product[];
}

function groupIndex(slug?: string): number {
  const i = slug ? GROUP_ORDER.indexOf(slug) : -1;
  return i === -1 ? GROUP_ORDER.length : i;
}

function PoultryCard({
  product,
  priority,
}: {
  product: Product;
  priority: boolean;
}) {
  const purpose = product.purpose
    ? PURPOSE_LABEL[product.purpose.toLowerCase()]
    : undefined;

  return (
    <Link
      href={`/proizvodi/${product.categorySlug}/${product.slug}`}
      className="group flex flex-col h-full bg-white rounded-2xl border border-green-100 overflow-hidden hover:shadow-lg hover:border-green-200 transition-all duration-300"
    >
      <div className="relative aspect-4/3 overflow-hidden">
        {product.image ? (
          <>
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              priority={priority}
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-linear-to-t from-green-900/50 to-transparent" />
          </>
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-green-50">
            <Bird className="text-green-700/40" size={40} strokeWidth={1.5} />
            <span className="text-xs font-medium text-green-700/60">
              Fotografija u pripremi
            </span>
          </div>
        )}
        {product.age && (
          <span className="absolute top-3 left-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-green-900">
            {product.age}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-2 p-5 flex-1">
        {purpose && (
          <span className="text-xs font-semibold text-green-700 uppercase tracking-wide">
            {purpose}
          </span>
        )}
        <h3 className="font-bold text-green-900 text-lg leading-snug font-heading group-hover:text-green-700 transition-colors">
          {product.name}
        </h3>
        {product.description && (
          <p className="text-gray-500 text-sm leading-relaxed flex-1">
            {product.description}
          </p>
        )}
        <span className="text-green-700 text-sm font-medium mt-1">Detalji →</span>
      </div>
    </Link>
  );
}

function PoultryCardGrid({
  items,
  priorityIds,
}: {
  items: Product[];
  priorityIds: Set<string>;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((p) => (
        <PoultryCard key={p.id} product={p} priority={priorityIds.has(p.id)} />
      ))}
    </div>
  );
}

export default function PoultryGrid({ subcategories, products }: Props) {
  const ordered = [...subcategories].sort(
    (a, b) =>
      groupIndex(a.slug) - groupIndex(b.slug) ||
      a.name.localeCompare(b.name, "hr")
  );

  const groups = ordered
    .map((sub) => ({
      sub,
      items: products.filter((p) => p.subcategoryId === sub.id),
    }))
    .filter((g) => g.items.length > 0);

  // Proizvod bez podkategorije ne smije tiho ispasti iz prikaza.
  const groupedIds = new Set(groups.flatMap((g) => g.items.map((p) => p.id)));
  const orphans = products.filter((p) => !groupedIds.has(p.id));

  // priority samo za prvi red kartica
  const priorityIds = new Set(
    [...groups.flatMap((g) => g.items), ...orphans].slice(0, 3).map((p) => p.id)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-16">
      {groups.map(({ sub, items }) => (
        <section key={sub.id} className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-green-900 font-heading mb-6">
            {sub.name}
          </h2>
          <PoultryCardGrid items={items} priorityIds={priorityIds} />
        </section>
      ))}

      {orphans.length > 0 && (
        <section className="mb-12">
          <PoultryCardGrid items={orphans} priorityIds={priorityIds} />
        </section>
      )}

      <div className="rounded-2xl border border-green-100 bg-green-50 p-8 text-center">
        <h3 className="text-xl md:text-2xl font-bold text-green-900 font-heading mb-2">
          Perad se prodaje po narudžbi
        </h3>
        <p className="text-gray-600 max-w-xl mx-auto mb-6">
          Termini dolaska ovise o sezoni. Javite se za dostupnost i rezervaciju
          količine.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Button href="/kontakt" variant="primary">
            Zatražite ponudu
          </Button>
          <Button href="/kontakt#poslovnice" variant="outline">
            Posjetite poslovnicu
          </Button>
        </div>
      </div>
    </div>
  );
}
