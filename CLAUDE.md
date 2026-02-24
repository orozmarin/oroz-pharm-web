# Oroz PHARM — Claude Context

## Project Overview

Agricultural pharmacy (poljoprivredna ljekarna) website for Oroz PHARM, operating since 1998 in Pleternica and Požega, Croatia. Provides 12,000+ products: seeds, fertilisers, plant protection, livestock feed, irrigation equipment, and more. The site serves as a product catalogue, educational blog, and storefront locator — no e-commerce checkout.

UI copy is in Croatian.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 (strict, path alias `@/*` → `src/*`) |
| Styling | Tailwind CSS v4 + custom theme in `src/app/globals.css` |
| Animation | Framer Motion + custom IntersectionObserver system |
| Forms | React Hook Form 7 + Zod 4 |
| Maps | React-Leaflet 5 / Leaflet 1.9 |
| Icons | Lucide React |
| Fonts | Playfair Display (headings) + Inter (body) via Google Fonts |

No database, no API routes, no authentication, no tests configured.

## Key Directories

```
src/
├── app/                    # Next.js App Router pages & layouts
│   ├── layout.tsx          # Root layout — Google Fonts, Header, Footer
│   ├── globals.css         # Tailwind theme, custom animations, CSS utilities
│   ├── blog/[slug]/        # Dynamic blog post pages
│   └── proizvodi/[category]/ # Dynamic product category pages
├── components/
│   ├── shared/             # Reusable primitives: Button, AnimatedSection, SectionHeading, Map
│   ├── layout/             # Header, Footer, MobileNav
│   ├── home/               # Page-specific sections (HeroSlideshow, ServicesIntro, etc.)
│   ├── blog/               # BlogCard, BlogListClient, BlogPostContent, BlogRelatedPosts
│   ├── products/           # CategoryGrid, CategoryCard, CategoryDetailClient, BrandMarquee
│   ├── contact/            # ContactForm, StoreLocations, LegalData
│   └── about/              # Timeline, TeamGrid, LocationGallery
├── data/                   # All static content (no CMS/DB)
│   ├── categories.ts       # 22 product categories with subcategories
│   ├── blogs.ts            # Blog posts (content as template-literal strings)
│   ├── testimonials.ts     # Customer quotes
│   ├── locations.ts        # Store coordinates, hours, contact
│   └── navigation.ts       # Nav link definitions
├── lib/
│   ├── useInView.ts        # IntersectionObserver hook for scroll animations
│   └── utils.ts            # cn() (clsx + twMerge), formatDate()
└── types/
    ├── product.ts           # ProductCategory, Subcategory, Brand
    └── blog.ts              # BlogPost interface
```

## Build & Dev Commands

```bash
npm run dev       # Dev server → http://localhost:3000
npm run build     # Production build (static generation)
npm run start     # Serve production build
npm run lint      # ESLint (next/core-web-vitals config)
```

No test runner is configured. `next build` is the primary correctness check.

## External Image Domains

Allowed in `next.config.ts`: `images.unsplash.com`, `unpkg.com` (Leaflet assets).

## Additional Documentation

Check these files when working on the relevant areas:

- [.claude/docs/architectural_patterns.md](.claude/docs/architectural_patterns.md) — Component structure conventions, scroll animation system, form pattern, dynamic route pattern, static data management, shared component API
