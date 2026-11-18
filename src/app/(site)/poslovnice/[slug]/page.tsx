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

function CardLabel({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-green-700 mb-2">
      {icon}
      {children}
    </p>
  );
}

function HoursRow({ label, value, closed }: { label: React.ReactNode; value: string; closed?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-gray-600">{label}</dt>
      <dd className={closed ? "text-gray-400 whitespace-nowrap" : "font-medium text-gray-900 tabular-nums whitespace-nowrap"}>
        {value}
      </dd>
    </div>
  );
}

export default async function StorePage({ params }: Props) {
  const { slug } = await params;
  const loc = locations.find((l) => l.slug === slug);
  if (!loc) notFound();
  const other = locations.find((l) => l.slug !== slug);

  // Današnji datum u Europe/Zagreb (en-CA daje YYYY-MM-DD)
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Zagreb" }).format(new Date());
  // Blagdani se prikazuju 60 dana unaprijed, pa ljeti kartica ne pokazuje Božić
  const until = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Zagreb" }).format(
    new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
  );
  const upcoming = specialHours.filter((h) => h.date >= today && h.date <= until);

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Početna", path: "/" },
          { name: "Kontakt", path: "/kontakt" },
          { name: loc.cityName, path: `/poslovnice/${loc.slug}` },
        ])}
      />

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
            {/* Breadcrumb na slici, da nema zasebne trake između zaglavlja i fotke */}
            <nav aria-label="Breadcrumb" className="mb-3">
              <ol className="flex items-center gap-1 text-sm text-white/75 flex-wrap">
                <li>
                  <Link href="/kontakt" className="hover:text-white transition-colors">
                    Kontakt
                  </Link>
                </li>
                <li className="flex items-center" aria-hidden="true">
                  <ChevronRight size={14} />
                </li>
                <li className="text-white" aria-current="page">{loc.cityName}</li>
              </ol>
            </nav>
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

        <aside className="lg:sticky lg:top-36 bg-white rounded-2xl shadow-md border border-green-100 overflow-hidden">
          <div className="p-6 md:p-7 divide-y divide-green-100 [&>*]:py-5 [&>*:first-child]:pt-0">
            <div>
              <CardLabel icon={<MapPin size={14} />}>Adresa</CardLabel>
              <p className="text-gray-800">{loc.address}</p>
              <p className="text-gray-500 text-sm">{loc.city}</p>
            </div>

            <div>
              <CardLabel icon={<Phone size={14} />}>Telefon</CardLabel>
              <a
                href={`tel:${loc.phone.replace(/\s/g, "")}`}
                className="text-lg font-semibold text-green-800 hover:text-green-600 transition-colors tabular-nums"
              >
                {loc.phone}
              </a>
            </div>

            <div>
              <CardLabel icon={<Clock size={14} />}>Radno vrijeme</CardLabel>
              <dl className="text-sm space-y-1.5">
                {loc.hours.map((h) => (
                  <HoursRow key={h.days} label={h.days} value={h.time.replace(/\s*-\s*/, " – ")} />
                ))}
                <HoursRow label="Ned" value="zatvoreno" closed />
              </dl>
            </div>

            {upcoming.length > 0 && (
              <div>
                <CardLabel icon={<CalendarDays size={14} />}>Blagdani</CardLabel>
                <dl className="text-sm space-y-1.5">
                  {upcoming.map((h) => (
                    <HoursRow
                      key={h.date}
                      label={
                        <>
                          <span className="tabular-nums inline-block w-12">{formatSpecialDate(h.date)}</span>
                          {h.label}
                        </>
                      }
                      value={h.opens && h.closes ? `${shortTime(h.opens)} – ${shortTime(h.closes)}` : "zatvoreno"}
                      closed={!h.opens}
                    />
                  ))}
                </dl>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 px-6 md:px-7 pb-6 md:pb-7">
            <a
              href={`tel:${loc.phone.replace(/\s/g, "")}`}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-700 hover:bg-green-600 text-white text-sm font-semibold py-3 transition-colors"
            >
              <Phone size={16} /> Nazovi
            </a>
            <a
              href={loc.gmapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-green-700 text-green-700 hover:bg-green-700 hover:text-white text-sm font-semibold py-2.5 transition-colors"
            >
              <Navigation size={16} /> Navigacija
            </a>
          </div>
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
