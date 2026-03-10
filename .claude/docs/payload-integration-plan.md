# Payload CMS v3 Integration Plan

Branch: `feat/payload-cms-integration`

---

## Overview

Embed Payload CMS v3 directly into the existing Next.js 16 app. Editors get a browser-based admin UI at `/admin`. Content is stored in a PostgreSQL database. Existing static TypeScript data files in `src/data/` are migrated into Payload collections, then replaced with Payload Local API calls.

---

## Collections to create

| Collection | Replaces | Key fields |
|---|---|---|
| `media` | Unsplash URLs in data files | File upload, alt text — built-in Payload upload collection |
| `blogs` | `src/data/blogs.ts` | title, slug, excerpt, coverImage (→ media), date, tags, readingTime, content (Lexical rich text) |
| `testimonials` | `src/data/testimonials.ts` | quote, author, company, logo (→ media) |
| `team` | hardcoded in TeamGrid | name, role, bio, photo (→ media) |
| `categories` | `src/data/categories.ts` | name, slug, description, icon, image (→ media), subcategories (array: name, slug, image → media) |

**Not migrated to Payload** (stays static — doesn't need browser editing):
- `src/data/navigation.ts` — nav links are code-driven
- `src/data/locations.ts` — store locations rarely change, legal/address data

---

## Phase 1 — Install Payload v3

**Packages to install:**
```bash
npm install payload @payloadcms/next @payloadcms/db-postgres @payloadcms/richtext-lexical @payloadcms/ui sharp
```

**Environment variables needed** (`.env.local`):
```env
DATABASE_URI=postgresql://user:password@localhost:5432/oroz_pharm
PAYLOAD_SECRET=<random-32-char-string>
NEXT_PUBLIC_SERVER_URL=http://localhost:3000
```

**Files to create/modify:**
- `payload.config.ts` — root Payload configuration (collections, admin, DB adapter)
- `src/app/(payload)/admin/[[...segments]]/page.tsx` — Payload admin route
- `src/app/(payload)/admin/[[...segments]]/not-found.tsx`
- `src/app/(payload)/api/[...slug]/route.ts` — Payload REST API route
- `next.config.ts` — wrap with `withPayload()`, add localhost to `remotePatterns`

**Database setup for local dev:**
- Install PostgreSQL locally (via Homebrew: `brew install postgresql@16`)
- Or use Docker: `docker run -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgres`
- Production: Neon.tech free tier (hosted PostgreSQL, no server management)

---

## Phase 2 — Define Collections

### 2a. Media (upload collection)
- Payload built-in upload type
- Stores images in `/public/media/` locally, object storage in production
- Automatically creates `url`, `width`, `height`, `alt` fields
- Add to `remotePatterns` in `next.config.ts`: localhost + production domain

### 2b. Blogs collection (`src/collections/Blogs.ts`)
Fields:
- `title` — text, required
- `slug` — text, unique, required (auto-generated from title)
- `excerpt` — textarea, required
- `coverImage` — upload (→ Media), required
- `date` — date, required
- `readingTime` — number (minutes)
- `tags` — array of text
- `content` — richText (Lexical editor)

Replace current content: 4 blog posts from `src/data/blogs.ts`

### 2c. Testimonials collection (`src/collections/Testimonials.ts`)
Fields:
- `quote` — textarea, required
- `author` — text, required
- `company` — text
- `logo` — upload (→ Media)
- `order` — number (for display ordering)

Replace current content: testimonials from `src/data/testimonials.ts`

### 2d. Team collection (`src/collections/Team.ts`)
Fields:
- `name` — text, required
- `role` — text, required
- `bio` — textarea
- `photo` — upload (→ Media), required
- `order` — number

New content — currently hardcoded/not present in data files.

### 2e. Categories collection (`src/collections/Categories.ts`)
This is the most complex. Current shape in `src/data/categories.ts`:
```
ProductCategory {
  id, slug, name, description, icon (string), image (URL),
  gridArea, subcategories: Subcategory[]
}
Subcategory { id, name, slug, image (URL) }
```

Payload fields:
- `name` — text, required
- `slug` — text, unique, required
- `description` — textarea
- `icon` — text (Lucide icon name — keep as string, rendered in code)
- `image` — upload (→ Media)
- `gridArea` — text (CSS grid area — keep as text)
- `subcategories` — array of objects:
  - `name` — text
  - `slug` — text
  - `image` — upload (→ Media)

Replace current content: 22 categories + all subcategories from `src/data/categories.ts`

---

## Phase 3 — Migrate existing data (seed)

Create `src/scripts/seed.ts` — a one-time migration script that:
1. Reads existing data from `src/data/blogs.ts`, `testimonials.ts`, `categories.ts`
2. Downloads and uploads Unsplash images to Payload Media
3. Creates all documents via Payload Local API

Run once after collections are defined. After seeding, the `src/data/*.ts` files can be removed (except `locations.ts` and `navigation.ts`).

---

## Phase 4 — Replace data fetching

Update Server Components to use Payload Local API instead of static imports.

**Before (current pattern):**
```ts
// src/app/blog/page.tsx
import { blogPosts } from '@/data/blogs'
```

**After (Payload Local API):**
```ts
// src/app/blog/page.tsx
import { getPayload } from 'payload'
import config from '@payload-config'

const payload = await getPayload({ config })
const { docs: posts } = await payload.find({ collection: 'blogs', sort: '-date' })
```

**Files to update:**
- `src/app/blog/page.tsx` + `[slug]/page.tsx`
- `src/app/proizvodi/page.tsx` + `[category]/page.tsx`
- `src/components/home/BlogPreview.tsx`
- `src/components/home/PartnersTestimonials.tsx`
- `src/components/about/TeamGrid.tsx`
- `src/app/(admin or about)/o-nama/page.tsx` (team data)

**`generateStaticParams`** stays — just replace the data source from static array to Payload query.

---

## Phase 5 — Update TypeScript types

- Remove `src/types/blog.ts` and `src/types/product.ts` — Payload auto-generates types from collection schemas
- Run `payload generate:types` to produce `src/payload-types.ts`
- Update all component props to use generated types

---

## Phase 6 — Update documentation

- Update `CLAUDE.md` to reflect new stack (database, API routes, auth now exist)
- Update `architectural_patterns.md` section 6 (Static Data Management → Payload Collections)
- Add notes on Payload Local API usage pattern

---

## Hosting notes (Hetzner VPS)

When deploying to a Hetzner VPS:
- Run PostgreSQL on the same server or use Neon.tech
- Media files: store in `/public/media/` or configure S3-compatible object storage (Cloudflare R2, Hetzner Object Storage)
- Set `PAYLOAD_SECRET`, `DATABASE_URI`, `NEXT_PUBLIC_SERVER_URL` as environment variables
- Run `npm run build && npm run start` with PM2 or similar process manager
- Nginx as reverse proxy in front of the Node.js server

---

## Implementation order

1. [ ] Install packages
2. [ ] Set up local PostgreSQL
3. [ ] Create `payload.config.ts` with empty collections
4. [ ] Wire up Payload routes in `src/app/(payload)/`
5. [ ] Update `next.config.ts` with `withPayload()`
6. [ ] Verify admin UI loads at `/admin`
7. [ ] Define Media collection
8. [ ] Define Blogs collection — verify CRUD works in admin
9. [ ] Define Testimonials collection
10. [ ] Define Team collection
11. [ ] Define Categories collection (most complex — test subcategory array)
12. [ ] Write and run seed script
13. [ ] Update data fetching in pages/components
14. [ ] Generate and update TypeScript types
15. [ ] Remove obsolete `src/data/` files (blogs.ts, testimonials.ts, categories.ts)
16. [ ] Update CLAUDE.md and architectural_patterns.md
17. [ ] Full `next build` — verify no type errors
