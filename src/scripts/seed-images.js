/**
 * Seed category images from Unsplash into the media table,
 * then link them to the corresponding categories rows.
 *
 * Bypasses Payload init entirely (avoids tsx/ESM cycle on Node.js v25).
 * Uses `pg` directly, same pattern as seed.js.
 *
 * Safe to re-run — existing images are replaced (old file + DB row deleted first).
 *
 * Run with:  npm run seed:images
 * Requires:  DATABASE_URI in .env.local
 */
'use strict'
const { Client } = require('pg')
const fs = require('fs')
const path = require('path')

const PUBLIC_MEDIA_DIR = path.resolve(__dirname, '../../public/media')

// Maps category slug (as stored in DB) → Unsplash image
const IMAGES = [
  { slug: 'sjemenski-program',      url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80', filename: 'sjemenski-program.jpg',      alt: 'Sjemenski program' },
  { slug: 'gnojiva',                url: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&q=80', filename: 'gnojiva.jpg',                alt: 'Gnojiva' },
  { slug: 'zastita-bilja',          url: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&q=80', filename: 'zastita-bilja.jpg',          alt: 'Zaštita bilja' },
  { slug: 'stocna-hrana',           url: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=800&q=80', filename: 'stocna-hrana.jpg',           alt: 'Stočna hrana' },
  { slug: 'sadni-materijal',        url: 'https://images.unsplash.com/photo-1600917016506-556622b74303?w=800&q=80', filename: 'sadni-materijal.jpg',        alt: 'Sadni materijal' },
  { slug: 'oprema-za-povrtlarstvo', url: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800&q=80', filename: 'oprema-za-povrtlarstvo.jpg', alt: 'Oprema za povrtlarstvo i cvjećarstvo' },
  { slug: 'navodnjavanje',          url: 'https://images.unsplash.com/photo-1598370006836-0ae5f7ec61c4?w=800&q=80', filename: 'navodnjavanje.jpg',          alt: 'Navodnjavanje' },
  { slug: 'enologija',              url: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=800&q=80', filename: 'enologija.jpg',              alt: 'Enologija' },
  { slug: 'oprema-za-pcelarstvo',   url: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=800&q=80', filename: 'oprema-za-pcelarstvo.jpg',   alt: 'Oprema za pčelarstvo' },
  { slug: 'poljoprivredni-strojevi',url: 'https://images.unsplash.com/photo-1690068023694-053da714f95f?w=800&q=80', filename: 'poljoprivredni-strojevi.jpg',alt: 'Poljoprivredni strojevi' },
  { slug: 'alati',                  url: 'https://images.unsplash.com/photo-1588311082740-88c1b480d72d?w=800&q=80', filename: 'alati.jpg',                  alt: 'Alati' },
  { slug: 'oprema-za-stocarstvo',   url: 'https://images.unsplash.com/photo-1761284724050-3541146cd0b5?w=800&q=80', filename: 'oprema-za-stocarstvo.jpg',   alt: 'Oprema za stočarstvo' },
  { slug: 'ulja-i-maziva',          url: 'https://images.unsplash.com/photo-1556912743-54b370e8385b?w=800&q=80', filename: 'ulja-i-maziva.jpg',          alt: 'Ulja i maziva' },
  { slug: 'kucni-ljubimci',         url: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&q=80', filename: 'kucni-ljubimci.jpg',         alt: 'Kućni ljubimci' },
  { slug: 'pribor-za-kolinje',      url: 'https://images.unsplash.com/photo-1674660346036-4b3df3f07cca?w=800&q=80', filename: 'pribor-za-kolinje.jpg',      alt: 'Pribor za kolinje' },
  { slug: 'gume-i-zracnice',        url: 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800&q=80', filename: 'gume-i-zracnice.jpg',        alt: 'Gume i zračnice' },
  { slug: 'vrt-i-okucnica',         url: 'https://images.unsplash.com/photo-1599778150914-88e98e0c3a3e?w=800&q=80', filename: 'vrt-i-okucnica.jpg',         alt: 'Vrt i okućnica' },
  { slug: 'roba-siroke-potrosnje',  url: 'https://images.unsplash.com/photo-1766394472149-109af96a7e1c?w=800&q=80', filename: 'roba-siroke-potrosnje.jpg',  alt: 'Roba široke potrošnje' },
  { slug: 'ekoloski-proizvodi',     url: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800&q=80', filename: 'ekoloski-proizvodi.jpg',     alt: 'Ekološki proizvodi' },
]

async function seedImages() {
  const client = new Client({ connectionString: process.env.DATABASE_URI })
  await client.connect()

  // Introspect media table so we know the exact column names
  const colRes = await client.query(
    `SELECT column_name FROM information_schema.columns
     WHERE table_name = 'media' ORDER BY ordinal_position`
  )
  const mediaColumns = new Set(colRes.rows.map((r) => r.column_name))
  console.log('media columns:', [...mediaColumns].join(', '), '\n')

  // Ensure public/media directory exists
  fs.mkdirSync(PUBLIC_MEDIA_DIR, { recursive: true })

  try {
    for (const item of IMAGES) {
      // 1. Find category
      const catRes = await client.query(
        `SELECT id, image_id FROM categories WHERE slug = $1`,
        [item.slug]
      )

      if (catRes.rows.length === 0) {
        console.warn(`  ⚠  category not found: ${item.slug}`)
        continue
      }

      const cat = catRes.rows[0]

      // 2. Delete old media if exists
      if (cat.image_id) {
        const oldMedia = await client.query(
          `SELECT filename FROM media WHERE id = $1`,
          [cat.image_id]
        )
        if (oldMedia.rows.length > 0) {
          const oldFile = path.join(PUBLIC_MEDIA_DIR, oldMedia.rows[0].filename)
          if (fs.existsSync(oldFile)) fs.unlinkSync(oldFile)
        }
        await client.query(`DELETE FROM media WHERE id = $1`, [cat.image_id])
        console.log(`  🗑  ${item.slug}: deleted old media #${cat.image_id}`)
      }

      // 3. Download image
      process.stdout.write(`  ↓  ${item.filename} ... `)
      const response = await fetch(item.url)
      if (!response.ok) {
        console.warn(`FAILED (HTTP ${response.status})`)
        continue
      }
      const buffer = Buffer.from(await response.arrayBuffer())
      console.log(`${Math.round(buffer.length / 1024)} KB`)

      // 4. Save to disk (public/media/)
      const filePath = path.join(PUBLIC_MEDIA_DIR, item.filename)
      fs.writeFileSync(filePath, buffer)

      // 5. Get image dimensions via sharp (optional)
      let width = null
      let height = null
      try {
        const sharp = require('sharp')
        const meta = await sharp(buffer).metadata()
        width = meta.width ?? null
        height = meta.height ?? null
      } catch {
        // sharp optional – dimensions stay null
      }

      // 6. Insert into media table
      const now = new Date().toISOString()
      const url = `/media/${item.filename}`

      const cols = ['alt', 'url', 'filename', 'mime_type', 'filesize', 'updated_at', 'created_at']
      const vals = [item.alt, url, item.filename, 'image/jpeg', buffer.length, now, now]

      if (mediaColumns.has('width'))  { cols.push('width');  vals.push(width) }
      if (mediaColumns.has('height')) { cols.push('height'); vals.push(height) }

      const placeholders = vals.map((_, i) => `$${i + 1}`).join(', ')
      const mediaRes = await client.query(
        `INSERT INTO media (${cols.join(', ')}) VALUES (${placeholders}) RETURNING id`,
        vals
      )

      const mediaId = mediaRes.rows[0].id

      // 7. Link to category
      await client.query(
        `UPDATE categories SET image_id = $1 WHERE id = $2`,
        [mediaId, cat.id]
      )

      console.log(`  ✓  ${item.slug} → media #${mediaId}`)
    }

    console.log('\nDone!')
  } finally {
    await client.end()
  }
}

seedImages().catch((err) => {
  console.error(err)
  process.exit(1)
})
