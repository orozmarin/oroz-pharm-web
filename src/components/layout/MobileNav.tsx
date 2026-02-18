"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { navLinks } from "@/data/navigation";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function MobileNav({ open, onClose }: Props) {
  const pathname = usePathname();

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] bg-green-900/98 lg:hidden"
        >
          <div className="flex justify-end p-5">
            <button
              onClick={onClose}
              className="text-white p-2 hover:bg-white/10 rounded-lg"
              aria-label="Zatvori izbornik"
            >
              <X size={28} />
            </button>
          </div>

          <nav className="flex flex-col items-center gap-6 mt-12">
            {navLinks.map((link, i) => {
              const active = pathname === link.href;
              return (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link
                    href={link.href}
                    onClick={onClose}
                    className={cn(
                      "text-2xl font-medium transition-colors",
                      active ? "text-green-300" : "text-white/80 hover:text-white"
                    )}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              );
            })}
          </nav>

          <div className="absolute bottom-12 left-0 right-0 text-center">
            <p className="text-green-300 text-sm">OROZ PHARM d.o.o.</p>
            <p className="text-green-400/60 text-xs mt-1">Pleternica | Pozega</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
