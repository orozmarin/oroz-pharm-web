/**
 * One-time seed script — migrates static data files into Payload collections.
 *
 * Run with:
 *   npm run seed
 *
 * Images are intentionally skipped (simple approach).
 * Add cover images / category images via the Payload admin UI after seeding.
 *
 * Note: data files are CJS modules when imported from this ESM script.
 * Node.js ESM cannot detect named exports from tsx-transformed CJS, so we
 * import via namespace (`* as`) and access the export from there.
 */

import { getPayload } from 'payload'
import config from '@payload-config'
import {
  editorConfigFactory,
  convertMarkdownToLexical,
} from '@payloadcms/richtext-lexical'

// Namespace imports allow accessing CJS module.exports properties from ESM
import * as blogsNS from '../data/blogs'
import * as testimonialsNS from '../data/testimonials'
import * as categoriesNS from '../data/categories'

/* eslint-disable @typescript-eslint/no-explicit-any */
const blogPosts: any[] = (blogsNS as any).blogPosts ?? (blogsNS as any).default?.blogPosts
const testimonials: any[] = (testimonialsNS as any).testimonials ?? (testimonialsNS as any).default?.testimonials
const categories: any[] = (categoriesNS as any).categories ?? (categoriesNS as any).default?.categories

async function seed() {
  const payload = await getPayload({ config })

  // Build the editor config so we can convert markdown → Lexical JSON
  const editorConfig = await editorConfigFactory.default({ config: payload.config })

  // ── Blogs ─────────────────────────────────────────────────────────────────
  console.log('\nSeeding blogs...')
  for (const post of blogPosts) {
    const content = convertMarkdownToLexical({ editorConfig, markdown: post.content })

    await payload.create({
      collection: 'blogs',
      data: {
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        date: post.date,
        readingTime: post.readingTime,
        tags: post.tags.map((tag: string) => ({ tag })),
        content,
      },
    })

    console.log(`  + ${post.title}`)
  }

  // ── Testimonials ──────────────────────────────────────────────────────────
  console.log('\nSeeding testimonials...')
  for (const [i, t] of testimonials.entries()) {
    await payload.create({
      collection: 'testimonials',
      data: {
        quote: t.quote,
        author: t.name,
        company: t.company,
        order: i + 1,
      },
    })

    console.log(`  + ${t.name}`)
  }

  // ── Categories ────────────────────────────────────────────────────────────
  console.log('\nSeeding categories...')
  for (const cat of categories) {
    await payload.create({
      collection: 'categories',
      data: {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        icon: cat.icon,
        gridArea: cat.gridArea,
        subcategories: cat.subcategories.map((sub: any) => ({
          name: sub.name,
          slug: sub.id,
        })),
      },
    })

    console.log(`  + ${cat.name}`)
  }

  console.log('\nSeeding complete!')
  process.exit(0)
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
