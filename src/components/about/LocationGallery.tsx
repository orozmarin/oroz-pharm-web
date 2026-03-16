"use client";

import Image from "next/image";
import { useEffect, useState, useCallback } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { useInView } from "@/lib/useInView";
import SectionHeading from "@/components/shared/SectionHeading";

const photos = [
  { src: "/images/about/skladiste-arko.jpg", alt: "Glavno skladište Pleternica", span: "col-span-2 row-span-2" },
  { src: "/images/about/interijer-sjeme.jpg", alt: "Interijer trgovine", span: "" },
  { src: "/images/about/asortiman-zastita.jpg", alt: "Zaštita bilja i agrokemija", span: "" },
  { src: "/images/about/asortiman-sjeme.jpg", alt: "Sjemenski asortiman", span: "" },
  { src: "/images/about/vanjski-dvoriste.jpg", alt: "Dvorište i vanjska skladišta", span: "" },
  { src: "/images/about/skladiste-2.jpg", alt: "Drugo skladište — Pleternica", span: "" },
  { src: "/images/about/vilicar-utovar.jpg", alt: "Utovar i transport robe", span: "" },
  { src: "/images/about/vanjski-palete.jpg", alt: "Vanjska skladišta — pogled na Pleternicu", span: "" },
  { src: "/images/about/interijer-sjemenska.jpg", alt: "Sjemenski program i dodaci", span: "" },
];

export default function LocationGallery() {
  const ref = useInView<HTMLDivElement>("-50px");
  const [selected, setSelected] = useState<number | null>(null);

  const close = useCallback(() => setSelected(null), []);
  const prev = useCallback(
    () => setSelected((i) => (i !== null ? (i - 1 + photos.length) % photos.length : null)),
    []
  );
  const next = useCallback(
    () => setSelected((i) => (i !== null ? (i + 1) % photos.length : null)),
    []
  );

  useEffect(() => {
    if (selected === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected, close, prev, next]);

  useEffect(() => {
    document.body.style.overflow = selected !== null ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [selected]);

  return (
    <>
      <section className="py-20 md:py-28 px-4 md:px-8">
        <SectionHeading
          title="Naše poslovnice"
          subtitle="Pogledajte gdje se nalazimo"
        />

        <div
          ref={ref}
          className="stagger-children max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4"
        >
          {photos.map((photo, i) => (
            <div
              key={i}
              className={`animate-on-scroll anim-scale-in aspect-square relative rounded-2xl overflow-hidden group cursor-pointer ${photo.span}`}
              onClick={() => setSelected(i)}
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-green-900/0 group-hover:bg-green-900/30 transition-colors duration-300 flex items-end">
                <span className="text-white text-sm font-medium p-4 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-[opacity,transform] duration-300">
                  {photo.alt}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Lightbox */}
      {selected !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/92 flex items-center justify-center"
          onClick={close}
        >
          {/* Broj */}
          <div className="absolute top-5 left-1/2 -translate-x-1/2 text-white/50 text-sm tabular-nums select-none">
            {selected + 1} / {photos.length}
          </div>

          {/* Zatvori */}
          <button
            onClick={close}
            className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10"
            aria-label="Zatvori"
          >
            <X size={26} />
          </button>

          {/* Prethodna */}
          <button
            onClick={(e) => { e.stopPropagation(); prev(); }}
            className="absolute left-3 md:left-6 text-white/60 hover:text-white transition-colors p-3 rounded-full hover:bg-white/10"
            aria-label="Prethodna fotografija"
          >
            <ChevronLeft size={36} />
          </button>

          {/* Slika */}
          <div
            className="relative h-[85vh] w-[90vw] md:w-[80vw]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={photos[selected].src}
              alt={photos[selected].alt}
              fill
              sizes="85vw"
              className="object-contain"
              priority
            />
          </div>

          {/* Natpis */}
          <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/60 text-sm text-center px-8 select-none">
            {photos[selected].alt}
          </p>

          {/* Sljedeća */}
          <button
            onClick={(e) => { e.stopPropagation(); next(); }}
            className="absolute right-3 md:right-6 text-white/60 hover:text-white transition-colors p-3 rounded-full hover:bg-white/10"
            aria-label="Sljedeća fotografija"
          >
            <ChevronRight size={36} />
          </button>
        </div>
      )}
    </>
  );
}
