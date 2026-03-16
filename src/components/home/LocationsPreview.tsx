"use client";

import dynamic from "next/dynamic";
import { useInView } from "@/lib/useInView";
import { locations } from "@/data/locations";
import SectionHeading from "@/components/shared/SectionHeading";
import { MapPin, Phone, Clock, Navigation } from "lucide-react";

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
        className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch"
      >
        {/* Map */}
        <div className="animate-on-scroll anim-slide-in-left min-h-80 h-full rounded-2xl overflow-hidden shadow-lg">
          <MapComponent />
        </div>

        {/* Store cards */}
        <div className="animate-on-scroll anim-slide-in-right space-y-6">
          {locations.map((loc) => (
            <div
              key={loc.id}
              className="bg-white rounded-2xl p-6 shadow-md border border-green-100"
            >
              <h3 className="font-bold text-green-900 text-lg mb-3 font-heading">
                {loc.name}
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-green-600 shrink-0" />
                  <span className="text-gray-600">{loc.address}, {loc.city}</span>
                  <a
                    href={loc.gmapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Otvori u Google Maps"
                    aria-label="Otvori u Google Maps"
                    className="shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-green-100 hover:bg-green-200 text-green-700 hover:text-green-900 transition-colors"
                  >
                    <Navigation size={12} />
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={16} className="text-green-600 shrink-0" />
                  <a
                    href={`tel:${loc.phone}`}
                    className="inline-flex items-center gap-1.5 px-1.5 py-0.5 rounded-md bg-green-100 hover:bg-green-200 text-green-700 hover:text-green-900 transition-colors font-medium"
                  >
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
