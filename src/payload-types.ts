/**
 * This file was generated from Payload collection schemas.
 * Re-generate by running: npx payload generate:types
 * (requires Node.js v22 or earlier due to ESM/tsx compatibility)
 */

// ─── Media ────────────────────────────────────────────────────────────────────

export interface Media {
  id: number;
  alt: string;
  updatedAt: string;
  createdAt: string;
  url?: string | null;
  thumbnailURL?: string | null;
  filename?: string | null;
  mimeType?: string | null;
  filesize?: number | null;
  width?: number | null;
  height?: number | null;
  focalX?: number | null;
  focalY?: number | null;
  sizes?: {
    thumbnail?: {
      url?: string | null;
      width?: number | null;
      height?: number | null;
      mimeType?: string | null;
      filesize?: number | null;
      filename?: string | null;
    } | null;
    card?: {
      url?: string | null;
      width?: number | null;
      height?: number | null;
      mimeType?: string | null;
      filesize?: number | null;
      filename?: string | null;
    } | null;
    hero?: {
      url?: string | null;
      width?: number | null;
      height?: number | null;
      mimeType?: string | null;
      filesize?: number | null;
      filename?: string | null;
    } | null;
  };
}

// ─── Blog ─────────────────────────────────────────────────────────────────────

export interface Blog {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  coverImage?: number | Media | null;
  date: string;
  readingTime?: number | null;
  tags?: {
    tag: string;
    id?: string | null;
  }[] | null;
  content?: {
    root: {
      type: string;
      children: {
        type: string;
        version: number;
        [k: string]: unknown;
      }[];
      direction: ('ltr' | 'rtl') | null;
      format: 'left' | 'start' | 'center' | 'right' | 'end' | 'justify' | '';
      indent: number;
      version: number;
    };
    [k: string]: unknown;
  } | null;
  updatedAt: string;
  createdAt: string;
}

// ─── Testimonial ──────────────────────────────────────────────────────────────

export interface Testimonial {
  id: number;
  quote: string;
  author: string;
  company?: string | null;
  logo?: number | Media | null;
  order?: number | null;
  updatedAt: string;
  createdAt: string;
}

// ─── Team ─────────────────────────────────────────────────────────────────────

export interface Team {
  id: number;
  name: string;
  role: string;
  bio?: string | null;
  photo: number | Media;
  order?: number | null;
  updatedAt: string;
  createdAt: string;
}

// ─── Manufacturer ─────────────────────────────────────────────────────────────

export interface Manufacturer {
  id: number;
  name: string;
  slug: string;
  updatedAt: string;
  createdAt: string;
}

// ─── Category ─────────────────────────────────────────────────────────────────

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  image?: number | Media | null;
  gridArea?: string | null;
  relatedCategories?: (number | Category)[] | null;
  updatedAt: string;
  createdAt: string;
}

// ─── Subcategory ──────────────────────────────────────────────────────────────

export interface Subcategory {
  id: number;
  name: string;
  slug: string;
  category: number | Category;
  image?: number | Media | null;
  updatedAt: string;
  createdAt: string;
}

// ─── Product ──────────────────────────────────────────────────────────────────

export interface Product {
  id: number;
  name: string;
  slug: string;
  category: number | Category;
  subcategory?: number | Subcategory | null;
  manufacturer?: number | Manufacturer | null;
  description?: string | null;
  instructions?: {
    root: {
      type: string;
      children: {
        type: string;
        version: number;
        [k: string]: unknown;
      }[];
      direction: ('ltr' | 'rtl') | null;
      format: 'left' | 'start' | 'center' | 'right' | 'end' | 'justify' | '';
      indent: number;
      version: number;
    };
    [k: string]: unknown;
  } | null;
  image?: number | Media | null;
  updatedAt: string;
  createdAt: string;
}

// ─── ContactSubmission ────────────────────────────────────────────────────────

export interface ContactSubmission {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  category: string;
  message: string;
  status: 'novo' | 'odgovoreno' | 'arhivirano';
  updatedAt: string;
  createdAt: string;
}

// ─── User ─────────────────────────────────────────────────────────────────────

export interface User {
  id: number;
  updatedAt: string;
  createdAt: string;
  email: string;
  resetPasswordToken?: string | null;
  resetPasswordExpiration?: string | null;
  salt?: string | null;
  hash?: string | null;
  loginAttempts?: number | null;
  lockUntil?: string | null;
  password?: string | null;
}

// ─── Config ───────────────────────────────────────────────────────────────────

export interface Config {
  auth: {
    users: {
      operations: {
        access: unknown;
        login: unknown;
        logout: unknown;
        me: unknown;
        refresh: unknown;
        register: unknown;
      };
    };
  };
  collections: {
    users: User;
    media: Media;
    blogs: Blog;
    testimonials: Testimonial;
    team: Team;
    manufacturers: Manufacturer;
    subcategories: Subcategory;
    categories: Category;
    products: Product;
    'contact-submissions': ContactSubmission;
  };
  collectionsJoins: Record<string, never>;
  db: {
    defaultIDType: number;
  };
  globals: Record<string, never>;
  locale: null;
  user: User & {
    collection: 'users';
  };
}

// ─── Module augmentation — registers types with the Payload SDK ───────────────

declare module 'payload' {
  export interface GeneratedTypes extends Config {}
}
