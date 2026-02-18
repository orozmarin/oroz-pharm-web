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
