import type { CollectionConfig } from 'payload'

export const Team: CollectionConfig = {
  slug: 'team',
  labels: { singular: 'Član tima', plural: 'Tim' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'role', 'order'],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Ime i prezime',
    },
    {
      name: 'role',
      type: 'text',
      required: true,
      label: 'Radno mjesto',
    },
    {
      name: 'bio',
      type: 'textarea',
      label: 'Kratki životopis',
    },
    {
      name: 'photo',
      type: 'upload',
      relationTo: 'media',
      required: true,
      label: 'Fotografija',
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
