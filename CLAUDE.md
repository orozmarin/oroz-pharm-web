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
