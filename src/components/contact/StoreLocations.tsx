"use client";

import Link from "next/link";
import { useInView } from "@/lib/useInView";
import { locations, contactInfo } from "@/data/locations";
import SectionHeading from "@/components/shared/SectionHeading";
import { MapPin, Phone, Mail, User } from "lucide-react";

export default function StoreLocations() {
  const ref = useInView<HTMLDivElement>();

  return (
    <section id="poslovnice" className="scroll-mt-24 py-12 md:py-16 px-4 md:px-8">
      <SectionHeading
        title="Telefoni i adrese"
        subtitle="Nazovite nas ili posjetite neku od naših poslovnica"
      />

      <div
        ref={ref}
        className="stagger-children max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {locations.map((loc) => (
          <div
            key={loc.id}
            className="animate-on-scroll anim-fade-in-up bg-white rounded-2xl p-6 shadow-md border border-green-100 flex flex-col"
          >
            <h3 className="text-lg font-bold text-green-900 mb-4 font-heading">
              {loc.cityName}
            </h3>
            <div className="space-y-3 flex-1">
              <div className="flex items-start gap-3">
                <MapPin size={18} className="text-green-600 mt-0.5 shrink-0" />
                <span className="text-gray-600">{loc.address}, {loc.city}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={18} className="text-green-600 shrink-0" />
                <a
                  href={`tel:${loc.phone}`}
                  className="font-medium text-green-700 hover:text-green-900 transition-colors"
                >
                  {loc.phone}
                </a>
              </div>
            </div>
            <Link
              href={`/poslovnice/${loc.slug}`}
              className="inline-block mt-5 text-sm font-semibold text-green-700 hover:text-green-900 transition-colors"
            >
              Karta i radno vrijeme
            </Link>
          </div>
        ))}

        {/* Director / general contact */}
        <div className="animate-on-scroll anim-fade-in-up bg-white rounded-2xl p-6 shadow-md border border-green-100 flex flex-col">
          <h3 className="text-lg font-bold text-green-900 mb-4 font-heading">
            Uprava
          </h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <User size={18} className="text-green-600 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-gray-700">{contactInfo.director}</p>
                <p className="text-sm text-gray-500">Direktor</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone size={18} className="text-green-600 shrink-0" />
              <a
                href={`tel:${contactInfo.directorPhone}`}
                className="font-medium text-green-700 hover:text-green-900 transition-colors"
              >
                {contactInfo.directorPhone}
              </a>
            </div>
            <div className="flex items-start gap-3">
              <Mail size={18} className="text-green-600 mt-0.5 shrink-0" />
              <a
                href={`mailto:${contactInfo.email}`}
                className="text-gray-600 hover:text-green-700 transition-colors break-all"
              >
                {contactInfo.email}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
