/**
 * One-time seed script — writes directly to PostgreSQL via the `pg` module.
 * Bypasses Payload init entirely, avoiding tsx/ESM compatibility issues.
 *
 * Run with:  npm run seed
 * Requires:  DATABASE_URI in .env.local (loaded via --env-file)
 */
'use strict'
const { Client } = require('pg')
const { randomUUID } = require('crypto')

// ── Markdown → Lexical converter (minimal) ───────────────────────────────────
// Converts a subset of markdown (headings, paragraphs, bold, blockquotes,
// unordered/ordered lists) into Payload's Lexical JSON format.

function textNode(text, format = 0) {
  return { detail: 0, format, mode: 'normal', style: '', text, type: 'text', version: 1 }
}

function parseInline(line) {
  const nodes = []
  const re = /\*\*(.*?)\*\*/g
  let last = 0
  let m
  while ((m = re.exec(line)) !== null) {
    if (m.index > last) nodes.push(textNode(line.slice(last, m.index)))
    nodes.push(textNode(m[1], 1)) // bold = format 1
    last = m.index + m[0].length
  }
  if (last < line.length) nodes.push(textNode(line.slice(last)))
  return nodes.length ? nodes : [textNode(line)]
}

function paragraph(children) {
  return { children, direction: 'ltr', format: '', indent: 0, type: 'paragraph', version: 1 }
}

function heading(children, tag) {
  return { children, direction: 'ltr', format: '', indent: 0, tag, type: 'heading', version: 1 }
}

function blockquote(children) {
  return { children, direction: 'ltr', format: '', indent: 0, type: 'quote', version: 1 }
}

function listItem(children, value) {
  return { children, direction: 'ltr', format: '', indent: 0, type: 'listitem', value, version: 1 }
}

function list(children, listType) {
  return { children, direction: 'ltr', format: '', indent: 0, listType, start: 1, tag: listType === 'bullet' ? 'ul' : 'ol', type: 'list', version: 1 }
}

function markdownToLexical(md) {
  const lines = md.split('\n')
  const children = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    if (!line.trim()) { i++; continue }

    // Headings
    const hMatch = line.match(/^(#{1,4})\s+(.+)/)
    if (hMatch) {
      const level = hMatch[1].length
      const tag = `h${Math.min(level + 1, 4)}` // h2-h4
      children.push(heading(parseInline(hMatch[2]), tag))
      i++; continue
    }

    // Blockquote
    if (line.startsWith('> ')) {
      children.push(blockquote(parseInline(line.slice(2))))
      i++; continue
    }

    // Unordered list
    if (line.match(/^[-*]\s/)) {
      const items = []
      let val = 1
      while (i < lines.length && lines[i].match(/^[-*]\s/)) {
        items.push(listItem(parseInline(lines[i].slice(2)), val++))
        i++
      }
      children.push(list(items, 'bullet'))
      continue
    }

    // Ordered list
    if (line.match(/^\d+\.\s/)) {
      const items = []
      let val = 1
      while (i < lines.length && lines[i].match(/^\d+\.\s/)) {
        items.push(listItem(parseInline(lines[i].replace(/^\d+\.\s/, '')), val++))
        i++
      }
      children.push(list(items, 'number'))
      continue
    }

    // Table — skip for simplicity
    if (line.startsWith('|')) { i++; continue }

    // Paragraph
    children.push(paragraph(parseInline(line)))
    i++
  }

  return { root: { children, direction: 'ltr', format: '', indent: 0, type: 'root', version: 1 } }
}

// ── Seed data (inlined from src/data/*.ts) ───────────────────────────────────

const blogPosts = [
  {
    slug: 'proljetna-gnojidba',
    title: 'Proljetna gnojidba - Kako pripremiti tlo za novu sezonu',
    excerpt: 'Saznajte kako pravilno pripremiti tlo za proljetnu sjetvu uz optimalan odabir gnojiva i pravilnu primjenu hraniva za maksimalne prinose.',
    date: '2025-03-15',
    readingTime: 5,
    tags: ['gnojidba', 'proljeće', 'tlo'],
    content: `## Važnost proljetne gnojidbe

Proljetna gnojidba jedan je od najvažnijih agrotehničkih zahvata koji direktno utječe na prinos i kvalitetu vaših kultura. Pravilna priprema tla i odabir gnojiva ključni su za uspješnu sezonu.

## Analiza tla

Prije svake gnojidbe preporučamo napraviti analizu tla. Na temelju rezultata možete točno odrediti koje hranive nedostaju i u kojim količinama ih primijeniti.

### Što analiza tla pokazuje?

- Razinu pH vrijednosti
- Sadržaj dušika, fosfora i kalija
- Količinu organske tvari
- Sadržaj mikroelemenata

## Preporučena gnojiva

Za proljetnu gnojidbu preporučamo:

- **YARA Mila** - kompleksno gnojivo za osnovnu gnojidbu
- **Petrokemija NPK** - provjereno gnojivo za ratarske kulture
- **Haifa Multi-K** - za kalijemsku prihranu

## Raspored gnojidbe

1. **Veljača/Ožujak**: Osnovna gnojidba NPK gnojivima
2. **Travanj**: Prva prihrana dušičnim gnojivima
3. **Svibanj**: Druga prihrana i folijarna gnojidba

> Svaka kultura ima specifične potrebe za hranjivima. Posjetite nas u Pleternici ili Požegi za stručno savjetovanje prilagođeno vašim potrebama.

Naš stručni tim uvijek vam je na raspolaganju za savjetovanje o optimalnom programu gnojidbe za vaše kulture.`,
  },
  {
    slug: 'zastita-vinograda-od-peronospore',
    title: 'Zaštita vinograda od peronospore',
    excerpt: 'Peronospora je jedna od najopasnijih bolesti vinove loze. Pravovremena zaštita ključna je za očuvanje vašeg vinograda i kvalitetan urod.',
    date: '2025-05-20',
    readingTime: 7,
    tags: ['vinograd', 'zaštita', 'peronospora'],
    content: `## Što je peronospora?

Peronospora (Plasmopara viticola) je gljivična bolest vinove loze koja može uzrokovati značajne štete na listu, cvijetu i plodu. U vlažnim uvjetima može uništiti i do 80% uroda.

## Simptomi

Na licu lista pojavljuju se žućkaste, uljaste pjege. Na naličju se razvija bijela prevlaka - sporulacija gljive. Na bobicama se pojavljuje smeđa boja i sušenje.

### Kritični periodi

- **Cvjetanje** - najosjetljivija faza
- **Formiranje bobica** - visoki rizik
- **Dozrijevanje** - smanjen ali prisutan rizik

## Program zaštite

### Preventivna zaštita

Preventivna zaštita počinje kad mladice dosegnu 10-15 cm duljine:

- **Bakreni preparati** - u ranim fazama vegetacije
- **Kontaktni fungicidi** - za osnovnu zaštitu
- **Sistemični fungicidi** - za naprednu zaštitu u kritičnim fazama

### Naš asortiman za zaštitu vinograda

U našoj ponudi nalaze se provjereni proizvodi od vodećih proizvođača:

- Syngenta portfolio za vinograd
- Bayer rješenja za vinogradarstvo
- BASF fungicidi za vinovu lozu

> Redovitost prskanja i pravilan izbor sredstava ključni su za uspješnu zaštitu. Ne čekajte pojavu bolesti - djelujte preventivno!

Posjetite nas za individualni program zaštite prilagođen vašem vinogradu.`,
  },
  {
    slug: 'navodnjavanje-kap-po-kap',
    title: 'Navodnjavanje kap po kap - Prednosti i ugradnja',
    excerpt: 'Sustav navodnjavanja kap po kap štedi vodu, smanjuje troškove i značajno povećava prinose. Saznajte sve o ugradnji i prednostima.',
    date: '2025-06-10',
    readingTime: 6,
    tags: ['navodnjavanje', 'tehnika', 'usteda-vode'],
    content: `## Zašto navodnjavanje kap po kap?

Navodnjavanje kap po kap jedan je od najefikasnijih načina navodnjavanja koji vodu dovodi direktno u zonu korijena biljke. Ovaj sustav štedi do 60% vode u usporedbi s klasičnim navodnjavanjem.

## Prednosti sustava

- **Ušteda vode** - do 60% manja potrošnja
- **Ravnomjerna raspodjela** - svaka biljka dobiva jednaku količinu
- **Manje korova** - voda ide samo gdje je potrebna
- **Veći prinosi** - optimalna vlažnost tla
- **Automatizacija** - mogućnost programiranja

## Komponente sustava

### Osnovni elementi

1. **Izvor vode** - bunar, cisterna ili vodovodna mreža
2. **Filtar** - za čišćenje vode od nečistoća
3. **Glavna cijev** - dovodi vodu do parcele
4. **Lateralne cijevi** - raspodjeljuju vodu po redovima
5. **Kapljači** - ispuštaju vodu kap po kap

### Kako odabrati pravu cijev?

Izbor cijevi ovisi o:
- Razmaku između biljaka
- Tipu tla
- Potrebnoj količini vode
- Duljini reda

## Ugradnja korak po korak

1. Planirajte raspored cijevi prema kulturi
2. Postavite filtar na izvor vode
3. Položite glavnu cijev
4. Spojite lateralne cijevi
5. Testirajte sustav prije sadnje

> Pravilno dimenzioniran sustav navodnjavanja jedna je od najboljih investicija u vašoj poljoprivredi. Dođite k nama - pomoći ćemo vam odabrati idealan sustav za vaše potrebe.

Nudimo kompletnu opremu za navodnjavanje i stručnu pomoć pri odabiru.`,
  },
  {
    slug: 'izbor-sjemena-za-povrtnjak',
    title: 'Izbor sjemena za povrtnjak',
    excerpt: 'Kvalitetno sjeme temelj je uspješnog povrtnjaka. Vodič za odabir najboljih sorti za vašu klimatsku zonu i tip tla.',
    date: '2025-02-28',
    readingTime: 4,
    tags: ['sjeme', 'povrtnjak', 'savjeti'],
    content: `## Kako odabrati pravo sjeme?

Izbor sjemena ovisi o nekoliko ključnih faktora: klimatskim uvjetima, tipu tla, željenom vremenu berbe i vašim osobnim preferencijama. Kvalitetno sjeme jamči zdrave biljke i obilne prinose.

## Kriteriji za odabir

### Klimatski uvjeti

Slavonija i Požeština imaju kontinentalnu klimu s toplim ljetima i hladnim zimama. Birajte sorte prilagođene našim uvjetima.

### Tip tla

- **Lakša tla** - pogodna za korijenašce (mrkva, peršin)
- **Teška tla** - dobra za kupusnjače i krumpir
- **Humusna tla** - idealna za rajčice i paprike

## Preporučene sorte za našu regiju

### Rajčica
- Bejo hibridne sorte - otporne i produktivne
- Clause cherry rajčice - odličnog okusa

### Paprika
- Rijk Zwaan sorte - visoki prinosi
- Domaće sorte za tradicionalnu pripremu

### Krastavci
- Bejo Zaden salatni krastavci
- Kornisoni za kiseljenje

### Salata
- Cjelogodišnje sorte od Rijk Zwaan
- Ledena salata za ljetni uzgoj

## Raspored sjetve

| Kultura | Sjetva | Berba |
|---------|--------|-------|
| Rajčica | Ožujak (presad) | Srpanj-Rujan |
| Paprika | Veljača (presad) | Srpanj-Rujan |
| Krastavac | Travanj-Svibanj | Lipanj-Rujan |
| Salata | Ožujak-Rujan | Cijelu sezonu |
| Mrkva | Ožujak-Lipanj | Lipanj-Studeni |

> Posjetite nas u Pleternici ili Požegi i razgledajte kompletnu ponudu sjemena. Naš stručni tim pomoći će vam odabrati idealne sorte za vaš povrtnjak.

Imamo više od 500 vrsta sjemena od renomiranih europskih sjemenarskih kuća.`,
  },
]

const testimonials = [
  { quote: 'S Oroz PHARM-om surađujemo već više od deset godina. Uvijek su tu s pravim savjetom, kvalitetnim sjemenom i gnojivima na vrijeme. Bez njih naša bi OPG priča bila puno teža.', name: 'Ivan Pavlović', company: 'OPG Pavlović' },
  { quote: 'Odlična ponuda sredstava za zaštitu vinograda i stručan pristup svakom upitu. Ekipa iz Požege uvijek preporuči pravo rješenje za naše potrebe, bez nepotrebne prodaje.', name: 'Marija Horvat', company: 'Vinarija Horvat' },
  { quote: 'Nabavljamo pčelarsku opremu i prehranu za pčele isključivo kod njih. Asortiman je uvijek kompletan, a cijene su poštene. Preporučujem svim pčelarima u regiji.', name: 'Stjepan Blažević', company: 'OPG Blažević' },
  { quote: 'Koristimo njihova gnojiva i stočnu hranu već godinama. Kvaliteta je konstantna, a dostava uvijek točna. Pouzdani partner za svako gospodarstvo.', name: 'Zdravko Marić', company: 'Farma Marić' },
  { quote: 'Kao mladi OPG, Oroz PHARM nam je pomogao savjetom pri prvom postavljanju navodnjavanja. Stručnost i strpljivost osoblja zaista se cijeni kad tek počinješ.', name: 'Petra Jurić', company: 'OPG Jurić' },
  { quote: 'Redovito nabavljamo sadnice, supstrat i opremu za povrtlarstvo. Sve je na jednom mjestu, a savjeti su uvijek besplatni i stručni. Pravi partner u poslu.', name: 'Ante Kovač', company: 'OPG Kovač' },
]

const categories = [
  { slug: 'sjemenski-program', name: 'Sjemenski program', description: 'Sjeme ratarskih kultura, uljarica, trava, djetelina i hibrida povrća vrhunskih sjemenarskih kuća.', icon: 'sprout', gridArea: 'sjeme', subcategories: [{ id: 'ratarskih-kultura', name: 'Ratarskih kultura' }, { id: 'uljarice', name: 'Uljarice' }, { id: 'trave-i-djeteline', name: 'Trave i djeteline' }, { id: 'hibridi-povrca', name: 'Hibridi povrća' }, { id: 'ostalo', name: 'Ostalo' }] },
  { slug: 'gnojiva', name: 'Gnojiva', description: 'Mineralna i organska gnojiva, biostimulatori i poboljšivači tla za optimalan rast vaših kultura.', icon: 'flask-conical', gridArea: 'gnojivo', subcategories: [{ id: 'mineralna', name: 'Mineralna' }, { id: 'organska', name: 'Organska' }, { id: 'biostimulatori', name: 'Biostimulatori' }, { id: 'poboljsivaci-tla', name: 'Poboljšivači tla' }, { id: 'ostalo', name: 'Ostalo' }] },
  { slug: 'zastita-bilja', name: 'Zaštita bilja', description: 'Herbicidi, fungicidi, insekticidi i biocidi vodećih svjetskih proizvođača za zaštitu vaših usjeva i nasada.', icon: 'shield', gridArea: 'zastita', subcategories: [{ id: 'herbicidi', name: 'Herbicidi' }, { id: 'fungicidi', name: 'Fungicidi' }, { id: 'insekticidi', name: 'Insekticidi' }, { id: 'limacidi', name: 'Limacidi' }, { id: 'biocidi-rodenticidi', name: 'Biocidi/Rodenticidi' }, { id: 'ostalo', name: 'Ostalo' }] },
  { slug: 'stocna-hrana', name: 'Stočna hrana', description: 'Kompletna hrana za sve vrste domaćih životinja od provjerenih domaćih i stranih proizvođača.', icon: 'wheat', gridArea: 'stocna', subcategories: [{ id: 'sano', name: 'Sano' }, { id: 'tsh-cakovec', name: 'TSH Čakovec' }, { id: 'patent', name: 'Patent' }, { id: 'genera', name: 'Genera' }, { id: 'lek', name: 'Lek' }, { id: 'valpovka', name: 'Valpovka' }, { id: 'ostalo', name: 'Ostalo' }] },
  { slug: 'sadni-materijal', name: 'Sadni materijal', description: 'Voćne sadnice, sadnice vinove loze, prijesadnice cvijeća, lučica i sjemenski krumpir.', icon: 'tree-pine', gridArea: 'sadni', subcategories: [{ id: 'vocne-sadnice', name: 'Voćne sadnice' }, { id: 'sadnice-vinove-loze', name: 'Sadnice vinove loze' }, { id: 'prijesadnice-cvijeca', name: 'Prijesadnice cvijeća' }, { id: 'lucica', name: 'Lučica' }, { id: 'sjemenski-krumpir', name: 'Sjemenski krumpir' }, { id: 'ostalo', name: 'Ostalo' }] },
  { slug: 'oprema-za-povrtlarstvo', name: 'Oprema za povrtlarstvo i cvjećarstvo', description: 'Profesionalni supstrati, plastenička folija, mreže i sva oprema za povrtlarstvo i cvjećarstvo.', icon: 'layers', gridArea: 'substr', subcategories: [{ id: 'klasmann', name: 'Klasmann' }, { id: 'florabella', name: 'Florabella' }, { id: 'brill', name: 'Brill' }, { id: 'hawita', name: 'Hawita' }, { id: 'plantella', name: 'Plantella' }, { id: 'plastenička-folija', name: 'Plastenička folija' }, { id: 'mreze', name: 'Mreže' }, { id: 'ostalo', name: 'Ostalo' }] },
  { slug: 'navodnjavanje', name: 'Navodnjavanje', description: 'Pumpe, crijeva, rasprskivači i sva oprema za navodnjavanje usjeva.', icon: 'droplets', gridArea: 'navod', subcategories: [{ id: 'pumpe', name: 'Pumpe' }, { id: 'spojnice-i-ventili', name: 'Spojnice i ventili' }, { id: 'crijeva-kap', name: 'Crijeva kap po kap' }, { id: 'rasprskivaci', name: 'Rasprskivači' }, { id: 'ostalo', name: 'Ostalo' }] },
  { slug: 'enologija', name: 'Enologija', description: 'Boce, kvasci, inox bačve, kanisteri i sva oprema za vinarstvo i proizvodnju kvalitetnog vina.', icon: 'grape', gridArea: 'enolog', subcategories: [{ id: 'boce', name: 'Boce' }, { id: 'kvasci', name: 'Kvasci' }, { id: 'inox-bacve', name: 'Inox bačve' }, { id: 'kanisteri', name: 'Kanisteri' }, { id: 'ostalo', name: 'Ostalo' }] },
  { slug: 'oprema-za-pcelarstvo', name: 'Oprema za pčelarstvo', description: 'Staklenke, poklopci, pogače, košnice i sva potrebna oprema za uspješno pčelarenje.', icon: 'hexagon', gridArea: 'pcelar', subcategories: [{ id: 'staklenke', name: 'Staklenke' }, { id: 'poklopci', name: 'Poklopci' }, { id: 'pogace', name: 'Pogače' }, { id: 'kosnice', name: 'Košnice' }, { id: 'ostalo', name: 'Ostalo' }] },
  { slug: 'poljoprivredni-strojevi', name: 'Poljoprivredni strojevi', description: 'Kosilice, motorne pile, trimeri i druga mehanizacija za poljoprivredu i vrtlarstvo.', icon: 'tractor', gridArea: 'stroj', subcategories: [{ id: 'kosilice', name: 'Kosilice' }, { id: 'motorne-pile', name: 'Motorne pile' }, { id: 'trimeri', name: 'Trimeri' }, { id: 'ostalo', name: 'Ostalo' }] },
  { slug: 'alati', name: 'Alati', description: 'Škare i pile za rezidbu, alatke i držala za profesionalan i hobi rad u vrtu i voćnjaku.', icon: 'scissors', gridArea: 'alati', subcategories: [{ id: 'skare-i-pile-za-rezidbu', name: 'Škare i pile za rezidbu' }, { id: 'alatke-i-drzala', name: 'Alatke i držala' }] },
  { slug: 'oprema-za-stocarstvo', name: 'Oprema za stočarstvo', description: 'Hranilice, pojilice, električni pastiri i sva potrebna oprema za stočarstvo.', icon: 'fence', gridArea: 'stocar', subcategories: [{ id: 'hranilice-i-pojilice', name: 'Hranilice i pojilice' }, { id: 'pastiri-i-oprema', name: 'Pastiri i oprema' }] },
  { slug: 'ulja-i-maziva', name: 'Ulja i maziva', description: 'Motorna ulja, maziva, antifriz i tekućine za stakla za poljoprivrednu mehanizaciju.', icon: 'oil-can', gridArea: 'ulja', subcategories: [{ id: 'ulja', name: 'Ulja' }, { id: 'maziva', name: 'Maziva' }, { id: 'antifriz', name: 'Antifriz' }, { id: 'tekucine-za-stakla', name: 'Tekućine za stakla' }] },
  { slug: 'kucni-ljubimci', name: 'Kućni ljubimci', description: 'Hrana za golubove, pse, mačke, ptice i ribe.', icon: 'paw-print', gridArea: 'kucni', subcategories: [{ id: 'hrana-za-golubove', name: 'Hrana za golubove' }, { id: 'hrana-i-oprema-za-pse-i-macke', name: 'Hrana i oprema za pse i mačke' }, { id: 'hrana-za-ptice-i-ribe', name: 'Hrana za ptice i ribe' }] },
  { slug: 'pribor-za-kolinje', name: 'Pribor za kolinje', description: 'Crijeva, punilice, mesoreznice, noževi, kuke i sav pribor za kolinje.', icon: 'utensils', gridArea: 'kolinje', subcategories: [{ id: 'crijeva', name: 'Crijeva' }, { id: 'punilice', name: 'Punilice' }, { id: 'mesoreznice', name: 'Mesoreznice' }, { id: 'nozevi', name: 'Noževi' }, { id: 'kuke', name: 'Kuke' }] },
  { slug: 'gume-i-zracnice', name: 'Gume i zračnice', description: 'Gume i zračnice za bicikle, tačke i ostalu ne-motoriziranu opremu.', icon: 'circle', gridArea: 'gume', subcategories: [] },
  { slug: 'vrt-i-okucnica', name: 'Vrt i okućnica', description: 'Tačke, nit za košnju, rukavice, čizme, lampioni i ostala oprema za vrt i okućnicu.', icon: 'home', gridArea: 'vrt', subcategories: [{ id: 'tacke', name: 'Tačke' }, { id: 'nit-za-kosnju', name: 'Nit za košnju-Flax' }, { id: 'rukavice', name: 'Rukavice' }, { id: 'cizme', name: 'Čizme' }, { id: 'lampioni', name: 'Lampioni' }] },
  { slug: 'roba-siroke-potrosnje', name: 'Roba široke potrošnje', description: 'Kace, bačve, kante, lončanice za cvijeće, sprejevi i ostala roba široke potrošnje.', icon: 'shopping-bag', gridArea: 'roba', subcategories: [{ id: 'kace', name: 'Kace' }, { id: 'bacve', name: 'Bačve' }, { id: 'kante', name: 'Kante' }, { id: 'loncanice-za-cvijece', name: 'Lončanice za cvijeće' }, { id: 'sprejevi', name: 'Sprejevi' }] },
  { slug: 'ekoloski-proizvodi', name: 'Ekološki proizvodi', description: 'Ekološki preparati i sredstva za organsku poljoprivredu bez umjetnih gnojiva i pesticida.', icon: 'leaf', gridArea: 'eko', subcategories: [] },
]

// ── Main ──────────────────────────────────────────────────────────────────────

async function seed() {
  const client = new Client({ connectionString: process.env.DATABASE_URI })
  await client.connect()

  try {
    // ── Blogs ────────────────────────────────────────────────────────────────
    console.log('\nSeeding blogs...')
    for (const post of blogPosts) {
      const content = markdownToLexical(post.content)
      const res = await client.query(
        `INSERT INTO blogs (title, slug, excerpt, date, reading_time, content)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id`,
        [post.title, post.slug, post.excerpt, post.date, post.readingTime, JSON.stringify(content)]
      )
      const blogId = res.rows[0].id
      for (let i = 0; i < post.tags.length; i++) {
        await client.query(
          `INSERT INTO blogs_tags (_order, _parent_id, id, tag) VALUES ($1, $2, $3, $4)`,
          [i + 1, blogId, randomUUID(), post.tags[i]]
        )
      }
      console.log(`  + ${post.title}`)
    }

    // ── Testimonials ─────────────────────────────────────────────────────────
    console.log('\nSeeding testimonials...')
    for (let i = 0; i < testimonials.length; i++) {
      const t = testimonials[i]
      await client.query(
        `INSERT INTO testimonials (quote, author, company, "order") VALUES ($1, $2, $3, $4)`,
        [t.quote, t.name, t.company, i + 1]
      )
      console.log(`  + ${t.name}`)
    }

    // ── Categories ───────────────────────────────────────────────────────────
    console.log('\nSeeding categories...')
    for (const cat of categories) {
      const res = await client.query(
        `INSERT INTO categories (name, slug, description, icon, grid_area)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        [cat.name, cat.slug, cat.description, cat.icon, cat.gridArea]
      )
      const catId = res.rows[0].id
      for (let i = 0; i < cat.subcategories.length; i++) {
        const sub = cat.subcategories[i]
        await client.query(
          `INSERT INTO categories_subcategories (_order, _parent_id, id, name, slug)
           VALUES ($1, $2, $3, $4, $5)`,
          [i + 1, catId, randomUUID(), sub.name, sub.id]
        )
      }
      console.log(`  + ${cat.name}`)
    }

    console.log('\nSeeding complete!')
  } finally {
    await client.end()
  }
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
