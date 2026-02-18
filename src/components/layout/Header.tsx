"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useCallback } from "react";
import { navLinks } from "@/data/navigation";
import { cn } from "@/lib/utils";
import MobileNav from "./MobileNav";
import { Menu } from "lucide-react";

export default function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md py-3">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/images/logo-oroz.jpeg"
              alt="Oroz PHARM - Poljoprivredne ljekarne"
              width={80}
              height={80}
              className="h-10 w-10 object-contain"
              priority
            />
            <span className="text-lg font-bold text-green-900">
              Oroz <span className="text-green-600">PHARM</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "text-sm font-medium transition-colors relative py-1",
                    active ? "text-green-700" : "text-gray-700 hover:text-green-700",
                    active && "after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-green-500 after:rounded-full"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-2 rounded-lg transition-colors text-green-900 hover:bg-green-50"
            aria-label="Otvori izbornik"
          >
            <Menu size={24} />
          </button>
        </div>
      </header>

      <MobileNav open={mobileOpen} onClose={closeMobile} />
    </>
  );
}
