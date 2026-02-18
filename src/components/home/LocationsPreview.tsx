"use client";

import dynamic from "next/dynamic";
import { useInView } from "@/lib/useInView";
import { locations } from "@/data/locations";
import SectionHeading from "@/components/shared/SectionHeading";
import { MapPin, Phone, Clock } from "lucide-react";

const MapComponent = dynamic(() => import("@/components/shared/Map"), { ssr: false });

export default function LocationsPreview() {
  const ref = useInView<HTMLDivElement>();

  return (
    <section className="py-20 md:py-28 bg-green-50 px-4 md:px-8">
      <SectionHeading
        title="Naše lokacije"
        subtitle="Posjetite nas u jednoj od naših poslovnica"
      />

      <div
        ref={ref}
        className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-start"
      >
        {/* Map */}
        <div className="animate-on-scroll anim-slide-in-left h-80 md:h-96 rounded-2xl overflow-hidden shadow-lg">
          <MapComponent />
        </div>

        {/* Store cards */}
        <div className="animate-on-scroll anim-slide-in-right space-y-6">
          {locations.map((loc) => (
            <div
              key={loc.id}
              className="bg-white rounded-2xl p-6 shadow-md border border-green-100"
            >
              <h3 className="font-bold text-green-900 text-lg mb-3 font-[family-name:var(--font-heading)]">
                {loc.name}
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <MapPin size={16} className="text-green-600 mt-0.5 shrink-0" />
                  <span className="text-gray-600">{loc.address}, {loc.city}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={16} className="text-green-600 shrink-0" />
                  <a href={`tel:${loc.phone}`} className="text-gray-600 hover:text-green-700 transition-colors">
                    {loc.phone}
                  </a>
                </div>
                <div className="flex items-start gap-2">
                  <Clock size={16} className="text-green-600 mt-0.5 shrink-0" />
                  <div className="text-gray-600">
                    {loc.hours.map((h, i) => (
                      <span key={i} className="block">
                        {h.days}: <span className="font-medium">{h.time}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
