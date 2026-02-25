/**
 * View model types — simplified shapes that server components produce from
 * Payload docs and pass as props to client components.
 *
 * These are distinct from the Payload-generated types in payload-types.ts
 * which describe the raw database documents.
 */

// Blog view model (normalised from Payload's Blog type)
export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  coverImage: string;
  date: string;
  readingTime: number;
  content: unknown; // Lexical SerializedEditorState from Payload
  tags: string[];
}

// Product category view model (normalised from Payload's Category type)
export interface ProductCategory {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  image: string;
  gridArea: string;
  subcategories: Subcategory[];
  brands: Brand[];
}

export interface Subcategory {
  id: string;
  name: string;
  description?: string;
}

export interface Brand {
  id: string;
  name: string;
  logo?: string;
  website?: string;
}
