import Link from "next/link";
import Image from "next/image";
import { navLinks } from "@/data/navigation";
import { locations, contactInfo, legalData } from "@/data/locations";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-green-900 text-white">
      {/* Logo centerpiece */}
      <div className="flex flex-col items-center justify-center py-8 md:py-12 border-b border-green-800">
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
          Vaš pouzdan partner u poljoprivredi od 1998. godine. Preko 15.000 artikala za sve vaše potrebe.
        </p>
        <div className="flex items-center gap-3 mt-5">
          <a
            href="https://www.facebook.com/oroz.pharm/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-green-700 text-green-300 hover:text-white hover:border-green-500 transition-colors text-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
            </svg>
            Facebook
          </a>
          <a
            href="https://www.instagram.com/orozpharm/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-green-700 text-green-300 hover:text-white hover:border-green-500 transition-colors text-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
            </svg>
            Instagram
          </a>
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {/* Navigation */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className="font-bold text-lg mb-4 font-heading">Navigacija</h3>
            <nav className="flex flex-col items-center md:items-start gap-2">
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
          <div className="flex flex-col items-center md:items-start">
            <h3 className="font-bold text-lg mb-4 font-heading">Lokacije</h3>
            {locations.map((loc) => (
              <div key={loc.id} className="mb-4 w-full max-w-xs md:max-w-none">
                <div className="flex items-start gap-2 text-sm justify-center md:justify-start">
                  <MapPin size={14} className="text-green-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium">{loc.name}</p>
                    <p className="text-green-200">{loc.address}, {loc.city}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm mt-1 ml-5 justify-center md:justify-start">
                  <Phone size={12} className="text-green-400" />
                  <span className="text-green-200">{loc.phone}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Contact */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className="font-bold text-lg mb-4 font-heading">Kontakt</h3>
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
          <span>&copy; {new Date().getFullYear()} {legalData.companyName} Sva prava pridržana.</span>
          <span>OIB: {legalData.oib} | MBS: {legalData.mbs}</span>
        </div>
      </div>
    </footer>
  );
}
