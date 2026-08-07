# Reorganizacija materijala Oroz PHARM — plan migracije

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Spojiti `~/Documents/Oroz-web` i `~/Documents/Oroz-marketing` u jedno stablo
`~/Documents/OrozDigital/materijali/` s registrom dobavljača, bez gubitka ijedne datoteke.

**Architecture:** Migracija je vođena deklarativnim mapiranjem (`mapiranje.tsv`) koje jedna
Python skripta izvršava. Skripta ne odlučuje ništa — svaka odluka o tome gdje što ide zapisana
je u TSV-u i može se pregledati prije izvršavanja. Nakon kopiranja slijedi prolaz slugifikacije
i tri neovisne provjere cjelovitosti. Stara stabla brišu se tek nakon zelene provjere i izričite
potvrde korisnika.

**Tech Stack:** Python 3 (stdlib), `rsync`, `shasum`. Bez novih ovisnosti.

## Global Constraints

- Spec: `docs/superpowers/specs/2026-08-07-reorganizacija-materijala-design.md`.
- Korijen odredišta: `/Users/marinoroz/Documents/OrozDigital/materijali`.
- Izvori: `/Users/marinoroz/Documents/Oroz-web`, `/Users/marinoroz/Documents/Oroz-marketing`.
- **Kopiranje, nikad premještanje.** Izvori ostaju netaknuti do Taska 8.
- **Očekivani broj datoteka na odredištu: 833.** (655 + 219 − 40 `.DS_Store` − 1 za
  `Oroz-web/.claude/settings.local.json`, koji se ne prenosi.)
- Nijedna putanja u `materijali/` ne smije sadržavati razmak, dijakritiku ni veliko slovo.
- Slugifikacija: `đ`/`Đ` → `d` eksplicitno (ne dekomponira se preko NFD), zatim NFD +
  odbacivanje kombinirajućih znakova, lowercase, `[^a-z0-9]+` → `-`, trim `-`. Ekstenzija se
  zadržava, lowercase.
- Provjereno na zatečenih 833 imena: **0 sudara, 0 praznih slugova.** Skripta svejedno mora
  prekinuti rad na sudaru — provjera vrijedi za današnje stanje, ne za buduće pokretanje.
- Sve skripte i međudatoteke idu u `src/scripts/migracija-materijala/`.
- Commitovi idu u `oroz-pharm` repozitorij. Repozitorij je trenutno na `main` — **prvi task
  otvara granu `reorganizacija-materijala`.**

---

## File Structure

| Datoteka | Odgovornost |
|---|---|
| `src/scripts/migracija-materijala/mapiranje.tsv` | Deklarativno mapiranje izvor → odredište. Jedini nositelj odluka. |
| `src/scripts/migracija-materijala/slug.py` | Funkcija `slugify(ime)`. Odvojena jer je testira Task 2 i koristi Task 5. |
| `src/scripts/migracija-materijala/migriraj.py` | Čita TSV, kopira, slugificira, zapisuje `preimenovanja.log`. |
| `src/scripts/migracija-materijala/provjeri.py` | Tri provjere cjelovitosti nakon kopiranja. |
| `src/scripts/migracija-materijala/test_slug.py` | Testovi za `slugify`. |
| `materijali/CLAUDE.md` | Pravilo razvrstavanja i konvencija, uz samo stablo. |

---

## Task 1: Razriješiti dvojbene mape

Šest mapa i dvije nedoumice o identitetu iz odjeljka „Otvorena pitanja" u specu. Bez ovoga
mapiranje u Tasku 3 ima rupe.

**Files:**
- Create: `src/scripts/migracija-materijala/odluke.md`

- [ ] **Step 1: Otvoriti granu**

```bash
cd /Users/marinoroz/Documents/OrozDigital/oroz-pharm
git checkout -b reorganizacija-materijala
```

- [ ] **Step 2: Otvoriti dvojbene datoteke u Previewu, grupu po grupu**

```bash
cd /Users/marinoroz/Documents/Oroz-marketing
open nikafert/*.jpeg
open biostimulatori/*.jpeg
open navodnjavanje/*.jpeg
open "za vrt"/*.jpeg
open kosilice/1.png kosilice/2.png kosilice/3.png
open insekticidi/Effect_Banner_Akcija_1080x1080_2026_HR.png \
     insekticidi/c0123fdd-584a-42db-a17d-bbe5ef502621.JPEG \
     insekticidi/ea06be23-249b-4b2a-b830-09acdcaf7f38.JPEG
```

- [ ] **Step 3: Pitati korisnika za svaku grupu**

Za svaku od šest grupa jedno pitanje: **vlastita fotografija ili dobavljačev materijal?**
Ako dobavljačev — koji dobavljač. Odgovor „ne znam" znači `vlastito/` (sigurniji smjer:
materijal ostaje naš, ne pripisuje se krivom partneru).

Uz to dva pitanja o identitetu:
- **TORA** — zaseban dobavljač ili brand AgroChem Maksa?
- **Elixir** — zaseban dobavljač ili brand koji distribuira Žito?

- [ ] **Step 4: Zapisati odluke**

`odluke.md`, jedan redak po grupi u obliku
`<izvorna putanja> → <odredište> (razlog, jednom rečenicom)`.
Ovo je dokaz da odluka postoji i zašto, kad se za pola godine bude pitalo.

- [ ] **Step 5: Commit**

```bash
git add src/scripts/migracija-materijala/odluke.md
git commit -m "docs: odluke o razvrstavanju dvojbenih mapa"
```

---

## Task 2: `slugify` s testovima

**Files:**
- Create: `src/scripts/migracija-materijala/slug.py`
- Test: `src/scripts/migracija-materijala/test_slug.py`

**Interfaces:**
- Produces: `slugify(ime: str) -> str` — slugificira jedan segment putanje (ime datoteke ili
  mape). Za datoteke odvaja i zadržava ekstenziju. Koriste ga Task 3 i Task 5.

- [ ] **Step 1: Napisati test koji pada**

```python
# test_slug.py
import unittest
from slug import slugify

class TestSlugify(unittest.TestCase):
    def test_dijakritika(self):
        self.assertEqual(slugify("Ritoša"), "ritosa")
        self.assertEqual(slugify("stočna hrana"), "stocna-hrana")
        self.assertEqual(slugify("Žito"), "zito")

    def test_d_s_crtom_ne_dekomponira(self):
        # đ nije NFD-razloživ, mora imati eksplicitno mapiranje
        self.assertEqual(slugify("Đakovo"), "dakovo")
        self.assertEqual(slugify("žeđ"), "zed")

    def test_ekstenzija_se_zadrzava_i_snizava(self):
        self.assertEqual(slugify("IMG_4306.HEIC"), "img-4306.heic")
        self.assertEqual(slugify("Oroz PHARM.svg"), "oroz-pharm.svg")

    def test_interpunkcija_i_visestruki_razmaci(self):
        self.assertEqual(
            slugify("Kosačica VINGO  2,3KS LONCIN 139.jpg"),
            "kosacica-vingo-2-3ks-loncin-139.jpg",
        )
        self.assertEqual(slugify("Vinkoprom - popis artikala.docx"),
                         "vinkoprom-popis-artikala.docx")

    def test_rubne_crtice_se_odbacuju(self):
        self.assertEqual(slugify("_zaBlur_.jpeg"), "zablur.jpeg")

    def test_mapa_bez_ekstenzije(self):
        self.assertEqual(slugify("Dani lubenica Soljani 2026."),
                         "dani-lubenica-soljani-2026")

if __name__ == "__main__":
    unittest.main()
```

- [ ] **Step 2: Pokrenuti test, potvrditi da pada**

```bash
cd /Users/marinoroz/Documents/OrozDigital/oroz-pharm/src/scripts/migracija-materijala
python3 -m unittest test_slug -v
```

Očekivano: `ModuleNotFoundError: No module named 'slug'`

- [ ] **Step 3: Implementirati**

```python
# slug.py
import os
import re
import unicodedata

_EKSPLICITNO = {"đ": "d", "Đ": "d"}

def slugify(ime: str) -> str:
    """Slugificira jedan segment putanje. Ekstenzija se zadržava, snižena."""
    baza, ext = os.path.splitext(ime)
    if ext in (".", ""):          # "mapa." nema ekstenziju, samo točku
        baza, ext = ime.rstrip("."), ""
    for a, b in _EKSPLICITNO.items():
        baza = baza.replace(a, b)
    baza = unicodedata.normalize("NFD", baza)
    baza = "".join(c for c in baza if not unicodedata.combining(c))
    baza = re.sub(r"[^a-zA-Z0-9]+", "-", baza).strip("-").lower()
    if not baza:
        raise ValueError(f"prazan slug za {ime!r}")
    return baza + ext.lower()
```

- [ ] **Step 4: Pokrenuti test, potvrditi prolaz**

```bash
python3 -m unittest test_slug -v
```

Očekivano: `OK`, 6 testova.

- [ ] **Step 5: Provjeriti na stvarnim podacima da nema sudara**

```bash
cd /Users/marinoroz/Documents
python3 -c "
import sys, os, collections
sys.path.insert(0, 'OrozDigital/oroz-pharm/src/scripts/migracija-materijala')
from slug import slugify
c = collections.defaultdict(list)
for root in ('Oroz-web', 'Oroz-marketing'):
    for dp, dn, fn in os.walk(root):
        for f in fn:
            if f != '.DS_Store':
                c[(dp, slugify(f))].append(f)
sudari = {k: v for k, v in c.items() if len(v) > 1}
print('sudara:', len(sudari))
for k, v in sudari.items(): print(' ', k, v)
"
```

Očekivano: `sudara: 0`

- [ ] **Step 6: Commit**

```bash
git add src/scripts/migracija-materijala/slug.py src/scripts/migracija-materijala/test_slug.py
git commit -m "feat: slugify za migraciju materijala"
```

---

## Task 3: Mapiranje

Deklarativni TSV, tri stupca razdvojena tabulatorom: `MODE`, `IZVOR`, `ODREDISTE`.

- `MODE=dir` — **sadržaj** izvorne mape kopira se u odredišnu mapu (rekurzivno).
- `MODE=file` — jedna datoteka kopira se na točnu odredišnu putanju, s imenom koje piše.

`IZVOR` je relativan na `~/Documents`. `ODREDISTE` je relativno na `materijali/`.
Odredišta su već slugificirana; prolaz slugifikacije iz Taska 5 dira samo imena koja su
došla unutar `MODE=dir` kopiranja.

**Files:**
- Create: `src/scripts/migracija-materijala/mapiranje.tsv`

**Interfaces:**
- Produces: `mapiranje.tsv` — čita ga `migriraj.py` u Tasku 4.

- [ ] **Step 1: Zapisati mapiranje dobavljača**

```tsv
dir	Oroz-web/partneri/AgroChem Maks	dobavljaci/agrochem-maks/slike
dir	Oroz-web/partneri/BASF	dobavljaci/basf/slike
file	Oroz-marketing/partneri/basf.png	dobavljaci/basf/logo.png
dir	Oroz-web/partneri/Bayer	dobavljaci/bayer/slike
file	Oroz-marketing/partneri/bayer.png	dobavljaci/bayer/logo.png
dir	Oroz-web/partneri/Bejo/Slike za Oroz Pharm	dobavljaci/bejo/slike
dir	Oroz-web/partneri/KWS	dobavljaci/kws/slike
dir	Oroz-web/partneri/Kony	dobavljaci/kony/slike
dir	Oroz-web/partneri/Medin san/medin-materijali	dobavljaci/medin-san/slike
file	Oroz-web/partneri/Medin san/medin-manifest.json	dobavljaci/medin-san/manifest.json
file	Oroz-web/partneri/Medin san/medin-showcase.json	dobavljaci/medin-san/showcase.json
file	Oroz-web/partneri/Medin san/Medin_san_popis_za_marketing.xlsx	dobavljaci/medin-san/popis-za-marketing.xlsx
file	Oroz-web/partneri/Medin san/Stanje_zalihe Medin san.xlsx	dobavljaci/medin-san/stanje-zalihe.xlsx
file	Oroz-marketing/partneri/Medin_san_logo.png	dobavljaci/medin-san/logo.png
file	Oroz-web/partneri/Navigator/NAVIGATOR.txt	dobavljaci/navigator/biljeske.txt
file	Oroz-web/partneri/Navigator/Catalog-2026-croatian-version-reduced.pdf	dobavljaci/navigator/katalog-2026.pdf
file	Oroz-web/partneri/Navigator/trainer-1L-5L-300x300.jpg	dobavljaci/navigator/slike/trainer-1l-5l-300x300.jpg
file	Oroz-web/partneri/Navigator/phenix-300x300.jpg	dobavljaci/navigator/slike/phenix-300x300.jpg
dir	Oroz-web/partneri/Ritoša/ritosa-materijali	dobavljaci/ritosa/slike
dir	Oroz-web/partneri/Ritoša/ritosa-brand-logos	dobavljaci/ritosa/brand-logos
file	Oroz-web/partneri/Ritoša/ritosa-manifest.json	dobavljaci/ritosa/manifest.json
file	Oroz-web/partneri/Ritoša/Ritosa_popis_za_marketing.xlsx	dobavljaci/ritosa/popis-za-marketing.xlsx
file	Oroz-web/partneri/Ritoša/Ritosa_popis_za_marketing_full.xlsx	dobavljaci/ritosa/popis-za-marketing-full.xlsx
file	Oroz-web/partneri/Ritoša/Stanje_zalihe Brati Ritoša.xlsx	dobavljaci/ritosa/stanje-zalihe.xlsx
file	Oroz-web/partneri/Ritoša/opisi-artikala.xlsx	dobavljaci/ritosa/opisi-artikala.xlsx
file	Oroz-marketing/partneri/brati_ritosa.png	dobavljaci/ritosa/logo.png
dir	Oroz-web/partneri/Sano/Sano-materijali	dobavljaci/sano/slike
file	Oroz-marketing/partneri/sano.png	dobavljaci/sano/logo.png
dir	Oroz-web/partneri/Syngenta/slike_ proizvoda_Syngenta_za Oroz Pharm_26/slike_ proizvoda_Syngenta_za Oroz Pharm_26	dobavljaci/syngenta/slike
file	Oroz-web/partneri/Syngenta/SYNGENTA.txt	dobavljaci/syngenta/biljeske.txt
file	Oroz-web/partneri/Syngenta/ampligo_400x135.png	dobavljaci/syngenta/slike/ampligo-400x135.png
file	Oroz-web/partneri/Syngenta/logo_ampligo_400x135.png	dobavljaci/syngenta/slike/logo-ampligo-400x135.png
file	Oroz-marketing/partneri/syngenta.png	dobavljaci/syngenta/logo.png
file	Oroz-web/partneri/Vinkoprom/Vinkoprom Stanje_zalihe kosačice.xlsx	dobavljaci/vinkoprom/stanje-zalihe.xlsx
file	Oroz-web/partneri/Vinkoprom/Vinkoprom - popis artikala.docx	dobavljaci/vinkoprom/popis-artikala.docx
file	Oroz-web/partneri/Vinkoprom/Kosačica VINGO  3,25 KS-B & S 750,160cm3-50,6cm SAMOHODNA s košarom.webp	dobavljaci/vinkoprom/slike/kosacica-vingo-3-25-ks-b-s-750-160cm3-50-6cm-samohodna-s-kosarom.webp
file	Oroz-web/partneri/Vinkoprom/Kosačica VINGO  2,3 KS-B & S 450E,125cm3-46cm SAMOHODNA s košarom.jpg	dobavljaci/vinkoprom/slike/kosacica-vingo-2-3-ks-b-s-450e-125cm3-46cm-samohodna-s-kosarom.jpg
file	Oroz-web/partneri/Vinkoprom/Kosačica VINGO  2,3KS LONCIN 139.jpg	dobavljaci/vinkoprom/slike/kosacica-vingo-2-3ks-loncin-139.jpg
dir	Oroz-web/partneri/Zeleni Hit/slike Oroz Pharm	dobavljaci/zeleni-hit/slike
file	Oroz-web/partneri/Zeleni Hit/ZELENI HIT.docx	dobavljaci/zeleni-hit/zeleni-hit.docx
file	Oroz-web/partneri/Žito/Elixir_20-30.png	dobavljaci/zito/slike/elixir-20-30.png
file	Oroz-web/partneri/Žito/Elixir_NPK_8-15-15.png	dobavljaci/zito/slike/elixir-npk-8-15-15.png
file	Oroz-web/partneri/BC.txt	dobavljaci/bc/biljeske.txt
file	Oroz-web/partneri/COLIĆ TRADE.txt	dobavljaci/colic-trade/biljeske.txt
file	Oroz-web/partneri/ELIXIR.txt	dobavljaci/zito/biljeske.txt
file	Oroz-web/partneri/NOVAG.txt	dobavljaci/novag/biljeske.txt
file	Oroz-web/partneri/PATENT.txt	dobavljaci/patent/biljeske.txt
file	Oroz-web/partneri/PDSJEMENA.txt	dobavljaci/pdsjemena/biljeske.txt
file	Oroz-web/partneri/PETROKEMIJA.txt	dobavljaci/petrokemija/biljeske.txt
file	Oroz-marketing/partneri/petrokemija-kutina.png	dobavljaci/petrokemija/logo.png
dir	Oroz-marketing/insekticidi/Petrokemija	dobavljaci/petrokemija/slike
file	Oroz-web/partneri/Dobavljac.numbers	dobavljaci/dobavljaci.numbers
file	Oroz-marketing/partneri/adria-flora.png	dobavljaci/adria-flora/logo.png
file	Oroz-marketing/partneri/atlantic_trade.png	dobavljaci/atlantic-trade/logo.png
file	Oroz-marketing/partneri/brgarden.png	dobavljaci/brgarden/logo.png
file	Oroz-marketing/partneri/chromos-agro.png	dobavljaci/chromos-agro/logo.png
file	Oroz-marketing/partneri/clause.png	dobavljaci/clause/logo.png
file	Oroz-marketing/partneri/corteva.png	dobavljaci/corteva/logo.png
file	Oroz-marketing/partneri/dekalb-logo.png	dobavljaci/dekalb/logo.png
file	Oroz-marketing/kukuruz/Dekalb/DKC4943.png	dobavljaci/dekalb/slike/dkc4943.png
file	Oroz-marketing/partneri/klasmann-deilmann.png	dobavljaci/klasmann-deilmann/logo.png
file	Oroz-marketing/partneri/koka.png	dobavljaci/koka/logo.png
file	Oroz-marketing/partneri/piliko-logo.png	dobavljaci/piliko/logo.png
file	Oroz-marketing/partneri/rijk-zwaan.png	dobavljaci/rijk-zwaan/logo.png
file	Oroz-marketing/partneri/salva.png	dobavljaci/salva/logo.png
file	Oroz-marketing/partneri/santaj.png	dobavljaci/santaj/logo.png
file	Oroz-marketing/partneri/tick.png	dobavljaci/tick/logo.png
file	Oroz-marketing/partneri/timac-agro.svg	dobavljaci/timac-agro/logo.svg
file	Oroz-marketing/partneri/tora.png	dobavljaci/agrochem-maks/logo.png
file	Oroz-marketing/partneri/vindija.svg.png	dobavljaci/vindija/logo.png
dir	Oroz-marketing/Plantella	dobavljaci/plantella/slike
file	Oroz-marketing/pirotehnika/HRV-Orion-Letak2024-SPREAD_compressed.pdf	dobavljaci/orion/letak-2024.pdf
dir	Oroz-marketing/pirotehnika/ilovepdf_pages-to-jpg	dobavljaci/orion/letak-2024-stranice
file	Oroz-marketing/podravka.jpeg	dobavljaci/podravka/slike/podravka.jpeg
file	Oroz-marketing/insekticidi/Effect_Banner_Akcija_1080x1080_2026_HR.png	dobavljaci/unichem-agro/slike/effect-banner-akcija-1080x1080-2026-hr.png
```

Mapiranje već uključuje odluke iz Taska 1 (`odluke.md`): mape `tora/` i `elixir/` se **ne**
stvaraju — `tora.png` ide AgroChem Maksu čiji je TORA brand, `ELIXIR.txt` ide Žitu. Dodan je
`unichem-agro`. Ukupno **40** mapa dobavljača, ne 41 kako je spec prvotno predviđao.

- [ ] **Step 2: Dopisati mapiranje vlastitog materijala**

```tsv
dir	Oroz-marketing/Florabella	vlastito/asortiman/florabella
dir	Oroz-marketing/Slavol	vlastito/asortiman/slavol
dir	Oroz-marketing/biostimulatori	vlastito/asortiman/biostimulatori
dir	Oroz-marketing/navodnjavanje	vlastito/asortiman/navodnjavanje
dir	Oroz-marketing/nikafert	vlastito/asortiman/nikafert
dir	Oroz-marketing/za vrt	vlastito/asortiman/za-vrt
file	Oroz-marketing/insekticidi/c0123fdd-584a-42db-a17d-bbe5ef502621.JPEG	vlastito/asortiman/insekticidi/c0123fdd-584a-42db-a17d-bbe5ef502621.jpeg
file	Oroz-marketing/insekticidi/ea06be23-249b-4b2a-b830-09acdcaf7f38.JPEG	vlastito/asortiman/insekticidi/ea06be23-249b-4b2a-b830-09acdcaf7f38.jpeg
file	Oroz-marketing/kosilice/IMG_20240506_122343.jpg	vlastito/asortiman/kosilice/img-20240506-122343.jpg
file	Oroz-marketing/kosilice/1.png	vlastito/objave/posts/kosilica-vingo-loncin-450e.png
file	Oroz-marketing/kosilice/2.png	vlastito/objave/posts/kosilica-vingo-bs-450e.png
file	Oroz-marketing/kosilice/3.png	vlastito/objave/posts/kosilica-vingo-bs-750ex.png
dir	Oroz-marketing/kolinje	vlastito/asortiman/kolinje
dir	Oroz-marketing/krumpir	vlastito/asortiman/krumpir
dir	Oroz-marketing/kukuruz/PoljInOS	vlastito/asortiman/kukuruz/poljinos
file	Oroz-marketing/kukuruz/Dekalb/WhatsApp Image 2024-04-08 at 12.40.27.jpeg	vlastito/asortiman/kukuruz/whatsapp-image-2024-04-08-at-12-40-27.jpeg
dir	Oroz-marketing/lampioni	vlastito/asortiman/lampioni
dir	Oroz-marketing/ljubimci	vlastito/asortiman/ljubimci
dir	Oroz-marketing/lučica	vlastito/asortiman/lucica
dir	Oroz-marketing/plin	vlastito/asortiman/plin
dir	Oroz-marketing/ptice	vlastito/asortiman/ptice
dir	Oroz-marketing/sadnice	vlastito/asortiman/sadnice
dir	Oroz-marketing/sjeme	vlastito/asortiman/sjeme
dir	Oroz-marketing/stočna hrana	vlastito/asortiman/stocna-hrana
dir	Oroz-marketing/vinarstvo	vlastito/asortiman/vinarstvo
dir	Oroz-marketing/zaštita	vlastito/asortiman/zastita
dir	Oroz-web/perad	vlastito/asortiman/perad
file	Oroz-web/vlastito/web/pcelarstvo-hero.jpg	vlastito/asortiman/pcelarstvo/pcelarstvo-hero.jpg
dir	Oroz-web/vlastito/pleternica	vlastito/poslovnice/pleternica
dir	Oroz-marketing/Pleternica	vlastito/poslovnice/pleternica
dir	Oroz-marketing/objave/posts	vlastito/objave/posts
dir	Oroz-marketing/objave/reels	vlastito/objave/reels
dir	Oroz-marketing/objave/story	vlastito/objave/story
dir	Oroz-web/blog/Dani lubenica Soljani 2026.	vlastito/objave/blog/dani-lubenica-soljani-2026
dir	Oroz-marketing/Oroz Pharm Pleternica-Pozega solo + 916	vlastito/objave/oglasi
file	Oroz-web/vlastito/web/products-hero.jpg	vlastito/web/products-hero.jpg
file	Oroz-web/vlastito/orozpharm-web-rec.mp4	vlastito/web/orozpharm-web-rec.mp4
file	Oroz-marketing/editing/za_blur.jpeg	vlastito/obrada/za-blur.jpeg
dir	Oroz-marketing/logo	brand
```

Dvije mape gađaju isto odredište `vlastito/poslovnice/pleternica` — to je namjerno, dva
snimanja iste poslovnice. Imena se ne preklapaju (`IMG_43xx` prema `IMG_05xx`), pa
`migriraj.py` neće prijaviti sudar.

`Oroz-marketing/logo/kolinje/` je prazna i `rsync` je neće stvoriti. Ako je stvori, Task 5
je briše.

- [ ] **Step 3: Provjeriti retke koji dolaze iz Taska 1**

Retci su već upisani u koracima 1 i 2; ovaj korak samo provjerava da odgovaraju
`src/scripts/migracija-materijala/odluke.md`:

- `nikafert`, `biostimulatori`, `navodnjavanje`, `za vrt` → `vlastito/asortiman/…` (cijele mape)
- `insekticidi/` — dvije UUID datoteke → `vlastito/asortiman/insekticidi`;
  `Effect_Banner_…png` → `dobavljaci/unichem-agro/slike`; podmapa `Petrokemija/` je već
  mapirana u koraku 1
- `kosilice/` se **dijeli**: `IMG_20240506_122343.jpg` → `vlastito/asortiman/kosilice`,
  a `1/2/3.png` → `vlastito/objave/posts/` pod imenima po sadržaju, jer su to gotove Oroz PHARM
  objave (logotip, adrese, cijena), a ne fotografije proizvoda
- `tora` i `elixir` nemaju vlastite mape; `unichem-agro` je nov

- [ ] **Step 4: Provjeriti da mapiranje pokriva svih 833 datoteke**

**Ključno — normalizacija Unicodea.** macOS vraća imena datoteka u **NFD** (`š` je `s` + kombinirajuća
kvačica), a `mapiranje.tsv` je pisan u **NFC**. `os.path.exists` i `rsync` rade s oba jer datotečni
sustav normalizira pri traženju, ali **usporedba stringova ne**. Bez `nfc()` ispod, provjera lažno
prijavi 155 nepokrivenih datoteka — svaku pod putanjom s dijakritikom (`Ritoša`, `Žito`, `zaštita`,
`stočna hrana`, `lučica`, `COLIĆ TRADE.txt`, `Kosačica…`).

```bash
cd /Users/marinoroz/Documents/OrozDigital/oroz-pharm/src/scripts/migracija-materijala
python3 -c "
import csv, os, unicodedata
os.chdir('/Users/marinoroz/Documents')
M = '/Users/marinoroz/Documents/OrozDigital/oroz-pharm/src/scripts/migracija-materijala/mapiranje.tsv'
nfc = lambda p: unicodedata.normalize('NFC', os.path.normpath(p))
def preskoci(x): return x == '.DS_Store' or x.startswith('._')
pokriveno = set()
with open(M) as f:
    for mode, izvor, _ in csv.reader(f, delimiter='\t'):
        if mode == 'file':
            pokriveno.add(nfc(izvor))
        else:
            for dp, dn, fn in os.walk(izvor):
                for x in fn:
                    if not preskoci(x):
                        pokriveno.add(nfc(os.path.join(dp, x)))
sve = set()
for root in ('Oroz-web', 'Oroz-marketing'):
    for dp, dn, fn in os.walk(root):
        for x in fn:
            if not preskoci(x):
                sve.add(nfc(os.path.join(dp, x)))
sve.discard(nfc('Oroz-web/.claude/settings.local.json'))
print('ukupno:', len(sve), '| pokriveno:', len(pokriveno & sve))
nepokriveno = sve - pokriveno
nepostojeci = pokriveno - sve
print('NEPOKRIVENO:', len(nepokriveno))
for p in sorted(nepokriveno): print('  ', p)
print('NEPOSTOJECI IZVORI:', len(nepostojeci))
for p in sorted(nepostojeci): print('  ', p)
"
```

Očekivano: `ukupno: 833 | pokriveno: 833`, `NEPOKRIVENO: 0`, `NEPOSTOJECI IZVORI: 0`.

Ako je nepokriveno > 0, dopisati retke i ponoviti. **Ne prelaziti na Task 4 dok nije 0.**

- [ ] **Step 5: Commit**

```bash
git add src/scripts/migracija-materijala/mapiranje.tsv
git commit -m "feat: mapiranje migracije, 833 datoteke pokrivene"
```

---

## Task 4: Skripta migracije

**Files:**
- Create: `src/scripts/migracija-materijala/migriraj.py`

**Interfaces:**
- Consumes: `mapiranje.tsv` (Task 3), `slugify` iz `slug.py` (Task 2).
- Produces: stablo `materijali/`, `preimenovanja.log` (TSV: `stara-putanja`, `nova-putanja`).

- [ ] **Step 1: Implementirati**

```python
#!/usr/bin/env python3
"""Migrira Oroz-web i Oroz-marketing u OrozDigital/materijali prema mapiranje.tsv."""
import csv
import os
import shutil
import subprocess
import sys

from slug import slugify

IZVOR_KORIJEN = "/Users/marinoroz/Documents"
CILJ = "/Users/marinoroz/Documents/OrozDigital/materijali"
MAPIRANJE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "mapiranje.tsv")
LOG = os.path.join(os.path.dirname(os.path.abspath(__file__)), "preimenovanja.log")


def kopiraj(suho: bool) -> None:
    with open(MAPIRANJE) as f:
        redci = [r for r in csv.reader(f, delimiter="\t") if r and not r[0].startswith("#")]
    for mode, izvor, odrediste in redci:
        src = os.path.join(IZVOR_KORIJEN, izvor)
        dst = os.path.join(CILJ, odrediste)
        if not os.path.exists(src):
            sys.exit(f"PREKID: izvor ne postoji: {src}")
        if mode == "dir":
            if suho:
                print(f"dir  {izvor}/ -> {odrediste}/")
                continue
            os.makedirs(dst, exist_ok=True)
            # ._* su AppleDouble sjene koje macOS ostavlja pri kopiranju preko USB-a i zipa.
            # Danas ih u izvorima nema, ali `._foo.jpg` slugificira u `foo.jpg` i tiho bi se
            # sudario s pravom datotekom — jeftinije ih je isključiti nego uhvatiti kasnije.
            subprocess.run(
                ["rsync", "-a", "--exclude", ".DS_Store", "--exclude", "._*",
                 f"{src}/", f"{dst}/"],
                check=True,
            )
        elif mode == "file":
            if os.path.exists(dst) and not suho:
                sys.exit(f"PREKID: odredište već postoji: {dst}")
            if suho:
                print(f"file {izvor} -> {odrediste}")
                continue
            os.makedirs(os.path.dirname(dst), exist_ok=True)
            shutil.copy2(src, dst)
        else:
            sys.exit(f"PREKID: nepoznat mode {mode!r} u retku {izvor}")


def slugificiraj() -> None:
    """Preimenuje sve u materijali/ odozdo prema gore. Prekida na sudaru."""
    preimenovanja = []
    for dp, dn, fn in os.walk(CILJ, topdown=False):
        for ime in fn + dn:
            novo = slugify(ime)
            if novo == ime:
                continue
            staro_p = os.path.join(dp, ime)
            novo_p = os.path.join(dp, novo)
            # APFS je case-insensitive: "Label" i "label" su ista stavka, pa os.path.exists
            # javlja True i za preimenovanje koje mijenja samo veličinu slova. samefile to
            # razlikuje od stvarnog sudara s drugom datotekom.
            if os.path.exists(novo_p) and not os.path.samefile(staro_p, novo_p):
                sys.exit(f"PREKID: sudar pri preimenovanju {staro_p} -> {novo_p}")
            os.rename(staro_p, novo_p)
            preimenovanja.append((staro_p, novo_p))
    with open(LOG, "w") as f:
        w = csv.writer(f, delimiter="\t")
        w.writerows(preimenovanja)
    print(f"preimenovano: {len(preimenovanja)}, zapisano u {LOG}")


if __name__ == "__main__":
    suho = "--suho" in sys.argv
    if not suho and os.path.exists(CILJ) and os.listdir(CILJ):
        sys.exit(f"PREKID: {CILJ} postoji i nije prazan. Obriši ga pa ponovi.")
    kopiraj(suho)
    if not suho:
        slugificiraj()
```

- [ ] **Step 2: Suhi prolaz**

```bash
cd /Users/marinoroz/Documents/OrozDigital/oroz-pharm/src/scripts/migracija-materijala
python3 migriraj.py --suho
```

Očekivano: ispis svakog retka mapiranja, bez `PREKID`. Broj redaka odgovara broju
redaka u `mapiranje.tsv`.

- [ ] **Step 3: Commit**

```bash
git add src/scripts/migracija-materijala/migriraj.py
git commit -m "feat: skripta migracije materijala"
```

---

## Task 5: Izvršiti migraciju

**Files:**
- Create: `/Users/marinoroz/Documents/OrozDigital/materijali/` (cijelo stablo)
- Create: `src/scripts/migracija-materijala/preimenovanja.log`

- [ ] **Step 1: Snimiti stanje izvora prije kopiranja**

```bash
cd /Users/marinoroz/Documents
find Oroz-web Oroz-marketing -type f ! -name .DS_Store -exec shasum -a 256 {} \; \
  | awk '{print $1}' | sort \
  > OrozDigital/oroz-pharm/src/scripts/migracija-materijala/prije-sha.txt
wc -l < OrozDigital/oroz-pharm/src/scripts/migracija-materijala/prije-sha.txt
```

Osnovica ide uz skripte, ne u `/tmp` — Task 8 je ponovno čita, a `/tmp` se prazni između sesija.

Očekivano: `834` (uključuje `settings.local.json`, koji se ne prenosi — Task 6 to uzima u obzir).

- [ ] **Step 2: Pokrenuti migraciju**

```bash
cd /Users/marinoroz/Documents/OrozDigital/oroz-pharm/src/scripts/migracija-materijala
python3 migriraj.py
```

Očekivano: bez `PREKID`, završni ispis `preimenovano: N, zapisano u …/preimenovanja.log`.

- [ ] **Step 3: Obrisati prazne mape ako ih je rsync ostavio**

```bash
find /Users/marinoroz/Documents/OrozDigital/materijali -type d -empty -delete
```

- [ ] **Step 4: Commit loga**

```bash
cd /Users/marinoroz/Documents/OrozDigital/oroz-pharm
git add src/scripts/migracija-materijala/preimenovanja.log
git commit -m "chore: log preimenovanja iz migracije"
```

---

## Task 6: Provjera cjelovitosti

Tri neovisne provjere. Sve tri moraju proći prije nego se išta briše.

**Files:**
- Create: `src/scripts/migracija-materijala/provjeri.py`

**Interfaces:**
- Consumes: `/tmp/prije-sha.txt` (Task 5), stablo `materijali/`.
- Produces: izlazni kod 0 ako sve tri provjere prođu, inače 1 uz popis razlika.

- [ ] **Step 1: Implementirati**

```python
#!/usr/bin/env python3
"""Tri provjere cjelovitosti migracije."""
import hashlib
import os
import re
import subprocess
import sys

CILJ = "/Users/marinoroz/Documents/OrozDigital/materijali"
OCEKIVANO = 833
NEPRENESENO = "/Users/marinoroz/Documents/Oroz-web/.claude/settings.local.json"
OSNOVICA = os.path.join(os.path.dirname(os.path.abspath(__file__)), "prije-sha.txt")
DOPUSTENO = re.compile(r"^[a-z0-9]+(-[a-z0-9]+)*(\.[a-z0-9]+)?$")


def sha(p):
    h = hashlib.sha256()
    with open(p, "rb") as f:
        for blok in iter(lambda: f.read(1 << 20), b""):
            h.update(blok)
    return h.hexdigest()


def sve_datoteke():
    """Materijali, bez metapodataka stabla. CLAUDE.md i .gitignore dodaje Task 7, pa bi
    inače pomaknuli broj i sažetke kad Task 8 ponovno pokrene provjeru."""
    for dp, dn, fn in os.walk(CILJ):
        for x in fn:
            if dp == CILJ and x in ("CLAUDE.md", ".gitignore"):
                continue
            yield os.path.join(dp, x)


def provjera_broja():
    n = sum(1 for _ in sve_datoteke())
    ok = n == OCEKIVANO
    print(f"[{'OK' if ok else 'PAD'}] broj datoteka: {n} (očekivano {OCEKIVANO})")
    return ok


def provjera_sadrzaja():
    """Svaki sha256 iz izvora mora postojati na odredištu. Hvata i tihi gubitak i izmjenu."""
    with open(OSNOVICA) as f:
        prije = sorted(x.strip() for x in f if x.strip())
    prije.remove(sha(NEPRENESENO))
    poslije = sorted(sha(p) for p in sve_datoteke())
    ok = prije == poslije
    print(f"[{'OK' if ok else 'PAD'}] sadržaj: {len(prije)} izvornih sažetaka prema {len(poslije)}")
    if not ok:
        nedostaje = set(prije) - set(poslije)
        visak = set(poslije) - set(prije)
        print(f"     nedostaje {len(nedostaje)}, višak {len(visak)}")
    return ok


def provjera_imena():
    """Pozitivna provjera: ime mora odgovarati dopuštenom obliku, a ne samo izbjeći
    poznate loše znakove. Crna lista propušta ono na što se nije mislilo — `,`, `&`, `+`."""
    lose = []
    for dp, dn, fn in os.walk(CILJ):
        for x in dn + fn:
            if dp == CILJ and x in ("CLAUDE.md", ".gitignore"):
                continue
            if not DOPUSTENO.match(x):
                lose.append(os.path.join(dp, x))
    ok = not lose
    print(f"[{'OK' if ok else 'PAD'}] imena: {len(lose)} problematičnih")
    for p in lose[:20]:
        print("     ", p)
    return ok


if __name__ == "__main__":
    rezultati = [provjera_broja(), provjera_sadrzaja(), provjera_imena()]
    velicina = subprocess.run(["du", "-sh", CILJ], capture_output=True, text=True).stdout.strip()
    print(f"     veličina: {velicina}")
    sys.exit(0 if all(rezultati) else 1)
```

- [ ] **Step 2: Pokrenuti**

```bash
cd /Users/marinoroz/Documents/OrozDigital/oroz-pharm/src/scripts/migracija-materijala
python3 provjeri.py; echo "izlazni kod: $?"
```

Očekivano:

```
[OK] broj datoteka: 833 (očekivano 833)
[OK] sadržaj: 833 izvornih sažetaka prema 833
[OK] imena: 0 problematičnih
     veličina: 3.2G	/Users/marinoroz/Documents/OrozDigital/materijali
izlazni kod: 0
```

Ako bilo koja provjera padne — **ne nastavljati.** Ispraviti mapiranje, obrisati
`materijali/`, ponoviti Task 5.

- [ ] **Step 3: Commit**

```bash
git add src/scripts/migracija-materijala/provjeri.py
git commit -m "test: provjere cjelovitosti migracije"
```

---

## Task 7: `CLAUDE.md` i ažuriranje referenci

**Files:**
- Create: `/Users/marinoroz/Documents/OrozDigital/materijali/CLAUDE.md`
- Create: `/Users/marinoroz/Documents/OrozDigital/materijali/.gitignore`
- Modify: `docs/superpowers/plans/2026-06-23-syngenta-import.md` (5 referenci)
- Modify: `docs/superpowers/plans/2026-08-03-perad-kategorija.md` (6 referenci)
- Modify: `docs/superpowers/specs/2026-06-23-syngenta-import-design.md` (1 referenca)
- Modify: `.claude/settings.local.json` (brisanje 2 unosa)

- [ ] **Step 1: Napisati `materijali/CLAUDE.md`**

```markdown
# Materijali Oroz PHARM

Stablo materijala uz `../oroz-pharm`. Nije git repozitorij.

## Pravilo razvrstavanja

**Podrijetlo odlučuje, ne brand.** Fotografija koju smo mi snimili ide u `vlastito/`, čak i
ako je na njoj proizvod dobavljača. Materijal koji je dobavljač isporučio ide u
`dobavljaci/<slug>/`, čak i ako smo ga naknadno obradili.

## Struktura

- `dobavljaci/<slug>/` — registar. Jedna mapa po partneru, i kad sadrži samo `logo.png`.
  Traka logotipa na webu dohvaća se s `dobavljaci/*/logo.*`.
- `vlastito/asortiman/<kategorija>/` — vlastite fotografije po kategoriji.
- `vlastito/poslovnice/<mjesto>/` — fotografije poslovnica.
- `vlastito/objave/{posts,reels,story,blog,oglasi}/` — objavljeno i pripremljeno za objavu.
- `vlastito/web/` — materijal vezan uz stranicu, a ne uz kategoriju.
- `vlastito/obrada/` — radne datoteke u tijeku.
- `brand/` — Oroz PHARM logotipi.

## Imenovanje

ASCII slug, bez iznimke: mala slova, bez dijakritike, bez razmaka, `-` kao razdjelnik.
`stocna-hrana/`, `zito/`, `dani-lubenica-soljani-2026/`.

Fiksni nazivi u mapi dobavljača, da ih skripte ne moraju pogađati:

| Datoteka | Naziv |
|---|---|
| logotip | `logo.png` ili `logo.svg` |
| popis asortimana | `biljeske.txt` |
| stanje zalihe od dobavljača | `stanje-zalihe.xlsx` |
| popis šifri poslan marketingu | `popis-za-marketing.xlsx` |
| manifest za uvoz | `manifest.json` |
| izlog asortimana | `showcase.json` |
| slike proizvoda | `slike/` |

## Novi dobavljač

```bash
mkdir -p dobavljaci/<slug>
```

Logotip odmah, ostalo kako stiže. Kad stigne `stanje-zalihe.xlsx`, obrada ide kroz
`supplier-sheet` skill (`~/.claude/skills/supplier-sheet/`), koji proizvodi
`popis-za-marketing.xlsx`.
```

- [ ] **Step 2: Napisati `.gitignore`**

```
.DS_Store
```

- [ ] **Step 3: Ažurirati putanje u dokumentaciji**

```bash
cd /Users/marinoroz/Documents/OrozDigital/oroz-pharm
S='/Users/marinoroz/Documents/Oroz-web/partneri/Syngenta/slike_ proizvoda_Syngenta_za Oroz Pharm_26/slike_ proizvoda_Syngenta_za Oroz Pharm_26'
N='/Users/marinoroz/Documents/OrozDigital/materijali/dobavljaci/syngenta/slike'
for f in docs/superpowers/plans/2026-06-23-syngenta-import.md \
         docs/superpowers/specs/2026-06-23-syngenta-import-design.md; do
  python3 - "$f" "$S" "$N" <<'PY'
import sys
f, s, n = sys.argv[1:4]
t = open(f).read()
print(f, t.count(s), "zamjena")
open(f, "w").write(t.replace(s, n))
PY
done
sed -i '' \
  's|/Users/marinoroz/Documents/Oroz-web/perad|/Users/marinoroz/Documents/OrozDigital/materijali/vlastito/asortiman/perad|g' \
  docs/superpowers/plans/2026-08-03-perad-kategorija.md
```

- [ ] **Step 4: Potvrditi da nema zaostalih referenci**

```bash
cd /Users/marinoroz/Documents/OrozDigital/oroz-pharm
grep -rn "Documents/Oroz-web\|Documents/Oroz-marketing" \
  docs/ .claude/settings.local.json src/ 2>/dev/null
```

Očekivano: samo 2 preostala pogotka u `.claude/settings.local.json` — oni se brišu u
sljedećem koraku, ne prepisuju, jer se odnose na datoteke koje mijenjaju i putanju i ime.

- [ ] **Step 5: Obrisati zastarjele unose iz allowliste**

Iz `.claude/settings.local.json`, `permissions.allow`, ukloniti dva unosa koja spominju
`Oroz-marketing/partneri`:
`"Bash(file /Users/marinoroz/Documents/Oroz-marketing/partneri/*.png)"` i
`"Bash(sips -g pixelWidth -g pixelHeight /Users/marinoroz/Documents/Oroz-marketing/partneri/corteva.png /Users/marinoroz/Documents/Oroz-marketing/partneri/petrokemija-kutina.png)"`.

- [ ] **Step 6: Potvrditi da je JSON i dalje valjan**

```bash
python3 -m json.tool /Users/marinoroz/Documents/OrozDigital/oroz-pharm/.claude/settings.local.json > /dev/null && echo "JSON OK"
grep -c "Oroz-web\|Oroz-marketing" /Users/marinoroz/Documents/OrozDigital/oroz-pharm/.claude/settings.local.json || echo "0 referenci"
```

Očekivano: `JSON OK`, zatim `0 referenci`.

- [ ] **Step 7: Commit**

`.claude/settings.local.json` je globalno gitignoriran (`~/.config/git/ignore:1`) — mijenja se
na disku, ali se **ne commita**. Ne dodavati ga s `-f`; lokalne postavke i ne pripadaju u repozitorij.

```bash
git add docs/
git commit -m "refactor: putanje materijala pokazuju na OrozDigital/materijali

Stara stabla Oroz-web i Oroz-marketing spojena su u OrozDigital/materijali.
Ažurirane apsolutne putanje u izvršenim planovima i specovima; iz allowliste
uklonjena dva unosa koja se odnose na datoteke koje su promijenile i ime."
```

---

## Task 8: Brisanje starih stabala

**Ovaj task se ne izvršava bez izričite potvrde korisnika u razgovoru.**

- [ ] **Step 1: Ponoviti provjeru**

```bash
cd /Users/marinoroz/Documents/OrozDigital/oroz-pharm/src/scripts/migracija-materijala
python3 provjeri.py; echo "izlazni kod: $?"
```

Očekivano: izlazni kod `0`. Ako nije — stati.

- [ ] **Step 2: Pitati korisnika**

Pokazati izlaz provjere i pitati smije li se obrisati `Oroz-web` i `Oroz-marketing`.
Bez potvrde u razgovoru — stati ovdje i ostaviti oba stabla.

- [ ] **Step 3: Premjestiti u Koš, ne `rm`**

```bash
osascript -e 'tell application "Finder" to delete (POSIX file "/Users/marinoroz/Documents/Oroz-web")'
osascript -e 'tell application "Finder" to delete (POSIX file "/Users/marinoroz/Documents/Oroz-marketing")'
```

Koš, a ne `rm -rf` — 3,2 GB je previše za nepovratan potez. Korisnik prazni Koš kad bude
siguran.

- [ ] **Step 4: Potvrditi**

```bash
ls -d /Users/marinoroz/Documents/Oroz-web /Users/marinoroz/Documents/Oroz-marketing 2>&1
ls /Users/marinoroz/Documents/OrozDigital/materijali
```

Očekivano: `No such file or directory` za oba stara stabla; `brand dobavljaci vlastito CLAUDE.md`
za novo.

- [ ] **Step 5: Commit**

```bash
cd /Users/marinoroz/Documents/OrozDigital/oroz-pharm
git add docs/superpowers/plans/2026-08-07-reorganizacija-materijala.md \
        docs/superpowers/specs/2026-08-07-reorganizacija-materijala-design.md \
        src/scripts/migracija-materijala/
git commit -m "chore: dovršena reorganizacija materijala"
```

Ne `git add -A` — repozitorij ima 25 nepovezanih untracked skripti u `src/scripts/`
(`seed-*.mjs`, `make-manifest.mjs`, …) koje bi ušle u commit reorganizacije.

---

## Rollback

Do Taska 8 rollback je brisanje `materijali/` — izvori su netaknuti:

```bash
rm -rf /Users/marinoroz/Documents/OrozDigital/materijali
cd /Users/marinoroz/Documents/OrozDigital/oroz-pharm && git checkout main
```

Nakon Taska 8 izvori su u Košu i vraćaju se iz njega. Nakon pražnjenja Koša rollbacka nema —
zato Task 8 traži izričitu potvrdu.
