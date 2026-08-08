/**
 * Postavlja Ritoša "izlog asortimana" (showcase) podkategorije:
 * kreira/ažurira podkat. s isShowcase=true, opisom i reprezentativnom slikom.
 * Pokretanje: node --env-file=.env.seed.local src/scripts/seed-ritosa-showcase.mjs
 */
import fs from 'fs'
import path from 'path'

const API_BASE = process.env.API_BASE ?? 'https://orozpharm.hr'
const EMAIL = process.env.ADMIN_EMAIL
const PASSWORD = process.env.ADMIN_PASSWORD
const IMG_DIR = '/Users/marinoroz/Documents/OrozDigital/materijali/dobavljaci/ritosa/slike'

const SHOWCASE = [
  {
    name: 'Spojnice i ventili', slug: 'spojnice-i-ventili', category: 7,
    description: 'Nudimo cijeli asortiman spojnica, ventila, adaptera, obujmica i fitinga za navodnjavanje (BR Garden, Claber i dr.). Za dostupnost i cijenu javite se ili posjetite trgovinu.',
    repImage: '25442.jpg',
  },
  {
    name: 'Vezni materijal', slug: 'vezni-materijal', category: 17,
    description: 'Veliki izbor vezica, špage (Flax), žice i pribora za vezivanje u vrtu i nasadu. Javite se za potreban tip i količinu.',
    repImage: '150268.jpg',
  },
  {
    name: 'Hranilice i pojilice', slug: 'hranilice-i-pojilice', category: 12,
    description: 'Asortiman hranilica i pojilica za stoku i perad. Javite se za dostupne modele i veličine.',
    repImage: '261460.jpg',
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

async function uploadImage(token, file) {
  const buf = fs.readFileSync(path.join(IMG_DIR, file))
  const form = new FormData()
  form.append('file', new Blob([buf], { type: 'image/jpeg' }), file)
  form.append('_payload', JSON.stringify({ alt: file.replace('.jpg', '') }))
  const res = await fetch(`${API_BASE}/api/media`, {
    method: 'POST', headers: { Authorization: `JWT ${token}` }, body: form,
  })
  if (!res.ok) throw new Error(`Upload ${file} → ${res.status}: ${await res.text()}`)
  return (await res.json()).doc.id
}

const { token } = await api('/users/login', {
  method: 'POST', body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
})
const auth = { Authorization: `JWT ${token}` }
console.log(`🔐 Prijavljen kao ${EMAIL}\n`)

for (const s of SHOWCASE) {
  const mediaId = await uploadImage(token, s.repImage)
  const fields = { description: s.description, isShowcase: true, image: mediaId }

  const existing = await api(`/subcategories?where[slug][equals]=${s.slug}`, { headers: auth })
  if (existing.docs?.length) {
    await api(`/subcategories/${existing.docs[0].id}`, {
      method: 'PATCH', headers: auth, body: JSON.stringify(fields),
    })
    console.log(`✏️  "${s.name}" ažurirana (id ${existing.docs[0].id}) — showcase ON, slika ${mediaId}`)
  } else {
    const created = await api('/subcategories', {
      method: 'POST', headers: auth,
      body: JSON.stringify({ name: s.name, slug: s.slug, category: s.category, ...fields }),
    })
    console.log(`✅ "${s.name}" kreirana (id ${created.doc?.id}) — showcase ON, slika ${mediaId}`)
  }
}
console.log('\nGotovo.')
