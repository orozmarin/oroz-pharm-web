import type { CollectionConfig } from 'payload'

export const Subcategories: CollectionConfig = {
  slug: 'subcategories',
  labels: { singular: 'Podkategorija', plural: 'Podkategorije' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'category', 'slug', 'updatedAt'],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Naziv podkategorije',
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      label: 'Slug',
      admin: {
        description: 'URL identifikator, npr. fungicidi, herbicidi',
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
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      label: 'Slika podkategorije',
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Opis (prikazuje se na izlogu asortimana)',
    },
    {
      name: 'isShowcase',
      type: 'checkbox',
      label: 'Prikaži kao izlog asortimana (bez pojedinačnih proizvoda)',
      defaultValue: false,
      admin: {
        description:
          'Kada je označeno, stranica podkategorije prikazuje opisni blok s CTA gumbom umjesto liste pojedinačnih proizvoda. Koristiti za asortiman koji nije objavljivan artikl-po-artikl (npr. sitni spojni materijal, vezni pribor).',
      },
    },
  ],
}
