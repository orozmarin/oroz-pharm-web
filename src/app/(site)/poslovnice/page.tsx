import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Phone, Navigation } from "lucide-react";
import { locations } from "@/data/locations";
import StoreMap from "@/components/poslovnice/StoreMap";
import JsonLd from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, openGraph } from "@/lib/seo";

const title = "Poljoprivredne ljekarne u Pleternici i Požegi";
const description =
  "Dvije poslovnice Oroz PHARM-a, u Pleternici i Požegi. Adrese, telefoni, radno vrijeme i karta, uz više od 15.000 artikala za polje, vrt i štalu.";

export const metadata: Metadata = {
  title: "Poslovnice",
  description,
  alternates: { canonical: "/poslovnice" },
  openGraph: openGraph({ title, description, url: "/poslovnice", images: locations[0].heroImage }),
};

export default function StoresPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Početna", path: "/" },
          { name: "Poslovnice", path: "/poslovnice" },
        ])}
      />

      <section className="px-4 md:px-8 pt-14 md:pt-20 pb-10">
        <div className="max-w-6xl mx-auto">
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-green-900 text-balance max-w-3xl leading-tight">
            {title}
          </h1>
          <p className="mt-5 text-lg text-gray-600 max-w-[60ch] leading-relaxed">
            U obje poslovnice dolazite po sjeme, gnojiva, zaštitu bilja, stočnu hranu i opremu za vrt,
            uz savjet za vašu kulturu. Pleternica je sjedište i ima skladište, a Požega subotom radi kraće.
          </p>
        </div>
      </section>

      <section className="px-4 md:px-8 pb-14">
        <div className="max-w-6xl mx-auto grid gap-8 md:grid-cols-2">
          {locations.map((loc) => (
            <article
              key={loc.id}
              className="flex flex-col overflow-hidden rounded-2xl bg-white border border-green-100 shadow-md"
            >
              <Link href={`/poslovnice/${loc.slug}`} className="relative block aspect-[16/9]">
                <Image
                  src={loc.heroImage}
                  alt={`Poslovnica Oroz PHARM ${loc.cityName}`}
                  fill
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="object-cover"
                />
              </Link>

              <div className="flex flex-1 flex-col p-6 md:p-7">
                <h2 className="text-2xl font-bold text-green-900">
                  <Link href={`/poslovnice/${loc.slug}`} className="hover:text-green-600 transition-colors">
                    {loc.cityName}
                  </Link>
                </h2>

                <div className="mt-5 space-y-2 text-gray-700">
                  <p className="flex items-start gap-2">
                    <MapPin size={18} className="text-green-600 mt-0.5 shrink-0" />
                    <span>
                      {loc.address}, {loc.city}
                    </span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone size={18} className="text-green-600 shrink-0" />
                    <a
                      href={`tel:${loc.phone.replace(/\s/g, "")}`}
                      className="font-semibold text-green-800 hover:text-green-600 tabular-nums"
                    >
                      {loc.phone}
                    </a>
                  </p>
                </div>

                <dl className="mt-5 text-sm space-y-1.5 border-t border-green-100 pt-5">
                  {loc.hours.map((h) => (
                    <div key={h.days} className="flex justify-between gap-4">
                      <dt className="text-gray-600">{h.days}</dt>
                      <dd className="font-medium text-gray-900 tabular-nums">{h.time.replace(/\s*-\s*/, " – ")}</dd>
                    </div>
                  ))}
                  <div className="flex justify-between gap-4">
                    <dt className="text-gray-600">Ned</dt>
                    <dd className="text-gray-400">zatvoreno</dd>
                  </div>
                </dl>

                <div className="mt-auto pt-6 grid grid-cols-2 gap-3">
                  <Link
                    href={`/poslovnice/${loc.slug}`}
                    className="inline-flex items-center justify-center rounded-xl bg-green-700 hover:bg-green-600 text-white text-sm font-semibold py-3 transition-colors"
                  >
                    Više o poslovnici
                  </Link>
                  <a
                    href={loc.gmapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-green-700 text-green-700 hover:bg-green-700 hover:text-white text-sm font-semibold py-2.5 transition-colors"
                  >
                    <Navigation size={16} /> Navigacija
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="px-4 md:px-8 pb-20">
        <div className="max-w-6xl mx-auto h-80 md:h-[420px] rounded-2xl overflow-hidden shadow-lg">
          <StoreMap />
        </div>
      </section>
    </>
  );
}
