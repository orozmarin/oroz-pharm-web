# Pretraživanje proizvoda — dizajn

**Datum:** 2026-06-25
**Status:** Odobreno (čeka spec review)

## Cilj

Omogućiti korisnicima da pronađu konkretan proizvod iz kataloga (~15.000 artikala) s
bilo koje stranice. Najčešći scenarij u poljoprivrednoj ljekarni je korisnik koji zna
naziv sredstva (npr. "Amistar") ili proizvođača (npr. "Syngenta") i želi brzo doći do
njega — bez navigacije kroz kategorije.

## Odluke (kontekst)

Istraživanje industrijskog standarda (Baymard, NN/g) pokazalo je:

- Trajni search bar u headeru na svakoj stranici je standard za velike kataloge.
- Pretraga ograničena **samo** na kategoriju je rizična kao primarni mehanizam —
  korisnici ne shvate da je rezultat ograničen i zaključe da proizvod ne postoji.
- Autocomplete drastično podiže uspješnost pretrage.
- Filteri i pretraga se nadopunjuju, ne zamjenjuju.

Donesene odluke:

- **Primarni mehanizam:** globalni search u headeru (opcija A iz analize).
- **Tehnologija:** PostgreSQL `pg_trgm` (trigram) — fuzzy/typo-tolerantna pretraga na
  postojećoj bazi, bez novog servisa i bez promjene deploy procedure.
- **Polja pretrage:** naziv proizvoda + naziv proizvođača. (Djelatna tvar i namjena su
  van opsega — ne postoje strukturirana polja i nisu tražena.)

## Opseg

### Uključeno

1. PostgreSQL `pg_trgm` ekstenzija + GIN trigram indeksi.
2. Jedinstvena SQL logika pretrage (raw, parametrizirana) preko Payload drizzle/pg poola.
3. API ruta za autocomplete (`/api/search`).
4. `SearchBar` client komponenta u headeru (desktop) + mobilni overlay.
5. Results stranica `/proizvodi/pretraga?q=...` (server-rendered grid + paginacija).

### Van opsega (YAGNI — dodaje se kasnije ako zatreba)

- Pretraga unutar pojedine kategorije ("search within category", opcija C).
- Pretraga po djelatnoj tvari ili namjeni/problemu (zahtijeva novu shemu i popunjavanje).
- Dedicirani search engine (Meilisearch/Typesense) — upgrade put ako se kasnije traži
  instant "as-you-type" na većoj skali.

## Arhitektura

```
Header (na svakoj stranici)
  └─ SearchBar (client) ──debounce 200ms──> GET /api/search?q=...  (top 8, JSON)
         │                                         │
         │                                         └─ raw SQL (pg_trgm)
         └─ Enter / "Svi rezultati" ──> /proizvodi/pretraga?q=...
                                              └─ ista SQL logika, veći limit + paginacija
```

Jedan izvor istine za pretragu: zajednička SQL/upitna funkcija koju koriste i
autocomplete API i results stranica (razlika je samo u `limit`/offsetu).

## Baza — pg_trgm

Migracija (Payload migration ili jednokratni SQL):

```sql
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS idx_products_name_trgm
  ON products USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_manufacturers_name_trgm
  ON manufacturers USING gin (name gin_trgm_ops);
```

GIN trigram indeks ubrzava i `ILIKE '%...%'` (substring) i `similarity()`
(typo-tolerancija) — jedan indeks pokriva oba.

> Napomena za implementaciju: točna imena tablica/stupaca (`products`, `manufacturers`,
> `manufacturer_id`, `category_id`) potvrditi protiv generirane Payload sheme prije
> pisanja migracije.

## SQL logika pretrage

```sql
SELECT
  p.id, p.name, p.slug,
  c.slug AS category_slug,
  m.name AS manufacturer,
  /* potrebno za sliku u dropdownu — preko media join/upitom */
FROM products p
LEFT JOIN manufacturers m ON p.manufacturer_id = m.id
LEFT JOIN categories     c ON p.category_id     = c.id
WHERE p.name ILIKE '%' || $q || '%'
   OR m.name ILIKE '%' || $q || '%'
   OR similarity(p.name, $q) > 0.3
ORDER BY GREATEST(similarity(p.name, $q), similarity(m.name, $q)) DESC, p.name
LIMIT $limit OFFSET $offset;
```

- Parametrizirano (`$q`, `$limit`, `$offset`) — zaštita od SQL injectiona.
- `similarity > 0.3` hvata tipfelere ("amsitar" → "Amistar"). Prag se može fino podesiti.
- Slika proizvoda: dohvatiti preko postojeće `getImageUrl` logike (media relacija).
  Implementacija odlučuje hoće li join na media ili naknadni Payload upit po id-evima.

## Komponente

### `SearchBar` (client, header)

- Input + autocomplete dropdown.
- Debounce ~200ms, minimalno 2 znaka.
- Keyboard navigacija: ↑/↓ kroz rezultate, Enter otvara, Esc zatvara.
- Svaki red: slika (mala) + naziv proizvoda + proizvođač.
- Zadnji red: *"Prikaži sve rezultate za '…'"* → vodi na results stranicu.
- Stanja: loading (spinner u dropdownu), nema rezultata.
- Mobilni: ikona pretrage u headeru otvara fullscreen overlay s istim `SearchBar`-om.

### `GET /api/search/route.ts`

- Query param `?q=`.
- Vraća top 8 rezultata kao JSON: `{ id, name, slug, categorySlug, manufacturer, image }`.
- `q` kraći od 2 znaka → prazan rezultat.

### `/proizvodi/pretraga/page.tsx`

- Server komponenta, čita `?q=` (i `?page=`).
- Ista SQL logika, `limit` ~60 + paginacija.
- Renderira postojeći `ProductCard` grid (reuse postojećeg UI-a).
- Naslov: *"Rezultati pretrage za '…'"* + broj rezultata.

## Tok podataka

1. Korisnik tipka u `SearchBar` → debounced `fetch('/api/search?q=…')`.
2. API izvršava SQL → vraća top 8 → dropdown.
3. Enter ili klik na "Svi rezultati" → `router.push('/proizvodi/pretraga?q=…')`.
4. Results stranica server-side izvrši istu pretragu (veći limit) → grid + paginacija.

## Rukovanje greškama / rubni slučajevi

- Prazan upit ili < 2 znaka → dropdown se ne otvara; results stranica prikazuje prompt.
- Nema rezultata → *"Nema rezultata za '…'"* + poticaj na kontakt/poslovnicu
  (u skladu s postojećim "Uskoro dostupno" tonom).
- Loading state u dropdownu tijekom dohvata.
- API greška → dropdown tiho ne prikazuje rezultate (ne ruši UI).

## Provjera ispravnosti

`next build` (jedina provjera — nema test runnera). Ručna provjera:

- Pretraga po punom nazivu vraća točan proizvod.
- Pretraga po proizvođaču vraća njegove proizvode.
- Tipfeler (npr. "amsitar") i dalje vraća "Amistar" (typo-tolerancija radi).
- Dropdown navigacija tipkovnicom radi.
- Results stranica paginacija radi.
- Mobilni overlay radi.
