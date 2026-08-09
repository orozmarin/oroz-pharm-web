/**
 * Perad: kreira kategoriju, dvije podkategorije po uzrastu i 9 proizvoda žive peradi.
 * Idempotentno (upsert po slugu), smije se pokrenuti više puta — i protiv iste baze
 * više puta, i kasnije ponovno protiv produkcije.
 *
 * Idempotentnost pokriva i slike: ako zapis (kategorija ili proizvod) već ima
 * pridruženu sliku, skripta je NE uploada iznova i NE dira image polje — samo
 * prazan slot (nov zapis ili postojeći bez slike) se popunjava uploadom. Bez ove
 * provjere bi svaki re-run stvarao nove Media zapise i ostavljao stare osirotjele
 * (potvrđeno u praksi — vidi task-3-report.md, fix round 1).
 *
 * Napomena: fotografije za `jednodnevni-purici` i `osmotjedna-nesilica` još ne postoje
 * (klijent ih fotografira i dodaje kasnije kroz /admin). Skripta ih tada preskače i
 * kreira proizvod bez slike, ne pada i ne koristi zamjensku fotografiju. Kad fotka
 * kasnije stigne u IMG_DIR, sljedeći re-run će je podići (jer zapis još nema image).
 *
 * Lokalno:  API_BASE=http://localhost:3000 node --env-file=.env.seed.local src/scripts/seed-perad.mjs
 * Prod:     node --env-file=.env.seed.local src/scripts/seed-perad.mjs
 */
import fs from 'fs'
import path from 'path'

const API_BASE = process.env.API_BASE ?? 'https://orozpharm.hr'
const EMAIL = process.env.ADMIN_EMAIL
const PASSWORD = process.env.ADMIN_PASSWORD
const IMG_DIR = '/Users/marinoroz/Documents/OrozDigital/materijali/vlastito/asortiman/perad'

const CATEGORY = {
  slug: 'perad',
  name: 'Perad',
  description:
    'Živa perad za tov i proizvodnju jaja, od jednodnevnih pilića i purića do odraslih nesilica. Prodaja po narudžbi.',
  icon: 'Bird',
  gridArea: 'perad',
  image: 'hero.jpg',
}

const GROUPS = [
  { slug: 'jednodnevna-perad', name: 'Jednodnevna perad' },
  { slug: 'podrasla-perad', name: 'Ostala perad' },
]

const PRODUCTS = [
  {
    slug: 'jednodnevno-pile',
    name: 'Jednodnevno pile',
    group: 'jednodnevna-perad',
    age: '1 dan',
    purpose: 'tov',
    description:
      'Bijeli brojler za tov. Prvih tjedan dana traži toplo i suho mjesto te starter hranu za piliće.',
  },
  {
    slug: 'jednodnevna-crvena-nesilica',
    name: 'Jednodnevna crvena nesilica',
    group: 'jednodnevna-perad',
    age: '1 dan',
    purpose: 'jaja',
    description: 'Crvena hibridna nesilica za proizvodnju jaja. Nosi smeđa jaja.',
  },
  {
    slug: 'jednodnevno-grahorasto-pile',
    name: 'Jednodnevno grahorasto pile',
    group: 'jednodnevna-perad',
    age: '1 dan',
    purpose: 'tov',
    description:
      'Grahorasto pile, otpornija pasmina prikladna za slobodni uzgoj i domaći tov.',
  },
  {
    slug: 'jednodnevna-patka',
    name: 'Jednodnevna patka',
    group: 'jednodnevna-perad',
    age: '1 dan',
    purpose: 'tov',
    description: 'Pačić za tov. Brzo raste i dobro se prilagođava vanjskom uzgoju.',
  },
  {
    slug: 'jednodnevni-purici',
    name: 'Jednodnevni purići',
    group: 'jednodnevna-perad',
    age: '1 dan',
    purpose: 'tov',
    description:
      'Purići za tov. Prvih tjedana traže višu temperaturu i hranu s više proteina od pilića.',
  },
  {
    slug: 'trotjedno-pile',
    name: 'Trotjedno pile',
    group: 'podrasla-perad',
    age: '3 tjedna',
    purpose: 'tov',
    description:
      'Pile s prvim perjem, prošlo najosjetljiviji period uzgoja. Spremno za prijelaz na vanjski prostor.',
  },
  {
    slug: 'osmotjedna-nesilica',
    name: 'Osmotjedna nesilica',
    group: 'podrasla-perad',
    age: '8 tjedana',
    purpose: 'jaja',
    description:
      'Odrasla nesilica, više ne traži grijanje. Do nesenja joj ostaje oko deset tjedana.',
  },
  {
    slug: 'osamnaesttjedna-nesilica',
    name: 'Osamnaesttjedna nesilica',
    group: 'podrasla-perad',
    age: '18 tjedana',
    purpose: 'jaja',
    description: 'Nesilica pred nesenjem. Prva jaja obično daje u roku dva do tri tjedna.',
  },
  {
    slug: 'petotjedni-purani',
    name: 'Petotjedni purani',
    group: 'podrasla-perad',
    age: '5 tjedana',
    purpose: 'tov',
    description:
      'Odrasli purani, prošli najzahtjevniju fazu uzgoja. Prikladni za domaći tov.',
  },
]

async function api(p, opts = {}) {
  const res = await fetch(`${API_BASE}/api${p}`, {
    ...opts,
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
  })
  const body = await res.text()
  if (!res.ok) throw new Error(`${opts.method ?? 'GET'} ${p} → ${res.status}: ${body}`)
  return body ? JSON.parse(body) : {}
}

const { token } = await api('/users/login', {
  method: 'POST',
  body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
})
const auth = { Authorization: `JWT ${token}` }
console.log(`🔐 Prijavljen kao ${EMAIL} na ${API_BASE}\n`)

async function uploadImage(file, alt) {
  const buf = fs.readFileSync(path.join(IMG_DIR, file))
  const form = new FormData()
  form.append('file', new Blob([buf], { type: 'image/jpeg' }), file)
  form.append('_payload', JSON.stringify({ alt }))
  const res = await fetch(`${API_BASE}/api/media`, {
    method: 'POST',
    headers: auth,
    body: form,
  })
  if (!res.ok) throw new Error(`Upload ${file} → ${res.status}: ${await res.text()}`)
  return (await res.json()).doc.id
}

async function findBySlug(collection, slug) {
  const existing = await api(
    `/${collection}?where[slug][equals]=${slug}&limit=1&depth=0`,
    { headers: auth },
  )
  return existing.docs?.[0] ?? null
}

async function upsert(collection, existingDoc, slug, fields) {
  if (existingDoc) {
    await api(`/${collection}/${existingDoc.id}`, {
      method: 'PATCH',
      headers: auth,
      body: JSON.stringify(fields),
    })
    return { id: existingDoc.id, action: 'ažuriran' }
  }
  const created = await api(`/${collection}`, {
    method: 'POST',
    headers: auth,
    body: JSON.stringify({ slug, ...fields }),
  })
  return { id: created.doc.id, action: 'kreiran' }
}

// Upload je skup i nije besplatno ponovljiv: ako zapis već ima sliku, ne diramo je
// (ne uploadamo iznova, ne mijenjamo image polje). Samo prazan slot (novi zapis ili
// postojeći bez slike) se puni uploadom — to je i put kojim će jednodnevni-purici i
// osmotjedna-nesilica dobiti sliku kasnije, kad je klijent isporuči.
async function resolveImage(existingDoc, file, alt, label) {
  if (existingDoc?.image) {
    console.log(`  (slika za "${label}" već postoji, upload preskočen)`)
    return { imageId: existingDoc.image, uploaded: false, missing: false }
  }
  const photoPath = path.join(IMG_DIR, file)
  if (!fs.existsSync(photoPath)) {
    return { imageId: undefined, uploaded: false, missing: true }
  }
  const imageId = await uploadImage(file, alt)
  return { imageId, uploaded: true, missing: false }
}

// 1. Kategorija
const existingCat = await findBySlug('categories', CATEGORY.slug)
const catImg = await resolveImage(existingCat, CATEGORY.image, 'Perad', 'Perad (kategorija)')
const catFields = {
  name: CATEGORY.name,
  description: CATEGORY.description,
  icon: CATEGORY.icon,
  gridArea: CATEGORY.gridArea,
}
if (catImg.imageId) catFields.image = catImg.imageId
const cat = await upsert('categories', existingCat, CATEGORY.slug, catFields)
console.log(`📁 Kategorija Perad ${cat.action} (id ${cat.id})`)

// 2. Podkategorije
const groupIds = {}
for (const g of GROUPS) {
  const existingGroup = await findBySlug('subcategories', g.slug)
  const r = await upsert('subcategories', existingGroup, g.slug, { name: g.name, category: cat.id })
  groupIds[g.slug] = r.id
  console.log(`  └─ ${g.name} ${r.action} (id ${r.id})`)
}

// 3. Proizvodi
const missingPhotos = []
for (const p of PRODUCTS) {
  const existingProduct = await findBySlug('products', p.slug)
  const fields = {
    name: p.name,
    category: cat.id,
    subcategory: groupIds[p.group],
    description: p.description,
    age: p.age,
    purpose: p.purpose,
  }
  const img = await resolveImage(existingProduct, `${p.slug}.jpg`, p.name, p.name)
  if (img.imageId) fields.image = img.imageId
  if (img.missing) missingPhotos.push(p.name)
  const r = await upsert('products', existingProduct, p.slug, fields)
  const hasImageNow = img.imageId || existingProduct?.image
  const imgNote = hasImageNow ? '' : ' — BEZ SLIKE (foto još ne postoji)'
  console.log(`🐣 ${p.name} ${r.action} (id ${r.id})${imgNote}`)
}

if (missingPhotos.length) {
  console.log(`\n⚠️  Bez fotografije (dodati kasnije kroz /admin): ${missingPhotos.join(', ')}`)
}

console.log('\n✅ Gotovo.')
