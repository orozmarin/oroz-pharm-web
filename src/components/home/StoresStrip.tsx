"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { MapPin, Phone } from "lucide-react";
import { locations, specialHours, type StoreLocation } from "@/data/locations";

const MapComponent = dynamic(() => import("@/components/shared/Map"), { ssr: false });

/** Radno vrijeme za danas u Europe/Zagreb, uključujući blagdane iz specialHours. */
function todayStatus(loc: StoreLocation): string {
  const now = new Date();
  const date = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Zagreb" }).format(now);
  const weekday = new Intl.DateTimeFormat("en-US", { timeZone: "Europe/Zagreb", weekday: "long" }).format(now);

  const special = specialHours.find((h) => h.date === date);
  if (special) {
    return special.opens && special.closes
      ? `Danas (${special.label}) ${short(special.opens)} – ${short(special.closes)}`
      : `Danas zatvoreno (${special.label})`;
  }
  const regular = loc.openingHours.find((h) => h.days.includes(weekday));
  if (!regular) return "Danas zatvoreno";
  return `Danas ${short(regular.opens)} – ${short(regular.closes)}`;
}

function short(t: string) {
  return t.replace(/^0/, "");
}

export default function StoresStrip() {
  // Status ovisi o današnjem danu, a stranica je statična, pa se računa tek u pregledniku.
  const [status, setStatus] = useState<Record<string, string>>({});
  useEffect(() => {
    setStatus(Object.fromEntries(locations.map((l) => [l.id, todayStatus(l)])));
  }, []);

  return (
    <section className="bg-green-50 px-4 md:px-8 py-14 md:py-20">
      <div className="max-w-6xl mx-auto grid gap-8 lg:grid-cols-2 lg:items-stretch">
        <div className="flex flex-col">
          <h2 className="text-3xl md:text-4xl font-bold text-green-900">Posjetite nas</h2>
          <p className="mt-3 text-gray-600 leading-relaxed">
            Dvije poslovnice, u Pleternici i Požegi. Dođite po robu i savjet.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {locations.map((loc) => (
              <div key={loc.id} className="rounded-2xl bg-white border border-green-100 p-5 shadow-sm">
                <h3 className="text-xl font-bold text-green-900">
                  <Link href={`/poslovnice/${loc.slug}`} className="hover:text-green-600 transition-colors">
                    {loc.cityName}
                  </Link>
                </h3>
                <p className="mt-1 min-h-5 text-sm font-medium text-green-700">{status[loc.id] ?? ""}</p>
                <div className="mt-3 space-y-2 text-sm text-gray-700">
                  <p className="flex items-start gap-2">
                    <MapPin size={16} className="text-green-600 mt-0.5 shrink-0" />
                    {loc.address}
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone size={16} className="text-green-600 shrink-0" />
                    <a href={`tel:${loc.phone.replace(/\s/g, "")}`} className="hover:text-green-700 tabular-nums">
                      {loc.phone}
                    </a>
                  </p>
                </div>
              </div>
            ))}
          </div>

          <Link
            href="/poslovnice"
            className="mt-6 self-start font-semibold text-green-700 underline decoration-green-300 decoration-2 underline-offset-4 hover:text-green-900 hover:decoration-green-700"
          >
            Radno vrijeme, blagdani i fotke poslovnica
          </Link>
        </div>

        <div className="h-72 lg:h-auto lg:min-h-80 rounded-2xl overflow-hidden shadow-lg">
          <MapComponent />
        </div>
      </div>
    </section>
  );
}
