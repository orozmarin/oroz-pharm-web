import type { CollectionConfig } from 'payload'

export const Categories: CollectionConfig = {
  slug: 'categories',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'updatedAt'],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Naziv kategorije',
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      label: 'Slug',
      admin: {
        description: 'URL identifikator, npr. sjemenski-program',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Opis',
    },
    {
      name: 'icon',
      type: 'text',
      label: 'Lucide ikona',
      admin: {
        description: 'Naziv Lucide ikone, npr. Wheat, Leaf, Tractor',
      },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      label: 'Slika kategorije',
    },
    {
      name: 'gridArea',
      type: 'text',
      label: 'Grid area (CSS)',
      admin: {
        description: 'CSS grid-area naziv za pozicioniranje u rešetki',
      },
    },
    {
      name: 'relatedCategories',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
      label: 'Srodne kategorije',
      admin: {
        description: 'Kategorije prikazane u dijelu "Možda vas zanima" na stranici kategorije (max 3)',
      },
    },
  ],
}
