"use client";

import Link from "next/link";
import { useInView } from "@/lib/useInView";
import SectionHeading from "@/components/shared/SectionHeading";
import { Shield, FlaskConical, Sprout, Droplets, Wheat, PawPrint } from "lucide-react";

const services = [
  { icon: Shield, label: "Zaštita bilja", desc: "Fungicidi, herbicidi i insekticidi", href: "/proizvodi#zastita-bilja" },
  { icon: FlaskConical, label: "Gnojiva", desc: "YARA, Haifa, Timac Agro", href: "/proizvodi#gnojivo" },
  { icon: Sprout, label: "Sjeme", desc: "Bejo, Clause, Rijk Zwaan", href: "/proizvodi#sjeme" },
  { icon: Droplets, label: "Navodnjavanje", desc: "Sustavi kap po kap", href: "/proizvodi#navodnjavanje" },
  { icon: Wheat, label: "Stočna hrana", desc: "Kompletna ishrana", href: "/proizvodi#stocna-hrana" },
  { icon: PawPrint, label: "Kućni ljubimci", desc: "Hrana i oprema", href: "/proizvodi#kucni-ljubimci" },
];

export default function ServicesIntro() {
  const ref = useInView<HTMLDivElement>();

  return (
    <section className="py-20 md:py-28 px-4 md:px-8">
      <SectionHeading
        title="Što nudimo"
        subtitle="Sve što vam je potrebno za uspješnu poljoprivredu, vrt i vaše ljubimce - na jednom mjestu."
      />

      <div
        ref={ref}
        className="stagger-children max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8"
      >
        {services.map((s) => (
          <div key={s.label} className="animate-on-scroll anim-scale-in">
            <Link
              href={s.href}
              className="group flex flex-col items-center text-center p-6 md:p-8 rounded-2xl bg-white border border-green-100 hover:border-green-300 hover:shadow-xl transition-[border-color,box-shadow] duration-300"
            >
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-green-50 group-hover:bg-green-100 flex items-center justify-center mb-4 transition-colors">
                <s.icon size={32} className="text-green-700" />
              </div>
              <h3 className="font-bold text-green-900 text-lg mb-1 font-[family-name:var(--font-heading)]">
                {s.label}
              </h3>
              <p className="text-gray-500 text-sm">{s.desc}</p>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
