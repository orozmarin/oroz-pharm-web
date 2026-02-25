"use client";

import { Quote } from "lucide-react";
import SectionHeading from "@/components/shared/SectionHeading";
import LeafDivider from "@/components/shared/LeafDivider";
import { useInView } from "@/lib/useInView";

type Testimonial = {
  id: string | number;
  quote: string;
  author: string;
  company?: string | null;
};

interface Props {
  testimonials: Testimonial[];
}

function getInitials(name: string): string {
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return parts[0].slice(0, 2).toUpperCase();
}

export default function PartnersTestimonials({ testimonials }: Props) {
  const ref = useInView<HTMLDivElement>();

  return (
    <section className="bg-green-900 py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-4 md:px-8 lg:px-16">
        <SectionHeading
          title="Što kažu naši partneri"
          subtitle="Povjerenje koje gradimo godinama, svjedočanstvo onih koji to najbolje znaju."
          light
        />

        <div
          ref={ref}
          className="stagger-children grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
        >
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="animate-on-scroll anim-fade-in-up flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8 backdrop-blur-sm"
            >
              {/* Quote icon */}
              <Quote className="w-8 h-8 text-green-400 shrink-0" />

              {/* Testimonial text */}
              <p className="text-green-50 leading-relaxed text-sm md:text-base flex-1">
                &ldquo;{t.quote}&rdquo;
              </p>

              {/* Partner info */}
              <div className="flex items-center gap-3 border-t border-white/10 pt-4">
                <div className="w-10 h-10 rounded-full bg-green-700 flex items-center justify-center shrink-0">
                  <span className="text-white text-sm font-semibold">
                    {getInitials(t.author)}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-white font-semibold text-sm truncate">
                    {t.author}
                  </p>
                  {t.company && (
                    <p className="text-green-300 text-xs truncate">
                      {t.company}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <LeafDivider light />
    </section>
  );
}
