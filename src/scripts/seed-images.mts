/**
 * Uploads category images from Unsplash into the Media collection,
 * then links them to the corresponding Categories documents.
 *
 * Safe to re-run — existing images are replaced (old media entry is deleted first).
 *
 * Run with:
 *   node --env-file=.env.local --import tsx/esm src/scripts/seed-images.mts
 */

import { getPayload } from 'payload'
import config from '@payload-config'

const CATEGORY_IMAGES: Record<string, { url: string; alt: string; filename: string }> = {
  'sjemenski-program': {
    url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80',
    alt: 'Sjemenski program',
    filename: 'sjemenski-program.jpg',
  },
  'gnojiva': {
    url: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&q=80',
    alt: 'Gnojiva',
    filename: 'gnojiva.jpg',
  },
  'zastita-bilja': {
    url: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&q=80',
    alt: 'Zaštita bilja',
    filename: 'zastita-bilja.jpg',
  },
  'stocna-hrana': {
    url: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=800&q=80',
    alt: 'Stočna hrana',
    filename: 'stocna-hrana.jpg',
  },
  'sadni-materijal': {
    url: 'https://images.unsplash.com/photo-1600917016506-556622b74303?w=800&q=80',
    alt: 'Sadni materijal',
    filename: 'sadni-materijal.jpg',
  },
  'oprema-za-povrtlarstvo': {
    url: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800&q=80',
    alt: 'Oprema za povrtlarstvo i cvjećarstvo',
    filename: 'oprema-za-povrtlarstvo.jpg',
  },
  'navodnjavanje': {
    url: 'https://images.unsplash.com/photo-1598370006836-0ae5f7ec61c4?w=800&q=80',
    alt: 'Navodnjavanje',
    filename: 'navodnjavanje.jpg',
  },
  'enologija': {
    url: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=800&q=80',
    alt: 'Enologija',
    filename: 'enologija.jpg',
  },
  'oprema-za-pcelarstvo': {
    url: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=800&q=80',
    alt: 'Oprema za pčelarstvo',
    filename: 'oprema-za-pcelarstvo.jpg',
  },
  'poljoprivredni-strojevi': {
    url: 'https://images.unsplash.com/photo-1690068023694-053da714f95f?w=800&q=80',
    alt: 'Poljoprivredni strojevi',
    filename: 'poljoprivredni-strojevi.jpg',
  },
  'alati': {
    url: 'https://images.unsplash.com/photo-1588311082740-88c1b480d72d?w=800&q=80',
    alt: 'Alati',
    filename: 'alati.jpg',
  },
  'oprema-za-stocarstvo': {
    url: 'https://images.unsplash.com/photo-1761284724050-3541146cd0b5?w=800&q=80',
    alt: 'Oprema za stočarstvo',
    filename: 'oprema-za-stocarstvo.jpg',
  },
  'ulja-i-maziva': {
    url: 'https://images.unsplash.com/photo-1556912743-54b370e8385b?w=800&q=80',
    alt: 'Ulja i maziva',
    filename: 'ulja-i-maziva.jpg',
  },
  'kucni-ljubimci': {
    url: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&q=80',
    alt: 'Kućni ljubimci',
    filename: 'kucni-ljubimci.jpg',
  },
  'pribor-za-kolinje': {
    url: 'https://images.unsplash.com/photo-1674660346036-4b3df3f07cca?w=800&q=80',
    alt: 'Pribor za kolinje',
    filename: 'pribor-za-kolinje.jpg',
  },
  'gume-i-zracnice': {
    url: 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800&q=80',
    alt: 'Gume i zračnice',
    filename: 'gume-i-zracnice.jpg',
  },
  'vrt-i-okucnica': {
    url: 'https://images.unsplash.com/photo-1599778150914-88e98e0c3a3e?w=800&q=80',
    alt: 'Vrt i okućnica',
    filename: 'vrt-i-okucnica.jpg',
  },
  'roba-siroke-potrosnje': {
    url: 'https://images.unsplash.com/photo-1766394472149-109af96a7e1c?w=800&q=80',
    alt: 'Roba široke potrošnje',
    filename: 'roba-siroke-potrosnje.jpg',
  },
  'ekoloski-proizvodi': {
    url: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800&q=80',
    alt: 'Ekološki proizvodi',
    filename: 'ekoloski-proizvodi.jpg',
  },
}

async function seedImages() {
  const payload = await getPayload({ config })

  for (const [slug, { url, alt, filename }] of Object.entries(CATEGORY_IMAGES)) {
    // 1. Find the category
    const result = await payload.find({
      collection: 'categories',
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 1,
    })

    const category = result.docs[0]
    if (!category) {
      console.warn(`  ⚠ Category not found: ${slug}`)
      continue
    }

    // 2. Download image
    console.log(`  ↓ ${slug}: downloading...`)
    const response = await fetch(url)
    if (!response.ok) {
      console.warn(`  ⚠ Failed to fetch ${url}: ${response.status}`)
      continue
    }
    const buffer = Buffer.from(await response.arrayBuffer())

    // 3. Delete old media if exists
    if (category.image) {
      const oldId = typeof category.image === 'object' ? category.image.id : category.image
      try {
        await payload.delete({ collection: 'media', id: oldId })
        console.log(`  🗑 ${slug}: deleted old media #${oldId}`)
      } catch {
        console.warn(`  ⚠ ${slug}: could not delete old media #${oldId}`)
      }
    }

    // 4. Upload to Media collection
    const media = await payload.create({
      collection: 'media',
      data: { alt },
      file: {
        data: buffer,
        mimetype: 'image/jpeg',
        name: filename,
        size: buffer.length,
      },
    })

    // 5. Link media to category
    await payload.update({
      collection: 'categories',
      id: category.id,
      data: { image: media.id },
    })

    console.log(`  ✓ ${slug} → media #${media.id}`)
  }

  console.log('\nDone!')
  process.exit(0)
}

seedImages().catch((err) => {
  console.error(err)
  process.exit(1)
})
