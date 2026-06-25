"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useCallback } from "react";
import { navLinks } from "@/data/navigation";
import { cn } from "@/lib/utils";
import MobileNav from "./MobileNav";
import SearchBar from "@/components/products/SearchBar";
import { Menu, Search, X } from "lucide-react";

export default function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const closeMobile = useCallback(() => setMobileOpen(false), []);
  const closeSearch = useCallback(() => setSearchOpen(false), []);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md py-3 md:py-5">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 md:gap-3 shrink-0">
            <Image
              src="/images/logo-oroz.png"
              alt="Oroz PHARM - Poljoprivredne ljekarne"
              width={176}
              height={176}
              className="h-14 w-14 md:h-22 md:w-22 object-contain"
              priority
            />
            <div className="flex flex-col leading-none">
              <span className="text-2xl md:text-4xl font-bold text-green-900 font-[family-name:var(--font-heading)] tracking-tight">
                Oroz <span className="text-green-600">PHARM</span>
              </span>
              <span className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-gray-400 mt-0.5 md:mt-1">
                Poljoprivredne ljekarne
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-10">
            {navLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "text-base font-medium transition-colors relative py-1",
                    active ? "text-green-700" : "text-gray-700 hover:text-green-700",
                    active && "after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-green-500 after:rounded-full"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Desktop search */}
          <div className="hidden lg:block w-64 xl:w-72">
            <SearchBar />
          </div>

          {/* Mobile actions */}
          <div className="flex items-center gap-1 lg:hidden">
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 rounded-lg transition-colors text-green-900 hover:bg-green-50"
              aria-label="Pretraži proizvode"
            >
              <Search size={24} />
            </button>
            <button
              onClick={() => setMobileOpen(true)}
              className="p-2 rounded-lg transition-colors text-green-900 hover:bg-green-50"
              aria-label="Otvori izbornik"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile search overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-70 bg-white lg:hidden">
          <div className="flex items-center gap-2 px-4 py-4 border-b border-green-100">
            <div className="flex-1">
              <SearchBar autoFocus onNavigate={closeSearch} />
            </div>
            <button
              onClick={closeSearch}
              className="p-2 rounded-lg text-green-900 hover:bg-green-50"
              aria-label="Zatvori pretragu"
            >
              <X size={24} />
            </button>
          </div>
        </div>
      )}

      <MobileNav open={mobileOpen} onClose={closeMobile} />
    </>
  );
}
