'use strict'
/**
 * Seeds F1 vegetable hybrids from Agrochem Maks into the Products collection.
 *
 * Bypasses Payload init entirely (avoids tsx/ESM cycle on Node.js v25).
 * Uses `pg` directly, same pattern as seed-tora-products.js.
 *
 * Prerequisites:
 *   - Categories must exist (run seed.js first)
 *   - F1 hybrid images uploaded to Media with alt: agrochem-maks-{naziv}-f1
 *   - Manufacturer Agrochem Maks already in DB (run seed-tora-products.js first)
 *
 * Safe to re-run — uses ON CONFLICT (slug) DO UPDATE.
 *
 * Run with:  npm run seed:f1
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
    root: { children, direction: 'ltr', format: '', indent: 0, type: 'root', version: 1 },
  }
}

// ── Product data ───────────────────────────────────────────────────────────

const PRODUCTS = [
  {
    name: 'Belladonna F1',
    slug: 'belladonna-f1',
    categorySlug: 'sjemenski-program',
    subcategorySlug: 'f1-hibridi-povrca',
    imageAltLike: 'belladonna-f1',
    description:
      'Hibridna sorta slatke paprike blok tipa (babura). Snažna biljka s ranim i bogatim plodonošenjem, krupnim debelo-mesnatim plodovima sjajne zeleno-crvene boje. Odlična za svježu potrošnju i preradu.',
    instructions: `Sjetva u zaštićene prostore (siječanj–veljača) na dubinu 0,5–1 cm.

- Pikirati u saksije kada biljka razvije 2–3 lista
- Saditi na otvoreno pod PE malčom u razmaku 40×60 cm
- Redovito gnojiti, navodnjavati i vezati biljke na potporu`,
  },
  {
    name: 'Big Beef F1',
    slug: 'big-beef-f1',
    categorySlug: 'sjemenski-program',
    subcategorySlug: 'f1-hibridi-povrca',
    imageAltLike: 'big-beef-f1',
    description:
      'Hibridna sorta paradajza tipa goveđeg srca s iznimno krupnim, okruglim plodovima mase 200–400 g. Indeterminatnog rasta, bogata berba, čvrsta konzistencija i izražen okus. Izvrsna za svježu potrošnju.',
    instructions: `Sjetva u zaštićene prostore (veljača–ožujak).

- Saditi na otvoreno ili u zaštićene objekte u razmaku 50×80 cm
- Vezati na potporu i redovito uklanjati zaperak
- Navodnjavanje fertirigacijom; primijeniti potporno gnojivo u fazi cvatnje`,
  },
  {
    name: 'Centro F1',
    slug: 'centro-f1',
    categorySlug: 'sjemenski-program',
    subcategorySlug: 'f1-hibridi-povrca',
    imageAltLike: 'centro-f1',
    description:
      'Hibridna sorta pogodna za uzgoj na otvorenom i u zaštićenim prostorima. Karakterizira je ujednačen razvoj biljaka, visoka rodnost i dobra otpornost na bolesti. Prilagođena uvjetima uzgoja u kontinentalnoj Hrvatskoj.',
    instructions: `Sjetva u zaštićene prostore ili direktno na otvoreno prema preporuci za sortu.

- Primijeniti standardne agrotehničke mjere za uzgoj povrća
- Redovito navodnjavati i prihranjivati mineralnim gnojivima
- Pratiti pojavu bolesti i primijeniti odgovarajuću zaštitu`,
  },
  {
    name: 'Kaptur F1',
    slug: 'kaptur-f1',
    categorySlug: 'sjemenski-program',
    subcategorySlug: 'f1-hibridi-povrca',
    imageAltLike: 'kaptur-f1',
    description:
      'Hibridna sorta paprike šiljatog (kapia) tipa. Biljka bujnog rasta s obilnim plodonošenjem, plodovi su dugi, glatke površine i izražene slatkosti. Prikladna za svježu potrošnju, sušenje i preradu u ajvar.',
    instructions: `Sjetva u zaštićene prostore (siječanj–veljača) na dubinu 0,5–1 cm.

- Pikirati u saksije kada biljka razvije 2–3 lista
- Saditi na otvoreno u razmaku 40×60 cm, po mogućnosti pod PE malčom
- Redovito gnojiti i navodnjavati; vezati biljke na potporu`,
  },
  {
    name: 'Mei Shuai F1',
    slug: 'mei-shuai-f1',
    categorySlug: 'sjemenski-program',
    subcategorySlug: 'f1-hibridi-povrca',
    imageAltLike: 'mei-shuai-f1',
    description:
      'Hibridna sorta kineskog kupusa (pak choi tipa). Brzo rastuća biljka s nježnim, tamnozelenim listovima i hrskavim bijelim peteljkama. Pogodna za uzgoj u proljetno-ljetnoj i jesenskoj sezoni.',
    instructions: `Direktna sjetva na gredicu ili uzgoj presadnica.

- Sjetva: proljeće (ožujak–travanj) ili jesen (kolovoz–rujan)
- Razmak sadnje: 25×30 cm
- Sazrijeva 40–60 dana od sjetve; brati kada glava dostigne punu veličinu
- Osjetljiva na stres od suše — osigurati redovito navodnjavanje`,
  },
  {
    name: 'Pata Negra F1',
    slug: 'pata-negra-f1',
    categorySlug: 'sjemenski-program',
    subcategorySlug: 'f1-hibridi-povrca',
    imageAltLike: 'pata-negra-f1',
    description:
      'Hibridna sorta paprike s karakterističnim tamnim stabljikama i krupnim, mesnatim plodovima. Visoka rodnost i robusnost biljke, dobra otpornost na stres i bolesti. Cijenjena sorta za profesionalnu i hobi-proizvodnju.',
    instructions: `Sjetva u zaštićene prostore (siječanj–veljača) na dubinu 0,5–1 cm.

- Pikirati u saksije kada biljka razvije 2–3 lista
- Saditi na otvoreno u razmaku 40×60 cm
- Redovito gnojiti; u fazi cvatnje primijeniti gnojivo bogato kalijem i borom`,
  },
]

// ── Subcategory definition ─────────────────────────────────────────────────

const SUBCATEGORY_DEF = {
  slug: 'f1-hibridi-povrca',
  name: 'F1 Hibridi Povrća',
  categorySlug: 'sjemenski-program',
}

// ── Main ───────────────────────────────────────────────────────────────────

async function seed() {
  const client = new Client({ connectionString: process.env.DATABASE_URI })
  await client.connect()
  const now = new Date().toISOString()

  try {
    // 1. Find manufacturer Agrochem Maks (must exist from seed-tora-products.js)
    console.log('\n── Manufacturer ──')
    const { rows: mfgRows } = await client.query(
      `SELECT id FROM manufacturers WHERE slug = $1`,
      ['agrochem-maks']
    )
    if (mfgRows.length === 0) {
      throw new Error('Manufacturer "agrochem-maks" not found — run seed-tora-products.js first.')
    }
    const manufacturerId = mfgRows[0].id
    console.log(`  ✓ Agrochem Maks (#${manufacturerId})`)

    // 2. Load category
    console.log('\n── Category ──')
    const { rows: catRows } = await client.query(
      `SELECT id FROM categories WHERE slug = $1`,
      ['sjemenski-program']
    )
    if (catRows.length === 0) {
      throw new Error('Category "sjemenski-program" not found — run seed.js first.')
    }
    const categoryId = catRows[0].id
    console.log(`  ✓ sjemenski-program (#${categoryId})`)

    // 3. Find or create subcategory
    console.log('\n── Subcategory ──')
    let subcategoryId
    const { rows: subcatRows } = await client.query(
      `SELECT id FROM subcategories WHERE slug = $1`,
      [SUBCATEGORY_DEF.slug]
    )
    if (subcatRows.length > 0) {
      subcategoryId = subcatRows[0].id
      console.log(`  ✓ Found: ${SUBCATEGORY_DEF.name} (#${subcategoryId})`)
    } else {
      const res = await client.query(
        `INSERT INTO subcategories (name, slug, category_id, updated_at, created_at)
         VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        [SUBCATEGORY_DEF.name, SUBCATEGORY_DEF.slug, categoryId, now, now]
      )
      subcategoryId = res.rows[0].id
      console.log(`  + Created: ${SUBCATEGORY_DEF.name} (#${subcategoryId})`)
    }

    // 4. Upsert products
    console.log('\n── Products ──')
    let nCreated = 0
    let nUpdated = 0

    for (const product of PRODUCTS) {
      process.stdout.write(`  ${product.name} ... `)

      // Find image by alt ILIKE
      const { rows: mediaRows } = await client.query(
        `SELECT id, alt FROM media WHERE alt ILIKE $1 LIMIT 1`,
        [`%${product.imageAltLike}%`]
      )
      const imageId = mediaRows.length > 0 ? mediaRows[0].id : null
      if (!imageId) process.stdout.write(`⚠ no image  `)

      const instructions = JSON.stringify(markdownToLexical(product.instructions))

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
