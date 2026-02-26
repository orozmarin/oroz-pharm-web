import type { CollectionConfig } from 'payload'

const isAdmin = ({ req: { user } }: { req: { user: unknown } }) => {
  return Boolean(user)
}

export const ContactSubmissions: CollectionConfig = {
  slug: 'contact-submissions',
  labels: { singular: 'Upit', plural: 'Upiti' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'category', 'status', 'createdAt'],
  },
  access: {
    read: isAdmin,
    create: () => true,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Ime i prezime',
    },
    {
      name: 'email',
      type: 'email',
      required: true,
      label: 'Email adresa',
    },
    {
      name: 'phone',
      type: 'text',
      label: 'Telefon',
    },
    {
      name: 'category',
      type: 'text',
      required: true,
      label: 'Kategorija upita',
    },
    {
      name: 'message',
      type: 'textarea',
      required: true,
      label: 'Poruka',
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'novo',
      label: 'Status',
      options: [
        { label: 'Novo', value: 'novo' },
        { label: 'Odgovoreno', value: 'odgovoreno' },
        { label: 'Arhivirano', value: 'arhivirano' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
  ],
}
