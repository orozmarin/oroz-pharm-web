import type { CollectionConfig } from 'payload'

export const Products: CollectionConfig = {
  slug: 'products',
  labels: { singular: 'Proizvod', plural: 'Proizvodi' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'category', 'manufacturer', 'updatedAt'],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Naziv proizvoda',
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      label: 'Slug',
      admin: {
        description: 'URL identifikator, npr. amistar-250-ec. Mora biti jedinstven.',
      },
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
      required: true,
      label: 'Kategorija',
    },
    {
      name: 'subcategory',
      type: 'relationship',
      relationTo: 'subcategories',
      label: 'Podkategorija',
      filterOptions: ({ data }) => {
        if (!data?.category) return true
        return { category: { equals: data.category } }
      },
    },
    {
      name: 'manufacturer',
      type: 'relationship',
      relationTo: 'manufacturers',
      label: 'Proizvođač',
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Kratki opis',
    },
    {
      name: 'age',
      type: 'text',
      label: 'Uzrast',
      admin: {
        description: 'Koristi se za kategoriju Perad. Npr. 1 dan, 3 tjedna, 18 tjedana.',
      },
    },
    {
      name: 'purpose',
      type: 'text',
      label: 'Namjena',
      admin: {
        description: 'Koristi se za kategoriju Perad. Upisati tov ili jaja.',
      },
    },
    {
      name: 'instructions',
      type: 'richText',
      label: 'Upute za primjenu',
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      label: 'Slika proizvoda',
    },
  ],
}
