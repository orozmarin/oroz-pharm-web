"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Search, Loader2 } from "lucide-react";
import type { Product } from "@/types/views";

interface Props {
  autoFocus?: boolean;
  onNavigate?: () => void;
  placeholder?: string;
}

export default function SearchBar({
  autoFocus = false,
  onNavigate,
  placeholder = "Pretraži proizvode...",
}: Props) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Debounced dohvat
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      setOpen(false);
      setLoading(false);
      return;
    }
    setLoading(true);
    const t = setTimeout(async () => {
      abortRef.current?.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, {
          signal: ctrl.signal,
        });
        const data = await res.json();
        setResults(data.products ?? []);
        setOpen(true);
        setHighlight(-1);
      } catch (e) {
        if ((e as Error).name !== "AbortError") {
          setResults([]);
          setOpen(false);
        }
      } finally {
        setLoading(false);
      }
    }, 200);
    return () => clearTimeout(t);
  }, [query]);

  // Zatvori na klik izvan
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const goToResults = useCallback(() => {
    const q = query.trim();
    if (q.length < 2) return;
    setOpen(false);
    onNavigate?.();
    router.push(`/proizvodi/pretraga?q=${encodeURIComponent(q)}`);
  }, [query, router, onNavigate]);

  const goToProduct = useCallback(
    (p: Product) => {
      setOpen(false);
      onNavigate?.();
      router.push(`/proizvodi/${p.categorySlug}/${p.slug}`);
    },
    [router, onNavigate]
  );

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlight >= 0 && results[highlight]) goToProduct(results[highlight]);
      else goToResults();
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
        <input
          type="text"
          value={query}
          autoFocus={autoFocus}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
          onFocus={() => {
            if (results.length > 0) setOpen(true);
          }}
          placeholder={placeholder}
          aria-label="Pretraži proizvode"
          className="w-full rounded-full border border-green-200 bg-white py-2 pl-10 pr-10 text-sm text-green-900 placeholder:text-gray-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
        />
        {loading && (
          <Loader2
            size={18}
            className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-green-500"
          />
        )}
      </div>

      {open && (results.length > 0 || !loading) && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-green-100 bg-white shadow-xl">
          {results.length > 0 ? (
            <>
              <ul>
                {results.map((p, i) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      onMouseEnter={() => setHighlight(i)}
                      onClick={() => goToProduct(p)}
                      className={`flex w-full items-center gap-3 px-3 py-2 text-left transition-colors ${
                        i === highlight ? "bg-green-50" : "hover:bg-green-50"
                      }`}
                    >
                      <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded bg-white">
                        <Image
                          src={p.image}
                          alt={p.name}
                          fill
                          sizes="40px"
                          className="object-contain mix-blend-multiply"
                        />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-green-900">
                          {p.name}
                        </span>
                        {p.manufacturer && (
                          <span className="block truncate text-xs text-green-700">
                            {p.manufacturer}
                          </span>
                        )}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={goToResults}
                className="block w-full border-t border-green-100 bg-green-50 px-3 py-2.5 text-center text-sm font-semibold text-green-800 hover:bg-green-100"
              >
                Prikaži sve rezultate za "{query.trim()}"
              </button>
            </>
          ) : (
            <div className="px-3 py-4 text-center text-sm text-gray-500">
              Nema rezultata za "{query.trim()}".
            </div>
          )}
        </div>
      )}
    </div>
  );
}
