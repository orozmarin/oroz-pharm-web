# Syngenta — uvoz proizvoda u Payload CMS

**Datum:** 2026-06-23
**Status:** Dizajn (čeka odobrenje)

## Cilj

Uvesti ~31 Syngenta proizvod (sredstva za zaštitu bilja + biostimulatori) u Payload CMS
na produkciji (orozpharm.hr), sa slikama iz dostavljenog foldera, ispravnom kategorijom/
podkategorijom, proizvođačem Syngenta i kratkim hrvatskim opisom + aktivnim tvarima +
primjenom verificiranim iz službenih izvora (FIS registar, Syngenta HR).

Folder slika:
`/Users/marinoroz/Documents/Oroz-web/partneri/Syngenta/slike_ proizvoda_Syngenta_za Oroz Pharm_26/slike_ proizvoda_Syngenta_za Oroz Pharm_26`

## Pristup

Iskoristiti postojeći, dokazani pipeline — **bez automatskog FIS scrapera** (FIS je JS SPA
bez javnog API-ja; nepouzdano + biostimulatori ionako nisu u registru):

1. `make-manifest.mjs` generira skeleton manifest iz naziva datoteka.
2. **Istraživanje (ručno/AI):** za svaki proizvod dohvatiti s FIS-a + Syngenta HR:
   `description`, `activeIngredients`, `mainUses`, te odrediti `category` + `subcategory`.
   Sve **na hrvatskom**. Veličina pakiranja se NE navodi u nazivu.
3. Pregled korisnika (dry-run + tablica).
4. `seed-from-manifest.mjs` upload na produkciju.

### Jedina izmjena koda

Proizvodi pokrivaju **dvije kategorije** (Zaštita bilja id 3 i Gnojiva id 2), a
`seed-from-manifest.mjs` trenutno prima samo jedan `--category-id`. Dodaje se **opcionalno
polje `category` po proizvodu u manifestu** (slug ili id), s fallbackom na `--category-id`.
Promjena je mala i unatrag kompatibilna:
- `getSubcategoryId` se poziva s efektivnom kategorijom proizvoda (ne globalnom).
- `createProduct` koristi efektivnu kategoriju proizvoda.

Ništa drugo u uploaderu se ne mijenja (login, obrada slika, getOrCreateManufacturer,
dedup po slugu ostaju isti).

## Ključni ID-evi (provjereno na živom API-ju)

| Entitet | id |
|---|---|
| Kategorija "Zaštita bilja" | 3 |
| Kategorija "Gnojiva" | 2 |
| Proizvođač "Syngenta" (postoji) | 3 |
| Podkat. herbicidi | 11 |
| Podkat. fungicidi | 12 |
| Podkat. insekticidi | 13 |
| Podkat. zastita-bilja-ostalo ("Ostalo") | 16 |
| Podkat. biostimulatori (pod Gnojiva) | 8 |

U manifestu se podkategorija referencira po **slugu** (`herbicidi`, `fungicidi`,
`insekticidi`, `zastita-bilja-ostalo`, `biostimulatori`); uploader razriješi id.

## Klasifikacija proizvoda

Svi proizvođač = **Syngenta**. Aktivne tvari/primjena popunjavaju se u fazi istraživanja.

### Zaštita bilja (category: zastita-bilja)

**Herbicidi** — Ouragan, Axial, Calaris, Elumis Banvel (co-pack), Elumis Peak (co-pack), Filon

**Fungicidi** — Amistar Gold, Ampexio, Dynali, Elatus Era, Magnello, Orondis Forte pack,
Orondis Ultra, Ortiva Top, Pergado F, Quadris, Revus, Universalis, Switch, Topas,
Ridomil Gold R, Taegro, **Nordox** (proizvođač: Syngenta — po uputi korisnika)

**Insekticidi** — Affirm, Ampligo, Force, Karate Zeon

**Ostalo (zastita-bilja-ostalo)** — Moddus (regulator rasta)

### Gnojiva (category: gnojiva) → Biostimulatori

Isabion, Megafol, Vixeran

## Rubni slučajevi

| Datoteka / slučaj | Rješenje |
|---|---|
| `7_ElumisPeak_ambalaza02.psd` | Duplikat Elumis Peak (postoji `5_b_Elumis Peak.png`). Ignorirati psd. |
| `5_Elumis Banvel_pakiranje.psd` | Jedina slika za Elumis Banvel. Pokušaj konverzije psd→png (`sips`/ImageMagick); ako ne uspije, označiti i tražiti zamjensku sliku. |
| `38_KARATE ZEON_1L` + `38b_KARATE ZEON_25ml` | Isti proizvod (veličina pakiranja nebitna). Koristi jednu sliku (1L); drugu ne unositi (`skipUpload`). |
| `.psd` općenito | `sharp` ne čita PSD; uploader ih preskače/zahtijeva png. |

## Format manifesta (po proizvodu)

```json
{
  "filename": "13_Ouragan1.jpg",
  "name": "Ouragan System 4",
  "slug": "ouragan-system-4",
  "manufacturer": "Syngenta",
  "category": "zastita-bilja",
  "subcategory": "herbicidi",
  "description": "Hrvatski kratki opis...",
  "activeIngredients": "glifosat ...",
  "mainUses": "primjena / kulture ..."
}
```

`category` izostavljen → koristi se `--category-id` default. Za biostimulatore se eksplicitno
postavlja `"category": "gnojiva"`.

## Kvaliteta podataka

- Riječ je o pesticidima — netočna aktivna tvar/primjena je stvarni rizik. Svaki podatak
  verificira se iz službenog izvora; ništa se ne izmišlja. Nesigurni podaci se označe za
  korisnikovu provjeru prije uploada.
- Svi tekstovi na hrvatskom. Bez veličine pakiranja u nazivu proizvoda.

## Koraci izvođenja

1. (kod) Dodati per-product `category` override u `seed-from-manifest.mjs`.
2. Generirati skeleton manifest (`make-manifest.mjs`), ručno počistiti nazive i duplikate.
3. Istražiti i popuniti podatke za svih ~31 proizvod.
4. Riješiti psd (Elumis Banvel) i Karate Zeon duplikat.
5. `--dry-run` + tablica korisniku na pregled.
6. Upload na produkciju (`seed-from-manifest.mjs`, ADMIN_EMAIL/PASSWORD korisnika).
7. Verifikacija u /admin.

## Deliverables

- `syngenta-manifest.json` (popunjen, verificiran)
- Izmijenjeni `seed-from-manifest.mjs` (per-product category)
- (po potrebi) konvertirana slika za Elumis Banvel

## Izvan opsega

- Automatski FIS scraper.
- Nove kolekcije/podkategorije (sve potrebne već postoje).
- Veličine pakiranja kao zaseban entitet.
