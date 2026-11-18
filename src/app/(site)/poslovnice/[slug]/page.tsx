import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { locations, specialHours, storeServices } from "@/data/locations";
import AnimatedSection from "@/components/shared/AnimatedSection";
import SectionHeading from "@/components/shared/SectionHeading";
import Button from "@/components/shared/Button";
import StoreMap from "@/components/poslovnice/StoreMap";
import JsonLd from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, metaDescription, openGraph } from "@/lib/seo";
import { MapPin, Phone, Clock, Navigation, ChevronRight, Check, CalendarDays } from "lucide-react";

// Dnevno osvježavanje da blok s blagdanskim radnim vremenom izbaci prošle datume
export const revalidate = 86400;
export const dynamicParams = false;

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return locations.map((loc) => ({ slug: loc.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const loc = locations.find((l) => l.slug === slug);
  if (!loc) notFound();
  // Layout dodaje " | Oroz PHARM" preko title.template
  const title = `Poljoprivredna ljekarna ${loc.cityName}`;
  const description = metaDescription(loc.intro[0]);
  return {
    title,
    description,
    alternates: { canonical: `/poslovnice/${slug}` },
    openGraph: openGraph({
      title,
      description,
      url: `/poslovnice/${slug}`,
      images: loc.heroImage,
    }),
  };
}

function formatSpecialDate(date: string) {
  const [, m, d] = date.split("-").map(Number);
  return `${d}.${m}.`;
}

/** "07:00" -> "7:00", kao u redovnom radnom vremenu */
function shortTime(t: string) {
  return t.replace(/^0/, "");
}

export default async function StorePage({ params }: Props) {
  const { slug } = await params;
  const loc = locations.find((l) => l.slug === slug);
  if (!loc) notFound();
  const other = locations.find((l) => l.slug !== slug);

  // Današnji datum u Europe/Zagreb (en-CA daje YYYY-MM-DD)
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Zagreb" }).format(new Date());
  const upcoming = specialHours.filter((h) => h.date >= today);

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Početna", path: "/" },
          { name: "Kontakt", path: "/kontakt" },
          { name: loc.cityName, path: `/poslovnice/${loc.slug}` },
        ])}
      />

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="max-w-6xl mx-auto px-4 md:px-8 pt-4 pb-2">
        <ol className="flex items-center gap-1 text-sm flex-wrap">
          <li>
            <Link href="/kontakt" className="text-green-600 hover:text-green-800 transition-colors">
              Kontakt
            </Link>
          </li>
          <li className="flex items-center text-gray-400">
            <ChevronRight size={14} />
          </li>
          <li className="text-gray-500">{loc.cityName}</li>
        </ol>
      </nav>

      {/* Hero */}
      <div className="relative h-[45vh] min-h-[320px] overflow-hidden">
        <Image
          src={loc.heroImage}
          alt={`Poslovnica Oroz PHARM ${loc.cityName}`}
          fill
          sizes="100vw"
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <div className="absolute inset-0 flex items-end pb-10">
          <div className="max-w-6xl mx-auto px-4 md:px-8 w-full">
            <h1 className="text-3xl md:text-5xl font-bold text-white font-heading mb-3">
              Poljoprivredna ljekarna {loc.cityName}
            </h1>
            <p className="flex items-center gap-2 text-white/80">
              <MapPin size={18} className="shrink-0" />
              {loc.address}, {loc.city}
            </p>
          </div>
        </div>
      </div>

      {/* Content + info card */}
      <section className="max-w-6xl mx-auto px-4 md:px-8 py-12 md:py-16 grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        <div className="lg:col-span-2">
          <div className="space-y-4 text-gray-600 leading-relaxed text-lg">
            {loc.intro.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>

          <h2 className="text-2xl font-bold text-green-900 font-heading mt-10 mb-4">
            Što možete naći kod nas
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {loc.highlights.map((h) => (
              <li key={h} className="flex items-start gap-2 text-gray-700">
                <Check size={18} className="text-green-600 mt-0.5 shrink-0" />
                {h}
              </li>
            ))}
          </ul>

          <h2 className="text-2xl font-bold text-green-900 font-heading mt-10 mb-4">
            Plaćanje i usluge
          </h2>
          <ul className="flex flex-wrap gap-2">
            {storeServices.map((s) => (
              <li
                key={s}
                className="text-sm bg-green-50 text-green-700 px-3 py-1.5 rounded-full font-medium"
              >
                {s}
              </li>
            ))}
          </ul>
        </div>

        <aside className="lg:sticky lg:top-36 bg-white rounded-2xl p-6 md:p-8 shadow-md border border-green-100 space-y-6">
          <div>
            <div className="flex items-start gap-3">
              <MapPin size={18} className="text-green-600 mt-1 shrink-0" />
              <div>
                <p className="font-medium text-gray-700">{loc.address}</p>
                <p className="text-gray-600 text-sm">{loc.city}</p>
              </div>
            </div>
            <a
              href={loc.gmapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-green-100 hover:bg-green-200 text-green-700 hover:text-green-900 transition-colors text-sm font-semibold"
            >
              <Navigation size={14} /> Navigacija
            </a>
          </div>

          <div className="flex items-center gap-3">
            <Phone size={18} className="text-green-600 shrink-0" />
            <a
              href={`tel:${loc.phone.replace(/\s/g, "")}`}
              className="text-2xl font-bold text-green-900 hover:text-green-600 transition-colors"
            >
              {loc.phone}
            </a>
          </div>

          <div className="flex items-start gap-3">
            <Clock size={18} className="text-green-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-gray-700 mb-1">Radno vrijeme</p>
              {loc.hours.map((h, i) => (
                <p key={i} className="text-gray-600 text-sm">
                  {h.days}: <span className="font-medium">{h.time}</span>
                </p>
              ))}
            </div>
          </div>

          {upcoming.length > 0 && (
            <div className="flex items-start gap-3 border-t border-green-100 pt-6">
              <CalendarDays size={18} className="text-green-600 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="font-medium text-gray-700 mb-2">Blagdansko radno vrijeme</p>
                <dl className="text-sm space-y-1">
                  {upcoming.map((h) => (
                    <div key={h.date} className="flex justify-between gap-3">
                      <dt className="text-gray-600">
                        <span className="tabular-nums">{formatSpecialDate(h.date)}</span> {h.label}
                      </dt>
                      <dd className={h.opens ? "font-medium text-gray-800 tabular-nums whitespace-nowrap" : "text-red-700 whitespace-nowrap"}>
                        {h.opens && h.closes ? `${shortTime(h.opens)} - ${shortTime(h.closes)}` : "zatvoreno"}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          )}
        </aside>
      </section>

      {/* Map */}
      <AnimatedSection className="pb-12 md:pb-16">
        <div className="max-w-6xl mx-auto h-80 md:h-96 rounded-2xl overflow-hidden shadow-lg">
          <StoreMap focusId={loc.id} />
        </div>
      </AnimatedSection>

      {/* Gallery */}
      <AnimatedSection className="py-12 md:py-16 bg-green-50">
        <SectionHeading title="Pogledajte poslovnicu" subtitle={`Oroz PHARM ${loc.cityName}`} />
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {loc.gallery.map((img) => (
            <div key={img.src} className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-md">
              <Image
                src={img.src}
                alt={img.alt}
                fill
                sizes="(min-width: 1024px) 384px, (min-width: 640px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </AnimatedSection>

      {/* Other store + CTA */}
      <AnimatedSection className="py-12 md:py-16">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {other && (
            <div className="bg-white rounded-2xl p-8 shadow-md border border-green-100">
              <h2 className="text-xl font-bold text-green-900 font-heading mb-2">
                Bliže vam je {other.cityName}?
              </h2>
              <p className="text-gray-600 mb-4">
                {other.address}, {other.city}
              </p>
              <Link
                href={`/poslovnice/${other.slug}`}
                className="font-semibold text-green-700 hover:text-green-900 transition-colors"
              >
                Poslovnica {other.cityName} &rarr;
              </Link>
            </div>
          )}
          <div className="bg-green-900 rounded-2xl p-8 text-white">
            <h2 className="text-xl font-bold font-heading mb-2">Pogledajte naš asortiman</h2>
            <p className="text-green-100 mb-4">Više od 15.000 artikala u ponudi.</p>
            <Button href="/proizvodi" variant="secondary">
              Proizvodi
            </Button>
          </div>
        </div>
      </AnimatedSection>
    </>
  );
}
