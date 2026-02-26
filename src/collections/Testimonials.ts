import type { CollectionConfig } from 'payload'

export const Testimonials: CollectionConfig = {
  slug: 'testimonials',
  labels: { singular: 'Preporuka', plural: 'Preporuke' },
  admin: {
    useAsTitle: 'author',
    defaultColumns: ['author', 'company', 'order'],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'quote',
      type: 'textarea',
      required: true,
      label: 'Citat',
    },
    {
      name: 'author',
      type: 'text',
      required: true,
      label: 'Ime i prezime',
    },
    {
      name: 'company',
      type: 'text',
      label: 'Tvrtka / Naziv partnera',
    },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
      label: 'Logo partnera',
    },
    {
      name: 'order',
      type: 'number',
      label: 'Redoslijed prikaza',
      admin: {
        description: 'Manji broj = prikazuje se prvo',
      },
    },
  ],
}
