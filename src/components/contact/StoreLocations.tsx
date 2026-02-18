"use client";

import dynamic from "next/dynamic";
import { useInView } from "@/lib/useInView";
import { locations, contactInfo } from "@/data/locations";
import SectionHeading from "@/components/shared/SectionHeading";
import { MapPin, Phone, Clock, Mail, User } from "lucide-react";

const MapComponent = dynamic(() => import("@/components/shared/Map"), { ssr: false });

export default function StoreLocations() {
  const ref = useInView<HTMLDivElement>();

  return (
    <section className="py-20 md:py-28 px-4 md:px-8">
      <SectionHeading
        title="Naše poslovnice"
        subtitle="Posjetite nas ili nas nazovite za sve informacije"
      />

      <div
        ref={ref}
        className="stagger-children max-w-6xl mx-auto"
      >
        {/* Map */}
        <div className="animate-on-scroll anim-fade-in-up h-72 md:h-80 rounded-2xl overflow-hidden shadow-lg mb-10">
          <MapComponent />
        </div>

        {/* Store cards */}
        <div className="animate-on-scroll anim-fade-in-up grid grid-cols-1 md:grid-cols-2 gap-8">
          {locations.map((loc) => (
            <div
              key={loc.id}
              className="bg-white rounded-2xl p-8 shadow-md border border-green-100"
            >
              <h3 className="text-xl font-bold text-green-900 mb-5 font-[family-name:var(--font-heading)]">
                {loc.name}
              </h3>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin size={18} className="text-green-600 mt-0.5 shrink-0" />
                  <span className="text-gray-600">{loc.address}, {loc.city}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone size={18} className="text-green-600 shrink-0" />
                  <a href={`tel:${loc.phone}`} className="text-gray-600 hover:text-green-700 transition-colors font-medium">
                    {loc.phone}
                  </a>
                </div>
                <div className="flex items-start gap-3">
                  <Clock size={18} className="text-green-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-gray-700 mb-1">Radno vrijeme:</p>
                    {loc.hours.map((h, i) => (
                      <p key={i} className="text-gray-600 text-sm">
                        {h.days}: <span className="font-medium">{h.time}</span>
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Director contact */}
        <div className="animate-on-scroll anim-fade-in-up mt-8 bg-green-50 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-12">
          <div className="flex items-center gap-3">
            <User size={20} className="text-green-600" />
            <div>
              <p className="font-semibold text-green-900">{contactInfo.director}</p>
              <p className="text-sm text-gray-500">Direktor</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Phone size={18} className="text-green-600" />
            <a href={`tel:${contactInfo.directorPhone}`} className="text-gray-600 hover:text-green-700 transition-colors">
              {contactInfo.directorPhone}
            </a>
          </div>
          <div className="flex items-center gap-3">
            <Mail size={18} className="text-green-600" />
            <a href={`mailto:${contactInfo.email}`} className="text-gray-600 hover:text-green-700 transition-colors">
              {contactInfo.email}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
