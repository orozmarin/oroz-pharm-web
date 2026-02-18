"use client";

import Image from "next/image";
import { useInView } from "@/lib/useInView";
import SectionHeading from "@/components/shared/SectionHeading";

const team = [
  {
    name: "Perica Oroz",
    role: "Direktor, dipl. ing.",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80",
    featured: true,
  },
  {
    name: "Stručni suradnik",
    role: "Dipl. ing. agronomije",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
  },
  {
    name: "Stručni suradnik",
    role: "Ing. poljoprivrede",
    image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&q=80",
  },
  {
    name: "Stručni suradnik",
    role: "Ing. poljoprivrede",
    image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&q=80",
  },
  {
    name: "Stručni suradnik",
    role: "Ing. poljoprivrede",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80",
  },
  {
    name: "Stručni suradnik",
    role: "Polj. tehničar",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80",
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

      <div
        ref={ref}
        className="stagger-children max-w-5xl mx-auto"
      >
        {/* Featured member (director) */}
        <div className="animate-on-scroll anim-fade-in-up flex justify-center mb-12">
          <div className="text-center">
            <div className="w-40 h-40 md:w-48 md:h-48 rounded-full overflow-hidden mx-auto mb-4 border-4 border-green-600 shadow-lg">
              <Image
                src={team[0].image}
                alt={team[0].name}
                width={192}
                height={192}
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="text-xl font-bold text-green-900 font-[family-name:var(--font-heading)]">
              {team[0].name}
            </h3>
            <p className="text-earth-700 text-sm">{team[0].role}</p>
          </div>
        </div>

        {/* Rest of team */}
        <div className="animate-on-scroll anim-fade-in-up grid grid-cols-2 md:grid-cols-5 gap-8">
          {team.slice(1).map((member, i) => (
            <div
              key={i}
              className="text-center group"
            >
              <div className="w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden mx-auto mb-3 border-3 border-green-200 group-hover:border-green-500 transition-colors shadow-md">
                <Image
                  src={member.image}
                  alt={member.name}
                  width={112}
                  height={112}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <h3 className="font-semibold text-green-900 text-sm">{member.name}</h3>
              <p className="text-gray-500 text-xs">{member.role}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
