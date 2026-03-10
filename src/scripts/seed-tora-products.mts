/**
 * Seeds TORA product line from Agrochem Maks into the Products collection.
 *
 * Prerequisites:
 *   - Categories and subcategories must exist (run seed.ts first)
 *   - TORA product images must be uploaded to Media with alt text: agrochem-maks-tora-{slug}
 *
 * Safe to re-run — existing slugs are updated, not duplicated.
 *
 * Run with:
 *   node --env-file=.env.local --import tsx/esm src/scripts/seed-tora-products.mts
 */

import { getPayload } from 'payload'
import config from '@payload-config'
import {
  editorConfigFactory,
  convertMarkdownToLexical,
} from '@payloadcms/richtext-lexical'

interface ProductData {
  name: string
  slug: string
  categorySlug: string
  subcategorySlug: string | null
  imageAltContains: string | null
  description: string
  instructions: string // markdown
}

const PRODUCTS: ProductData[] = [
  // ── Mineralna gnojiva ──────────────────────────────────────────────────────
  {
    name: 'TORA MICRO MAGNICAL B',
    slug: 'tora-micro-magnical-b',
    categorySlug: 'gnojiva',
    subcategorySlug: 'mineralna-gnojiva',
    imageAltContains: 'magnical-b',
    description:
      'Folijarno gnojivo koje kombinira magnezij (Mg), kalcij (Ca) i bor (B) za korekciju nedostataka mikroelemenata i unaprjeđenje kvalitete prinosa.',
    instructions: `Primjenjuje se folijarno prskanjem biljaka u vegetativnoj fazi.

- Preporučena doza: 1–2 l/ha, otopljeno u 200–300 l vode
- Primijeniti 2–3 puta u sezoni u razmacima od 10–14 dana`,
  },
  {
    name: 'TORA MICRO BOR MAX',
    slug: 'tora-micro-bor-max',
    categorySlug: 'gnojiva',
    subcategorySlug: 'mineralna-gnojiva',
    imageAltContains: 'bor-max',
    description:
      'Folijarno gnojivo na bazi bora za stimulaciju cvatnje, oplodnje i razvoja plodova. Preporučeno za kulture osjetljive na nedostatak bora.',
    instructions: `Primijeniti folijarno u fazi butonizacije i cvatnje.

- Doza: 0,5–1 l/ha u 200–300 l vode
- Primjena 1–2 puta u sezoni`,
  },
  {
    name: 'TORA MICRO COMBI MAX',
    slug: 'tora-micro-combi-max',
    categorySlug: 'gnojiva',
    subcategorySlug: 'mineralna-gnojiva',
    imageAltContains: 'combi-max',
    description:
      'Kompleksno folijarno gnojivo s optimalnim omjerom željeza (Fe) i ostalih mikroelemenata (Mn, Zn, Cu, Mo, B). Certificirano od ECOCERT-a za primjenu u ekološkoj proizvodnji.',
    instructions: `Primijeniti folijarno u intenzivnom porastu biljke.

- Doza: 1–2 l/ha u 200–400 l vode
- Primijeniti 2–4 puta u sezoni`,
  },
  {
    name: 'TORA ENERGY START (10-45-10+ME)',
    slug: 'tora-energy-start',
    categorySlug: 'gnojiva',
    subcategorySlug: 'mineralna-gnojiva',
    imageAltContains: 'energy-start',
    description:
      'Vodotopivo NPK gnojivo s pojačanim sadržajem fosfora (45%) za snažan razvoj korijenskog sustava i brzi start biljke na početku vegetacije.',
    instructions: `Primjenjuje se fertirigacijom ili folijarno u fazi nicanja i ranog porasta.

- Folijarno: 2–4 kg/ha u 200–400 l vode
- Fertirigacijom: 3–5 kg/1000 m²`,
  },
  {
    name: 'TORA ENERGY BALANCE (20-20-20+ME)',
    slug: 'tora-energy-balance',
    categorySlug: 'gnojiva',
    subcategorySlug: 'mineralna-gnojiva',
    imageAltContains: 'energy-balance',
    description:
      'Uravnoteženo vodotopivo NPK gnojivo s jednakim udjelom dušika, fosfora i kalija za ujednačenu ishranu biljke tijekom cijele vegetacije.',
    instructions: `Primjenjuje se fertirigacijom ili folijarno. Primijeniti više puta prema potrebi.

- Folijarno: 2–4 kg/ha u 200–400 l vode
- Fertirigacijom: 3–5 kg/1000 m²`,
  },
  {
    name: 'TORA ENERGY ACTIVE (15-5-30+ME)',
    slug: 'tora-energy-active',
    categorySlug: 'gnojiva',
    subcategorySlug: 'mineralna-gnojiva',
    imageAltContains: 'energy-active',
    description:
      'Vodotopivo NPK gnojivo s visokim sadržajem kalija (30%) za intenzivan razvoj i punjenje plodova u fazi nakon zametanja.',
    instructions: `Primjenjuje se fertirigacijom ili folijarno u fazi zametanja i razvoja plodova.

- Folijarno: 2–4 kg/ha u 200–400 l vode
- Fertirigacijom: 3–5 kg/1000 m²`,
  },
  {
    name: 'TORA TURBO CEREALS',
    slug: 'tora-turbo-cereals',
    categorySlug: 'gnojiva',
    subcategorySlug: 'mineralna-gnojiva',
    imageAltContains: 'turbo-cereals',
    description:
      'Specijalizirano folijarno gnojivo s biostimulatnim djelovanjem za žitarice. Kombinacija makro i mikroelemenata s biostimulatorima za povećanje prinosa i kvalitete zrna.',
    instructions: `Primjenjuje se folijarno na žitarice. Može se miješati s pesticidima.

- Doza: 2–3 l/ha u 200–300 l vode
- Preporučena primjena u fazi vlatanja (BBCH 30–37) i klasanja (BBCH 51–59)`,
  },
  {
    name: 'TORA TURBO CORN',
    slug: 'tora-turbo-corn',
    categorySlug: 'gnojiva',
    subcategorySlug: 'mineralna-gnojiva',
    imageAltContains: 'turbo-corn',
    description:
      'Specijalizirano folijarno gnojivo s biostimulatnim djelovanjem za kukuruz. Formula prilagođena potrebama kukuruza u ključnim fazama rasta.',
    instructions: `Primjenjuje se folijarno na kukuruz.

- Doza: 2–3 l/ha u 200–300 l vode
- Preporučena primjena u fazi 4–6 listova (BBCH 14–16) i metličanja (BBCH 51–59)`,
  },
  {
    name: 'TORA TURBO OILSEEDS',
    slug: 'tora-turbo-oilseeds',
    categorySlug: 'gnojiva',
    subcategorySlug: 'mineralna-gnojiva',
    // Filename has OILSEED (no S), match on common substring
    imageAltContains: 'turbo-oilseed',
    description:
      'Specijalizirano folijarno gnojivo s biostimulatnim djelovanjem za uljarice. Formula prilagođena za uljanu repicu, suncokret i soju.',
    instructions: `Primjenjuje se folijarno na uljarice.

- Doza: 2–3 l/ha u 200–300 l vode
- Uljana repica: primijeniti u fazi rozete
- Suncokret/soja: primijeniti u fazi 2–4 para listova`,
  },
  {
    name: 'TORA STAGE CANDY+',
    slug: 'tora-stage-candy-plus',
    categorySlug: 'gnojiva',
    subcategorySlug: 'mineralna-gnojiva',
    // Filename TORA-CANDY-PLUS (without STAGE)
    imageAltContains: 'candy-plus',
    description:
      'Specijalizirano folijarno gnojivo za povećanje sadržaja šećera, poboljšanje obojenosti i kvalitete plodova. Sadrži kombinaciju kalija, fosfora i aminokiselina.',
    instructions: `Primijeniti folijarno u fazi dozrijevanja plodova.

- Doza: 2–3 l/ha u 200–400 l vode
- Primijeniti 2–3 puta u razmacima od 7–10 dana`,
  },

  // ── Biostimulatori ─────────────────────────────────────────────────────────
  {
    name: 'TORA N-LEAF',
    slug: 'tora-n-leaf',
    categorySlug: 'gnojiva',
    subcategorySlug: 'biostimulatori',
    imageAltContains: 'n-leaf',
    description:
      'Biostimulator na bazi selektiranih sojeva bakterija (Azotobacter, Azospirillum) za fiksaciju slobodnog atmosferskog dušika i povećanje iskoristivosti primijenjenih gnojiva.',
    instructions: `Primjenjuje se tretiranjem sjemena, folijarno ili aplikacijom u tlo.

- Tretiranje sjemena: 0,5–1 l/100 kg sjemena
- Folijarno: 1–2 l/ha u 200–300 l vode
- Primijeniti 2–3 puta u vegetaciji`,
  },
  {
    name: 'TORA P-SOIL',
    slug: 'tora-p-soil',
    categorySlug: 'gnojiva',
    subcategorySlug: 'biostimulatori',
    imageAltContains: 'p-soil',
    description:
      'Biostimulator na bazi selektiranih bakterija za mobilizaciju fosfora iz tla i povećanje pristupačnosti fosfora biljci bez povećanja doze mineralnih gnojiva.',
    instructions: `Primjenjuje se tretiranjem sjemena ili aplikacijom u tlo pri pripremi tla ili u ranoj vegetaciji.

- Tretiranje sjemena: 0,5–1 l/100 kg sjemena
- Aplikacija u tlo: 1–2 l/ha u 300–400 l vode`,
  },
  {
    name: 'TORA STAGE ROOT',
    slug: 'tora-stage-root',
    categorySlug: 'gnojiva',
    subcategorySlug: 'biostimulatori',
    imageAltContains: 'stage-root',
    description:
      'Biostimulator za ukorjenjivanje i startnu ishranu biljke. Kombinacija aminokiselina, huminske kiseline i mikroelemenata za brzi razvoj korijenskog sustava.',
    instructions: `Primjenjuje se fertirigacijom ili zalivanjem pri transplantaciji, sadnji ili neposredno nakon nicanja.

- Doza: 1–2 l/ha ili 0,1–0,2 l/100 m²`,
  },
  {
    name: 'TORA STAGE SET',
    slug: 'tora-stage-set',
    categorySlug: 'gnojiva',
    subcategorySlug: 'biostimulatori',
    imageAltContains: 'stage-set',
    description:
      'Bioaktivna kombinacija bora i aminokiselina za poboljšanje cvatnje i oplodnje. Reducira osipanje cvjetova i povećava postotak zametnute plodine.',
    instructions: `Primijeniti folijarno u fazi butonizacije i punog cvata, po mogućnosti ujutro ili navečer.

- Doza: 1–2 l/ha u 200–300 l vode
- Primjena 1–2 puta u razmacima od 7–10 dana`,
  },
  {
    name: 'TORA VITA FUSION',
    slug: 'tora-vita-fusion',
    categorySlug: 'gnojiva',
    subcategorySlug: 'biostimulatori',
    imageAltContains: 'vita-fusion',
    description:
      'Biostimulator nove generacije s kombinacijom aminokiselina, osmoprotektanata i elicitora otpornosti za zaštitu biljaka od stresa uzrokovanog mrazom, sušom i visokim temperaturama.',
    instructions: `Primijeniti folijarno preventivno ili odmah nakon stresnog događaja (mraz, suša, toplinski udar).

- Doza: 2–3 l/ha u 200–400 l vode
- Primijeniti 2–4 puta u sezoni prema potrebi`,
  },

  // ── Ostalo ────────────────────────────────────────────────────────────────
  {
    name: 'TORA MICRO BLUE',
    slug: 'tora-micro-blue',
    categorySlug: 'gnojiva',
    subcategorySlug: 'ostalo',
    imageAltContains: 'micro-blue',
    description:
      'Folijarno gnojivo na bazi bakra s fungicidnim i baktericidnim djelovanjem. Univerzalno rješenje za istovremenu zaštitu i ishranu biljaka u jednoj aplikaciji.',
    instructions: `Primijeniti folijarno kao preventivnu ili kurativnu mjeru zaštite biljaka od gljivičnih i bakterijskih bolesti. Kompatibilno s većinom pesticida.

- Doza: 2–3 l/ha u 200–400 l vode
- Primijeniti u razmacima od 10–14 dana ili prema pojavi simptoma`,
  },
]

async function seedToraProducts() {
  const payload = await getPayload({ config })
  const editorConfig = await editorConfigFactory.default({ config: payload.config })

  // 1. Find or create manufacturer Agrochem Maks
  console.log('\n── Manufacturer ──')
  let manufacturerId: number
  const mfgResult = await payload.find({
    collection: 'manufacturers',
    where: { slug: { equals: 'agrochem-maks' } },
    limit: 1,
  })
  if (mfgResult.docs.length > 0) {
    manufacturerId = mfgResult.docs[0].id
    console.log(`  ✓ Found: Agrochem Maks (#${manufacturerId})`)
  } else {
    const mfg = await payload.create({
      collection: 'manufacturers',
      data: { name: 'Agrochem Maks', slug: 'agrochem-maks' },
    })
    manufacturerId = mfg.id
    console.log(`  + Created: Agrochem Maks (#${manufacturerId})`)
  }

  // 2. Load all needed categories
  console.log('\n── Categories ──')
  const allCategorySlugs = [...new Set(PRODUCTS.map((p) => p.categorySlug))]
  const categoryIds: Record<string, number> = {}
  for (const slug of allCategorySlugs) {
    const result = await payload.find({
      collection: 'categories',
      where: { slug: { equals: slug } },
      limit: 1,
    })
    if (!result.docs[0]) throw new Error(`Category "${slug}" not found — run seed.ts first.`)
    categoryIds[slug] = result.docs[0].id
    console.log(`  ✓ ${result.docs[0].name} (#${result.docs[0].id})`)
  }

  // 3. Find or create subcategories
  console.log('\n── Subcategories ──')
  const SUBCATEGORY_DEFS: Array<{ slug: string; name: string; categorySlug: string }> = [
    { slug: 'mineralna-gnojiva', name: 'Mineralna gnojiva', categorySlug: 'gnojiva' },
    { slug: 'biostimulatori', name: 'Biostimulatori', categorySlug: 'gnojiva' },
    { slug: 'ostalo', name: 'Ostalo', categorySlug: 'gnojiva' },
  ]
  const subcategoryIds: Record<string, number> = {}
  for (const def of SUBCATEGORY_DEFS) {
    const existing = await payload.find({
      collection: 'subcategories',
      where: { slug: { equals: def.slug } },
      limit: 1,
    })
    if (existing.docs.length > 0) {
      subcategoryIds[def.slug] = existing.docs[0].id
      console.log(`  ✓ Found: ${def.name} (#${existing.docs[0].id})`)
    } else {
      const created = await payload.create({
        collection: 'subcategories',
        data: { name: def.name, slug: def.slug, category: categoryIds[def.categorySlug] },
      })
      subcategoryIds[def.slug] = created.id
      console.log(`  + Created: ${def.name} (#${created.id})`)
    }
  }

  // 4. Create or update products
  console.log('\n── Products ──')
  let nCreated = 0
  let nUpdated = 0

  for (const product of PRODUCTS) {
    process.stdout.write(`  ${product.name} ... `)

    // Find image by alt text (contains match)
    let imageId: number | undefined
    if (product.imageAltContains) {
      const mediaResult = await payload.find({
        collection: 'media',
        where: { alt: { like: product.imageAltContains } },
        limit: 1,
      })
      if (mediaResult.docs.length > 0) {
        imageId = mediaResult.docs[0].id
      } else {
        console.warn(`\n    ⚠ Image not found (alt like "${product.imageAltContains}")`)
      }
    }

    const instructions = convertMarkdownToLexical({
      editorConfig,
      markdown: product.instructions,
    })

    const data = {
      name: product.name,
      slug: product.slug,
      category: categoryIds[product.categorySlug],
      ...(product.subcategorySlug
        ? { subcategory: subcategoryIds[product.subcategorySlug] }
        : {}),
      manufacturer: manufacturerId,
      description: product.description,
      instructions,
      ...(imageId !== undefined ? { image: imageId } : {}),
    }

    const existing = await payload.find({
      collection: 'products',
      where: { slug: { equals: product.slug } },
      limit: 1,
    })

    if (existing.docs.length > 0) {
      await payload.update({ collection: 'products', id: existing.docs[0].id, data })
      console.log(`updated (#${existing.docs[0].id})${imageId ? ` 🖼 #${imageId}` : ' ⚠ no image'}`)
      nUpdated++
    } else {
      const doc = await payload.create({ collection: 'products', data })
      console.log(`created (#${doc.id})${imageId ? ` 🖼 #${imageId}` : ' ⚠ no image'}`)
      nCreated++
    }
  }

  console.log(`\n✅ Done! Created: ${nCreated}  Updated: ${nUpdated}`)
  process.exit(0)
}

seedToraProducts().catch((err) => {
  console.error(err)
  process.exit(1)
})
