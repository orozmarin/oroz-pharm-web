import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'Korisnik', plural: 'Korisnici' },
  admin: {
    useAsTitle: 'email',
  },
  auth: true,
  fields: [],
}
