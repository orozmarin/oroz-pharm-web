import Link from "next/link";
import Image from "next/image";
import { navLinks } from "@/data/navigation";
import { locations, contactInfo, legalData } from "@/data/locations";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-green-900 text-white">
      {/* Logo centerpiece */}
      <div className="flex flex-col items-center justify-center py-12 border-b border-green-800">
        <div className="flex items-center gap-2">
          <Image
            src="/images/logo-oroz.png"
            alt="Oroz PHARM - Poljoprivredne ljekarne"
            width={120}
            height={120}
            className="w-24 h-24 md:w-32 md:h-32 object-contain brightness-0 invert"
          />
          <div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-wide font-[family-name:var(--font-heading)]">
              Oroz PHARM
            </h2>
            <p className="text-green-300 text-sm mt-1">Poljoprivredne ljekarne</p>
          </div>
        </div>
        <p className="text-green-200 text-sm leading-relaxed mt-4 text-center max-w-md">
          Vaš pouzdan partner u poljoprivredi od 1998. godine. Preko 12.000 artikala za sve vaše potrebe.
        </p>
      </div>

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Navigation */}
          <div>
            <h3 className="font-bold text-lg mb-4 font-[family-name:var(--font-heading)]">Navigacija</h3>
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-green-200 hover:text-white transition-colors text-sm"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Locations */}
          <div>
            <h3 className="font-bold text-lg mb-4 font-[family-name:var(--font-heading)]">Lokacije</h3>
            {locations.map((loc) => (
              <div key={loc.id} className="mb-4">
                <div className="flex items-start gap-2 text-sm">
                  <MapPin size={14} className="text-green-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium">{loc.name}</p>
                    <p className="text-green-200">{loc.address}, {loc.city}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm mt-1 ml-5">
                  <Phone size={12} className="text-green-400" />
                  <span className="text-green-200">{loc.phone}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-lg mb-4 font-[family-name:var(--font-heading)]">Kontakt</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Mail size={14} className="text-green-400" />
                <a href={`mailto:${contactInfo.email}`} className="text-green-200 hover:text-white transition-colors">
                  {contactInfo.email}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={14} className="text-green-400" />
                <a href={`tel:${contactInfo.directorPhone}`} className="text-green-200 hover:text-white transition-colors">
                  {contactInfo.directorPhone}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-green-400" />
                <span className="text-green-200">Pon-Pet: 7:00-19:00</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-green-800">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-green-400">
          <span>&copy; {new Date().getFullYear()} {legalData.companyName}. Sva prava pridržana.</span>
          <span>OIB: {legalData.oib} | MBS: {legalData.mbs}</span>
        </div>
      </div>
    </footer>
  );
}
