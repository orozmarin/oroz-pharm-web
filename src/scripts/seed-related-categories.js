'use strict'
/**
 * Seeds the relatedCategories field for all categories.
 *
 * Run with:  npm run seed:related
 * Requires:  DATABASE_URI in .env.local
 *
 * NOTE: Start the dev server at least once after adding the relatedCategories
 * field to Categories.ts so that Payload can auto-create the join table
 * `categories_rels` before running this script.
 *
 * Groupings rationale:
 *  - Ratarstvo:     sjeme ↔ gnojiva ↔ zaštita bilja ↔ sadni materijal
 *  - Stočarstvo:    stočna hrana ↔ opr. za stočarstvo ↔ pribor za kolinje ↔ kućni ljubimci
 *  - Mehanizacija:  poljoprivr. strojevi ↔ alati ↔ ulja i maziva ↔ gume
 *  - Vrt/povrtnjak: opr. za povrtlarstvo ↔ navodnjavanje ↔ vrt i okućnica
 *  - Tradicija:     enologija ↔ pčelarstvo ↔ ekološki proizvodi
 */

const { Client } = require('pg')

// ── Mapa: slug kategorije → slugovi max 3 srodnih kategorija ─────────────────
const RELATED_MAP = {
  'zastita-bilja':         ['gnojiva', 'sjemenski-program', 'oprema-za-povrtlarstvo'],
  'gnojiva':               ['sjemenski-program', 'zastita-bilja', 'ekoloski-proizvodi'],
  'sjemenski-program':     ['gnojiva', 'zastita-bilja', 'sadni-materijal'],
  'stocna-hrana':          ['oprema-za-stocarstvo', 'pribor-za-kolinje', 'kucni-ljubimci'],
  'sadni-materijal':       ['sjemenski-program', 'gnojiva', 'oprema-za-povrtlarstvo'],
  'oprema-za-povrtlarstvo':['sadni-materijal', 'navodnjavanje', 'vrt-i-okucnica'],
  'navodnjavanje':         ['oprema-za-povrtlarstvo', 'vrt-i-okucnica', 'poljoprivredni-strojevi'],
  'enologija':             ['oprema-za-pcelarstvo', 'roba-siroke-potrosnje', 'pribor-za-kolinje'],
  'oprema-za-pcelarstvo':  ['enologija', 'ekoloski-proizvodi', 'vrt-i-okucnica'],
  'poljoprivredni-strojevi':['alati', 'ulja-i-maziva', 'gume-i-zracnice'],
  'alati':                 ['poljoprivredni-strojevi', 'vrt-i-okucnica', 'navodnjavanje'],
  'oprema-za-stocarstvo':  ['stocna-hrana', 'pribor-za-kolinje', 'kucni-ljubimci'],
  'ulja-i-maziva':         ['poljoprivredni-strojevi', 'gume-i-zracnice', 'alati'],
  'kucni-ljubimci':        ['stocna-hrana', 'oprema-za-stocarstvo', 'vrt-i-okucnica'],
  'pribor-za-kolinje':     ['stocna-hrana', 'oprema-za-stocarstvo', 'roba-siroke-potrosnje'],
  'vrt-i-okucnica':        ['oprema-za-povrtlarstvo', 'navodnjavanje', 'alati'],
  'roba-siroke-potrosnje': ['vrt-i-okucnica', 'kucni-ljubimci', 'pribor-za-kolinje'],
  'gume-i-zracnice':       ['poljoprivredni-strojevi', 'ulja-i-maziva', 'alati'],
  'ekoloski-proizvodi':    ['gnojiva', 'sjemenski-program', 'oprema-za-pcelarstvo'],
}

async function seed() {
  const client = new Client({ connectionString: process.env.DATABASE_URI })
  await client.connect()

  try {
    // Dohvati sve kategorije odjednom
    const { rows: allCats } = await client.query('SELECT id, slug FROM categories')
    const slugToId = Object.fromEntries(allCats.map(r => [r.slug, r.id]))

    let totalInserted = 0

    for (const [categorySlug, relatedSlugs] of Object.entries(RELATED_MAP)) {
      const parentId = slugToId[categorySlug]
      if (!parentId) {
        console.warn(`  ⚠ Kategorija '${categorySlug}' nije pronađena — preskačem`)
        continue
      }

      // Obriši postojeće veze za ovu kategoriju (idempotentno)
      await client.query(
        "DELETE FROM categories_rels WHERE parent_id = $1 AND path = 'relatedCategories'",
        [parentId]
      )

      let order = 1
      for (const relSlug of relatedSlugs) {
        const relId = slugToId[relSlug]
        if (!relId) {
          console.warn(`    ⚠ Srodna '${relSlug}' nije pronađena — preskačem`)
          continue
        }
        await client.query(
          `INSERT INTO categories_rels ("order", parent_id, path, categories_id)
           VALUES ($1, $2, 'relatedCategories', $3)`,
          [order++, parentId, relId]
        )
        totalInserted++
      }

      console.log(`  ✓ ${categorySlug} → [${relatedSlugs.join(', ')}]`)
    }

    console.log(`\nUkupno dodano: ${totalInserted} veza`)
    console.log('Seeding related categories complete!')
  } finally {
    await client.end()
  }
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
