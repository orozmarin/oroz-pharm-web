import { buildConfig } from 'payload'
import { hr } from '@payloadcms/translations/languages/hr'
import { postgresAdapter } from '@payloadcms/db-postgres'
import {
  lexicalEditor,
  HeadingFeature,
  BoldFeature,
  ItalicFeature,
  UnderlineFeature,
  StrikethroughFeature,
  SubscriptFeature,
  SuperscriptFeature,
  OrderedListFeature,
  UnorderedListFeature,
  ChecklistFeature,
  LinkFeature,
  BlockquoteFeature,
  HorizontalRuleFeature,
  UploadFeature,
} from '@payloadcms/richtext-lexical'
import sharp from 'sharp'
import path from 'path'
import { fileURLToPath } from 'url'

import { Users } from '@/collections/Users'
import { Media } from '@/collections/Media'
import { Blogs } from '@/collections/Blogs'
import { Testimonials } from '@/collections/Testimonials'
import { Team } from '@/collections/Team'
import { Manufacturers } from '@/collections/Manufacturers'
import { Subcategories } from '@/collections/Subcategories'
import { Categories } from '@/collections/Categories'
import { Products } from '@/collections/Products'
import { ContactSubmissions } from '@/collections/ContactSubmissions'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  i18n: {
    supportedLanguages: { hr },
    fallbackLanguage: 'hr',
  },
  admin: {
    user: 'users',
    theme: 'all',
    dateFormat: 'dd.MM.yyyy. HH:mm',
    meta: {
      titleSuffix: '— Oroz PHARM',
      description: 'Oroz PHARM — sustav za upravljanje sadržajem',
    },
    components: {
      afterNavLinks: [
        {
          path: '@/components/admin/LogoutButton',
          exportName: 'default',
        },
      ],
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [
    Users,
    Media,
    Blogs,
    Testimonials,
    Team,
    Manufacturers,
    Subcategories,
    Categories,
    Products,
    ContactSubmissions,
  ],
  editor: lexicalEditor({
    features: () => [
      HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
      BoldFeature(),
      ItalicFeature(),
      UnderlineFeature(),
      StrikethroughFeature(),
      SubscriptFeature(),
      SuperscriptFeature(),
      OrderedListFeature(),
      UnorderedListFeature(),
      ChecklistFeature(),
      LinkFeature(),
      BlockquoteFeature(),
      HorizontalRuleFeature(),
      UploadFeature(),
    ],
  }),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'src/payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
  }),
  sharp,
  plugins: [],
})
