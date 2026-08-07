# Syngenta Import Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Uvesti ~31 Syngenta proizvod (zaštita bilja + biostimulatori) u Payload CMS na produkciji, sa slikama, ispravnom kategorijom/podkategorijom i verificiranim hrvatskim podacima.

**Architecture:** Iskoristiti postojeći pipeline (`make-manifest.mjs` → istraživanje/popunjavanje JSON manifesta → `seed-from-manifest.mjs`). Jedina izmjena koda: per-product `category` override u uploaderu, jer proizvodi pokrivaju dvije kategorije (Zaštita bilja id 3, Gnojiva id 2). Podaci se verificiraju s FIS registra + Syngenta HR.

**Tech Stack:** Node ESM (`.mjs`), `sharp` (obrada slika), Payload REST API (`/api/...`).

## Global Constraints

- Svi tekstovi (`description`, `activeIngredients`, `mainUses`) na **hrvatskom jeziku**.
- **Bez veličine pakiranja** u nazivu proizvoda (npr. ne "Karate Zeon 1L", nego "Karate Zeon").
- Proizvođač za sve = **Syngenta** (već postoji, id 3).
- Kategorija "Zaštita bilja" = id 3, slug `zastita-bilja`. Kategorija "Gnojiva" = id 2, slug `gnojiva`.
- Podkategorije po slugu: `herbicidi`, `fungicidi`, `insekticidi`, `zastita-bilja-ostalo`, `biostimulatori`.
- Podaci o pesticidima moraju biti verificirani iz službenog izvora; nesigurno se označava, ne izmišlja.
- Nema test runnera u projektu — provjera je `--dry-run` izlaz i Payload `/admin` + REST API.
- Manifest i artefakti spremaju se u `src/scripts/syngenta-manifest.json`.
- Slike: `/Users/marinoroz/Documents/OrozDigital/materijali/dobavljaci/syngenta/slike`

---

### Task 1: Per-product `category` override u uploaderu

**Files:**
- Modify: `src/scripts/seed-from-manifest.mjs` (helper + main loop)

**Interfaces:**
- Produces: `getCategoryId(token, slugOrId)` → vraća numerički id kategorije; `categoryMap` (slug/id → id); `subcategoryMap` keyiran po `"${catId}:${subSlug}"`.
- Consumes: postojeći `apiFetch`, `getSubcategoryId`, `createProduct`.

- [ ] **Step 1: Dodati `getCategoryId` helper**

Iznad `getSubcategoryId` dodati:

```js
async function getCategoryId(token, slugOrId) {
  if (/^\d+$/.test(String(slugOrId))) return Number(slugOrId)
  const res = await apiFetch(`/categories?where[slug][equals]=${slugOrId}`)
  if (res.docs?.length > 0) return res.docs[0].id
  throw new Error(`Kategorija "${slugOrId}" nije pronađena.`)
}
```

- [ ] **Step 2: Razriješiti efektivnu kategoriju po proizvodu u main()**

U `main()`, prije petlje za podkategorije, zamijeniti blok koji gradi `subcategoryMap`. Najprije izgraditi mapu kategorija i pridružiti svakom proizvodu efektivni catId:

```js
// Razriješi efektivnu kategoriju po proizvodu (override > --category-id)
const defaultCategoryId = await getCategoryId(token, categoryId)
const categoryMap = {}
for (const p of manifest) {
  if (p.skipUpload) continue
  const key = p.category ?? defaultCategoryId
  if (categoryMap[key] === undefined) categoryMap[key] = await getCategoryId(token, key)
  p._catId = categoryMap[key]
}

// Collect unique subcategories (po kategoriji)
const subcategoryMap = {}
for (const p of manifest) {
  if (p.skipUpload || !p.subcategory) continue
  const mapKey = `${p._catId}:${p.subcategory}`
  if (subcategoryMap[mapKey] === undefined) {
    subcategoryMap[mapKey] = await getSubcategoryId(token, p.subcategory, p._catId)
    console.log(`📂 Podkategorija "${p.subcategory}" (cat ${p._catId}, id: ${subcategoryMap[mapKey]})`)
  }
}
```

- [ ] **Step 3: Koristiti efektivnu kategoriju pri kreiranju proizvoda**

U petlji koja kreira proizvode zamijeniti retke koji računaju `subcategoryId` i zovu `createProduct`:

```js
const manufacturerId = manufacturerMap[product.manufacturer]
const mediaId = await uploadImage(token, outPath, product.filename, product.name)
const subcategoryId = product.subcategory ? subcategoryMap[`${product._catId}:${product.subcategory}`] : null
const result = await createProduct(token, product, product._catId, manufacturerId, mediaId, subcategoryId)
```

- [ ] **Step 4: Provjeriti da je `--dry-run` i dalje funkcionalan i prikazuje kategoriju**

U `DRY_RUN` granu, u ispis dodati redak za kategoriju (odmah nakon `slug`):

```js
console.log(`   category:    ${p.category ?? '(default --category-id)'}`)
```

- [ ] **Step 5: Sintaksna provjera**

Run: `node --check src/scripts/seed-from-manifest.mjs`
Expected: bez izlaza (exit 0).

- [ ] **Step 6: Commit**

```bash
git add src/scripts/seed-from-manifest.mjs
git commit -m "feat(seed): per-product category override u manifest uploaderu"
```

---

### Task 2: Generirati i očistiti skeleton manifest

**Files:**
- Create: `src/scripts/syngenta-manifest.json`

**Interfaces:**
- Produces: `syngenta-manifest.json` — niz objekata s `filename`, `name`, `slug`, `manufacturer: "Syngenta"` i poljima `description/activeIngredients/mainUses` = `"TODO"`; `category`/`subcategory` dodaju se u kasnijim taskovima.

- [ ] **Step 1: Generirati skeleton**

```bash
node src/scripts/make-manifest.mjs \
  --dir "/Users/marinoroz/Documents/OrozDigital/materijali/dobavljaci/syngenta/slike" \
  --manufacturer "Syngenta" \
  --out src/scripts/syngenta-manifest.json
```

Expected: ispis pronađenih datoteka i njihovih izvučenih naziva.

- [ ] **Step 2: Ručno očistiti nazive i ukloniti `.psd`/duplikate**

Urediti `syngenta-manifest.json` tako da:
- Naziv svakog proizvoda bude čist, bez veličine pakiranja (npr. `"Ouragan System 4"`, `"Amistar Gold"`, `"Karate Zeon"`).
- Ukloniti unos za `7_ElumisPeak_ambalaza02.psd` (duplikat — koristi se `5_b_Elumis Peak.png`).
- Unos `38b_KARATE ZEON_25ml...` postaviti `"skipUpload": true` (isti proizvod kao 1L).
- `slug` uskladiti s očišćenim nazivom (lowercase, bez dijakritike, crtice).

- [ ] **Step 3: Provjera valjanosti JSON-a**

Run: `node -e "console.log(JSON.parse(require('fs').readFileSync('src/scripts/syngenta-manifest.json')).length + ' unosa')"`
Expected: ispiše broj unosa (~32 datoteke; ~31 aktivnih nakon skipUpload).

- [ ] **Step 4: Commit**

```bash
git add src/scripts/syngenta-manifest.json
git commit -m "chore(seed): skeleton Syngenta manifest (nazivi očišćeni)"
```

---

### Task 3: Popuniti podatke — Herbicidi

**Files:**
- Modify: `src/scripts/syngenta-manifest.json`

**Interfaces:**
- Consumes: skeleton iz Task 2.
- Produces: za svaki herbicid postavljeno `category: "zastita-bilja"`, `subcategory: "herbicidi"`, te popunjeni `description`, `activeIngredients`, `mainUses` (hrvatski).

Proizvodi: **Ouragan System 4, Axial, Calaris, Elumis Banvel, Elumis Peak, Filon**.

- [ ] **Step 1: Istražiti svaki proizvod**

Za svaki: dohvatiti s FIS registra (`fis.mps.hr`) i/ili Syngenta HR aktivne tvari, dozvoljene kulture i primjenu. Zabilježiti izvor. Nesigurne podatke označiti komentarom u opisu ("⚠️ provjeriti").

- [ ] **Step 2: Upisati u manifest**

Za svaki herbicid postaviti polja, npr.:

```json
{
  "filename": "13_Ouragan1.jpg",
  "name": "Ouragan System 4",
  "slug": "ouragan-system-4",
  "manufacturer": "Syngenta",
  "category": "zastita-bilja",
  "subcategory": "herbicidi",
  "description": "Neselektivni herbicid za suzbijanje jednogodišnjih i višegodišnjih korova.",
  "activeIngredients": "glifosat 360 g/L (u obliku kalijeve soli)",
  "mainUses": "Primjena na strništima, u voćnjacima i vinogradima te na nepoljoprivrednim površinama."
}
```

(Elumis Banvel i Elumis Peak su co-pack proizvodi — opisati kao kombinaciju dvaju herbicida.)

- [ ] **Step 3: Validacija JSON-a**

Run: `node -e "JSON.parse(require('fs').readFileSync('src/scripts/syngenta-manifest.json'))"`
Expected: bez greške.

- [ ] **Step 4: Commit**

```bash
git add src/scripts/syngenta-manifest.json
git commit -m "data(seed): popunjeni herbicidi (Syngenta)"
```

---

### Task 4: Popuniti podatke — Fungicidi

**Files:**
- Modify: `src/scripts/syngenta-manifest.json`

**Interfaces:**
- Produces: za svaki fungicid `category: "zastita-bilja"`, `subcategory: "fungicidi"`, popunjeni hrvatski podaci.

Proizvodi: **Amistar Gold, Ampexio, Dynali, Elatus Era, Magnello, Orondis Forte pack, Orondis Ultra, Ortiva Top, Pergado F, Quadris, Revus, Universalis, Switch, Topas, Ridomil Gold R, Taegro, Nordox**.

- [ ] **Step 1: Istražiti svaki proizvod (FIS + Syngenta HR)**

Posebno provjeriti: **Ridomil Gold R** (točan sastav — metalaksil-M + bakar), **Taegro** (biofungicid, *Bacillus amyloliquefaciens*), **Nordox** (bakreni oksid; proizvođač u CMS-u = Syngenta po uputi korisnika).

- [ ] **Step 2: Upisati u manifest**

Za svaki fungicid postaviti `category`, `subcategory: "fungicidi"`, `description`, `activeIngredients`, `mainUses`. Primjer:

```json
{
  "filename": "27_QUADRIS_100ml_327x712.png",
  "name": "Quadris",
  "slug": "quadris",
  "manufacturer": "Syngenta",
  "category": "zastita-bilja",
  "subcategory": "fungicidi",
  "description": "Sistemični fungicid širokog spektra djelovanja.",
  "activeIngredients": "azoksistrobin 250 g/L",
  "mainUses": "Suzbijanje gljivičnih bolesti u povrću, vinovoj lozi i ratarskim kulturama."
}
```

- [ ] **Step 3: Validacija JSON-a**

Run: `node -e "JSON.parse(require('fs').readFileSync('src/scripts/syngenta-manifest.json'))"`
Expected: bez greške.

- [ ] **Step 4: Commit**

```bash
git add src/scripts/syngenta-manifest.json
git commit -m "data(seed): popunjeni fungicidi (Syngenta)"
```

---

### Task 5: Popuniti podatke — Insekticidi + Ostalo

**Files:**
- Modify: `src/scripts/syngenta-manifest.json`

**Interfaces:**
- Produces: insekticidi (`subcategory: "insekticidi"`) i Moddus (`subcategory: "zastita-bilja-ostalo"`), svi `category: "zastita-bilja"`.

Proizvodi: **Affirm, Ampligo, Force, Karate Zeon** (insekticidi); **Moddus** (regulator rasta → ostalo).

- [ ] **Step 1: Istražiti (FIS + Syngenta HR)**

Karate Zeon — koristiti jedan unos (1L); 25ml ostaje `skipUpload`. Moddus — trineksapak-etil, regulator rasta žitarica.

- [ ] **Step 2: Upisati u manifest**

Primjer (Moddus → ostalo):

```json
{
  "filename": "40_Moddus250.png",
  "name": "Moddus",
  "slug": "moddus",
  "manufacturer": "Syngenta",
  "category": "zastita-bilja",
  "subcategory": "zastita-bilja-ostalo",
  "description": "Regulator rasta za sprječavanje polijeganja žitarica.",
  "activeIngredients": "trineksapak-etil 250 g/L",
  "mainUses": "Primjena u pšenici, ječmu, raži i drugim žitaricama za jačanje stabljike."
}
```

- [ ] **Step 3: Validacija JSON-a**

Run: `node -e "JSON.parse(require('fs').readFileSync('src/scripts/syngenta-manifest.json'))"`
Expected: bez greške.

- [ ] **Step 4: Commit**

```bash
git add src/scripts/syngenta-manifest.json
git commit -m "data(seed): popunjeni insekticidi + ostalo (Syngenta)"
```

---

### Task 6: Popuniti podatke — Biostimulatori (Gnojiva)

**Files:**
- Modify: `src/scripts/syngenta-manifest.json`

**Interfaces:**
- Produces: Isabion, Megafol, Vixeran s `category: "gnojiva"` i `subcategory: "biostimulatori"`.

- [ ] **Step 1: Istražiti (Syngenta HR — nisu u FIS SZB registru)**

Isabion (aminokiseline), Megafol (aminokiseline/biostimulator protiv stresa), Vixeran (*Azotobacter salinestris*, mikrobiološki biostimulator za fiksaciju dušika).

- [ ] **Step 2: Upisati u manifest**

```json
{
  "filename": "1_Isabion_1l.png",
  "name": "Isabion",
  "slug": "isabion",
  "manufacturer": "Syngenta",
  "category": "gnojiva",
  "subcategory": "biostimulatori",
  "description": "Biostimulator na bazi aminokiselina i peptida za jačanje i oporavak biljaka.",
  "activeIngredients": "slobodne aminokiseline i peptidi",
  "mainUses": "Folijarna primjena u voću, povrću i ratarskim kulturama za smanjenje stresa i poticanje rasta."
}
```

- [ ] **Step 3: Validacija JSON-a**

Run: `node -e "JSON.parse(require('fs').readFileSync('src/scripts/syngenta-manifest.json'))"`
Expected: bez greške.

- [ ] **Step 4: Commit**

```bash
git add src/scripts/syngenta-manifest.json
git commit -m "data(seed): popunjeni biostimulatori → Gnojiva (Syngenta)"
```

---

### Task 7: Riješiti sliku Elumis Banvel (.psd)

**Files:**
- Create: konvertirana slika (npr. `5-elumis-banvel-pakiranje.png`) u istom folderu ILI ažuriranje `filename` u manifestu.

**Interfaces:**
- Consumes: `5-elumis-banvel-pakiranje.psd`.
- Produces: rasterska slika koju `sharp` može pročitati, te ažuriran `filename` za Elumis Banvel unos.

- [ ] **Step 1: Pokušati konverziju psd→png (macOS `sips`)**

```bash
sips -s format png "/Users/marinoroz/Documents/OrozDigital/materijali/dobavljaci/syngenta/slike/5-elumis-banvel-pakiranje.psd" --out "/Users/marinoroz/Documents/OrozDigital/materijali/dobavljaci/syngenta/slike/5-elumis-banvel-pakiranje.png"
```

Expected: kreiran `.png`. Ako `sips` ne uspije, probati `magick` (ImageMagick); ako ni to, označiti Elumis Banvel `skipUpload: true` i javiti korisniku da treba zamjenska slika.

- [ ] **Step 2: Ažurirati `filename` u manifestu**

Promijeniti `filename` Elumis Banvel unosa na `"5-elumis-banvel-pakiranje.png"`.

- [ ] **Step 3: Provjeriti da je slika čitljiva**

Run: `node -e "import('sharp').then(s=>s.default('/Users/marinoroz/Documents/OrozDigital/materijali/dobavljaci/syngenta/slike/5-elumis-banvel-pakiranje.png').metadata().then(m=>console.log(m.width+'x'+m.height)))"`
Expected: ispis dimenzija (ili poruka da je preskočeno).

- [ ] **Step 4: Commit**

```bash
git add src/scripts/syngenta-manifest.json
git commit -m "fix(seed): rasterska slika za Elumis Banvel"
```

---

### Task 8: Dry-run pregled, upload i verifikacija

**Files:**
- Uses: `src/scripts/seed-from-manifest.mjs`, `src/scripts/syngenta-manifest.json`

**Interfaces:**
- Consumes: završeni manifest + izmijenjeni uploader.

- [ ] **Step 1: Provjera da nema preostalih TODO polja**

Run: `node -e "const m=JSON.parse(require('fs').readFileSync('src/scripts/syngenta-manifest.json')); const t=m.filter(p=>!p.skipUpload&&(p.description==='TODO'||p.activeIngredients==='TODO'||p.mainUses==='TODO')); console.log(t.length?('TODO:'+t.map(p=>p.name).join(', ')):'OK')"`
Expected: `OK`.

- [ ] **Step 2: Dry-run**

```bash
node src/scripts/seed-from-manifest.mjs \
  --manifest src/scripts/syngenta-manifest.json \
  --images-dir "/Users/marinoroz/Documents/OrozDigital/materijali/dobavljaci/syngenta/slike" \
  --category-id 3 \
  --dry-run
```

Expected: za svaki proizvod ispis kategorije/podkategorije i statusa slike (✅). Biostimulatori prikazuju `category: gnojiva`. Bez `❌ NIJE PRONAĐENA`.

- [ ] **Step 3: Korisnikov pregled tablice**

Predati korisniku sažetak (naziv → kategorija → podkategorija → aktivna tvar) i pričekati odobrenje. Posebno istaknuti unose označene "⚠️ provjeriti".

- [ ] **Step 4: Upload na produkciju**

```bash
ADMIN_EMAIL='<email>' ADMIN_PASSWORD='<lozinka>' node src/scripts/seed-from-manifest.mjs \
  --manifest src/scripts/syngenta-manifest.json \
  --images-dir "/Users/marinoroz/Documents/OrozDigital/materijali/dobavljaci/syngenta/slike" \
  --category-id 3
```

Expected: sažetak na kraju — `✅ Uspješno kreirano: ~31`, `❌ Greške: 0`.

- [ ] **Step 5: Verifikacija preko API-ja**

Run: `curl -s "https://orozpharm.hr/api/products?where[manufacturer][equals]=3&limit=100&depth=1" | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{const j=JSON.parse(d);console.log('Ukupno:',j.totalDocs);})"`
Expected: broj odgovara broju uploadanih proizvoda.

- [ ] **Step 6: Vizualna provjera u /admin**

Otvoriti `https://orozpharm.hr/admin` → Proizvodi, filtrirati po Syngenta, provjeriti slike, kategorije i opise na nekoliko nasumičnih unosa.

---

## Self-Review

**Spec coverage:** Per-product category (Task 1) ✓; skeleton + čišćenje (Task 2) ✓; klasifikacija herbicidi/fungicidi/insekticidi/ostalo/biostimulatori (Tasks 3–6) ✓; psd/duplikati (Task 2 + Task 7) ✓; dry-run + upload + verifikacija (Task 8) ✓; hrvatski + bez veličine pakiranja (Global Constraints, primjeri) ✓.

**Placeholder scan:** `"TODO"` u manifestu je namjeran međukorak; Task 8 Step 1 eksplicitno provjerava da ih nema prije uploada. Nema "TBD"/"implement later" u koracima.

**Type consistency:** `getCategoryId`, `categoryMap`, `subcategoryMap` keyiran po `"${catId}:${subSlug}"`, `product._catId` — dosljedno korišteni u Task 1 koracima 1–3 i u Task 8.
