# Task 1 — odluke o razvrstavanju dvojbenih mapa

Razriješeno vizualnim pregledom reprezentativnih datoteka, 2026-08-07. Pravilo je podrijetlo:
fotografija koju smo mi snimili → `vlastito/`, materijal koji je dobavljač isporučio →
`dobavljaci/<slug>/`.

## Šest dvojbenih mapa

| Izvor | Odredište | Razlog |
|---|---|---|
| `nikafert/` (3) | `vlastito/asortiman/nikafert` | Vreća leži na pločicama, vidljiv otisnut kod šarže i datum 04.2023 — snimljeno u firmi, nije render. |
| `biostimulatori/` (4) | `vlastito/asortiman/biostimulatori` | `fusion1L.jpeg` je bočica na pultu, u pozadini čitač barkoda i police trgovine. |
| `navodnjavanje/` (6) | `vlastito/asortiman/navodnjavanje` | `police.jpeg` su police s cjenicima u EUR/kn, `crijevo.jpeg` je Rivulis rola na paleti u skladištu. |
| `za vrt/` (5) | `vlastito/asortiman/za-vrt` | `jagode.jpeg` je stalak sa sadnicama ispred trgovine, s rukom pisanim cjenikom „1,35 €". |
| `insekticidi/` — 2 UUID datoteke | `vlastito/asortiman/insekticidi` | Polica s Neopitroidom, Winnerom i BROS-om, s cjenicima. Snimljeno u trgovini. |
| `kosilice/IMG_20240506_122343.jpg` | `vlastito/asortiman/kosilice` | Obična fotografija s mobitela. |

## Dvije ispravke prvotne pretpostavke

**`kosilice/{1,2,3}.png` nisu ni vlastite fotke ni materijal dobavljača — gotove su Oroz PHARM
objave.** Nose logotip Oroz PHARM-a, obje adrese (Kralja Zvonimira 24 Pleternica, Frankopanska 53
Požega), telefone, `www.orozpharm.hr` i cijenu. Idu u `vlastito/objave/posts/`, ne u `asortiman/`.
Imena `1/2/3` ništa ne znače u zajedničkoj mapi s 25 drugih objava, pa se preimenuju po sadržaju:

| Izvor | Odredište |
|---|---|
| `kosilice/1.png` | `vlastito/objave/posts/kosilica-vingo-loncin-450e.png` |
| `kosilice/2.png` | `vlastito/objave/posts/kosilica-vingo-bs-450e.png` |
| `kosilice/3.png` | `vlastito/objave/posts/kosilica-vingo-bs-750ex.png` |

Kosilice su VinGo, brand Vinkoproma — isti dobavljač čija je mapa
`Oroz-web/partneri/Vinkoprom/` s datotekama „Kosačica VINGO".

**`insekticidi/Effect_Banner_Akcija_1080x1080_2026_HR.png` je materijal dobavljača** — banner je
potpisan UNICHEM AGRO d.o.o. → `dobavljaci/unichem-agro/slike/effect-banner-akcija-1080x1080-2026-hr.png`

## Tri odluke o identitetu dobavljača

| Pitanje | Odluka | Posljedica |
|---|---|---|
| Plantella i Unichem Agro | **Dva odvojena dobavljača** | `dobavljaci/plantella/` i `dobavljaci/unichem-agro/` |
| TORA | **Brand AgroChem Maksa** | Mapa `tora/` se ne stvara. `tora.png` → `dobavljaci/agrochem-maks/logo.png`. Napomena: datoteka je znak branda TORA, ali je to logotip pod kojim taj partner stoji u traci na webu, pa zadržava ime `logo.png` da traka `dobavljaci/*/logo.*` i dalje radi. |
| Elixir | **Brand Žita** | Mapa `elixir/` se ne stvara. `ELIXIR.txt` → `dobavljaci/zito/biljeske.txt`. |

## Učinak na broj mapa dobavljača

Spec je predviđao 41. Sada **40**: −1 `tora`, −1 `elixir`, +1 `unichem-agro`.

Ukupan broj datoteka ostaje **833** — nijedna odluka ne dodaje ni ne uklanja datoteku, samo
mijenja odredište.
