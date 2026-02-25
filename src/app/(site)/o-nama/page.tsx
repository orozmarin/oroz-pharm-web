import type { Metadata } from "next";
import Image from "next/image";
import Timeline from "@/components/about/Timeline";
import TeamGrid from "@/components/about/TeamGrid";
import LocationGallery from "@/components/about/LocationGallery";
import SectionHeading from "@/components/shared/SectionHeading";
import { Users, Package, TrendingUp, MapPin } from "lucide-react";

export const metadata: Metadata = {
  title: "O nama",
  description: "Oroz PHARM d.o.o. - privatno poduzece osnovano 1998. godine u Pleternici. 10 zaposlenih, preko 12.000 artikala.",
};

const stats = [
  { icon: Users, value: "10", label: "Zaposlenih" },
  { icon: Package, value: "12.000+", label: "Artikala" },
  { icon: TrendingUp, value: "25+", label: "Godina iskustva" },
  { icon: MapPin, value: "2", label: "Lokacije" },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <div className="relative h-[60vh] min-h-[450px] overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1920&q=80"
          alt="Oroz PHARM poslovnica"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-green-900/80 via-green-900/30 to-transparent" />
        <div className="absolute inset-0 flex items-end pb-16">
          <div className="max-w-7xl mx-auto px-4 md:px-8 w-full">
            <p className="text-green-300 text-lg mb-2 font-medium">Od 1998. uz vas</p>
            <h1 className="text-4xl md:text-6xl font-bold text-white font-[family-name:var(--font-heading)] max-w-2xl">
              Vaš pouzdan partner u poljoprivredi
            </h1>
          </div>
        </div>
      </div>

      {/* Stats strip */}
      <div className="bg-green-800 py-8">
        <div className="max-w-5xl mx-auto px-4 md:px-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <s.icon size={28} className="mx-auto text-green-300 mb-2" />
              <div className="text-3xl font-bold text-white font-[family-name:var(--font-heading)]">
                {s.value}
              </div>
              <div className="text-green-200 text-sm">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Intro text */}
      <section className="py-16 md:py-20 px-4 md:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <SectionHeading
            title="Naša priča"
            subtitle="Od male poljoprivredne ljekarne do jednog od vodećih dobavljača u Požeško-slavonskoj županiji"
          />
          <p className="text-gray-600 leading-relaxed">
            OROZ PHARM d.o.o. privatno je poduzeće osnovano 1998. godine, registrirano za maloprodaju
            i veleprodaju repromaterijala u poljoprivredi te za proizvodnu djelatnost. Sjedište tvrtke
            nalazi se u Pleternici, gdje se nalaze maloprodajna trgovina, skladište i računovodstvo.
            Tim od 10 zaposlenih uključuje diplomirane inženjere agronomije i poljoprivredne tehničara
            koji vam stoje na raspolaganju kako u uredskim prostorima tako i na terenu.
          </p>
        </div>
      </section>

      <Timeline />
      <TeamGrid />
      <LocationGallery />
    </>
  );
}
