"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

export interface GalleryPhoto {
  src: string;
  alt: string;
}

/**
 * Mreža fotki koja se klikom otvara preko cijelog ekrana.
 * Strelice i Esc na tipkovnici, povlačenje prstom na mobitelu.
 */
export default function PhotoGallery({ photos }: { photos: GalleryPhoto[] }) {
  const [selected, setSelected] = useState<number | null>(null);
  const touchX = useRef<number | null>(null);
  const lastTrigger = useRef<HTMLButtonElement | null>(null);

  const close = useCallback(() => {
    setSelected(null);
    lastTrigger.current?.focus();
  }, []);
  const prev = useCallback(
    () => setSelected((i) => (i === null ? null : (i - 1 + photos.length) % photos.length)),
    [photos.length]
  );
  const next = useCallback(
    () => setSelected((i) => (i === null ? null : (i + 1) % photos.length)),
    [photos.length]
  );

  useEffect(() => {
    if (selected === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [selected, close, prev, next]);

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
        {photos.map((photo, i) => (
          <button
            key={photo.src}
            type="button"
            onClick={(e) => {
              lastTrigger.current = e.currentTarget;
              setSelected(i);
            }}
            className="group relative aspect-square overflow-hidden rounded-2xl bg-green-100 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-green-700 cursor-zoom-in"
            aria-label={`Otvori fotku: ${photo.alt}`}
          >
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            />
          </button>
        ))}
      </div>

      {selected !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Galerija fotografija"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95"
          onClick={close}
          onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
          onTouchEnd={(e) => {
            if (touchX.current === null) return;
            const dx = e.changedTouches[0].clientX - touchX.current;
            if (Math.abs(dx) > 50) (dx > 0 ? prev : next)();
            touchX.current = null;
          }}
        >
          <p className="absolute top-5 left-1/2 -translate-x-1/2 text-sm text-white/60 tabular-nums select-none">
            {selected + 1} / {photos.length}
          </p>

          <button
            type="button"
            autoFocus
            onClick={close}
            className="absolute top-3 right-3 rounded-full p-2 text-white/70 hover:bg-white/10 hover:text-white"
            aria-label="Zatvori galeriju"
          >
            <X size={28} />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
            className="absolute left-2 md:left-6 hidden sm:block rounded-full p-3 text-white/70 hover:bg-white/10 hover:text-white"
            aria-label="Prethodna fotografija"
          >
            <ChevronLeft size={36} />
          </button>

          <div className="relative h-[80vh] w-[92vw] md:w-[80vw]" onClick={(e) => e.stopPropagation()}>
            <Image
              src={photos[selected].src}
              alt={photos[selected].alt}
              fill
              sizes="90vw"
              className="object-contain"
              priority
            />
          </div>

          <p className="absolute bottom-5 left-1/2 w-full max-w-xl -translate-x-1/2 px-6 text-center text-sm text-white/70 select-none">
            {photos[selected].alt}
          </p>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
            className="absolute right-2 md:right-6 hidden sm:block rounded-full p-3 text-white/70 hover:bg-white/10 hover:text-white"
            aria-label="Sljedeća fotografija"
          >
            <ChevronRight size={36} />
          </button>
        </div>
      )}
    </>
  );
}
