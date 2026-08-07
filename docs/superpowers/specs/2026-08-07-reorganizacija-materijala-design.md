# Reorganizacija materijala Oroz PHARM — design

Datum: 2026-08-07

## Problem

Materijali za web i marketing žive u dva odvojena stabla u `~/Documents`:

- **`Oroz-web/`** — 1,1 GB, 655 datoteka. Materijali dobavljača (`partneri/`, 15 mapa + 7 `.txt`
  bilješki), gotovi web assetovi (`perad/` sa slug-imenima), vlastite fotke (`vlastito/`), blog.
- **`Oroz-marketing/`** — 2,1 GB, 219 datoteka. Uglavnom sirov materijal (58 HEIC, 11 videa),
  28 mapa u istoj razini, `logo/`, `partneri/` (24 logotipa), `objave/{posts,reels,story}`.

Četiri konkretna problema:

1. **`partneri/` postoji u oba stabla i znači različite stvari** — u `Oroz-web` su to fotografije
   proizvoda po dobavljaču, u `Oroz-marketing` ravna mapa s 24 logotipa.
2. **Isti dobavljač je rasut po tri mjesta.** Petrokemija: `Oroz-web/partneri/PETROKEMIJA.txt`,
   `Oroz-marketing/partneri/petrokemija-kutina.png`, `Oroz-marketing/insekticidi/Petrokemija/`.
3. **28 mapa u `Oroz-marketing` miješa četiri logike** — kategoriju asortimana (`zaštita`, `sjeme`),
   brand (`Plantella`, `Slavol`), sezonu (`kolinje`, `pirotehnika`) i poslovnicu (`Pleternica`).
4. **Imena s dijakritikom i razmacima lome shell.** Najgori slučaj:
   `Oroz-web/partneri/Syngenta/slike_ proizvoda_Syngenta_za Oroz Pharm_26/slike_ proizvoda_Syngenta_za Oroz Pharm_26/`
   — dvostruko ugniježđeno isto ime, s razmakom iza donje crte, citirano doslovno na 5 mjesta
   u `docs/superpowers/plans/2026-06-23-syngenta-import.md`.

Provjereno: **nema duplikata** između dva stabla. Usporedba imena svih datoteka daje samo
`.DS_Store`. Pleternica fotke u `Oroz-web/vlastito/pleternica/` (23 kom) i `Oroz-marketing/Pleternica/`
(5 kom) su različita snimanja, ne kopije.

## Odluke

| Pitanje | Odluka |
|---|---|
| Primarni ključ pretrage | **Dobavljač** — otuda se najčešće kreće |
| Korijen | `~/Documents/OrozDigital/materijali/`, uz `oroz-pharm` repozitorij |
| Vlastiti materijal | Po **kategoriji asortimana**, uz `poslovnice/` i `objave/` |
| Sirovo vs gotovo | **Ne razdvaja se** posebnim slojem mapa |
| Dobavljači | **Registar** — jedna mapa po dobavljaču, uvijek, i kad sadrži samo logotip |
| Imenovanje | **ASCII slug** za sve mape i datoteke |

## Ciljna struktura

```
Documents/OrozDigital/
├─ oroz-pharm/                     ← Next.js + Payload repozitorij, ne dira se
└─ materijali/
   ├─ CLAUDE.md                    ← pravilo razvrstavanja i konvencija imenovanja
   ├─ dobavljaci/
   │  ├─ dobavljaci.numbers        ← bivši Dobavljac.numbers, indeks registra
   │  └─ <slug>/
   │     ├─ logo.png | logo.svg
   │     ├─ biljeske.txt           ← bivši <DOBAVLJAČ>.txt
   │     ├─ stanje-zalihe.xlsx
   │     ├─ popis-za-marketing.xlsx
   │     ├─ manifest.json
   │     ├─ showcase.json
   │     └─ slike/
   ├─ vlastito/
   │  ├─ asortiman/<kategorija>/
   │  ├─ poslovnice/{pleternica,pozega}/
   │  ├─ objave/{posts,reels,story,blog,oglasi}/
   │  └─ web/
   └─ brand/
```

Nijedna mapa ni datoteka nema dijakritiku, razmak ni velika slova u imenu.

### Konvencija imena unutar mape dobavljača

Datoteke se preimenuju u fiksne nazive gdje god postoji jasan parnjak, jer skripte i
`supplier-sheet` skill onda ne moraju pogađati:

| Bilo | Postaje |
|---|---|
| `Stanje_zalihe Medin san.xlsx` | `stanje-zalihe.xlsx` |
| `Medin_san_popis_za_marketing.xlsx` | `popis-za-marketing.xlsx` |
| `medin-manifest.json` | `manifest.json` |
| `medin-showcase.json` | `showcase.json` |
| `PETROKEMIJA.txt` | `biljeske.txt` |
| `petrokemija-kutina.png` | `logo.png` |

Datoteke bez parnjaka zadržavaju svoj naziv, samo slugificiran:
`Ritosa_popis_za_marketing_full.xlsx` → `popis-za-marketing-full.xlsx`,
`Vinkoprom - popis artikala.docx` → `popis-artikala.docx`,
`ZELENI HIT.docx` → `zeleni-hit.docx`.

Podmape s materijalima spajaju se u `slike/`. Dvostruko gniježđenje kod Syngente se
poravnava: `slike_ proizvoda_Syngenta_za Oroz Pharm_26/slike_ proizvoda_Syngenta_za Oroz Pharm_26/*`
→ `dobavljaci/syngenta/slike/*`. Iznimka su podmape koje nose značenje — `KWS/{Bez labela,Label}`
→ `slike/{bez-labela,label}`, `Bayer/{Slanje,compressed}` → `slike/{slanje,compressed}` — one ostaju.

## Pravilo razvrstavanja

**Podrijetlo odlučuje, ne brand.**

- Fotografija koju je snimio netko iz Oroz PHARM-a → `vlastito/`, čak i ako je na njoj
  proizvod dobavljača.
- Materijal koji je dobavljač isporučio → `dobavljaci/<slug>/`, čak i ako je naknadno obrađen.

Praktični signal za razvrstavanje zatečenog materijala:

| Uzorak imena | Podrijetlo |
|---|---|
| `IMG_*.HEIC`, `IMG_*.JPEG`, `IMG_2024*` | vlastito |
| `WhatsApp Image *`, `WhatsApp Video *` | vlastito |
| Čisto ime proizvoda — `NPK 15-15-15.jpg`, `DKC4943.png`, `UREA N 46.jpg` | dobavljač |
| Dimenzije u imenu — `*_1000x1000.png`, `*_1080x1080_*.png`, `*_400x135.png` | dobavljač |
| `FB COVER *`, `*_Banner_*`, `*Letak*` | dobavljač |

Signal je heuristika za jednokratnu migraciju, ne trajno pravilo. Trajno pravilo je podrijetlo;
kad heuristika ne odlučuje, materijal ide na popis za ručnu provjeru (odjeljak „Otvorena pitanja").

## Registar dobavljača

> **Napomena:** brojke niže su ispravljene odlukama donesenim u Tasku 1 — vidi
> `src/scripts/migracija-materijala/odluke.md`. Stvarno stanje registra: **40 mapa, 24 s
> logotipom** (ne 41 / 17 kako stoji ispod — `tora` i `elixir` nisu zasebni dobavljači, brand su
> `agrochem-maks` i `zito`; dodan je `unichem-agro`, koji ovaj popis ne navodi).

41 mapa. Skupine po tome što se u njih slijeva.

### Iz mape s materijalima (14)

`agrochem-maks`, `basf`, `bayer`, `bejo`, `kws`, `kony`, `medin-san`, `navigator`, `ritosa`,
`sano`, `syngenta`, `vinkoprom`, `zeleni-hit`, `zito`

Izvor: `Oroz-web/partneri/<Ime>/`. Sedam ih usput dobiva logotip iz `Oroz-marketing/partneri/`:

| Slug | Logotip | Napomena |
|---|---|---|
| `basf` | `basf.png` | |
| `bayer` | `bayer.png` | |
| `medin-san` | `Medin_san_logo.png` | |
| `ritosa` | `brati_ritosa.png` | mapa je `Ritoša`, xlsx nosi „Brati Ritoša" |
| `sano` | `sano.png` | |
| `syngenta` | `syngenta.png` | `SYNGENTA.txt` iz iste mape → `biljeske.txt` |
| `navigator` | — | `NAVIGATOR.txt` iz iste mape → `biljeske.txt` |

### Iz `.txt` bilješke (7)

| Slug | Izvor | Dodatno |
|---|---|---|
| `bc` | `BC.txt` | |
| `colic-trade` | `COLIĆ TRADE.txt` | |
| `elixir` | `ELIXIR.txt` | vidi Otvorena pitanja |
| `novag` | `NOVAG.txt` | |
| `patent` | `PATENT.txt` | |
| `pdsjemena` | `PDSJEMENA.txt` | |
| `petrokemija` | `PETROKEMIJA.txt` | + `petrokemija-kutina.png` → `logo.png`, + `Oroz-marketing/insekticidi/Petrokemija/*` → `slike/` |

### Samo logotip (17)

`adria-flora`, `atlantic-trade`, `brgarden`, `chromos-agro`, `clause`, `corteva`, `dekalb`,
`klasmann-deilmann`, `koka`, `piliko`, `rijk-zwaan`, `salva`, `santaj`, `tick`, `timac-agro`,
`tora`, `vindija`

Svaka sadrži samo `logo.png` (`timac-agro` → `logo.svg`, `vindija.svg.png` → `logo.png`).
Iznimka: `dekalb` dodatno dobiva `Oroz-marketing/kukuruz/Dekalb/DKC4943.png` → `slike/`.

Prazne-ali-postojeće mape su namjerne: registar je popis **svih** partnera. (Traka logotipa
na webu, `BrandMarquee.tsx`, poslužuje se iz tvrdo kodiranog niza u `public/images/brands/` —
neovisno o ovom stablu; vidi napomenu na vrhu odjeljka „Registar dobavljača".)

### Novi, iz materijala u `Oroz-marketing` (3)

| Slug | Izvor | Zašto dobavljač |
|---|---|---|
| `plantella` | `Oroz-marketing/Plantella/` | `FB COVER NATECAJ_BIOGRENA_150res.png`, `Biogrena_povecava_urod_1000x1000.png`, `Organsko_povecava_urod_1500x500.png` — Unichemove kreative |
| `orion` | `Oroz-marketing/pirotehnika/HRV-Orion-Letak2024-SPREAD_compressed.pdf` + `ilovepdf_pages-to-jpg/` | letak dobavljača i njegov rasterizirani ispis |
| `podravka` | `Oroz-marketing/podravka.jpeg` | slobodna datoteka na vrhu stabla |

## Vlastiti materijal

### `vlastito/asortiman/`

Slugificirane postojeće mape iz `Oroz-marketing`, minus ono što je otišlo dobavljačima:

`biostimulatori`, `florabella`, `insekticidi`, `kolinje`, `kosilice`, `krumpir`, `kukuruz`,
`lampioni`, `ljubimci`, `lucica`, `navodnjavanje`, `nikafert`, `perad`, `pcelarstvo`,
`plin`, `ptice`, `sadnice`, `sjeme`, `slavol`, `stocna-hrana`, `vinarstvo`,
`za-vrt`, `zastita`

Napomene:

- `florabella` i `slavol` **ostaju vlastito** — sadržaj je `IMG_05xx.HEIC`, fotografije tih
  proizvoda snimljene u trgovini. Brand u imenu ne čini ih materijalom dobavljača.
- `kukuruz/PoljInOS/` ostaje vlastito iz istog razloga (`IMG_1937.HEIC`, `IMG_2172.HEIC`,
  `WhatsApp Image 2024-04-02*`) → `asortiman/kukuruz/poljinos/`.
- `kukuruz/Dekalb/` se **dijeli**: `DKC4943.png` → `dobavljaci/dekalb/slike/`,
  `WhatsApp Image 2024-04-08*.jpeg` → `asortiman/kukuruz/`.
- `pirotehnika/` **nestaje kao kategorija.** Svih 18 datoteka su Orionov letak — 1 PDF i
  17 rasteriziranih stranica u `ilovepdf_pages-to-jpg/`. Sve ide u `dobavljaci/orion/`,
  u `vlastito/` ne ostaje ništa. Kategorija se vraća kad se snimi vlastiti materijal.
- `perad` dolazi iz `Oroz-web/perad/` — gotovi slug-imenovani assetovi (`hero.jpg`,
  `jednodnevna-patka.jpg`, …) i `kandidati/` s A/B/C varijantama i `kandidati.tsv`.
  Postojeća podmapa `kandidati/` se zadržava; nova razina sirovo/gotovo se **ne** uvodi.
- `pcelarstvo` dolazi iz `Oroz-web/vlastito/web/pcelarstvo-hero.jpg`.

### `vlastito/poslovnice/`

| Ciljna mapa | Izvori |
|---|---|
| `pleternica/` | `Oroz-web/vlastito/pleternica/` (23 datoteke) + `Oroz-marketing/Pleternica/` (5) |

Mapa za Požegu se **ne** stvara — nema nijedne fotografije te poslovnice. Renderi oglasa za
Požegu idu u `objave/oglasi/`, gdje im je i mjesto. Prazne mape se ne stvaraju nigdje osim u
registru dobavljača, gdje su nositelj informacije „ovo je naš partner".

### `vlastito/objave/`

| Ciljna mapa | Izvor | Kom. |
|---|---|---|
| `posts/` | `Oroz-marketing/objave/posts/` | 26 |
| `reels/` | `Oroz-marketing/objave/reels/` | 4 |
| `story/` | `Oroz-marketing/objave/story/` | 9 |
| `blog/dani-lubenica-soljani-2026/` | `Oroz-web/blog/Dani lubenica Soljani 2026./` | 3 |
| `oglasi/` | `Oroz-marketing/Oroz Pharm Pleternica-Pozega solo + 916/` | 4 mp4 |

`oglasi/` sadrži gotove renderirane oglase u dva formata (16:9 i 9:16) za obje poslovnice.
Imena se slugificiraju: `oroz pharm pleternica 9 16 render 2.2.mp4` →
`pleternica-9x16-render-2-2.mp4`.

### `vlastito/web/`

Materijal vezan uz stranicu, a ne uz kategoriju asortimana:
`Oroz-web/vlastito/web/products-hero.jpg`, `Oroz-web/vlastito/orozpharm-web-rec.mp4`.

### `vlastito/obrada/`

`Oroz-marketing/editing/za_blur.jpeg` — radna datoteka u tijeku.

## `brand/`

Iz `Oroz-marketing/logo/`: `Oroz PHARM.svg` → `oroz-pharm.svg`, `logo-oroz.png`,
`logo-oroz.jpeg`, `oroz.jpg`, `oroz_background.jpeg` → `oroz-background.jpeg`,
`logo-croatia_checkered.png` → `logo-croatia-checkered.png`, `logo_croatia_rect.svg` →
`logo-croatia-rect.svg`.

`Oroz-marketing/logo/kolinje/` je **prazna** — ne prenosi se.

## Migracija

Kopiranje, ne premještanje. Stara stabla ostaju netaknuta do izričite potvrde.

1. `rsync -a` iz starih putanja u novo stablo, prema mapiranju iznad.
2. Preimenovanja u slugove i fiksne nazive.
3. **Provjera:** broj datoteka u novom stablu = 655 + 219 − 40 `.DS_Store` − 1 = **833**.
   Oduzeta jedinica je `Oroz-web/.claude/settings.local.json` — konfiguracija dopuštenja za
   rad u staroj mapi, koja s njom i prestaje vrijediti. Ne prenosi se.
   Zbroj veličina jednak starom (3,2 GB) unutar odstupanja za `.DS_Store`. Provjera da nijedna
   putanja u `materijali/` ne sadrži razmak, dijakritiku ni veliko slovo. Provjera da je skup
   veličina datoteka identičan — hvata slučaj da je preimenovanje pregazilo datoteku.
4. Tek nakon zelenog rezultata i potvrde korisnika — brisanje `Oroz-web/` i `Oroz-marketing/`.

`.DS_Store` (25 u web, 15 u marketing) se ne prenose. U `materijali/` ide `.gitignore` s
`.DS_Store`, iako stablo nije git repozitorij — radi budućnosti.

## Što se lomi

Ništa što Next.js builda — `Oroz-web` je namjerno izvan repozitorija
(`docs/superpowers/plans/2026-08-03-perad-kategorija.md:153`) i aplikacija ga ne čita.

Lome se apsolutne putanje u dokumentaciji projekta, ukupno 14 mjesta:

| Datoteka | Broj referenci |
|---|---|
| `docs/superpowers/plans/2026-06-23-syngenta-import.md` | 5 |
| `docs/superpowers/plans/2026-08-03-perad-kategorija.md` | 6, uključujući `IMG_DIR` u skripti (linija 268) |
| `docs/superpowers/specs/2026-06-23-syngenta-import-design.md` | 1 |
| `.claude/settings.local.json` | 2 unosa u `permissions.allow` |

Planovi i specovi su izvršeni, povijesni dokumenti. Ažuriraju se `sed`-om na nove putanje;
ne prepisuju se i ne mijenja im se sadržaj osim putanja. Promjena se navodi u commit poruci.

`.claude/settings.local.json` unosi (`Bash(file …/Oroz-marketing/partneri/*.png)`,
`Bash(sips … corteva.png petrokemija-kutina.png)`) postaju besmisleni jer te datoteke mijenjaju
i putanju i ime — brišu se, a ne prepisuju.

`~/.claude/skills/supplier-sheet/SKILL.md` ne sadrži apsolutne putanje — ne dira se.

## `materijali/CLAUDE.md`

Uz stablo ide kratak dokument da struktura preživi. Sadrži:

- pravilo razvrstavanja (podrijetlo, ne brand),
- konvenciju imenovanja (ASCII slug, fiksni nazivi u mapi dobavljača),
- postupak za novog dobavljača: `mkdir dobavljaci/<slug>`, `logo.*` odmah, ostalo kad stigne,
- vezu prema `supplier-sheet` skillu za obradu `stanje-zalihe.xlsx`.

## Otvorena pitanja

Šest stavki koje se ne mogu razvrstati iz imena datoteka. Rješavaju se vizualnim pregledom
prije migracije, ne nagađanjem.

1. **`nikafert/`** — `crveni.jpeg`, `narancasti.jpeg`, `plavi.jpeg`. Vlastita fotografija
   pakiranja ili dobavljačev render?
2. **`biostimulatori/`** — `fusion1L.jpeg`, `tora1L.jpeg`, `polyamin_bundle.jpeg`,
   `stimulatori.jpeg`. Isto pitanje; `tora1L` sugerira TORA-u.
3. **`navodnjavanje/`** — `crijevo.jpeg`, `lay_flat.jpeg`, `police.jpeg`, `rasprskivac.jpeg`.
   `police.jpeg` zvuči kao polica u trgovini (vlastito), ostalo kao katalog.
4. **`za vrt/`** — `cvijece.jpeg`, `jagode.jpeg`, `kosilice.jpeg`, `vani.jpeg` + jedan
   `WhatsApp Image` (taj je sigurno vlastit).
5. **`kosilice/`** — `1.png`, `2.png`, `3.png` uz `IMG_20240506_122343.jpg`. Brojevi ne govore
   ništa; `IMG_*` dio je sigurno vlastit.
6. **`insekticidi/`** — `Effect_Banner_Akcija_1080x1080_2026_HR.png` je po heuristici dobavljačev
   banner, ali nije jasno čiji je Effect. Uz njega dvije datoteke s UUID imenima
   (`c0123fdd-584a-42db-a17d-bbe5ef502621.JPEG`, `ea06be23-…JPEG`) — ime ne govori ništa,
   traže pogled.

Uz to, dvije nedoumice o identitetu dobavljača:

- **TORA** — postoji kao zaseban logotip (`tora.png`), kao `AgroChem Maks/RENDERI TORA AMBALAŽE/`
  i kao `objave/reels/TORA_reel.mp4`. Zaseban dobavljač ili AgroChemov brand? Spec zasad
  pretpostavlja **zaseban** (`dobavljaci/tora/`), jer ima vlastiti logotip u traci partnera.
- **Elixir** — `ELIXIR.txt` stoji samostalno, ali `Oroz-web/partneri/Žito/` sadrži
  `Elixir_20-30.png` i `Elixir_NPK_8-15-15.png`. Je li Elixir brand koji distribuira Žito?
  Spec zasad drži `elixir` i `zito` kao **odvojene** mape.

Obje pretpostavke su zabilježene kao pretpostavke; ako se pokažu netočnima, ispravak je
premještanje jedne mape.
