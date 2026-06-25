# Pretraživanje proizvoda — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Globalna pretraga proizvoda dostupna iz headera na svakoj stranici, s autocomplete dropdownom i dediciranom results stranicom, pokretana PostgreSQL `pg_trgm` trigram pretragom.

**Architecture:** Jedna zajednička funkcija `searchProducts()` izvršava parametrizirani raw SQL upit (pg_trgm) preko Payloadovog node-postgres poola da dobije poredane ID-eve + ukupni broj, zatim hidrira dokumente kroz Payload `find` (depth 1) radi reuse-a postojeće media/URL logike. Tu funkciju koriste i autocomplete API ruta (`/api/search`) i server-rendered results stranica (`/proizvodi/pretraga`). Header dobiva `SearchBar` client komponentu (desktop inline + mobilni overlay).

**Tech Stack:** Next.js 15 (App Router), Payload CMS v3, PostgreSQL + `pg_trgm`, `pg` (node-postgres), TypeScript 5, Tailwind v4, lucide-react.

## Global Constraints

- Sav UI tekst je na **hrvatskom**.
- **Nema test runnera** — `next build` je jedina automatska provjera ispravnosti. Verifikacija svakog taska = `next build` + ciljani `curl`/ručna provjera.
- Tehnologija pretrage: **PostgreSQL `pg_trgm`** — bez novog servisa, bez promjene deploy procedure.
- Polja pretrage: **naziv proizvoda + naziv proizvođača** (ništa drugo).
- Env varijabla za DB konekciju: `DATABASE_URI`.
- Imena tablica = Payload collection slug (`products`, `manufacturers`, `categories`); FK stupci = `<field>_id` (`manufacturer_id`, `category_id`).
- Slugovi i copy: pretraga je `noindex` (results stranica se ne indeksira), URL je `/proizvodi/pretraga?q=...`.
- Skripte u `src/scripts/` se pokreću s `node --env-file=.env.local ...` (vidi `package.json`).

---

## File Structure

- `src/scripts/add-search-indexes.js` — **(create)** jednokratna migracija: pg_trgm ekstenzija + GIN trigram indeksi. Migracija (ne data seed) → **commita se**.
- `src/lib/search.ts` — **(create)** `searchProducts()` core logika (SQL + hidracija + mapiranje u `Product` view model).
- `src/app/api/search/route.ts` — **(create)** GET autocomplete endpoint, vraća top 8.
- `src/components/products/SearchBar.tsx` — **(create)** client komponenta: input + autocomplete dropdown + keyboard nav. Reusable (desktop + overlay).
- `src/components/layout/Header.tsx` — **(modify)** ugraditi `SearchBar` (desktop) + ikonu/overlay (mobilni).
- `src/app/(site)/proizvodi/pretraga/page.tsx` — **(create)** server results stranica: grid + paginacija + empty state.
- `package.json` — **(modify)** dodati `migrate:search-indexes` skriptu.

---

### Task 1: pg_trgm ekstenzija + trigram indeksi

**Files:**
- Create: `src/scripts/add-search-indexes.js`
- Modify: `package.json` (scripts blok)

**Interfaces:**
- Consumes: `DATABASE_URI` env var; tablice `products`, `manufacturers` sa stupcem `name`.
- Produces: pg_trgm ekstenzija aktivna; GIN indeksi `idx_products_name_trgm`, `idx_manufacturers_name_trgm`. Omogućuje `similarity()` i ubrzava `ILIKE '%...%'` — preduvjet za Task 2.

- [ ] **Step 1: Napiši migracijsku skriptu**

Create `src/scripts/add-search-indexes.js`:

```js
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URI });

const statements = [
  `CREATE EXTENSION IF NOT EXISTS pg_trgm;`,
  `CREATE INDEX IF NOT EXISTS idx_products_name_trgm ON products USING gin (name gin_trgm_ops);`,
  `CREATE INDEX IF NOT EXISTS idx_manufacturers_name_trgm ON manufacturers USING gin (name gin_trgm_ops);`,
];

async function main() {
  for (const sql of statements) {
    await pool.query(sql);
    console.log("✓", sql.split("\n")[0]);
  }
  await pool.end();
  console.log("Gotovo.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

- [ ] **Step 2: Dodaj npm skriptu**

In `package.json`, u `scripts` blok dodaj (uz postojeće `migrate:r2`):

```json
"migrate:search-indexes": "node --env-file=.env.local src/scripts/add-search-indexes.js"
```

- [ ] **Step 3: Pokreni migraciju**

Run: `npm run migrate:search-indexes`
Expected output (sadrži):
```
✓ CREATE EXTENSION IF NOT EXISTS pg_trgm;
✓ CREATE INDEX IF NOT EXISTS idx_products_name_trgm ...
✓ CREATE INDEX IF NOT EXISTS idx_manufacturers_name_trgm ...
Gotovo.
```

- [ ] **Step 4: Potvrdi da indeksi postoje**

Run:
```bash
node --env-file=.env.local -e "import('pg').then(async ({default:pg})=>{const p=new pg.Pool({connectionString:process.env.DATABASE_URI});const r=await p.query(\"SELECT indexname FROM pg_indexes WHERE indexname LIKE '%trgm%'\");console.log(r.rows);await p.end();})"
```
Expected: ispisuje oba retka — `idx_products_name_trgm` i `idx_manufacturers_name_trgm`.

- [ ] **Step 5: Commit**

```bash
git add src/scripts/add-search-indexes.js package.json
git commit -m "feat(search): pg_trgm ekstenzija i trigram indeksi za pretragu"
```

---

### Task 2: Core search funkcija (`searchProducts`)

**Files:**
- Create: `src/lib/search.ts`

**Interfaces:**
- Consumes: pg_trgm indeksi (Task 1); `getImageUrl` iz `@/lib/utils`; `Product` tip iz `@/types/views`; Payload `getPayload` + `@payload-config`.
- Produces:
  - `searchProducts(rawQuery: string, opts?: { limit?: number; offset?: number }): Promise<{ products: Product[]; total: number }>`
  - Koriste je Task 3 (API) i Task 6 (results page).

- [ ] **Step 1: Napiši `searchProducts`**

Create `src/lib/search.ts`:

```ts
import { getPayload } from "payload";
import config from "@payload-config";
import type { Pool } from "pg";
import type { Product } from "@/types/views";
import { getImageUrl } from "@/lib/utils";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&q=80";
const SIMILARITY_THRESHOLD = 0.3;

export interface SearchResult {
  products: Product[];
  total: number;
}

const MATCH_SQL = `
  SELECT p.id AS id
  FROM products p
  LEFT JOIN manufacturers m ON p.manufacturer_id = m.id
  WHERE p.name ILIKE '%' || $1 || '%'
     OR m.name ILIKE '%' || $1 || '%'
     OR similarity(p.name, $1) > $2
  ORDER BY GREATEST(similarity(p.name, $1), COALESCE(similarity(m.name, $1), 0)) DESC, p.name ASC
  LIMIT $3 OFFSET $4
`;

const COUNT_SQL = `
  SELECT COUNT(*)::int AS total
  FROM products p
  LEFT JOIN manufacturers m ON p.manufacturer_id = m.id
  WHERE p.name ILIKE '%' || $1 || '%'
     OR m.name ILIKE '%' || $1 || '%'
     OR similarity(p.name, $1) > $2
`;

export async function searchProducts(
  rawQuery: string,
  { limit = 8, offset = 0 }: { limit?: number; offset?: number } = {}
): Promise<SearchResult> {
  const q = rawQuery.trim();
  if (q.length < 2) return { products: [], total: 0 };

  const payload = await getPayload({ config });
  const pool = (payload.db as unknown as { pool: Pool }).pool;

  const [matchRes, countRes] = await Promise.all([
    pool.query<{ id: number }>(MATCH_SQL, [q, SIMILARITY_THRESHOLD, limit, offset]),
    pool.query<{ total: number }>(COUNT_SQL, [q, SIMILARITY_THRESHOLD]),
  ]);

  const ids = matchRes.rows.map((r) => r.id);
  const total = countRes.rows[0]?.total ?? 0;
  if (ids.length === 0) return { products: [], total };

  // Hidracija kroz Payload radi reuse-a media/URL logike (R2) i relacija.
  const { docs } = await payload.find({
    collection: "products",
    where: { id: { in: ids } },
    depth: 1,
    limit: ids.length,
  });

  // Sačuvaj SQL poredak (relevantnost).
  const byId = new Map(docs.map((d) => [Number(d.id), d]));
  const products: Product[] = ids
    .map((id) => byId.get(id))
    .filter((d): d is NonNullable<typeof d> => Boolean(d))
    .map((doc) => ({
      id: String(doc.id),
      slug: doc.slug,
      categorySlug:
        typeof doc.category === "object" && doc.category !== null
          ? doc.category.slug
          : "",
      subcategoryId:
        typeof doc.subcategory === "object" && doc.subcategory !== null
          ? String(doc.subcategory.id)
          : String(doc.subcategory ?? ""),
      name: doc.name,
      manufacturer:
        typeof doc.manufacturer === "object" && doc.manufacturer !== null
          ? doc.manufacturer.name
          : "",
      description: doc.description ?? "",
      instructions: doc.instructions,
      image: getImageUrl(doc.image, FALLBACK_IMAGE),
    }));

  return { products, total };
}
```

- [ ] **Step 2: Provjeri tipove (build prolazi)**

Run: `npx tsc --noEmit`
Expected: bez grešaka u `src/lib/search.ts`. (Ako `payload.db` tip stvara problem, cast `as unknown as { pool: Pool }` ga rješava — već je u kodu.)

- [ ] **Step 3: Smoke-test funkcije protiv prave baze**

Run (zamijeni "amistar" poznatim proizvodom iz baze):
```bash
node --env-file=.env.local --experimental-strip-types -e "import('./src/lib/search.ts').then(async ({searchProducts})=>{const r=await searchProducts('amistar',{limit:5});console.log('total',r.total);console.log(r.products.map(p=>p.name));process.exit(0)})"
```
Expected: ispisuje `total` > 0 i listu naziva koji sadrže traženi pojam. Ako `--experimental-strip-types` nije dostupan na instaliranoj Node verziji, preskoči ovaj korak — Task 3 verificira funkciju kroz API.

- [ ] **Step 4: Commit**

```bash
git add src/lib/search.ts
git commit -m "feat(search): searchProducts core (pg_trgm SQL + Payload hidracija)"
```

---

### Task 3: Autocomplete API ruta

**Files:**
- Create: `src/app/api/search/route.ts`

**Interfaces:**
- Consumes: `searchProducts` (Task 2).
- Produces: `GET /api/search?q=<pojam>` → `{ products: Product[] }` (max 8). Koristi je `SearchBar` (Task 4).

- [ ] **Step 1: Napiši route handler**

Create `src/app/api/search/route.ts`:

```ts
import { NextResponse } from "next/server";
import { searchProducts } from "@/lib/search";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";
  try {
    const { products } = await searchProducts(q, { limit: 8 });
    return NextResponse.json({ products });
  } catch (err) {
    console.error("[/api/search]", err);
    return NextResponse.json({ products: [] }, { status: 500 });
  }
}
```

- [ ] **Step 2: Pokreni dev server**

Run: `npm run dev` (u zasebnom terminalu; pričekaj "Ready").

- [ ] **Step 3: Test API-ja s pravim pojmom**

Run: `curl -s "http://localhost:3000/api/search?q=amistar" | head -c 600`
Expected: JSON `{"products":[{"id":...,"name":"...","slug":"...","categorySlug":"...","manufacturer":"...","image":"..."}, ...]}` — barem jedan rezultat za poznati pojam.

- [ ] **Step 4: Test typo-tolerancije**

Run: `curl -s "http://localhost:3000/api/search?q=amsitar" | head -c 300`
Expected: i dalje vraća "Amistar" (ili sl.) — dokaz da trigram similarity radi.

- [ ] **Step 5: Test praznog/kratkog upita**

Run: `curl -s "http://localhost:3000/api/search?q=a"`
Expected: `{"products":[]}` (kraće od 2 znaka).

- [ ] **Step 6: Commit**

```bash
git add src/app/api/search/route.ts
git commit -m "feat(search): /api/search autocomplete endpoint"
```

---

### Task 4: `SearchBar` komponenta

**Files:**
- Create: `src/components/products/SearchBar.tsx`

**Interfaces:**
- Consumes: `GET /api/search` (Task 3); `Product` tip; `next/navigation` `useRouter`.
- Produces: `export default function SearchBar(props: { autoFocus?: boolean; onNavigate?: () => void; placeholder?: string })`. Koristi je Header (Task 5).

- [ ] **Step 1: Napiši komponentu**

Create `src/components/products/SearchBar.tsx`:

```tsx
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
        if ((e as Error).name !== "AbortError") setResults([]);
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
                Prikaži sve rezultate za “{query.trim()}”
              </button>
            </>
          ) : (
            <div className="px-3 py-4 text-center text-sm text-gray-500">
              Nema rezultata za “{query.trim()}”.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Provjeri build/tipove**

Run: `npx tsc --noEmit`
Expected: bez grešaka u `SearchBar.tsx`.

- [ ] **Step 3: Commit**

```bash
git add src/components/products/SearchBar.tsx
git commit -m "feat(search): SearchBar komponenta s autocomplete dropdownom"
```

> Vizualna provjera komponente slijedi u Tasku 5 (kad je ugrađena u Header).

---

### Task 5: Integracija u Header (desktop + mobilni overlay)

**Files:**
- Modify: `src/components/layout/Header.tsx`

**Interfaces:**
- Consumes: `SearchBar` (Task 4).
- Produces: globalno dostupna pretraga na svakoj stranici.

- [ ] **Step 1: Zamijeni sadržaj Headera**

Replace the full contents of `src/components/layout/Header.tsx` with:

```tsx
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
        <div className="fixed inset-0 z-[70] bg-white lg:hidden">
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
```

- [ ] **Step 2: Provjeri build**

Run: `npm run build`
Expected: build uspješan, bez TypeScript/ESLint grešaka.

- [ ] **Step 3: Ručna provjera u pregledniku (desktop)**

Run: `npm run dev`, otvori `http://localhost:3000`.
Provjeri:
- Search input vidljiv u headeru (desno).
- Tipkanje "amis" (2+ znaka) → dropdown s rezultatima i slikama.
- ↑/↓ označava redove, Enter na označenom otvara proizvod, Esc zatvara.
- "Prikaži sve rezultate" vodi na `/proizvodi/pretraga?q=...`.

- [ ] **Step 4: Ručna provjera (mobilni)**

U pregledniku uključi responsive/mobile view (npr. 390px).
Provjeri:
- U headeru ikona pretrage + hamburger.
- Klik na ikonu → fullscreen overlay s autofokusiranim inputom; X zatvara.
- Odabir rezultata zatvara overlay i navigira.

- [ ] **Step 5: Commit**

```bash
git add src/components/layout/Header.tsx
git commit -m "feat(search): ugradi pretragu u header (desktop + mobilni overlay)"
```

---

### Task 6: Results stranica `/proizvodi/pretraga`

**Files:**
- Create: `src/app/(site)/proizvodi/pretraga/page.tsx`

**Interfaces:**
- Consumes: `searchProducts` (Task 2); postojeći `ProductCard`.
- Produces: server-rendered results stranica s gridom, paginacijom, empty-state.

> **Napomena o rutiranju:** dinamička ruta `/proizvodi/[category]` postoji. `pretraga` je statički segment i u Next.js App Routeru ima prednost pred `[category]`, pa `/proizvodi/pretraga` ispravno hvata ovu stranicu (neće biti tretiran kao kategorija sa slugom "pretraga").

- [ ] **Step 1: Napiši stranicu**

Create `src/app/(site)/proizvodi/pretraga/page.tsx`:

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ProductCard from "@/components/products/ProductCard";
import { searchProducts } from "@/lib/search";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 24;

export const metadata: Metadata = {
  title: "Pretraga proizvoda",
  robots: { index: false, follow: true },
};

interface Props {
  searchParams: Promise<{ q?: string; page?: string }>;
}

export default async function SearchPage({ searchParams }: Props) {
  const { q = "", page = "1" } = await searchParams;
  const query = q.trim();
  const currentPage = Math.max(1, parseInt(page, 10) || 1);
  const offset = (currentPage - 1) * PAGE_SIZE;

  const { products, total } =
    query.length >= 2
      ? await searchProducts(query, { limit: PAGE_SIZE, offset })
      : { products: [], total: 0 };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 pt-28 md:pt-36 pb-16 min-h-[60vh]">
      <Link
        href="/proizvodi"
        className="inline-flex items-center gap-1 text-green-700 text-sm mb-6 hover:text-green-900 transition-colors"
      >
        <ArrowLeft size={16} /> Svi proizvodi
      </Link>

      <h1 className="text-3xl md:text-4xl font-bold text-green-900 font-heading mb-2">
        Rezultati pretrage
      </h1>
      {query.length >= 2 ? (
        <p className="text-gray-500 mb-10">
          {total} {total === 1 ? "rezultat" : "rezultata"} za “{query}”
        </p>
      ) : (
        <p className="text-gray-500 mb-10">
          Upišite pojam za pretragu (najmanje 2 znaka).
        </p>
      )}

      {products.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {products.map((p, i) => (
              <ProductCard key={p.id} product={p} priority={i < 8} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex flex-wrap items-center justify-center gap-2 mt-12">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <Link
                  key={n}
                  href={`/proizvodi/pretraga?q=${encodeURIComponent(query)}&page=${n}`}
                  className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                    n === currentPage
                      ? "bg-green-700 text-white"
                      : "border border-green-200 text-green-800 hover:bg-green-50"
                  }`}
                >
                  {n}
                </Link>
              ))}
            </div>
          )}
        </>
      ) : query.length >= 2 ? (
        <div className="py-16 text-center">
          <p className="text-gray-500 text-lg">Nema rezultata za “{query}”.</p>
          <p className="text-gray-400 text-sm mt-2">
            Provjerite pravopis ili nas kontaktirajte za pomoć pri pronalasku proizvoda.
          </p>
          <Link
            href="/kontakt"
            className="inline-block mt-6 text-green-700 font-medium text-sm hover:underline"
          >
            Kontaktirajte nas →
          </Link>
        </div>
      ) : null}
    </div>
  );
}
```

- [ ] **Step 2: Build**

Run: `npm run build`
Expected: uspješno; ruta `/proizvodi/pretraga` se pojavljuje u izlazu builda.

- [ ] **Step 3: Ručna provjera**

Run: `npm run dev`, pa redom:
- `http://localhost:3000/proizvodi/pretraga?q=amistar` → naslov, broj rezultata, grid kartica.
- Ako ima >24 rezultata → paginacija; klik na stranicu 2 mijenja rezultate i zadržava `q`.
- `http://localhost:3000/proizvodi/pretraga?q=xyzxyz` → "Nema rezultata" + link na kontakt.
- `http://localhost:3000/proizvodi/pretraga` (bez q) → poruka "Upišite pojam...".
- Potvrdi da `/proizvodi/<prava-kategorija>` i dalje radi (nije slomljen `[category]`).

- [ ] **Step 4: Commit**

```bash
git add "src/app/(site)/proizvodi/pretraga/page.tsx"
git commit -m "feat(search): results stranica /proizvodi/pretraga s paginacijom"
```

---

## Završna verifikacija (cijela značajka)

- [ ] `npm run build` prolazi bez grešaka.
- [ ] Pretraga radi s headera na **bilo kojoj** stranici (npr. s `/o-nama`, `/blog`).
- [ ] Autocomplete: naziv proizvoda i naziv proizvođača oboje vraćaju rezultate.
- [ ] Typo-tolerancija radi (npr. "amsitar" → "Amistar").
- [ ] Klik na rezultat vodi na ispravan `/proizvodi/[category]/[product]`.
- [ ] Mobilni overlay radi.
- [ ] Results stranica: grid, paginacija, empty-state.
- [ ] Postojeće stranice kategorija (`[category]`) i filteri i dalje rade.

## Self-Review (popunjeno tijekom pisanja plana)

**Spec coverage:** Globalni header search → Task 5. pg_trgm → Task 1. Naziv+proizvođač polja → Task 2 (SQL). Autocomplete → Task 3+4. Results stranica → Task 6. Edge slučajevi (kratki upit, nema rezultata, loading) → Task 4 (dropdown) + Task 6 (stranica). Sve sekcije spec-a pokrivene.

**Placeholder scan:** Nema TBD/TODO; sav kod je potpun.

**Type consistency:** `searchProducts(rawQuery, { limit, offset }) → { products: Product[]; total }` korišten identično u Tasku 3 i 6. `SearchBar` props (`autoFocus`, `onNavigate`, `placeholder`) korišteni identično u Tasku 5. `Product` view model polja usklađena s `src/types/views.ts`.
