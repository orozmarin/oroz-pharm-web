"use client";

import Image from "next/image";
import { useRef, useEffect } from "react";

type Brand = { name: string; logo: string; w: number; h: number };

const brands: Brand[] = [
  { name: "Bayer",             logo: "/images/brands/bayer.png",             w: 600, h: 600 },
  { name: "Syngenta",          logo: "/images/brands/syngenta.png",          w: 600, h: 198 },
  { name: "TORA",              logo: "/images/brands/tora.png",              w: 600, h: 600 },
  { name: "DeKalb",            logo: "/images/brands/dekalb-logo.png",       w: 600, h: 600 },
  { name: "Adria Flora",       logo: "/images/brands/adria-flora.png",       w: 197, h: 78  },
  { name: "Atlantic Trade",    logo: "/images/brands/atlantic_trade.png",    w: 600, h: 600 },
  { name: "Brati Ritosa",      logo: "/images/brands/brati_ritosa.png",      w: 600, h: 191 },
  { name: "BR Garden",         logo: "/images/brands/brgarden.png",          w: 600, h: 145 },
  { name: "Piliko",            logo: "/images/brands/piliko-logo.png",       w: 310, h: 45  },
  { name: "Salva",             logo: "/images/brands/salva.png",             w: 600, h: 331 },
  { name: "Santaj",            logo: "/images/brands/santaj.png",            w: 426, h: 118 },
  { name: "Tick",              logo: "/images/brands/tick.png",              w: 600, h: 277 },
  { name: "YARA",              logo: "/images/brands/yara.svg",              w: 45,  h: 46  },
  { name: "Haifa Group",       logo: "/images/brands/haifa.svg",             w: 184, h: 290 },
  { name: "Petrokemija",       logo: "/images/brands/petrokemija-kutina.png", w: 300, h: 150 },
  { name: "Bejo",              logo: "/images/brands/bejo.svg",              w: 60,  h: 120 },
  { name: "Vilmorin",          logo: "/images/brands/vilmorin.png",          w: 600, h: 214 },
  { name: "Corteva",           logo: "/images/brands/corteva.png",           w: 512, h: 512 },
  { name: "BASF",              logo: "/images/brands/basf.png",              w: 600, h: 337 },
  { name: "Chromos Agro",      logo: "/images/brands/chromos-agro.png",      w: 414, h: 85  },
  { name: "Clause",            logo: "/images/brands/clause.png",            w: 600, h: 158 },
  { name: "Klasmann-Deilmann", logo: "/images/brands/klasmann-deilmann.png", w: 600, h: 205 },
  { name: "Rijk Zwaan",        logo: "/images/brands/rijk-zwaan.png",        w: 560, h: 600 },
  { name: "SANO",              logo: "/images/brands/sano.png",              w: 416, h: 121 },
  { name: "Timac Agro",        logo: "/images/brands/timac-agro.svg",        w: 1358, h: 372 },
];

const SPEED = 60; // px/s

export default function BrandMarquee() {
  const trackRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const startScroll = useRef(0);
  const lastTime = useRef<number | null>(null);
  const rafId = useRef<number>(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const tick = (now: number) => {
      if (!isDragging.current) {
        if (lastTime.current !== null) {
          const delta = (now - lastTime.current) / 1000; // seconds
          track.scrollLeft += SPEED * delta;
          // seamless loop — reset when first copy is fully scrolled past
          const half = track.scrollWidth / 2;
          if (track.scrollLeft >= half) track.scrollLeft -= half;
        }
        lastTime.current = now;
      } else {
        lastTime.current = null; // reset so there's no jump when drag ends
      }
      rafId.current = requestAnimationFrame(tick);
    };

    rafId.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId.current);
  }, []);

  // --- Mouse ---
  const onMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    startX.current = e.pageX;
    startScroll.current = trackRef.current?.scrollLeft ?? 0;
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    e.preventDefault();
    const track = trackRef.current;
    if (!track) return;
    const walked = startX.current - e.pageX;
    track.scrollLeft = startScroll.current + walked;
    // wrap on drag too
    const half = track.scrollWidth / 2;
    if (track.scrollLeft < 0) track.scrollLeft += half;
    if (track.scrollLeft >= half) track.scrollLeft -= half;
  };

  const onMouseUp = () => { isDragging.current = false; };

  // --- Touch ---
  const onTouchStart = (e: React.TouchEvent) => {
    isDragging.current = true;
    startX.current = e.touches[0].pageX;
    startScroll.current = trackRef.current?.scrollLeft ?? 0;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current) return;
    const track = trackRef.current;
    if (!track) return;
    const walked = startX.current - e.touches[0].pageX;
    track.scrollLeft = startScroll.current + walked;
    const half = track.scrollWidth / 2;
    if (track.scrollLeft < 0) track.scrollLeft += half;
    if (track.scrollLeft >= half) track.scrollLeft -= half;
  };

  const onTouchEnd = () => { isDragging.current = false; };

  const doubled = [...brands, ...brands];

  return (
    <div
      ref={trackRef}
      className="py-6 bg-white border-y border-green-100 overflow-x-scroll scrollbar-none cursor-grab active:cursor-grabbing select-none"
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div className="flex items-center whitespace-nowrap w-max gap-16 px-8">
        {doubled.map((brand, i) => (
          <div
            key={`${brand.name}-${i}`}
            className="shrink-0 opacity-60 hover:opacity-100 transition-opacity duration-300"
          >
            <Image
              src={brand.logo}
              alt={brand.name}
              width={brand.w}
              height={brand.h}
              className="h-10 w-auto object-contain max-w-40"
              draggable={false}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
