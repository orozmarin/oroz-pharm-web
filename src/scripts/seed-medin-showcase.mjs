/**
 * Medin san (pčelarstvo): kreira showcase podkategorije s tematskom slikom + opisom,
 * te "Sredstva za pčele" (ne-showcase) za brendirane proizvode.
 * Pokretanje: node --env-file=.env.seed.local src/scripts/seed-medin-showcase.mjs
 */
import fs from 'fs'
import path from 'path'

const API_BASE = process.env.API_BASE ?? 'https://orozpharm.hr'
const EMAIL = process.env.ADMIN_EMAIL
const PASSWORD = process.env.ADMIN_PASSWORD
const IMG_DIR = '/Users/marinoroz/Documents/OrozDigital/materijali/dobavljaci/medin-san/slike'
const SHOWCASE = JSON.parse(
  fs.readFileSync('/Users/marinoroz/Documents/OrozDigital/materijali/dobavljaci/medin-san/showcase.json', 'utf8')
).showcaseSubcategories

async function api(p, opts = {}) {
  const res = await fetch(`${API_BASE}/api${p}`, {
    ...opts, headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
  })
  const body = await res.text()
  if (!res.ok) throw new Error(`${opts.method ?? 'GET'} ${p} → ${res.status}: ${body}`)
  return body ? JSON.parse(body) : {}
}
async function uploadImage(token, file, alt) {
  const buf = fs.readFileSync(path.join(IMG_DIR, file))
  const form = new FormData()
  form.append('file', new Blob([buf], { type: 'image/jpeg' }), file)
  form.append('_payload', JSON.stringify({ alt }))
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

// Prenamjena postojećih PRAZNIH cat-9 placeholdera (bez stvaranja duplikata):
// slug (ciljani) -> id postojećeg zapisa koji prenamjenjujemo
const REPURPOSE = {
  'kosnice': 51,               // Košnice -> Košnice
  'vrcanje-i-cijedjenje': 48,  // Staklenke -> Vrcanje i cijeđenje meda
  'pcelarski-alat': 49,        // Poklopci -> Pčelarski alat
  'zastita-pcelara': 52,       // Ostalo -> Zaštita pčelara
  'prihrana-pcela': 50,        // Pogače -> Prihrana pčela
}

async function upsertBySlug(fields) {
  const existing = await api(`/subcategories?where[slug][equals]=${fields.slug}`, { headers: auth })
  if (existing.docs?.length) {
    await api(`/subcategories/${existing.docs[0].id}`, { method: 'PATCH', headers: auth, body: JSON.stringify(fields) })
    return { id: existing.docs[0].id, action: 'ažurirana' }
  }
  const created = await api('/subcategories', { method: 'POST', headers: auth, body: JSON.stringify(fields) })
  return { id: created.doc?.id, action: 'kreirana' }
}

// 1) Sredstva za pčele (ne-showcase, za brendirane proizvode)
const sred = await upsertBySlug({ name: 'Sredstva za pčele', slug: 'sredstva-za-pcele', category: 9 })
console.log(`🧴 "Sredstva za pčele" ${sred.action} (id ${sred.id})`)

// 2) showcase podkategorije — prenamjenom postojećih praznih placeholdera
for (const s of SHOWCASE) {
  const mediaId = await uploadImage(token, s.image, s.name)
  const fields = { name: s.name, slug: s.slug, category: s.category,
    description: s.description, isShowcase: true, image: mediaId }
  const id = REPURPOSE[s.slug]
  if (id) {
    await api(`/subcategories/${id}`, { method: 'PATCH', headers: auth, body: JSON.stringify(fields) })
    console.log(`🐝 "${s.name}" prenamijenjena (id ${id}) — showcase ON, slika ${mediaId}`)
  } else {
    const r = await upsertBySlug(fields)
    console.log(`🐝 "${s.name}" ${r.action} (id ${r.id}) — showcase ON, slika ${mediaId}`)
  }
}
console.log('\nGotovo.')
