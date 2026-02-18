import type { Metadata } from "next";
import Image from "next/image";
import BrandMarquee from "@/components/products/BrandMarquee";
import CategoryGrid from "@/components/products/CategoryGrid";

export const metadata: Metadata = {
  title: "Proizvodi",
  description: "Pregledajte naš asortiman od preko 12.000 artikala - zaštita bilja, gnojiva, sjeme, navodnjavanje, stočna hrana i još mnogo toga.",
};

export default function ProductsPage() {
  return (
    <>
      {/* Hero banner */}
      <div className="relative h-[50vh] min-h-[400px] overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1920&q=80"
          alt="Poljoprivredno polje"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-green-900/80 via-green-900/40 to-transparent" />
        <div className="absolute inset-0 flex items-end pb-16">
          <div className="max-w-7xl mx-auto px-4 md:px-8 w-full">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-3 font-[family-name:var(--font-heading)]">
              Naš asortiman
            </h1>
            <p className="text-white/80 text-lg max-w-xl">
              Preko 12.000 artikala za sve vaše poljoprivredne potrebe, organizirano u {" "}
              <span className="text-green-300 font-semibold">13 kategorija</span> s vodećim svjetskim brandovima.
            </p>
          </div>
        </div>
      </div>

      <BrandMarquee />

      <section className="py-16 md:py-24">
        <CategoryGrid />
      </section>
    </>
  );
}
