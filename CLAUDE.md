# Oroz PHARM — Claude Context

## Project Overview

Agricultural pharmacy (poljoprivredna ljekarna) website for Oroz PHARM, operating since 1998 in Pleternica and Požega, Croatia. Provides 12,000+ products: seeds, fertilisers, plant protection, livestock feed, irrigation equipment, and more. The site serves as a product catalogue, educational blog, and storefront locator — no e-commerce checkout.

UI copy is in Croatian.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| CMS | Payload CMS v3 (embedded, admin UI at `/admin`) |
| Database | PostgreSQL via `@payloadcms/db-postgres` |
| Language | TypeScript 5 (strict, path alias `@/*` → `src/*`) |
| Styling | Tailwind CSS v4 + custom theme in `src/app/globals.css` |
| Animation | Framer Motion + custom IntersectionObserver system |
| Forms | React Hook Form 7 + Zod 4 |
| Maps | React-Leaflet 5 / Leaflet 1.9 |
| Icons | Lucide React |
| Fonts | Playfair Display (headings) + Inter (body) via Google Fonts |

Authentication exists (Payload admin users). API routes exist (`/api/[...slug]`). No test runner configured — `next build` is the primary correctness check.

## Key Directories

```
src/
├── app/                    # Next.js App Router pages & layouts
│   ├── (site)/             # Public-facing route group
│   │   ├── layout.tsx      # Site layout — Google Fonts, Header, Footer
│   │   ├── page.tsx        # Home page (async, fetches from Payload)
│   │   ├── blog/           # Blog list + [slug] detail pages
│   │   ├── proizvodi/      # Product category list + [category] detail pages
│   │   ├── o-nama/         # About page
│   │   ├── kontakt/        # Contact page
│   │   └── not-found.tsx   # 404 page
│   ├── (payload)/          # Payload CMS admin + API (auto-generated routes)
│   └── globals.css         # Tailwind theme, custom animations, CSS utilities
├── collections/            # Payload collection definitions (schema = source of truth)
│   ├── Blogs.ts            # Blog posts — title, slug, date, coverImage, content (Lexical)
│   ├── Categories.ts       # Product categories — name, slug, image, subcategories
│   ├── Testimonials.ts     # Customer quotes — quote, author, company
│   ├── Team.ts             # Team members — name, role, image, bio
│   └── Media.ts            # Uploaded media (images)
├── components/
│   ├── shared/             # Reusable primitives: Button, AnimatedSection, SectionHeading, Map
│   ├── layout/             # Header, Footer, MobileNav
│   ├── home/               # Page-specific sections (HeroSlideshow, ServicesIntro, etc.)
│   ├── blog/               # BlogCard, BlogListClient, BlogPostContent, BlogRelatedPosts
│   ├── products/           # CategoryGrid, CategoryCard, CategoryDetailClient, BrandMarquee
│   ├── contact/            # ContactForm, StoreLocations, LegalData
│   └── about/              # Timeline, TeamGrid, LocationGallery
├── data/                   # Static content NOT managed by CMS
│   ├── locations.ts        # Store coordinates, hours, contact
│   └── navigation.ts       # Nav link definitions
├── lib/
│   ├── useInView.ts        # IntersectionObserver hook for scroll animations
│   └── utils.ts            # cn() (clsx + twMerge), formatDate()
├── payload-types.ts        # Auto-generated Payload types (Media, Blog, Category, etc.)
├── scripts/                # One-off scripts (e.g. seed.ts to populate database)
└── types/
    └── views.ts            # View-layer interfaces: BlogPost, ProductCategory, Subcategory, Brand
```

## Build & Dev Commands

```bash
npm run dev       # Dev server → http://localhost:3000
npm run build     # Production build
npm run start     # Serve production build
npm run lint      # ESLint (next/core-web-vitals config)
npx tsx src/scripts/seed.ts   # Seed database from static data (run once after fresh DB)
```

No test runner is configured. `next build` is the primary correctness check.

Payload admin UI is at `http://localhost:3000/admin`. Database connection is configured via `DATABASE_URI` env var (PostgreSQL).

## External Image Domains

Allowed in `next.config.ts`: `images.unsplash.com`, `unpkg.com` (Leaflet assets).

## Additional Documentation

Check these files when working on the relevant areas:

- [.claude/docs/architectural_patterns.md](.claude/docs/architectural_patterns.md) — Component structure conventions, scroll animation system, form pattern, dynamic route pattern, Payload CMS data fetching, shared component API

## Sub-Agents

Always invoke the relevant sub-agent immediately when a task maps to one of these domains — do not handle it inline first.

| Agent | Domain |
|---|---|
| `cms-collections-agent` | Payload CMS v3 collection schemas, Lexical editor config, Cloudflare R2/storage plugin, seed scripts, `payload-types.ts` regeneration |
| `product-catalogue-agent` | Product & category listing pages, subcategory filtering, product cards, manufacturer/brand display, related categories — view layer under `src/app/(site)/proizvodi/` and `src/components/products/` |
| `blog-content-agent` | Blog list and detail pages, Lexical rich-text rendering, blog cards, related posts, Croatian date formatting — `src/app/(site)/blog/` and `src/components/blog/` |
| `contact-forms-agent` | Contact form (React Hook Form + Zod), Cloudflare Turnstile bot protection, `/api/contact` route, Resend email integration, store locations map, legal data |
| `ui-styling-agent` | Tailwind v4 theme tokens, global CSS, scroll animation system (`useInView`, `AnimatedSection`), shared component primitives, Header/Footer/MobileNav, responsive layout |
| `infra-deploy-agent` | Hetzner server deploy, production build, PostgreSQL connection, Cloudflare R2 storage, DNS/SSL, environment variables, `next.config.ts` |

## Memory System

Project memory lives in `~/.claude/projects/-Users-marinoroz-Documents-OrozDigital-oroz-pharm/memory/`.

**`MEMORY.md`** is always loaded — it's a short index of pointers to individual memory files.

Rules for saving memory:
- **Feedback** (`feedback_*.md`) — whenever something breaks in a non-obvious way or a workaround is needed. These are the most valuable — they prevent repeating the same mistakes.
- **Project** (`project_*.md`) — server config, deploy state, integration status, DNS/infra progress. Update when state changes (e.g. DNS migrated, SSL obtained).
- **Do NOT save** to memory: code patterns, file paths, architecture — those are derivable from the codebase. Git history belongs in commits. In-progress task state belongs in TodoWrite, not memory.
