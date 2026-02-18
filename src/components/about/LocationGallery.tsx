"use client";

import Image from "next/image";
import { useInView } from "@/lib/useInView";
import SectionHeading from "@/components/shared/SectionHeading";

const photos = [
  { src: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&q=80", alt: "Poslovnica Pleternica", span: "col-span-2 row-span-2" },
  { src: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=400&q=80", alt: "Interijer trgovine", span: "" },
  { src: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400&q=80", alt: "Strucno savjetovanje", span: "" },
  { src: "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400&q=80", alt: "Obilazak terena", span: "col-span-2" },
  { src: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&q=80", alt: "Polje", span: "" },
  { src: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&q=80", alt: "Usjevi", span: "" },
];

export default function LocationGallery() {
  const ref = useInView<HTMLDivElement>("-50px");

  return (
    <section className="py-20 md:py-28 px-4 md:px-8">
      <SectionHeading
        title="Nase poslovnice"
        subtitle="Pogledajte gdje se nalazimo"
      />

      <div
        ref={ref}
        className="stagger-children max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 auto-rows-[180px] md:auto-rows-[200px]"
      >
        {photos.map((photo, i) => (
          <div
            key={i}
            className={`animate-on-scroll anim-scale-in relative rounded-2xl overflow-hidden group ${photo.span}`}
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
  );
}
