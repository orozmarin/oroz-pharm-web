"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

const slides = [
  {
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1920&q=80",
    title: "Vaš partner u poljoprivredi od 1998.",
    subtitle: "Stručno savjetovanje i kvalitetni proizvodi",
  },
  {
    image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1920&q=80",
    title: "Preko 12.000 artikala za vašu zemlju",
    subtitle: "Sve što vam je potrebno na jednom mjestu",
  },
  {
    image: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1920&q=80",
    title: "Stručno savjetovanje za svaku kulturu",
    subtitle: "Naš tim poljoprivrednih inženjera na vašem raspolaganju",
  },
  {
    image: "https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?w=1920&q=80",
    title: "Moderna rješenja za moderne izazove",
    subtitle: "Navodnjavanje, zaštita bilja, gnojiva i još mnogo toga",
  },
  {
    image: "/images/hero/pleternica.jpg",
    title: "Pleternica i Požega",
    subtitle: "Uvijek u vašoj blizini",
  },
];

export default function HeroSlideshow() {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
  }, []);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  }, []);

  useEffect(() => {
    const timer = setTimeout(next, 6000);
    return () => clearTimeout(timer);
  }, [current, next]);

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* All slides rendered, only current one visible via CSS opacity */}
      {slides.map((slide, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            i === current ? "opacity-100 z-1" : "opacity-0 z-0"
          }`}
        >
          <Image
            src={slide.image}
            alt={slide.title}
            fill
            sizes="100vw"
            className="object-cover animate-kenburns"
            priority={i === 0}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        </div>
      ))}

      {/* Content */}
      <div className="absolute inset-0 flex items-end pb-32 md:pb-40 z-2">
        <div className="max-w-7xl mx-auto px-4 md:px-8 w-full">
          <div key={current} className="hero-text-enter">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 font-[family-name:var(--font-heading)] max-w-3xl">
              {slides[current].title}
            </h1>
            <p className="text-lg md:text-xl text-white/80 max-w-xl">
              {slides[current].subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation arrows */}
      <button
        onClick={prev}
        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-3 w-12 h-12 rounded-full bg-black/30 border border-white/20 text-white flex items-center justify-center hover:bg-black/40 transition-colors"
        aria-label="Prethodna"
      >
        <ChevronLeft size={24} />
      </button>
      <button
        onClick={next}
        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-3 w-12 h-12 rounded-full bg-black/30 border border-white/20 text-white flex items-center justify-center hover:bg-black/40 transition-colors"
        aria-label="Sljedeća"
      >
        <ChevronRight size={24} />
      </button>

      {/* Dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-3">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-2.5 h-2.5 rounded-full transition-[background-color,width] duration-300 ${
              i === current ? "bg-white w-8" : "bg-white/40 hover:bg-white/60"
            }`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
