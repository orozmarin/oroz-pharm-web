import { legalData } from "@/data/locations";
import { Building2 } from "lucide-react";

export default function LegalData() {
  return (
    <section className="bg-green-900 py-12 md:py-16 px-4 md:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Building2 size={24} className="text-green-400" />
          <h2 className="text-xl font-bold text-white font-[family-name:var(--font-heading)]">
            Pravni podaci
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
          <div>
            <p className="text-green-400 font-medium mb-1">Tvrtka</p>
            <p className="text-green-100">{legalData.companyName}</p>
          </div>
          <div>
            <p className="text-green-400 font-medium mb-1">OIB</p>
            <p className="text-green-100">{legalData.oib}</p>
          </div>
          <div>
            <p className="text-green-400 font-medium mb-1">MBS</p>
            <p className="text-green-100">{legalData.mbs}</p>
          </div>
          <div>
            <p className="text-green-400 font-medium mb-1">IBAN</p>
            <p className="text-green-100">{legalData.iban}</p>
            <p className="text-green-300/60 text-xs mt-0.5">{legalData.bank}</p>
          </div>
          <div>
            <p className="text-green-400 font-medium mb-1">Temeljni kapital</p>
            <p className="text-green-100">{legalData.capital}</p>
          </div>
          <div>
            <p className="text-green-400 font-medium mb-1">Uprava</p>
            <p className="text-green-100">{legalData.director}</p>
          </div>
          <div className="md:col-span-2 lg:col-span-3">
            <p className="text-green-400 font-medium mb-1">Sudski registar</p>
            <p className="text-green-100">{legalData.court}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
