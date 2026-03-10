'use strict'
/**
 * Seeds TORA product line from Agrochem Maks into the Products collection.
 *
 * Bypasses Payload init entirely (avoids tsx/ESM cycle on Node.js v25).
 * Uses `pg` directly, same pattern as seed-related-categories.js.
 *
 * Prerequisites:
 *   - Categories must exist (run seed.js first)
 *   - TORA images uploaded to Media with alt text containing the product slug fragment
 *
 * Safe to re-run — uses ON CONFLICT (slug) DO UPDATE.
 *
 * Run with:  npm run seed:tora
 */

const { Client } = require('pg')

// ── Lexical JSON helpers ───────────────────────────────────────────────────

function lexicalTextNode(text) {
  return { detail: 0, format: 0, mode: 'normal', style: '', text, type: 'text', version: 1 }
}

function lexicalParagraph(text) {
  return {
    children: [lexicalTextNode(text)],
    direction: 'ltr',
    format: '',
    indent: 0,
    type: 'paragraph',
    version: 1,
    textFormat: 0,
  }
}

function lexicalListItem(text, value) {
  return {
    children: [lexicalTextNode(text)],
    direction: 'ltr',
    format: '',
    indent: 0,
    type: 'listitem',
    version: 1,
    value,
  }
}

function lexicalBulletList(items) {
  return {
    children: items.map((text, i) => lexicalListItem(text, i + 1)),
    direction: 'ltr',
    format: '',
    indent: 0,
    listType: 'bullet',
    start: 1,
    tag: 'ul',
    type: 'list',
    version: 1,
  }
}

/**
 * Converts a simple markdown string to Lexical JSON.
 * Supports: paragraphs and "- bullet" lists.
 * Consecutive bullet lines are grouped into one list node.
 */
function markdownToLexical(markdown) {
  const lines = markdown.split('\n')
  const children = []
  let currentBullets = []

  function flushBullets() {
    if (currentBullets.length > 0) {
      children.push(lexicalBulletList(currentBullets))
      currentBullets = []
    }
  }

  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed === '') {
      flushBullets()
      continue
    }
    if (trimmed.startsWith('- ')) {
      currentBullets.push(trimmed.slice(2))
    } else {
      flushBullets()
      children.push(lexicalParagraph(trimmed))
    }
  }
  flushBullets()

  return {
    root: {
      children,
      direction: 'ltr',
      format: '',
      indent: 0,
      type: 'root',
      version: 1,
    },
  }
}

// ── Product data ───────────────────────────────────────────────────────────

const PRODUCTS = [
  // ── Mineralna gnojiva ──────────────────────────────────────────────────
  {
    name: 'TORA MICRO MAGNICAL B',
    slug: 'tora-micro-magnical-b',
    categorySlug: 'gnojiva',
    subcategorySlug: 'mineralna-gnojiva',
    imageAltLike: 'magnical-b',
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
    imageAltLike: 'bor-max',
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
    imageAltLike: 'combi-max',
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
    imageAltLike: 'energy-start',
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
    imageAltLike: 'energy-balance',
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
    imageAltLike: 'energy-active',
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
    imageAltLike: 'turbo-cereals',
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
    imageAltLike: 'turbo-corn',
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
    // Filename is OILSEED (no S at end) — match on substring
    imageAltLike: 'turbo-oilseed',
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
    // Filename is CANDY-PLUS (without STAGE)
    imageAltLike: 'candy-plus',
    description:
      'Specijalizirano folijarno gnojivo za povećanje sadržaja šećera, poboljšanje obojenosti i kvalitete plodova. Sadrži kombinaciju kalija, fosfora i aminokiselina.',
    instructions: `Primijeniti folijarno u fazi dozrijevanja plodova.

- Doza: 2–3 l/ha u 200–400 l vode
- Primijeniti 2–3 puta u razmacima od 7–10 dana`,
  },

  // ── Biostimulatori ────────────────────────────────────────────────────
  {
    name: 'TORA N-LEAF',
    slug: 'tora-n-leaf',
    categorySlug: 'gnojiva',
    subcategorySlug: 'biostimulatori',
    imageAltLike: 'n-leaf',
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
    imageAltLike: 'p-soil',
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
    imageAltLike: 'stage-root',
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
    imageAltLike: 'stage-set',
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
    imageAltLike: 'vita-fusion',
    description:
      'Biostimulator nove generacije s kombinacijom aminokiselina, osmoprotektanata i elicitora otpornosti za zaštitu biljaka od stresa uzrokovanog mrazom, sušom i visokim temperaturama.',
    instructions: `Primijeniti folijarno preventivno ili odmah nakon stresnog događaja (mraz, suša, toplinski udar).

- Doza: 2–3 l/ha u 200–400 l vode
- Primijeniti 2–4 puta u sezoni prema potrebi`,
  },

  // ── Ostalo ────────────────────────────────────────────────────────────
  {
    name: 'TORA MICRO BLUE',
    slug: 'tora-micro-blue',
    categorySlug: 'gnojiva',
    subcategorySlug: 'ostalo',
    imageAltLike: 'micro-blue',
    description:
      'Folijarno gnojivo na bazi bakra s fungicidnim i baktericidnim djelovanjem. Univerzalno rješenje za istovremenu zaštitu i ishranu biljaka u jednoj aplikaciji.',
    instructions: `Primijeniti folijarno kao preventivnu ili kurativnu mjeru zaštite biljaka od gljivičnih i bakterijskih bolesti. Kompatibilno s većinom pesticida.

- Doza: 2–3 l/ha u 200–400 l vode
- Primijeniti u razmacima od 10–14 dana ili prema pojavi simptoma`,
  },
]

// ── Subcategory definitions ────────────────────────────────────────────────

const SUBCATEGORY_DEFS = [
  { slug: 'mineralna-gnojiva', name: 'Mineralna gnojiva', categorySlug: 'gnojiva' },
  { slug: 'biostimulatori',    name: 'Biostimulatori',    categorySlug: 'gnojiva' },
  { slug: 'ostalo',            name: 'Ostalo',            categorySlug: 'gnojiva' },
]

// ── Main ───────────────────────────────────────────────────────────────────

async function seed() {
  const client = new Client({ connectionString: process.env.DATABASE_URI })
  await client.connect()
  const now = new Date().toISOString()

  try {
    // 1. Find or create manufacturer
    console.log('\n── Manufacturer ──')
    let { rows: mfgRows } = await client.query(
      `SELECT id FROM manufacturers WHERE slug = $1`,
      ['agrochem-maks']
    )
    let manufacturerId
    if (mfgRows.length > 0) {
      manufacturerId = mfgRows[0].id
      console.log(`  ✓ Found: Agrochem Maks (#${manufacturerId})`)
    } else {
      const res = await client.query(
        `INSERT INTO manufacturers (name, slug, updated_at, created_at)
         VALUES ($1, $2, $3, $4) RETURNING id`,
        ['Agrochem Maks', 'agrochem-maks', now, now]
      )
      manufacturerId = res.rows[0].id
      console.log(`  + Created: Agrochem Maks (#${manufacturerId})`)
    }

    // 2. Load categories
    console.log('\n── Categories ──')
    const { rows: allCats } = await client.query(`SELECT id, slug FROM categories`)
    const categoryIdBySlug = Object.fromEntries(allCats.map((r) => [r.slug, r.id]))
    for (const slug of [...new Set(PRODUCTS.map((p) => p.categorySlug))]) {
      if (!categoryIdBySlug[slug]) throw new Error(`Category "${slug}" not found — run seed.js first.`)
      console.log(`  ✓ ${slug} (#${categoryIdBySlug[slug]})`)
    }

    // 3. Find or create subcategories
    console.log('\n── Subcategories ──')
    const { rows: allSubcats } = await client.query(`SELECT id, slug FROM subcategories`)
    const subcategoryIdBySlug = Object.fromEntries(allSubcats.map((r) => [r.slug, r.id]))

    for (const def of SUBCATEGORY_DEFS) {
      if (subcategoryIdBySlug[def.slug]) {
        console.log(`  ✓ Found: ${def.name} (#${subcategoryIdBySlug[def.slug]})`)
      } else {
        const catId = categoryIdBySlug[def.categorySlug]
        const res = await client.query(
          `INSERT INTO subcategories (name, slug, category_id, updated_at, created_at)
           VALUES ($1, $2, $3, $4, $5) RETURNING id`,
          [def.name, def.slug, catId, now, now]
        )
        subcategoryIdBySlug[def.slug] = res.rows[0].id
        console.log(`  + Created: ${def.name} (#${res.rows[0].id})`)
      }
    }

    // 4. Upsert products
    console.log('\n── Products ──')
    let nCreated = 0
    let nUpdated = 0

    for (const product of PRODUCTS) {
      process.stdout.write(`  ${product.name} ... `)

      // Find image by alt LIKE
      const { rows: mediaRows } = await client.query(
        `SELECT id, alt FROM media WHERE alt ILIKE $1 LIMIT 1`,
        [`%${product.imageAltLike}%`]
      )
      const imageId = mediaRows.length > 0 ? mediaRows[0].id : null
      if (!imageId) process.stdout.write(`⚠ no image  `)

      const categoryId    = categoryIdBySlug[product.categorySlug]
      const subcategoryId = subcategoryIdBySlug[product.subcategorySlug] ?? null
      const instructions  = JSON.stringify(markdownToLexical(product.instructions))

      const { rows: existing } = await client.query(
        `SELECT id FROM products WHERE slug = $1`,
        [product.slug]
      )

      if (existing.length > 0) {
        await client.query(
          `UPDATE products SET
             name            = $1,
             category_id     = $2,
             subcategory_id  = $3,
             manufacturer_id = $4,
             description     = $5,
             instructions    = $6,
             image_id        = $7,
             updated_at      = $8
           WHERE slug = $9`,
          [
            product.name, categoryId, subcategoryId, manufacturerId,
            product.description, instructions, imageId, now, product.slug,
          ]
        )
        console.log(`updated (#${existing[0].id})${imageId ? ` 🖼 #${imageId}` : ''}`)
        nUpdated++
      } else {
        const res = await client.query(
          `INSERT INTO products
             (name, slug, category_id, subcategory_id, manufacturer_id,
              description, instructions, image_id, updated_at, created_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
           RETURNING id`,
          [
            product.name, product.slug, categoryId, subcategoryId, manufacturerId,
            product.description, instructions, imageId, now, now,
          ]
        )
        console.log(`created (#${res.rows[0].id})${imageId ? ` 🖼 #${imageId}` : ''}`)
        nCreated++
      }
    }

    console.log(`\n✅ Done! Created: ${nCreated}  Updated: ${nUpdated}`)
  } finally {
    await client.end()
  }
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
