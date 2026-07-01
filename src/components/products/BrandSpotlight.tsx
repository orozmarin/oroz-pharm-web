import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Props {
  logoSrc: string;
  logoAlt: string;
  eyebrow: string;
  title: string;
  text: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  className?: string;
}

export default function BrandSpotlight({
  logoSrc,
  logoAlt,
  eyebrow,
  title,
  text,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
  className,
}: Props) {
  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-2xl",
        "bg-linear-to-br from-green-900 via-green-800 to-green-700",
        className
      )}
    >
      {/* Amber radial glow accent */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-16 -right-16 w-80 h-80 rounded-full opacity-20"
        style={{
          background:
            "radial-gradient(circle, #d69b2d 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 flex flex-col sm:flex-row items-center gap-8 p-8 md:p-10">
        {/* Logo card */}
        <div className="shrink-0 flex items-center justify-center bg-white rounded-2xl shadow-lg p-6 w-36 h-36 sm:w-44 sm:h-44">
          <Image
            src={logoSrc}
            alt={logoAlt}
            width={160}
            height={160}
            className="w-full h-full object-contain"
          />
        </div>

        {/* Text content */}
        <div className="flex-1 text-center sm:text-left">
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-2"
            style={{ color: "#d69b2d" }}
          >
            {eyebrow}
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-white font-heading mb-3">
            {title}
          </h2>
          <p className="text-green-200 leading-relaxed mb-6 max-w-xl">
            {text}
          </p>

          {/* CTA buttons */}
          <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
            <Link
              href={primaryHref}
              className="inline-flex items-center justify-center font-semibold rounded-xl px-5 py-2.5 text-sm text-white bg-[#d69b2d] hover:bg-[#c48a20] transition-[background-color,box-shadow] duration-200 shadow-md hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-amber-400"
            >
              {primaryLabel}
            </Link>

            {secondaryHref && secondaryLabel && (
              <Link
                href={secondaryHref}
                scroll={secondaryHref.includes("#") ? false : undefined}
                className="inline-flex items-center justify-center font-semibold rounded-xl px-5 py-2.5 text-sm border border-white/40 text-white/90 hover:bg-white/10 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white/50"
              >
                {secondaryLabel}
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
