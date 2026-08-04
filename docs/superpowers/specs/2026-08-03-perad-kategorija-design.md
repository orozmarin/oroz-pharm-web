# Kategorija "Perad" — dizajn

Datum: 2026-08-03

## Cilj

Dodati kategoriju "Perad" na stranicu Proizvodi s ponudom žive peradi (9 vrsta).
Nema vlastitih fotografija ni opisa, pa se sadržaj sastavlja iz odabranih stock
fotografija i kratkih tekstova.

Zahtjev naručitelja: svaka vrsta peradi mora biti pojedinačno istaknuta, ne
smije ostaviti dojam nabrajanja. Prikaz su velike kartice s fotografijom po
vrsti, u dvije grupe po uzrastu.

## Asortiman

**Jednodnevna perad**

| Naziv | Uzrast | Namjena |
|---|---|---|
| Jednodnevno pile | 1 dan | tov |
| Jednodnevna crvena nesilica | 1 dan | jaja |
| Jednodnevno grahorasto pile | 1 dan | tov |
| Jednodnevna patka | 1 dan | tov |
| Jednodnevni purići | 1 dan | tov |

**Podrasla perad**

| Naziv | Uzrast | Namjena |
|---|---|---|
| Trotjedno pile | 3 tjedna | tov |
| Osmotjedna nesilica | 8 tjedana | jaja |
| Osamnaesttjedna nesilica | 18 tjedana | jaja |
| Petotjedni purani | 5 tjedana | tov |

## 1. Podatkovni model

Sadržaj živi u Payloadu, uređuje se iz `/admin` bez deploya.

### Kategorija

Jedan `categories` zapis:

- `name`: `Perad`
- `slug`: `perad`
- `description`: kratki opis kategorije, prikazuje se u herou i na bento kartici
- `icon`: `Bird` (Lucide)
- `image`: hero fotografija
- `gridArea`: `perad`
- `relatedCategories`: Stočna hrana, Stočarstvo

### Podkategorije

Dva `subcategories` zapisa, oba `category → Perad`, oba `isShowcase: false`:

- `jednodnevna-perad` — "Jednodnevna perad"
- `podrasla-perad` — "Podrasla perad"

Ne služe kao filter tabovi. `PoultryGrid` ne renderira filtere, koristi ih kao
naslove grupa. Neovisno od toga se pojavljuju kao pilule na bento kartici
kategorije, jer ih `CategoryCard` prikazuje za svaku kategoriju.

### Proizvodi

Devet `products` zapisa, svi `category → Perad`, `subcategory` prema grupi iz
tablice asortimana. Bez `manufacturer` i bez `instructions`.

Slugovi: `jednodnevno-pile`, `jednodnevna-crvena-nesilica`,
`jednodnevno-grahorasto-pile`, `jednodnevna-patka`, `jednodnevni-purici`,
`trotjedno-pile`, `osmotjedna-nesilica`, `osamnaesttjedna-nesilica`,
`petotjedni-purani`.

### Nova polja na `products`

Dva opcionalna polja, oba `type: 'text'`:

| Polje | Label | Primjer |
|---|---|---|
| `age` | Uzrast | `1 dan`, `3 tjedna`, `18 tjedana` |
| `purpose` | Namjena | `tov`, `jaja` |

Oba dobivaju `admin.description` koja kaže da se koriste za kategoriju Perad.

**Zašto `text` a ne `select`:** Payload na PostgreSQL-u za `select` stvara enum
tip, što na produkciji uz `ALTER TABLE` traži i `CREATE TYPE`. Dva plain
`varchar` stupca su manji rizik pri deployu, a za devet zapisa koje se upisuju
ručno validacija kroz `select` ne dobiva ništa.

### View model

U [src/types/views.ts](../../../src/types/views.ts):

- `Product` dobiva `age?: string` i `purpose?: string`. Popunjavaju se u mapperu
  na stranici kategorije. Ostali mapperi (pretraga, detail stranica) ih ne
  moraju popunjavati.
- `Subcategory` dobiva `slug?: string`. Trenutno ga nema, pa `PoultryGrid` ne
  bi imao po čemu razlikovati grupe osim po nazivu. Popunjava se u mapperu na
  stranici kategorije.

Redoslijed grupa u `PoultryGrid` ide **eksplicitno po slugu**
(`jednodnevna-perad`, pa `podrasla-perad`), ne po abecedi. Postojeći
`sort: "name"` u upitu slučajno daje isti rezultat, ali to nije nešto na što se
smije vezati.

### Nazivi na karticama

`name` u Payloadu ostaje pun ("Jednodnevna crvena nesilica"), bez skraćivanja za
prikaz. Unutar grupe "Jednodnevna perad" to znači da se prefiks ponavlja pet
puta, uz badge koji već piše "1 dan".

Svjesna odluka. Alternativa su kraći nazivi ("Crvena nesilica") ili izvedeno
skraćivanje na kartici, ali:

- kartica s nazivom "Pile" ne stoji sama za sebe, a cilj je da svaka vrsta bude
  samostalno istaknuta
- puni naziv je ono što korisnik upisuje u pretragu ("jednodnevno pile")
- naslov detail stranice i `<title>` bi s kratkim nazivom bili nejasni
- izvedeno skraćivanje znači parsiranje naziva, što je krhko

## 2. Prikaz na stranici kategorije

### Komponenta

Nova `src/components/products/PoultryGrid.tsx`, **server** komponenta. Nema
filtera ni paginacije, pa nema potrebe za `"use client"`.

Props: `subcategories: Subcategory[]`, `products: Product[]`.

### Uklapanje u rutu

U [src/app/(site)/proizvodi/\[category\]/page.tsx](../../../src/app/(site)/proizvodi/[category]/page.tsx)
se `CategoryDetailClient` **zamijeni** s `PoultryGrid` kada je
`category.slug === "perad"`. Isti obrazac branchanja po slugu koji tamo već
postoji za `BrandSpotlight` (`oprema-za-pcelarstvo`).

Hero, sekcija "Možda vas zanima" i `generateMetadata` ostaju nepromijenjeni.

### Struktura

Dvije sekcije, po jedna za svaku podkategoriju, u redoslijedu Jednodnevna pa
Podrasla perad. Svaka ima naslov (`h2`, `font-heading`) i grid
`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`. Prva grupa ima 5 kartica, druga 4.

Ispod obje grupe jedan CTA blok: napomena da se živa perad prodaje po narudžbi
i po sezoni, uz gumbe na `/kontakt` i `/kontakt#poslovnice`.

### Kartica

```
┌──────────────────────────┐
│  ( 1 dan )               │  badge uzrasta, gore lijevo, preko fotke
│                          │
│        FOTOGRAFIJA       │  aspect-4/3, object-cover
│                          │
│░░░░░░░░░░░░░░░░░░░░░░░░░░│  gradijent prema dnu
├──────────────────────────┤
│  ZA JAJA                 │  namjena, mala kapitalka
│  Crvena nesilica         │  naziv, font-heading
│  Kratki opis u dva reda. │
│                          │
│  Detalji →               │
└──────────────────────────┘
```

- Cijela kartica je `Link` na `/proizvodi/perad/{slug}`
- Fotka: `object-cover`, **bez** `object-contain mix-blend-multiply`. Taj par
  klasa u `ProductCard` postoji namjerno za snimke pakiranja na bijeloj
  podlozi; fotografija žive peradi kroz njega izgleda odrezano i isprano.
- Badge uzrasta: `age`, bijeli tekst na poluprozirnoj podlozi, gore lijevo
- Namjena: `purpose` mapiran u tekst (`tov` → "ZA TOV", `jaja` → "ZA JAJA"),
  zelena mala kapitalka na mjestu gdje `ProductCard` prikazuje proizvođača
- Vizualni jezik (radijusi, `border-green-100`, hover shadow, gradijent) prati
  postojeći `ProductCard` i `ShowcaseBlock`, tako da kategorija ne izgleda kao
  strano tijelo

Kartica gracioznije podnosi prazna polja: bez `age` nema badgea, bez `purpose`
nema kapitalke, bez `image` se koristi `FALLBACK_IMAGE`.

## 3. Ulaz u kategoriju

### Bento grid

`gridTemplateAreas` u
[src/components/products/CategoryGrid.tsx](../../../src/components/products/CategoryGrid.tsx)
je fiksni raspored s 19 slotova. Dodaje se novi red pune širine odmah nakon
`stocna`:

```
"zastita zastita gnojivo gnojivo"
"sjeme sjeme stocna stocna"
"perad perad perad perad"          <- novo
"sadni sadni substr substr"
"navod pcelar ulja enolog"
"stroj stroj alati stocar"
"kucni kucni kolinje gume"
"vrt vrt roba eko"
```

Nijedan postojeći slot ne mijenja poziciju ni veličinu. `CategoryCard` je
neosjetljiv na dimenzije tila (`h-full`, `min-h`, `object-cover`), radi na punoj
širini bez izmjena.

U `GRID_ORDER` (redoslijed na mobilnom) se `"perad"` ubacuje iza `"stocna"`.

### Broj kategorija u herou

Hero na [src/app/(site)/proizvodi/page.tsx](../../../src/app/(site)/proizvodi/page.tsx)
tvrdi "13 kategorija", a u gridu ih je 19. Podatak je zastario neovisno od ovog
zadatka. Ispravlja se na točan broj nakon dodavanja Peradi, provjeren protiv
baze, a ne protiv `GRID_ORDER`.

## 4. Rubni slučajevi

Budući da su to pravi `products` zapisi, dvije stvari se otvaraju same i moraju
se pokriti:

### Pretraga

[src/lib/search.ts](../../../src/lib/search.ts) je sirovi SQL nad
`products.name`, pa upiti "pile", "patka", "nesilica" vraćaju perad. To je
željeno ponašanje, SQL se ne dira.

Rezultati se renderiraju kroz `ProductCard`, pa tamo ide jedan branch: za
`categorySlug === "perad"` fotka ide `object-cover` bez `mix-blend-multiply`.
Branch se komentira, da se poslije zna zašto postoji.

### Detail stranice

`/proizvodi/perad/{slug}` postoje bez obzira na naš prikaz, jer je ruta
generička. Zato kartice u `PoultryGrid` linkaju na njih, konzistentno s
ostatkom sitea i s rezultatima pretrage.

Detail stranica za perad prikazuje naziv, opis, fotografiju i srodne
proizvode. Sekcija "Upute za primjenu" se ne renderira jer `instructions` nije
popunjen. Opisi se pišu dovoljno sadržajni da stranica ne izgleda prazna.

## 5. Fotografije

Ukupno 10: hero za kategoriju plus 9 po vrsti. Izvor su Unsplash i Pexels.

Postupak:

1. Sastavlja se kontakt-lista s linkovima i thumbnailima, po jedan predložak za
   svaku vrstu
2. Naručitelj odobrava odabir prije ubacivanja
3. Odobrene fotke se skidaju i uploadaju u `Media` kolekciju (R2 u produkciji)

Ništa se ne hotlinka, `next.config.ts` se ne mijenja.

**Rizično mjesto:** jednodnevno pile, grahorasto pile i trotjedno pile su
vizualno najsličniji. Za njih se traže fotke koje se razlikuju kadrom i
krupnim planom (jedno pile u ruci, grupa u leglu, pile s prvim perjem), da se
ne vidi da je isti motiv tri puta.

## 6. Tekstovi

Prvi nacrt opisa. Naručitelj ih pregledava i korigira, jer zna stvarno stanje
ponude i pasmine koje doista drži.

| Vrsta | Opis |
|---|---|
| Jednodnevno pile | Bijeli brojler za tov. Prvih tjedan dana traži toplo i suho mjesto te starter hranu za piliće. |
| Jednodnevna crvena nesilica | Crvena hibridna nesilica za proizvodnju jaja. Nosi smeđa jaja. |
| Jednodnevno grahorasto pile | Grahorasto pile, otpornija pasmina prikladna za slobodni uzgoj i domaći tov. |
| Jednodnevna patka | Pačić za tov. Brzo raste i dobro se prilagođava vanjskom uzgoju. |
| Jednodnevni purići | Purići za tov. Prvih tjedana traže višu temperaturu i hranu s više proteina od pilića. |
| Trotjedno pile | Pile s prvim perjem, prošlo najosjetljiviji period uzgoja. Spremno za prijelaz na vanjski prostor. |
| Osmotjedna nesilica | Podrasla nesilica, više ne traži grijanje. Do nesenja joj ostaje oko deset tjedana. |
| Osamnaesttjedna nesilica | Nesilica pred nesenjem. Prva jaja obično daje u roku dva do tri tjedna. |
| Petotjedni purani | Podrasli purani, prošli najzahtjevniju fazu uzgoja. Prikladni za domaći tov. |

## 7. Deploy

Redoslijed je obavezan, isti problem se već javio pri prethodnim promjenama
sheme:

1. Na produkcijskoj bazi, kao superuser:
   ```sql
   ALTER TABLE products ADD COLUMN age varchar;
   ALTER TABLE products ADD COLUMN purpose varchar;
   ```
2. Tek onda `npm run build`
3. Ako build padne, obrisati `.next` i ponoviti

## Provjera ispravnosti

Nema test runnera, `next build` je provjera. Uz to, ručno:

- `/proizvodi` — perad tile na punoj širini, ostalih 19 tila nepomaknuto,
  broj kategorija u herou točan
- `/proizvodi` na mobilnom — perad na poziciji iza stočne hrane
- `/proizvodi/perad` — dvije grupe, 5 i 4 kartice, fotke ispunjavaju okvir
- `/proizvodi/perad/jednodnevno-pile` — stranica nije prazna, nema sekcije
  "Upute za primjenu"
- `/proizvodi/pretraga?q=pile` — perad se pojavljuje, fotke ispunjavaju okvir
- Ostale kategorije nepromijenjene, `object-contain` na pakiranjima očuvan

## Izvan opsega

- Cijene i termini dolaska. Perad se prodaje po narudžbi, korisnik ide na
  kontakt.
- Sezonska dostupnost po vrsti. Ako se pokaže potrebnim, dodaje se kasnije kao
  polje na proizvodu.
- Zamjena stock fotografija vlastitima. Struktura je za to pripremljena,
  mijenja se samo `image` u adminu.
