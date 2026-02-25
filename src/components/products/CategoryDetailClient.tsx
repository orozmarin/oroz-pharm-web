"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ProductCategory } from "@/types/views";
import { ChevronDown } from "lucide-react";

interface Props {
  category: ProductCategory;
}

export default function CategoryDetailClient({ category }: Props) {
  const [openSub, setOpenSub] = useState<string | null>(
    category.subcategories[0]?.id || null
  );

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-16">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Subcategories accordion */}
        {category.subcategories.length > 0 && (
          <div className="lg:col-span-2">
            <h2 className="text-3xl font-bold text-green-900 mb-6 font-[family-name:var(--font-heading)]">
              Potkategorije
            </h2>
            <div className="space-y-3">
              {category.subcategories.map((sub) => (
                <div
                  key={sub.id}
                  className="bg-white rounded-xl border border-green-100 overflow-hidden"
                >
                  <button
                    onClick={() => setOpenSub(openSub === sub.id ? null : sub.id)}
                    className="w-full flex items-center justify-between p-5 text-left hover:bg-green-50 transition-colors"
                  >
                    <span className="font-semibold text-green-900 text-base">
                      {sub.name}
                    </span>
                    <ChevronDown
                      size={20}
                      className={`text-green-600 transition-transform duration-200 ${
                        openSub === sub.id ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  <AnimatePresence>
                    {openSub === sub.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pt-3 pb-5 text-gray-600 text-sm">
                          <p>
                            {sub.description ||
                              `Širok izbor proizvoda iz kategorije ${sub.name}. Posjetite nas u poslovnici za detaljan pregled ponude i stručno savjetovanje.`}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Brands sidebar */}
        <div>
          <h2 className="text-2xl font-bold text-green-900 mb-6 font-[family-name:var(--font-heading)]">
            {category.brands.length > 0 ? "Brendovi" : "Kontaktirajte nas"}
          </h2>
          {category.brands.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {category.brands.map((brand) => (
                <div
                  key={brand.id}
                  className="bg-white rounded-xl border border-green-100 p-4 flex items-center justify-center text-center"
                >
                  <span className="font-semibold text-gray-700 text-sm">
                    {brand.name}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-green-100 p-6">
              <p className="text-gray-600 text-sm mb-4">
                Za detaljan pregled proizvoda u ovoj kategoriji, posjetite nas u jednoj od naših poslovnica ili nas kontaktirajte.
              </p>
              <a
                href="/kontakt"
                className="text-green-700 font-medium text-sm hover:underline"
              >
                Kontakt &rarr;
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
