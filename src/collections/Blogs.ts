import type { CollectionConfig } from 'payload'

export const Blogs: CollectionConfig = {
  slug: 'blogs',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'date', 'updatedAt'],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Naslov',
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      label: 'Slug',
      admin: {
        description: 'URL identifikator, npr. proljetna-gnojidba (automatski generirano iz naslova)',
      },
    },
    {
      name: 'excerpt',
      type: 'textarea',
      required: true,
      label: 'Kratki opis',
      admin: {
        description: 'Kratki opis koji se prikazuje na popisu blogova',
      },
    },
    {
      name: 'coverImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Naslovna slika',
    },
    {
      name: 'date',
      type: 'date',
      required: true,
      label: 'Datum objave',
      admin: {
        date: {
          pickerAppearance: 'dayOnly',
          displayFormat: 'd. M. yyyy.',
        },
      },
    },
    {
      name: 'readingTime',
      type: 'number',
      label: 'Vrijeme čitanja (min)',
      admin: {
        description: 'Procijenjeno vrijeme čitanja u minutama',
      },
    },
    {
      name: 'tags',
      type: 'array',
      label: 'Oznake',
      fields: [
        {
          name: 'tag',
          type: 'text',
          required: true,
          label: 'Oznaka',
        },
      ],
    },
    {
      name: 'content',
      type: 'richText',
      required: true,
      label: 'Sadržaj',
    },
  ],
}
