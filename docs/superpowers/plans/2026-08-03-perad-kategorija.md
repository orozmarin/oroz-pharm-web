# Kategorija "Perad" — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dodati kategoriju "Perad" s 9 vrsta žive peradi na stranicu Proizvodi, prikazanu kroz velike kartice s fotografijom po vrsti u dvije grupe po uzrastu.

**Architecture:** Sadržaj su pravi Payload zapisi (1 kategorija, 2 podkategorije, 9 proizvoda) plus dva nova opcionalna `text` polja na `products` (`age`, `purpose`). Prikaz je nova server komponenta `PoultryGrid` koja na ruti `/proizvodi/[category]` zamjenjuje `CategoryDetailClient` kada je slug `perad`, istim obrascem branchanja po slugu koji tamo već postoji za `BrandSpotlight`. Fotografije su odobrene stock slike uploadane u `Media` (R2).

**Tech Stack:** Next.js 15 App Router, Payload CMS v3, PostgreSQL, TypeScript 5 strict, Tailwind CSS v4, Lucide React.

**Spec:** [docs/superpowers/specs/2026-08-03-perad-kategorija-design.md](../specs/2026-08-03-perad-kategorija-design.md)

## Global Constraints

- **Nema test runnera.** Provjera je `npx tsc --noEmit` (brzo, hvata tipove) pa `npm run build`, plus ručna provjera u pregledniku na `http://localhost:3000`. Nijedan korak ne smije tvrditi da je gotov bez pokrenute provjere.
- **`npm run lint` je već slomljen** u ovom repozitoriju i to nije naša regresija: eslint config puca s `TypeError: Plugin "" not found` na `defineConfig` u `eslint.config.mjs`. Ne koristiti lint kao gate i ne popravljati ga unutar ovog zadatka. Baseline provjeren 2026-08-03: `npx tsc --noEmit` prolazi čist.
- **`npx payload generate:types` NE RADI** na Node.js v25 (tsx ESM inkompatibilnost). `src/payload-types.ts` se piše **ručno**. Datoteka je već ručno održavana, ima vlastite `// ─── Naziv ───` separatore i taj stil se prati.
- **`npx payload migrate` NE RADI** na Node 25. Lokalne DB kolone nastanu tako da se pokrene `npm run dev`, otvori `/admin` u pregledniku, pa `Ctrl+C`.
- **Nova polja su `type: 'text'`, ne `select`.** `select` u Payloadu na PostgreSQL-u stvara enum tip, što na produkciji uz `ALTER TABLE` traži i `CREATE TYPE`.
- **Seed i import skripte se NE commitaju** u git. Ostaju untracked u `src/scripts/`.
- **Tekstovi bez AI-štiha:** nema em-crtica, nema strelica u proznom tekstu, nema suvišnih objašnjenja. Kratko i prirodno, hrvatski.
- **Tailwind v4 sintaksa** kakva se već koristi u projektu: `bg-linear-to-t`, `aspect-4/3`, `grid-cols-3`.
- **Redoslijed deploya na prod je obavezan:** `ALTER TABLE` kao superuser PRIJE `npm run build`. Detalji u Tasku 7.
- **Grana:** `feat/perad-kategorija` (već postoji, spec je na njoj).

---

### Task 1: Shema i tipovi za `age` i `purpose`

Dodaje dva opcionalna polja na `products` i tri opcionalna polja na view modele. Nakon ovog taska ništa se vizualno ne mijenja, ali admin ima polja i TypeScript zna za njih.

**Files:**
- Modify: `src/collections/Products.ts` (nakon `description`, prije `instructions`)
- Modify: `src/payload-types.ts:138-164` (`Product` interface)
- Modify: `src/types/views.ts:34-40` (`Subcategory`), `src/types/views.ts:50-60` (`Product`)

**Interfaces:**
- Consumes: ništa
- Produces:
  - Payload polja `products.age: string | null`, `products.purpose: string | null` (DB stupci `age`, `purpose`, tip `varchar`)
  - `Product` view model dobiva `age?: string`, `purpose?: string`
  - `Subcategory` view model dobiva `slug?: string`

- [ ] **Step 1: Dodaj polja u Products kolekciju**

U `src/collections/Products.ts`, između polja `description` i `instructions`:

```ts
    {
      name: 'age',
      type: 'text',
      label: 'Uzrast',
      admin: {
        description: 'Koristi se za kategoriju Perad. Npr. 1 dan, 3 tjedna, 18 tjedana.',
      },
    },
    {
      name: 'purpose',
      type: 'text',
      label: 'Namjena',
      admin: {
        description: 'Koristi se za kategoriju Perad. Upisati tov ili jaja.',
      },
    },
```

- [ ] **Step 2: Ručno dopiši `payload-types.ts`**

`npx payload generate:types` ne radi na Node 25. U `src/payload-types.ts`, u `Product` interface, odmah nakon linije `description?: string | null;`:

```ts
  age?: string | null;
  purpose?: string | null;
```

- [ ] **Step 3: Dopiši view modele**

U `src/types/views.ts`, u `Subcategory` interface dodaj `slug`:

```ts
export interface Subcategory {
  id: string;
  slug?: string;
  name: string;
  description?: string;
  isShowcase?: boolean;
  image?: string;
}
```

U isti file, u `Product` interface dodaj `age` i `purpose`:

```ts
export interface Product {
  id: string;
  slug: string;
  categorySlug: string;
  subcategoryId: string;
  name: string;
  manufacturer: string;
  description: string;
  age?: string;
  purpose?: string;
  instructions: unknown; // Lexical SerializedEditorState from Payload
  image: string;
}
```

Oba su opcionalna, pa postojeći mapperi u `src/lib/search.ts` i na detail stranici ostaju netaknuti i dalje kompajliraju.

- [ ] **Step 4: Napravi kolone u lokalnoj bazi**

`npx payload migrate` ne radi na Node 25, pa se kolone stvaraju kroz dev server (lokalno je `push` uključen):

```bash
npm run dev
```

Otvori `http://localhost:3000/admin` u pregledniku, pričekaj da se stranica učita, pa `Ctrl+C` u terminalu.

- [ ] **Step 5: Provjeri da su kolone nastale**

```bash
psql "$DATABASE_URI" -c "\d products" | grep -E "age|purpose"
```

Expected: dva reda, `age | character varying` i `purpose | character varying`.

Ako `psql` nije u pathu ili `DATABASE_URI` nije u shellu, alternativa je otvoriti `/admin/collections/products` i bilo koji proizvod, pa provjeriti da se polja "Uzrast" i "Namjena" prikazuju i da se snimanje ne ruši.

- [ ] **Step 6: Build**

```bash
npx tsc --noEmit && npm run build
```

Expected: tsc bez ispisa (exit 0), build prolazi.

- [ ] **Step 7: Commit**

```bash
git add src/collections/Products.ts src/payload-types.ts src/types/views.ts
git commit -m "feat(perad): polja uzrast i namjena na proizvodima"
```

---

### Task 2: Odabir i odobrenje fotografija

Pribavlja 10 fotografija (1 hero + 9 po vrsti). **Sadrži gate na kojem se čeka odobrenje naručitelja**, ne nastavljati bez njega.

**Files:**
- Create: `/Users/marinoroz/Documents/OrozDigital/materijali/vlastito/asortiman/perad/` (folder izvan repozitorija, prati konvenciju postojećih materijala dobavljača)
- Create: `/Users/marinoroz/Documents/OrozDigital/materijali/vlastito/asortiman/perad/perad-fotke.md` (kontakt-lista za odobrenje)

**Interfaces:**
- Consumes: ništa
- Produces: 10 `.jpg` datoteka s točno ovim imenima, koje Task 3 čita:
  `hero.jpg`, `jednodnevno-pile.jpg`, `jednodnevna-crvena-nesilica.jpg`, `jednodnevno-grahorasto-pile.jpg`, `jednodnevna-patka.jpg`, `jednodnevni-purici.jpg`, `trotjedno-pile.jpg`, `osmotjedna-nesilica.jpg`, `osamnaesttjedna-nesilica.jpg`, `petotjedni-purani.jpg`

- [ ] **Step 1: Napravi folder**

```bash
mkdir -p /Users/marinoroz/Documents/OrozDigital/materijali/vlastito/asortiman/perad
```

- [ ] **Step 2: Pronađi kandidate**

Za svaku od 10 pozicija nađi 2 kandidata na Unsplashu i Pexelsu. Pojmovi za pretragu:

| Datoteka | Pojmovi |
|---|---|
| `hero.jpg` | free range chickens farm, poultry farm |
| `jednodnevno-pile.jpg` | day old chick, baby chick yellow |
| `jednodnevna-crvena-nesilica.jpg` | brown chick, rhode island red chick |
| `jednodnevno-grahorasto-pile.jpg` | speckled chick, partridge chick |
| `jednodnevna-patka.jpg` | duckling |
| `jednodnevni-purici.jpg` | turkey poults, baby turkey |
| `trotjedno-pile.jpg` | three week old chicken, juvenile chick feathers |
| `osmotjedna-nesilica.jpg` | pullet, young brown hen |
| `osamnaesttjedna-nesilica.jpg` | brown laying hen, rhode island red hen |
| `petotjedni-purani.jpg` | young turkeys, turkey flock farm |

Zahtjevi na odabir:
- Landscape orijentacija, minimalno 1200px široko. Kartica je `aspect-4/3` s `object-cover`, portret fotke se odrežu.
- Motiv u središnjem dijelu kadra, jer `object-cover` reže rubove.
- **Tri kritične:** `jednodnevno-pile`, `jednodnevno-grahorasto-pile`, `trotjedno-pile` su vizualno najsličnije. Za njih se traže **različiti kadrovi**: jedno pile u ruci / grupa u leglu / pile s prvim perjem. Ako sva tri kandidata izgledaju kao isti motiv, traži dalje.

- [ ] **Step 3: Napiši kontakt-listu**

`/Users/marinoroz/Documents/OrozDigital/materijali/vlastito/asortiman/perad/perad-fotke.md`, po jedan blok za svaku poziciju:

```markdown
## jednodnevno-pile

- A: https://unsplash.com/photos/<id>  (opis kadra: jedno pile u ruci, neutralna podloga)
- B: https://www.pexels.com/photo/<id>  (opis kadra: pile na sijenu, krupni plan)

Predlažem: A
```

- [ ] **Step 4: GATE — čekaj odobrenje**

Pokaži naručitelju kontakt-listu i pitaj koje verzije odabire. **Ne skidati fotke i ne nastavljati na Task 3 dok ne odobri.** Ako odbije neku poziciju, vrati se na Step 2 za tu poziciju.

- [ ] **Step 5: Skini odobrene fotke**

Skini svaku odobrenu fotku u `/Users/marinoroz/Documents/OrozDigital/materijali/vlastito/asortiman/perad/` pod **točnim** imenom iz bloka Interfaces gore. Preimenovanje je obavezno, Task 3 traži ta imena.

- [ ] **Step 6: Provjeri da su sve tu i da su landscape**

```bash
cd /Users/marinoroz/Documents/OrozDigital/materijali/vlastito/asortiman/perad
for f in hero jednodnevno-pile jednodnevna-crvena-nesilica jednodnevno-grahorasto-pile \
         jednodnevna-patka jednodnevni-purici trotjedno-pile osmotjedna-nesilica \
         osamnaesttjedna-nesilica petotjedni-purani; do
  if [ -f "$f.jpg" ]; then
    echo "OK   $f.jpg $(sips -g pixelWidth -g pixelHeight "$f.jpg" | tail -2 | tr -d ' \n')"
  else
    echo "FALI $f.jpg"
  fi
done
```

Expected: 10 redova, svi počinju s `OK`, svaki `pixelWidth` veći od `pixelHeight` i najmanje 1200.

Bez commita. Fotke su izvan repozitorija.

---

### Task 3: Seed kategorije, podkategorija i proizvoda

Uploada 10 fotki u `Media` i kreira 12 zapisa (1 kategorija, 2 podkategorije, 9 proizvoda). Skripta je idempotentna, upsert po slugu, pa se smije pokrenuti više puta i kasnije ponovno protiv produkcije.

**Files:**
- Create: `src/scripts/seed-perad.mjs` (**untracked, ne commitati**)

**Interfaces:**
- Consumes: `products.age` i `products.purpose` iz Taska 1; datoteke iz Taska 2
- Produces: u bazi kategorija sa slugom `perad` i `gridArea: "perad"`, podkategorije `jednodnevna-perad` i `podrasla-perad`, te 9 proizvoda sa slugovima navedenima u skripti

- [ ] **Step 1: Provjeri da postoje admin credsi**

```bash
grep -c ADMIN_EMAIL .env.seed.local
```

Expected: `1`. Datoteka `.env.seed.local` već postoji u projektu i sadrži `ADMIN_EMAIL` i `ADMIN_PASSWORD`.

- [ ] **Step 2: Napiši skriptu**

`src/scripts/seed-perad.mjs`. Prati obrazac postojećih skripti (`seed-medin-showcase.mjs`): fetch prema Payload REST API-ju, login za JWT, upsert po slugu.

```js
/**
 * Perad: kreira kategoriju, dvije podkategorije po uzrastu i 9 proizvoda žive peradi.
 * Idempotentno (upsert po slugu), smije se pokrenuti više puta.
 *
 * Lokalno:  API_BASE=http://localhost:3000 node --env-file=.env.seed.local src/scripts/seed-perad.mjs
 * Prod:     node --env-file=.env.seed.local src/scripts/seed-perad.mjs
 */
import fs from 'fs'
import path from 'path'

const API_BASE = process.env.API_BASE ?? 'https://orozpharm.hr'
const EMAIL = process.env.ADMIN_EMAIL
const PASSWORD = process.env.ADMIN_PASSWORD
const IMG_DIR = '/Users/marinoroz/Documents/OrozDigital/materijali/vlastito/asortiman/perad'

const CATEGORY = {
  slug: 'perad',
  name: 'Perad',
  description:
    'Živa perad za tov i proizvodnju jaja, od jednodnevnih pilića i purića do podraslih nesilica. Prodaja po narudžbi.',
  icon: 'Bird',
  gridArea: 'perad',
  image: 'hero.jpg',
}

const GROUPS = [
  { slug: 'jednodnevna-perad', name: 'Jednodnevna perad' },
  { slug: 'podrasla-perad', name: 'Podrasla perad' },
]

const PRODUCTS = [
  {
    slug: 'jednodnevno-pile',
    name: 'Jednodnevno pile',
    group: 'jednodnevna-perad',
    age: '1 dan',
    purpose: 'tov',
    description:
      'Bijeli brojler za tov. Prvih tjedan dana traži toplo i suho mjesto te starter hranu za piliće.',
  },
  {
    slug: 'jednodnevna-crvena-nesilica',
    name: 'Jednodnevna crvena nesilica',
    group: 'jednodnevna-perad',
    age: '1 dan',
    purpose: 'jaja',
    description: 'Crvena hibridna nesilica za proizvodnju jaja. Nosi smeđa jaja.',
  },
  {
    slug: 'jednodnevno-grahorasto-pile',
    name: 'Jednodnevno grahorasto pile',
    group: 'jednodnevna-perad',
    age: '1 dan',
    purpose: 'tov',
    description:
      'Grahorasto pile, otpornija pasmina prikladna za slobodni uzgoj i domaći tov.',
  },
  {
    slug: 'jednodnevna-patka',
    name: 'Jednodnevna patka',
    group: 'jednodnevna-perad',
    age: '1 dan',
    purpose: 'tov',
    description: 'Pačić za tov. Brzo raste i dobro se prilagođava vanjskom uzgoju.',
  },
  {
    slug: 'jednodnevni-purici',
    name: 'Jednodnevni purići',
    group: 'jednodnevna-perad',
    age: '1 dan',
    purpose: 'tov',
    description:
      'Purići za tov. Prvih tjedana traže višu temperaturu i hranu s više proteina od pilića.',
  },
  {
    slug: 'trotjedno-pile',
    name: 'Trotjedno pile',
    group: 'podrasla-perad',
    age: '3 tjedna',
    purpose: 'tov',
    description:
      'Pile s prvim perjem, prošlo najosjetljiviji period uzgoja. Spremno za prijelaz na vanjski prostor.',
  },
  {
    slug: 'osmotjedna-nesilica',
    name: 'Osmotjedna nesilica',
    group: 'podrasla-perad',
    age: '8 tjedana',
    purpose: 'jaja',
    description:
      'Podrasla nesilica, više ne traži grijanje. Do nesenja joj ostaje oko deset tjedana.',
  },
  {
    slug: 'osamnaesttjedna-nesilica',
    name: 'Osamnaesttjedna nesilica',
    group: 'podrasla-perad',
    age: '18 tjedana',
    purpose: 'jaja',
    description: 'Nesilica pred nesenjem. Prva jaja obično daje u roku dva do tri tjedna.',
  },
  {
    slug: 'petotjedni-purani',
    name: 'Petotjedni purani',
    group: 'podrasla-perad',
    age: '5 tjedana',
    purpose: 'tov',
    description:
      'Podrasli purani, prošli najzahtjevniju fazu uzgoja. Prikladni za domaći tov.',
  },
]

async function api(p, opts = {}) {
  const res = await fetch(`${API_BASE}/api${p}`, {
    ...opts,
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
  })
  const body = await res.text()
  if (!res.ok) throw new Error(`${opts.method ?? 'GET'} ${p} → ${res.status}: ${body}`)
  return body ? JSON.parse(body) : {}
}

const { token } = await api('/users/login', {
  method: 'POST',
  body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
})
const auth = { Authorization: `JWT ${token}` }
console.log(`🔐 Prijavljen kao ${EMAIL} na ${API_BASE}\n`)

async function uploadImage(file, alt) {
  const buf = fs.readFileSync(path.join(IMG_DIR, file))
  const form = new FormData()
  form.append('file', new Blob([buf], { type: 'image/jpeg' }), file)
  form.append('_payload', JSON.stringify({ alt }))
  const res = await fetch(`${API_BASE}/api/media`, {
    method: 'POST',
    headers: auth,
    body: form,
  })
  if (!res.ok) throw new Error(`Upload ${file} → ${res.status}: ${await res.text()}`)
  return (await res.json()).doc.id
}

async function upsert(collection, slug, fields) {
  const existing = await api(
    `/${collection}?where[slug][equals]=${slug}&limit=1`,
    { headers: auth },
  )
  if (existing.docs?.length) {
    const id = existing.docs[0].id
    await api(`/${collection}/${id}`, {
      method: 'PATCH',
      headers: auth,
      body: JSON.stringify(fields),
    })
    return { id, action: 'ažuriran' }
  }
  const created = await api(`/${collection}`, {
    method: 'POST',
    headers: auth,
    body: JSON.stringify({ slug, ...fields }),
  })
  return { id: created.doc.id, action: 'kreiran' }
}

// 1. Kategorija
const catImageId = await uploadImage(CATEGORY.image, 'Perad')
const cat = await upsert('categories', CATEGORY.slug, {
  name: CATEGORY.name,
  description: CATEGORY.description,
  icon: CATEGORY.icon,
  gridArea: CATEGORY.gridArea,
  image: catImageId,
})
console.log(`📁 Kategorija Perad ${cat.action} (id ${cat.id})`)

// 2. Podkategorije
const groupIds = {}
for (const g of GROUPS) {
  const r = await upsert('subcategories', g.slug, { name: g.name, category: cat.id })
  groupIds[g.slug] = r.id
  console.log(`  └─ ${g.name} ${r.action} (id ${r.id})`)
}

// 3. Proizvodi
for (const p of PRODUCTS) {
  const imageId = await uploadImage(`${p.slug}.jpg`, p.name)
  const r = await upsert('products', p.slug, {
    name: p.name,
    category: cat.id,
    subcategory: groupIds[p.group],
    description: p.description,
    age: p.age,
    purpose: p.purpose,
    image: imageId,
  })
  console.log(`🐣 ${p.name} ${r.action} (id ${r.id})`)
}

console.log('\n✅ Gotovo.')
```

- [ ] **Step 3: Pokreni protiv lokalnog dev servera**

U jednom terminalu:

```bash
npm run dev
```

U drugom:

```bash
API_BASE=http://localhost:3000 node --env-file=.env.seed.local src/scripts/seed-perad.mjs
```

Expected: `🔐 Prijavljen`, pa `📁 Kategorija Perad kreiran`, dvije podkategorije, 9 redova `🐣`, pa `✅ Gotovo.`

Ako login vrati 403, admin korisnik iz `.env.seed.local` ne postoji u **lokalnoj** bazi. Tada napravi korisnika na `http://localhost:3000/admin` i upiši te podatke u `API_BASE`-specifičnu varijantu poziva, ili preskoči lokalni seed i testiraj protiv produkcije nakon Taska 7.

- [ ] **Step 4: Provjeri u pregledniku**

Otvori `http://localhost:3000/proizvodi/perad`.

Expected: hero s fotografijom i naslovom "Perad", pa **standardni** product grid s 9 kartica i dva filter taba ("Jednodnevna perad", "Podrasla perad"). Fotke su u ovoj fazi prikazane kroz `object-contain mix-blend-multiply` i izgledat će isprano i odrezano. **To je očekivano**, ispravlja se u Tasku 4.

Otvori `http://localhost:3000/admin/collections/products` i provjeri da jedan zapis peradi ima popunjena polja "Uzrast" i "Namjena".

- [ ] **Step 5: Postavi srodne kategorije**

Spec traži `relatedCategories` = Stočna hrana i Stočarstvo. Slugovi tih kategorija nisu unaprijed poznati, a `relationship` polje traži njihove ID-eve, pa se to postavlja ručno iz admina jednom, umjesto da se u skriptu upisuje pogađanje.

Otvori `http://localhost:3000/admin/collections/categories`, nađi zapis "Perad", u polju "Srodne kategorije" odaberi Stočnu hranu i Stočarstvo (točne nazive uzmi iz liste kategorija), pa snimi.

Ako se `relatedCategories` ostavi prazno, stranica ne puca: `[category]/page.tsx` ima fallback koji dovuče prve tri druge kategorije. Ali onda "Možda vas zanima" prikazuje što god baza vrati prvo, što nije namjera.

- [ ] **Step 6: Provjeri srodne kategorije**

Otvori `http://localhost:3000/proizvodi/perad` i skrolaj do "Možda vas zanima".

Expected: prikazane su Stočna hrana i Stočarstvo.

- [ ] **Step 7: Bez commita**

Seed skripte se ne commitaju. Provjeri da je untracked i da tako ostaje:

```bash
git status --short src/scripts/seed-perad.mjs
```

Expected: `?? src/scripts/seed-perad.mjs`

Napomena za Task 7: `relatedCategories` na produkciji treba postaviti isto, ručno iz `https://orozpharm.hr/admin`, jer skripta to polje ne dira.

---

### Task 4: Komponenta `PoultryGrid`

Zamjenjuje standardni product grid za kategoriju `perad`. Ovo je task u kojem prikaz postaje ono što je dizajnirano.

**Files:**
- Create: `src/components/products/PoultryGrid.tsx`
- Modify: `src/app/(site)/proizvodi/[category]/page.tsx:105-112` (mapper podkategorija, dodati `slug`)
- Modify: `src/app/(site)/proizvodi/[category]/page.tsx:130-146` (mapper proizvoda, dodati `age` i `purpose`)
- Modify: `src/app/(site)/proizvodi/[category]/page.tsx:193` (branch na `PoultryGrid`)

**Interfaces:**
- Consumes: `Product.age`, `Product.purpose`, `Subcategory.slug` iz Taska 1; zapisi iz Taska 3
- Produces: `export default function PoultryGrid({ subcategories, products }: { subcategories: Subcategory[]; products: Product[] })`

- [ ] **Step 1: Napiši komponentu**

`src/components/products/PoultryGrid.tsx`:

```tsx
import Image from "next/image";
import Link from "next/link";
import Button from "@/components/shared/Button";
import type { Product, Subcategory } from "@/types/views";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80";

/** Redoslijed grupa je eksplicitan. Abecedni sort iz upita slučajno daje isto,
 *  ali na to se ne vežemo. Nepoznate podkategorije idu na kraj. */
const GROUP_ORDER = ["jednodnevna-perad", "podrasla-perad"];

const PURPOSE_LABEL: Record<string, string> = {
  tov: "Za tov",
  jaja: "Za jaja",
};

interface Props {
  subcategories: Subcategory[];
  products: Product[];
}

function groupIndex(slug?: string): number {
  const i = slug ? GROUP_ORDER.indexOf(slug) : -1;
  return i === -1 ? GROUP_ORDER.length : i;
}

function PoultryCard({
  product,
  priority,
}: {
  product: Product;
  priority: boolean;
}) {
  const purpose = product.purpose
    ? PURPOSE_LABEL[product.purpose.toLowerCase()]
    : undefined;

  return (
    <Link
      href={`/proizvodi/${product.categorySlug}/${product.slug}`}
      className="group flex flex-col h-full bg-white rounded-2xl border border-green-100 overflow-hidden hover:shadow-lg hover:border-green-200 transition-all duration-300"
    >
      <div className="relative aspect-4/3 overflow-hidden">
        <Image
          src={product.image || FALLBACK_IMAGE}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          priority={priority}
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-linear-to-t from-green-900/50 to-transparent" />
        {product.age && (
          <span className="absolute top-3 left-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-green-900">
            {product.age}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-2 p-5 flex-1">
        {purpose && (
          <span className="text-xs font-semibold text-green-700 uppercase tracking-wide">
            {purpose}
          </span>
        )}
        <h3 className="font-bold text-green-900 text-lg leading-snug font-heading group-hover:text-green-700 transition-colors">
          {product.name}
        </h3>
        {product.description && (
          <p className="text-gray-500 text-sm leading-relaxed flex-1">
            {product.description}
          </p>
        )}
        <span className="text-green-700 text-sm font-medium mt-1">Detalji →</span>
      </div>
    </Link>
  );
}

export default function PoultryGrid({ subcategories, products }: Props) {
  const ordered = [...subcategories].sort(
    (a, b) =>
      groupIndex(a.slug) - groupIndex(b.slug) ||
      a.name.localeCompare(b.name, "hr")
  );

  const groups = ordered
    .map((sub) => ({
      sub,
      items: products.filter((p) => p.subcategoryId === sub.id),
    }))
    .filter((g) => g.items.length > 0);

  // Proizvod bez podkategorije ne smije tiho ispasti iz prikaza.
  const groupedIds = new Set(groups.flatMap((g) => g.items.map((p) => p.id)));
  const orphans = products.filter((p) => !groupedIds.has(p.id));

  // priority samo za prvi red kartica
  const priorityIds = new Set(
    [...groups.flatMap((g) => g.items), ...orphans].slice(0, 3).map((p) => p.id)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-16">
      {groups.map(({ sub, items }) => (
        <section key={sub.id} className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-green-900 font-heading mb-6">
            {sub.name}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((p) => (
              <PoultryCard
                key={p.id}
                product={p}
                priority={priorityIds.has(p.id)}
              />
            ))}
          </div>
        </section>
      ))}

      {orphans.length > 0 && (
        <section className="mb-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {orphans.map((p) => (
              <PoultryCard
                key={p.id}
                product={p}
                priority={priorityIds.has(p.id)}
              />
            ))}
          </div>
        </section>
      )}

      <div className="rounded-2xl border border-green-100 bg-green-50 p-8 text-center">
        <h3 className="text-xl md:text-2xl font-bold text-green-900 font-heading mb-2">
          Perad se prodaje po narudžbi
        </h3>
        <p className="text-gray-600 max-w-xl mx-auto mb-6">
          Termini dolaska ovise o sezoni. Javite se za dostupnost i rezervaciju
          količine.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Button href="/kontakt" variant="primary">
            Zatražite ponudu
          </Button>
          <Button href="/kontakt#poslovnice" variant="outline">
            Posjetite poslovnicu
          </Button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Dopuni mapper podkategorija**

U `src/app/(site)/proizvodi/[category]/page.tsx`, u petlji koja gradi `subsByCategoryId`, dodaj `slug` u objekt koji se pusha:

```ts
    subsByCategoryId.get(catId)!.push({
      id: String(sub.id),
      slug: sub.slug,
      name: sub.name,
      description: sub.description ?? undefined,
      isShowcase: sub.isShowcase ?? undefined,
      image: getImageUrl(sub.image, ""),
    });
```

- [ ] **Step 3: Dopuni mapper proizvoda**

U istom fileu, u `const products: Product[] = productDocs.map(...)`, dodaj dva polja nakon `description`:

```ts
    description: doc.description ?? "",
    age: doc.age ?? undefined,
    purpose: doc.purpose ?? undefined,
    instructions: doc.instructions,
```

- [ ] **Step 4: Dodaj import i branch**

Uz ostale importe u istom fileu:

```tsx
import PoultryGrid from "@/components/products/PoultryGrid";
```

Zamijeni liniju `<CategoryDetailClient category={category} products={products} />` s:

```tsx
      {category.slug === "perad" ? (
        <PoultryGrid subcategories={category.subcategories} products={products} />
      ) : (
        <CategoryDetailClient category={category} products={products} />
      )}
```

- [ ] **Step 5: Build i lint**

```bash
npx tsc --noEmit && npm run build
```

Expected: tsc bez ispisa (exit 0), build prolazi. Ako TypeScript prijavi da `sub.slug` ne postoji na tipu, Task 1 Step 2 nije odrađen ili `payload-types.ts` nije snimljen.

- [ ] **Step 6: Ručna provjera**

```bash
npm run dev
```

Na `http://localhost:3000/proizvodi/perad` provjeri:

- Dva naslova grupa, "Jednodnevna perad" pa "Podrasla perad", u tom redoslijedu
- 5 kartica u prvoj grupi, 4 u drugoj
- Fotografije **ispunjavaju** okvir kartice, nisu isprane ni odrezane s bijelim rubovima
- Badge uzrasta gore lijevo na svakoj fotki ("1 dan", "3 tjedna", ...)
- Iznad naziva mala zelena kapitalka "ZA TOV" ili "ZA JAJA"
- **Nema** filter tabova podkategorija i **nema** pilula proizvođača
- CTA blok na dnu, oba gumba rade
- Klik na karticu vodi na `/proizvodi/perad/<slug>`
- Na `375px` širine kartice su u jednoj koloni i tekst se ne prelijeva

Provjeri i da se **ostale** kategorije nisu promijenile, npr. `http://localhost:3000/proizvodi/zastita-bilja`: filter tabovi i dalje postoje, fotke pakiranja i dalje `object-contain`.

- [ ] **Step 7: Commit**

```bash
git add src/components/products/PoultryGrid.tsx "src/app/(site)/proizvodi/[category]/page.tsx"
git commit -m "feat(perad): prikaz peradi kroz PoultryGrid umjesto standardnog grida"
```

---

### Task 5: Ulaz u kategoriju na `/proizvodi`

Dodaje `perad` slot u bento grid, u mobilni redoslijed, i popravlja zastarjeli broj kategorija u herou.

**Files:**
- Modify: `src/components/products/CategoryGrid.tsx:11-15` (`GRID_ORDER`)
- Modify: `src/components/products/CategoryGrid.tsx:33-41` (`gridTemplateAreas`)
- Modify: `src/app/(site)/proizvodi/page.tsx:65-69` (broj kategorija u herou)

**Interfaces:**
- Consumes: kategorija s `gridArea: "perad"` iz Taska 3
- Produces: ništa što drugi task troši

- [ ] **Step 1: Dodaj `perad` u mobilni redoslijed**

U `src/components/products/CategoryGrid.tsx`, u `GRID_ORDER`, ubaci `"perad"` odmah iza `"stocna"`:

```ts
const GRID_ORDER = [
  "zastita","gnojivo","sjeme","stocna","perad","sadni","substr",
  "navod","pcelar","ulja","enolog","stroj","alati","stocar",
  "kucni","kolinje","gume","vrt","roba","eko",
];
```

- [ ] **Step 2: Dodaj red pune širine u bento grid**

U istom fileu, u `gridTemplateAreas`, ubaci novi red između `sjeme sjeme stocna stocna` i `sadni sadni substr substr`:

```tsx
          gridTemplateAreas: `
            "zastita zastita gnojivo gnojivo"
            "sjeme sjeme stocna stocna"
            "perad perad perad perad"
            "sadni sadni substr substr"
            "navod pcelar ulja enolog"
            "stroj stroj alati stocar"
            "kucni kucni kolinje gume"
            "vrt vrt roba eko"
          `,
```

Nijedan postojeći slot ne mijenja poziciju ni veličinu.

- [ ] **Step 3: Napravi broj kategorija u herou dinamičnim**

Hero tvrdi "13 kategorija", a u bazi ih je 19 plus Perad. Hardkodiran broj je i bio uzrok greške, pa ide izračun iz podataka.

U `src/app/(site)/proizvodi/page.tsx`, prije `export default`, dodaj helper (hrvatska sklonidba: 1 i brojevi na 1 osim 11 daju nominativ jednine, 2 do 4 osim 12 do 14 daju "kategorije", ostalo genitiv množine):

```ts
function pluralizeKategorija(n: number): string {
  const last2 = n % 100;
  const last = n % 10;
  if (last2 >= 11 && last2 <= 14) return "kategorija";
  if (last === 1) return "kategorija";
  if (last >= 2 && last <= 4) return "kategorije";
  return "kategorija";
}
```

Zamijeni tekst u herou:

```tsx
            <p className="text-white/80 text-lg max-w-xl">
              Preko 15.000 artikala za sve vaše poljoprivredne potrebe, organizirano u{" "}
              <span className="text-green-300 font-semibold">
                {categories.length} {pluralizeKategorija(categories.length)}
              </span>{" "}
              s vodećim svjetskim brandovima.
            </p>
```

- [ ] **Step 4: Build i lint**

```bash
npx tsc --noEmit && npm run build
```

Expected: tsc bez ispisa (exit 0), build prolazi.

- [ ] **Step 5: Ručna provjera**

```bash
npm run dev
```

Na `http://localhost:3000/proizvodi`:

- Perad tile je pune širine, u trećem redu, ispod Sjemena i Stočne hrane
- Ostalih 19 tila je na istim pozicijama i istih veličina kao prije. Usporedi s `git stash` verzijom ako nisi siguran.
- Hero piše točan broj, `20 kategorija` (ili koliko ih baza vrati)
- Na `375px` širine Perad je u stupcu odmah iza Stočne hrane
- Klik na Perad vodi na `/proizvodi/perad`
- Na hover Perad tile pokazuje pilule "Jednodnevna perad" i "Podrasla perad"

- [ ] **Step 6: Commit**

```bash
git add src/components/products/CategoryGrid.tsx "src/app/(site)/proizvodi/page.tsx"
git commit -m "feat(perad): perad tile u bento gridu, dinamičan broj kategorija"
```

---

### Task 6: Fotografije peradi u pretrazi

`src/lib/search.ts` je sirovi SQL nad `products.name`, pa upiti "pile", "patka", "nesilica" već vraćaju perad. To je željeno i SQL se ne dira. Ali rezultati se renderiraju kroz `ProductCard`, koji fotku prikazuje kroz `object-contain mix-blend-multiply`, namijenjeno snimkama pakiranja na bijelom.

**Files:**
- Modify: `src/components/products/ProductCard.tsx:13-28`

**Interfaces:**
- Consumes: `Product.categorySlug` (postoji od prije)
- Produces: ništa

- [ ] **Step 1: Dodaj branch po kategoriji**

U `src/components/products/ProductCard.tsx`, unutar komponente, prije `return`:

```tsx
export default function ProductCard({ product, priority = false }: Props) {
  // Perad su fotografije žive robe, a ne snimke pakiranja na bijeloj podlozi.
  // contain + mix-blend-multiply ih odreže i ispere, pa za njih ide cover.
  const isLivePhoto = product.categorySlug === "perad";
```

I zamijeni `className` na `<Image>`:

```tsx
          className={`${
            isLivePhoto ? "object-cover" : "object-contain mix-blend-multiply"
          } group-hover:scale-105 transition-transform duration-300`}
```

- [ ] **Step 2: Build i lint**

```bash
npx tsc --noEmit && npm run build
```

Expected: tsc bez ispisa (exit 0), build prolazi.

- [ ] **Step 3: Ručna provjera**

```bash
npm run dev
```

- `http://localhost:3000/proizvodi/pretraga?q=pile` — perad se pojavljuje, fotke ispunjavaju okvir kartice
- `http://localhost:3000/proizvodi/pretraga?q=nesilica` — isto
- `http://localhost:3000/proizvodi/pretraga?q=amistar` — pakiranje se i dalje prikazuje `object-contain`, na bijelom, bez odrezivanja
- `http://localhost:3000/proizvodi/perad/jednodnevno-pile` — stranica nije prazna: fotka, naziv, opis, srodni proizvodi. **Nema** sekcije "Upute za primjenu" i nema proizvođača.

- [ ] **Step 4: Commit**

```bash
git add src/components/products/ProductCard.tsx
git commit -m "fix(perad): cover fit za fotografije peradi u pretrazi"
```

---

### Task 7: Deploy na produkciju

Redoslijed je obavezan. Kolone moraju postojati prije builda, jer `next build` statički prerenderira `/proizvodi` i `/sitemap.xml` koji čitaju `products`, a produkcijski `orozpharm_user` nema `ALTER TABLE` prava pa Payload ne može sam dodati stupce.

**Files:** nema izmjena koda

**Interfaces:**
- Consumes: sve iz Taskova 1 do 6
- Produces: živa kategorija na `https://orozpharm.hr/proizvodi/perad`

- [ ] **Step 1: Merge grane**

```bash
git checkout main && git merge --no-ff feat/perad-kategorija
git push origin main
```

- [ ] **Step 2: Na serveru, `git pull` bez builda**

```bash
cd /var/www/orozpharm && git pull
```

**Ne pokretati build.**

- [ ] **Step 3: Dodaj kolone kao superuser**

```bash
sudo -u postgres psql -d orozpharm -c \
  "ALTER TABLE products ADD COLUMN IF NOT EXISTS age varchar;
   ALTER TABLE products ADD COLUMN IF NOT EXISTS purpose varchar;"
```

- [ ] **Step 4: Provjeri da kolone postoje**

```bash
sudo -u postgres psql -d orozpharm -c "\d products" | grep -E "^ (age|purpose) "
```

Expected: dva reda, oba `character varying`. Ako fali ijedan, **ne buildati**, vratiti se na Step 3.

- [ ] **Step 5: Build i restart**

```bash
npm run build && pm2 restart orozpharm
```

Ako build padne, ostaje nekonzistentan `.next/` koji u runtime-u ruši `robots.txt` i `sitemap.xml`. Fix:

```bash
rm -rf .next && npm run build && pm2 restart orozpharm
```

- [ ] **Step 6: Seedaj sadržaj na produkciju**

Lokalno, s lokalnog stroja (skripta i fotke su lokalno):

```bash
node --env-file=.env.seed.local src/scripts/seed-perad.mjs
```

Bez `API_BASE`, default je `https://orozpharm.hr`. Fotke se uploadaju u produkcijski R2.

Expected: isti izlaz kao u Tasku 3 Step 3, s `kreiran` za sve zapise.

- [ ] **Step 7: Rebuild da sitemap uključi Perad**

`/sitemap.xml` (`src/app/sitemap.ts`) je statička ruta bez `revalidate` exporta
(`initialRevalidateSeconds: false`), i nigdje u `src/` ne postoji poziv
`revalidatePath` koji bi je osvježio. Build u Stepu 5 se izvodi **prije**
seeda iz Stepa 6, pa je sitemap zapečen bez URL-ova za proizvode i kategoriju
Perad. Ta ruta se sama ne liječi - treba novi build da uzme svježe podatke.

```bash
npm run build && pm2 restart orozpharm
```

- [ ] **Step 8: Postavi srodne kategorije na produkciji**

Skripta ne dira `relatedCategories`. Otvori `https://orozpharm.hr/admin/collections/categories`, zapis "Perad", i u "Srodne kategorije" odaberi Stočnu hranu i Stočarstvo, pa snimi.

- [ ] **Step 9: Provjeri produkciju**

`/proizvodi` ima `revalidate = 3600`, a `/proizvodi/[category]` i detail ruta `revalidate = 60`. Kako se seed vrti **nakon** builda, bento grid može do sat vremena prikazivati stanje bez Peradi. Ako Perad tile ne vidiš odmah, to nije bug. Da ne čekaš, `pm2 restart orozpharm` izbaci ISR cache iz memorije.

Detail rute ne trebaju rebuild: `[product]/page.tsx` ima `dynamicParams = true` i nema `generateStaticParams`, pa se novi proizvodi razriješe u letu.

- `https://orozpharm.hr/proizvodi` — Perad tile pune širine, točan broj kategorija u herou
- `https://orozpharm.hr/proizvodi/perad` — dvije grupe, 5 i 4 kartice, fotke ispunjavaju okvir
- `https://orozpharm.hr/proizvodi/perad/jednodnevno-pile` — stranica nije prazna
- `https://orozpharm.hr/proizvodi/pretraga?q=pile` — perad se pojavljuje
- `https://orozpharm.hr/proizvodi/zastita-bilja` — nepromijenjeno
- `curl -sI https://orozpharm.hr/sitemap.xml | head -1` — `200`, ne 500

Provjeri i logove svježe, jer `pm2 logs` pokazuje rep starog append-only error loga:

```bash
pm2 flush && curl -s https://orozpharm.hr/proizvodi/perad -o /dev/null && pm2 logs orozpharm --lines 30 --nostream
```

Expected: bez greški.

- [ ] **Step 10: Obriši granu**

```bash
git branch -d feat/perad-kategorija
```

---

## Napomene za izvođača

**Zašto `PoultryGrid` zamjenjuje, a ne dopunjuje `CategoryDetailClient`:** za perad ne želimo filter tabove, pilule proizvođača ni paginaciju. `CategoryDetailClient` je klijentska komponenta zbog tog state-a. `PoultryGrid` ništa od toga ne treba, pa je server komponenta i ne šalje JS na klijenta.

**Zašto kartice linkaju na detail stranice:** rute `/proizvodi/perad/[product]` postoje bez obzira na nas, jer je ruta generička, i pretraga već vodi na njih. Da kartice ne linkaju, imali bismo dva različita ponašanja za isti zapis.

**Ako naručitelj kasnije dobije vlastite fotografije:** mijenja se samo `image` u `/admin`, kod se ne dira.

**Ako se doda treća grupa uzrasta:** nova podkategorija pod Perad, plus njen slug u `GROUP_ORDER` u `PoultryGrid.tsx`. Bez toga grupa se i dalje prikaže, ali na kraju i sortirana po nazivu.
