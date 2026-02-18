"use client";

const brands = [
  "YARA", "Haifa", "Timac Agro", "Petrokemija", "BASF", "Bayer", "Syngenta",
  "Chromos Agro", "Corteva", "Bejo Zaden", "Clause", "Rijk Zwaan",
  "Pedigree", "Friskies", "Vitakraft", "Felco", "GENERA", "SANO",
  "Brill", "Klasmann", "Vilmorin",
];

export default function BrandMarquee() {
  return (
    <div className="py-8 bg-white border-y border-green-100 overflow-hidden">
      <div className="flex animate-marquee whitespace-nowrap">
        {[...brands, ...brands].map((brand, i) => (
          <span
            key={`${brand}-${i}`}
            className="inline-flex items-center mx-8 text-lg font-semibold text-gray-400 hover:text-green-700 transition-colors duration-300 cursor-default select-none"
          >
            {brand}
          </span>
        ))}
      </div>
    </div>
  );
}
