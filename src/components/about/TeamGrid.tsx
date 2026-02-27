"use client";

import Image from "next/image";
import { useInView } from "@/lib/useInView";
import SectionHeading from "@/components/shared/SectionHeading";

const highlights = [
  {
    value: "25+",
    label: "Godina iskustva",
    desc: "Aktivno poslujemo od 1998. godine uz neprestano usavršavanje znanja.",
  },
  {
    value: "10",
    label: "Stručnih djelatnika",
    desc: "Diplomirani inženjeri agronomije i poljoprivredni tehničari.",
  },
  {
    value: "2",
    label: "Poslovnice",
    desc: "Dostupni u Pleternici i Požegi, a po potrebi i na vašem terenu.",
  },
];

export default function TeamGrid() {
  const ref = useInView<HTMLDivElement>();

  return (
    <section className="py-20 md:py-28 bg-earth-100 px-4 md:px-8">
      <SectionHeading
        title="Naš tim"
        subtitle="Stručnjaci koji brinu o vašem uspjehu"
      />

      <div ref={ref} className="max-w-5xl mx-auto">
        {/* Team photo */}
        <div className="animate-on-scroll anim-fade-in-up relative rounded-2xl overflow-hidden shadow-xl aspect-16/7">
          <Image
            src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1200&q=80"
            alt="Tim Oroz PHARM"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-green-900/75 via-green-900/15 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
            <p className="text-green-300 text-sm font-medium tracking-wide uppercase mb-1">
              Pleternica &amp; Požega
            </p>
            <h3 className="text-white text-2xl md:text-3xl font-bold font-heading">
              10 stručnjaka na vašoj strani
            </h3>
          </div>
        </div>

        {/* Highlight cards */}
        <div className="animate-on-scroll anim-fade-in-up grid md:grid-cols-3 gap-6 mt-8">
          {highlights.map((h) => (
            <div key={h.label} className="bg-white rounded-xl p-6 shadow-sm border border-earth-200">
              <div className="text-3xl font-bold text-green-700 mb-1 font-heading">
                {h.value}
              </div>
              <div className="font-semibold text-green-900 mb-2">{h.label}</div>
              <p className="text-gray-500 text-sm leading-relaxed">{h.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
