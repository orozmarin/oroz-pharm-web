# Architectural Patterns

## 1. Server / Client Component Split

Pages in `src/app/` are **async Server Components** by default — they import data directly and render HTML. Interactive children are extracted into separate `"use client"` components.

**Pattern:**
- `src/app/(site)/proizvodi/[category]/page.tsx` — async server page fetches category from Payload, normalises to view type, renders layout
- `src/components/products/CategoryDetailClient.tsx` — `"use client"` accordion needs `useState`
- `src/app/(site)/blog/[slug]/page.tsx` — async server page; `BlogPostContent` is a server component rendering Lexical JSON via `<RichText>`

Rule of thumb: push `"use client"` as far down the tree as possible.

---

## 2. Dynamic Route Pattern

Both dynamic routes follow the same three-export structure:

```
generateStaticParams()   → pre-renders all slugs at build time
generateMetadata()       → per-page SEO title + description
default export (async)   → awaits params, calls notFound() if missing
```

Key files:
- [src/app/(site)/blog/[slug]/page.tsx](../../src/app/(site)/blog/%5Bslug%5D/page.tsx)
- [src/app/(site)/proizvodi/[category]/page.tsx](../../src/app/(site)/proizvodi/%5Bcategory%5D/page.tsx)

`params` is a Promise in Next.js 15+ App Router — always `await params` before destructuring.

---

## 3. Scroll Animation System

Three-layer system used across home sections, blog cards, contact form, and product grids.

**Layer 1 — Hook** [`src/lib/useInView.ts:9`](../../src/lib/useInView.ts#L9)
`useInView<T>()` returns a ref. When the element enters the viewport, it adds `is-visible` to the element and cascades `is-visible` + `--stagger-index` to direct `.animate-on-scroll` children. Fires once, then disconnects.

**Layer 2 — CSS** [`src/app/globals.css`](../../src/app/globals.css)
`.animate-on-scroll` starts `opacity: 0`. On `.is-visible`, transitions to full opacity + default transform. Animation variant classes (`anim-fade-in-up`, `anim-slide-in-left`, `anim-slide-in-right`, `anim-scale-in`) set the starting `transform`. Stagger children use `calc(var(--stagger-index) * 80ms)` delay.

**Layer 3 — Wrapper Component** [`src/components/shared/AnimatedSection.tsx`](../../src/components/shared/AnimatedSection.tsx)
`<AnimatedSection animation="fade-in-up">` wraps a `<section>` with the hook + classes applied. Use this for page-level sections; apply the hook directly in components that need finer control.

**Usage:** add `animate-on-scroll anim-*` classes to an element, attach the `useInView` ref to it (or its parent for stagger).

Respects `prefers-reduced-motion` via CSS.

---

## 4. Form Pattern

Single pattern used in [`src/components/contact/ContactForm.tsx:12`](../../src/components/contact/ContactForm.tsx#L12):

1. Define a **Zod schema** at module level
2. Derive the TypeScript type with `z.infer<typeof schema>`
3. Pass `zodResolver(schema)` to `useForm<FormData>()`
4. Bind fields with `{...register("fieldName")}`
5. Show errors via `errors.fieldName?.message`
6. Gate the submit button with `isSubmitting`

Do not mix in manual `useState` for field values — React Hook Form owns all field state.

---

## 5. Shared Button Component

[`src/components/shared/Button.tsx`](../../src/components/shared/Button.tsx) renders either a `<Link>` (when `href` is provided) or a `<button>`. Props:

- `variant`: `"primary"` (green) | `"secondary"` (earth/brown) | `"outline"`
- `size`: `"sm"` | `"md"` | `"lg"`
- `type`: `"button"` | `"submit"` (defaults to `"button"`)

Always use this component instead of raw `<button>` or `<Link>` for CTAs.

---

## 6. Payload CMS Data Fetching

Dynamic content (blogs, categories, testimonials, team, media) is stored in PostgreSQL and managed via the Payload CMS admin UI at `/admin`. Static content that needs no CMS editing (`locations.ts`, `navigation.ts`) remains in `src/data/`.

### Local API Pattern

All data fetching happens in **async Server Components** using the Payload Local API (no HTTP round-trip):

```ts
import { getPayload } from "payload";
import config from "@payload-config";

const payload = await getPayload({ config });
const { docs } = await payload.find({
  collection: "blogs",   // must match a key in Config["collections"]
  sort: "-date",
  depth: 1,              // populate relation fields (e.g. coverImage: number → Media object)
  limit: 10,
  where: { slug: { equals: slug } },
});
```

`depth: 1` is required whenever you need the full Media object (with `url`). Without it, relation fields are returned as bare numeric IDs.

### Image Normalisation Helper

Payload returns media relations as `number | Media | null` depending on depth. Use this helper in every server page:

```ts
import type { Media } from "@/payload-types";

function getImageUrl(media: number | Media | null | undefined): string {
  if (typeof media === "object" && media !== null && media.url) {
    return media.url;
  }
  return FALLBACK_IMAGE;
}
```

### View Model Types

Server components normalise raw Payload docs into simplified view-layer interfaces (`src/types/views.ts`) before passing them as props to `"use client"` components:

```
Payload doc (Category)  →  normalizeCategory()  →  ProductCategory (views.ts)  →  CategoryGrid (client)
```

This keeps client components decoupled from Payload internals.

### Tag Normalisation

Payload stores tags as `{ tag: string; id?: string }[]`, not `string[]`. Always map:

```ts
tags: doc.tags?.map((t) => t.tag) ?? []
```

### Generated Types

`src/payload-types.ts` is the type source of truth for all Payload collections. It exports `Media`, `Blog`, `Category`, `Testimonial`, `Team`, `User`, and the `Config` interface which powers SDK type inference via module augmentation. **Do not edit this file by hand** unless regenerating with `npx payload generate:types` is blocked (Node.js v25 ESM compatibility issue — write manually from collection schemas if needed).

### Rich Text Rendering

Blog post `content` is stored as Lexical JSON. Render it with:

```tsx
import { RichText } from "@payloadcms/richtext-lexical/react";
import type { SerializedEditorState } from "lexical";

<RichText data={content as SerializedEditorState} />
```

This is a **server component** — no `"use client"` needed. Do not use the old custom line-by-line markdown parser.

---

## 7. Active Nav State

[`src/components/layout/Header.tsx`](../../src/components/layout/Header.tsx) uses `usePathname()` and compares against each link's `href` to apply active styles. The same `navLinks` array from `src/data/navigation.ts` drives the desktop header, `MobileNav`, and the footer nav — edit once, updates everywhere.

---

## 8. Image Usage

Always use `next/image` `<Image>`. Patterns in use:

- `fill` + `sizes="100vw"` for full-bleed backgrounds with an overlay `<div>`
- `priority` flag on above-the-fold images (hero slides, blog cover)
- External sources must be listed in `next.config.ts` under `remotePatterns`

---

## 9. Utility Helpers

[`src/lib/utils.ts`](../../src/lib/utils.ts):
- `cn(...inputs)` — `clsx` + `tailwind-merge`; use for all conditional class construction
- `formatDate(dateStr)` — formats ISO date strings to Croatian locale (`hr-HR`)
