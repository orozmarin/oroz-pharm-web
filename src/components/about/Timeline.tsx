"use client";

import { useRef, useEffect, useState } from "react";
import { useInView } from "@/lib/useInView";

const milestones = [
  {
    year: "1998",
    title: "Osnivanje tvrtke",
    desc: "Oroz PHARM d.o.o. osnovan u Pleternici kao privatno poduzeće za maloprodaju i veleprodaju repromaterijala u poljoprivredi.",
  },
  {
    year: "2002",
    title: "Vlastiti poslovni prostor",
    desc: "Preseljenje u vlastiti poslovni prostor u Pleternici — novi uvjeti za rast asortimana i bolju uslugu kupcima.",
  },
  {
    year: "2013",
    title: "Kooperantska proizvodnja povrća",
    desc: "Pokrenuta kooperantska proizvodnja povrća u suradnji s lokalnim poljoprivrednicima Požeško-slavonske županije.",
  },
  {
    year: "2014",
    title: "Poslovnica u Požegi i otkup voća",
    desc: "Otvorena druga poslovnica u Požegi, a djelatnost proširena na otkup voća u suradnji s lokalnim voćarima.",
  },
  {
    year: "2018",
    title: "Poduzetnik godine — Pleternica",
    desc: "Nagrada Grada Pleternice za poduzetnika godine — prepoznanje dugogodišnjeg doprinosa lokalnoj zajednici i gospodarstvu.",
  },
  {
    year: "2023",
    title: "Zlatna kuna",
    desc: "Nagrada Zlatna kuna za najbolje malo poduzeće — potvrda kvalitete, pouzdanosti i predanosti poslu kroz cijelo poslovanje.",
  },
  {
    year: "Danas",
    title: "Preko 15.000 artikala",
    desc: "Tim od 10+ stručnjaka, dvije poslovnice i konstantan rast asortimana uz bok najboljim dobavljačima u regiji.",
  },
];

export default function Timeline() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [lineScale, setLineScale] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let ticking = false;
    const update = () => {
      const rect = container.getBoundingClientRect();
      const viewCenter = window.innerHeight / 2;
      const total = rect.height - window.innerHeight;

      if (total <= 0) {
        setLineScale(1);
        ticking = false;
        return;
      }

      const progress = Math.min(1, Math.max(0, (viewCenter - rect.top) / total));
      setLineScale(progress);
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    update();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const sectionRef = useInView<HTMLDivElement>("-100px");

  return (
    <section ref={containerRef} className="py-20 md:py-28 px-4 md:px-8 relative">
      <div className="max-w-4xl mx-auto relative">
        {/* Background line (static) */}
        <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-green-100 md:-translate-x-px" />

        {/* Animated line (draws on scroll) */}
        <div
          className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-green-600 md:-translate-x-px origin-top"
          style={{ transform: `scaleY(${lineScale})` }}
        />

        <div ref={sectionRef} className="stagger-children space-y-16">
          {milestones.map((m, i) => (
            <div
              key={m.year}
              className={`animate-on-scroll anim-scale-in relative flex items-start gap-8 ${
                i % 2 === 0
                  ? "md:flex-row"
                  : "md:flex-row-reverse"
              }`}
            >
              {/* Dot */}
              <div className="absolute left-8 md:left-1/2 w-4 h-4 bg-green-600 rounded-full border-4 border-cream -translate-x-1/2 z-10 mt-1" />

              {/* Content */}
              <div className={`ml-16 md:ml-0 md:w-5/12 ${i % 2 === 0 ? "md:pr-12 md:text-right" : "md:pl-12"}`}>
                <span className="text-green-600 font-bold text-lg">{m.year}</span>
                <h3 className="text-xl font-bold text-green-900 mt-1 font-heading">
                  {m.title}
                </h3>
                <p className="text-gray-600 mt-2 text-sm leading-relaxed">{m.desc}</p>
              </div>

              {/* Spacer for opposite side */}
              <div className="hidden md:block md:w-5/12" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
