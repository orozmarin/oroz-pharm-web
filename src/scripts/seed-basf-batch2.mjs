#!/usr/bin/env node
/**
 * seed-basf-batch2.mjs
 * Uploads second batch of BASF products to Oroz PHARM production via Payload REST API.
 * Crops all images to 1:1 (center) before upload.
 *
 * Priaxor already exists — only its image (media id 149) is replaced with the new visual.
 *
 * Usage:
 *   ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=secret node src/scripts/seed-basf-batch2.mjs
 */

import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const API_BASE = process.env.API_BASE ?? 'https://orozpharm.hr'
const ADMIN_EMAIL = process.env.ADMIN_EMAIL
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD
const IMAGES_DIR =
  '/Users/marinoroz/Documents/OrozDigital/materijali/dobavljaci/basf/slike/isporukapreostalihslikaproizvoda/for-upload'
const TMP_DIR = path.join(os.tmpdir(), 'basf-batch2-cropped')

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error('Postavi ADMIN_EMAIL i ADMIN_PASSWORD env varijable.')
  process.exit(1)
}

// ─── Product data ──────────────────────────────────────────────────────────────

const PRODUCTS = [
  {
    filename: 'mtr-basf-agro-hr-vizuali-za-pakovanje-delan-700-wdg-1l-w001-mockup.jpg',
    name: 'Delan 700 WDG',
    slug: 'delan-700-wdg',
    description:
      'Delan 700 WDG je kontaktni preventivni fungicid u obliku vododispergirajućih granula s nespecifičnim mehanizmom djelovanja koji djeluje na više mjesta u razvoju gljiva, čime gotovo nema opasnosti od razvoja rezistentnosti. Odlikuje se iznimnom otpornošću na ispiranje kišom i dugotrajnim zaštitnim učinkom unutar redovnog programa integrirane zaštite bilja.',
    activeIngredients: 'ditianon 700 g/kg',
    mainUses:
      'jabuka i kruška (krastavost), breskva i nektarina (kovrčavost lista, sušenje cvjetova, šupljikavost lista), trešnja (bolesti lista, šupljikavost), vinova loza (crna pjegavost, pepelnica)',
  },
  {
    filename: 'mtr-basf-agro-hr-vizuali-za-pakovanje-duet-turbo-1l-w001-mockup.jpg',
    name: 'Duet Turbo',
    slug: 'duet-turbo',
    description:
      'Duet Turbo je sistemični fungicid koji kombinira triazol nove generacije Revysol® i strobilurin kresoksim-metil za sinergijsko djelovanje protiv bolesti strnih žitarica. Fleksibilan je u primjeni od busanja do klasanja (BBCH 30–69), a dokazano pruža dulje trajanje zaštite u usporedbi sa standardima na tržištu.',
    activeIngredients: 'mefentriflukonazol (Revysol®) 100 g/l + kresoksim-metil 150 g/l',
    mainUses:
      'ozima i jara pšenica, ozimi i jari ječam, raž, tritikale — suzbijanje pepelnice, rđe (smeđa i žuta rđa), mrežaste pjegavosti ječma te ostalih bolesti lišća',
  },
  {
    filename: 'mtr-basf-agro-hr-vizuali-za-pakovanje-enervin-pro-w001-mockup.jpg',
    name: 'Enervin Pro',
    slug: 'enervin-pro',
    description:
      'Enervin Pro je inovativni fungicid koji kombinira dvije aktivne tvari s različitim mehanizmima djelovanja — Initium® (ametoktradin) inhibira respiratorni lanac gljive, dok kalijev fosfonat stimulira prirodne obrambene mehanizme biljke. Odlikuje se iznimnom otpornošću na ispiranje kišom, potpunom sistemičnošću te zaštitom novonastalog prirasta.',
    activeIngredients: 'ametoktradin (Initium®) 75 g/l + kalijev fosfonat 453 g/l',
    mainUses:
      'vinova loza (plamenjača — Plasmopara viticola), krumpir, rajčica, krastavac, tikvica, dinja, bundeva, lubenica, salata, špinat, blitva i začinsko bilje (plamenjača)',
  },
  {
    filename: 'mtr-basf-agro-hr-vizuali-za-pakovanje-revycare-1l-w001-mockup.jpg',
    name: 'Revycare',
    slug: 'revycare',
    description:
      'Revycare je sistemični fungicid koji spaja triazol nove generacije Revysol® — koji se do 100 puta jače veže za patogena od standardnih triazola — i strobilurin piraklostrobin za dugotrajna preventivna i kurativna svojstva. Učinkovit je i pri niskim temperaturama, otporan na UV zračenje i ispiranje kišom, a usvaja se u list već 15 minuta nakon primjene.',
    activeIngredients: 'mefentriflukonazol (Revysol®) 100 g/l + piraklostrobin 100 g/l',
    mainUses:
      'ozima i jara pšenica (uključujući durum), ozimi i jari ječam, tritikale i raž — suzbijanje smeđe rđe, žute rđe, pjegavosti lišća, mrežaste pjegavosti, fuzarijske palež klasa te pepelnice',
  },
  {
    filename: 'mtr-basf-agro-hr-vizuali-za-pakovanje-revyona-1l-w001-mockup.jpg',
    name: 'Revyona',
    slug: 'revyona',
    description:
      'Revyona je sistemični fungicid nove generacije na bazi triazola mefentriflukonazola koji djeluje preventivno i kurativno na svim temperaturama. Posebno je učinkovita u suzbijanju pepelnice, bez premca među triazolima za tu bolest, a registrirana je za primjenu u voćarstvu i vinogradarstvu.',
    activeIngredients: 'mefentriflukonazol 75 g/l',
    mainUses:
      'vinova loza (pepelnica, crna trulež), jabuka i kruška (krastavost, pepelnica, alternarioza), koštičavo voće — trešnja, šljiva, breskva, marelica, nektarina (monilija, pepelnica)',
  },
  {
    filename: 'mtr-basf-agro-hr-vizuali-za-pakovanje-sercadis-plus-1l-w001-mockup.png',
    name: 'Sercadis Plus',
    slug: 'sercadis-plus',
    description:
      'Sercadis Plus je sistemični fungicid koji kombinira SDHI aktivnu tvar Xemium® (fluksapiroksad) i triazol difenokonazol za sinergijsko djelovanje prema širokom spektru gljivičnih bolesti. Kombinirani mehanizmi djelovanja — inhibicija sukcinat-dehidrogenaze i demetilacija sterola — značajno smanjuju rizik od razvoja rezistentnosti.',
    activeIngredients: 'fluksapiroksad (Xemium®) 75 g/l + difenokonazol 50 g/l',
    mainUses:
      'jabuka i kruška (krastavost, pepelnica, smeđa pjegavost), jagoda (pepelnica), rajčica, paprika, krastavac, dinja, tikvica, lubenica (pepelnica, pjegavosti lista), krumpir, mrkva, luk, zelena salata, grašak',
  },
]

// Priaxor već postoji (media id 149) — samo zamijeniti sliku s novim vizualom
const PRIAXOR_UPDATE = {
  filename: 'mtr-basf-agro-hr-vizuali-za-pakovanje-priaxor-1l-w001-mockup.jpg',
  existingMediaId: 149,
}

// ─── Helper functions ──────────────────────────────────────────────────────────

async function apiFetch(urlPath, options = {}) {
  const url = `${API_BASE}/api${urlPath}`
  const res = await fetch(url, options)
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`${options.method ?? 'GET'} ${url} → ${res.status}: ${body}`)
  }
  return res.json()
}

async function login() {
  console.log(`🔐 Prijavljujem se kao ${ADMIN_EMAIL}...`)
  const data = await apiFetch('/users/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  })
  if (!data.token) throw new Error('Login nije vratio token.')
  console.log('✅ Prijava uspješna.\n')
  return data.token
}

async function cropToSquare(srcPath, outPath) {
  const meta = await sharp(srcPath).metadata()
  const size = Math.min(meta.width, meta.height)
  const left = Math.floor((meta.width - size) / 2)
  const top = Math.floor((meta.height - size) / 2)

  const ext = path.extname(srcPath).toLowerCase()
  const isJpg = ext === '.jpg' || ext === '.jpeg'

  const pipeline = sharp(srcPath).extract({ left, top, width: size, height: size })
  if (isJpg) {
    await pipeline.jpeg({ quality: 90, progressive: true }).toFile(outPath)
  } else {
    await pipeline.png({ compressionLevel: 8 }).toFile(outPath)
  }

  console.log(`  📐 ${path.basename(srcPath)} → ${size}×${size}`)
}

async function uploadImage(token, filePath, filename, altText) {
  const ext = path.extname(filename).toLowerCase()
  const mimeType = ext === '.png' ? 'image/png' : 'image/jpeg'

  const buf = fs.readFileSync(filePath)
  const blob = new Blob([buf], { type: mimeType })
  const form = new FormData()
  form.append('file', blob, filename)
  form.append('_payload', JSON.stringify({ alt: altText }))

  const res = await fetch(`${API_BASE}/api/media`, {
    method: 'POST',
    headers: { Authorization: `JWT ${token}` },
    body: form,
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Upload ${filename} → ${res.status}: ${body}`)
  }
  const data = await res.json()
  console.log(`  ✅ Slika uploadana (id: ${data.doc.id})`)
  return data.doc.id
}

async function patchMediaImage(token, mediaId, filePath, filename) {
  const ext = path.extname(filename).toLowerCase()
  const mimeType = ext === '.png' ? 'image/png' : 'image/jpeg'

  const buf = fs.readFileSync(filePath)
  const blob = new Blob([buf], { type: mimeType })
  const form = new FormData()
  form.append('file', blob, filename)
  form.append('_payload', JSON.stringify({ alt: filename }))

  const res = await fetch(`${API_BASE}/api/media/${mediaId}`, {
    method: 'PATCH',
    headers: { Authorization: `JWT ${token}` },
    body: form,
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`PATCH media/${mediaId} → ${res.status}: ${body}`)
  }
  console.log(`  ✅ Media ${mediaId} zamijenjen novim vizualom`)
}

async function createProduct(token, product, categoryId, manufacturerId, mediaId) {
  const existing = await apiFetch(`/products?where[slug][equals]=${product.slug}`)
  if (existing.docs?.length > 0) {
    console.log(`  ⏭️  Preskačem "${product.name}" (slug već postoji)`)
    return null
  }

  const instructions = {
    root: {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          version: 1,
          children: [
            { type: 'text', text: `Aktivne tvari: ${product.activeIngredients}`, version: 1 },
          ],
        },
        {
          type: 'paragraph',
          version: 1,
          children: [
            { type: 'text', text: `Primjena: ${product.mainUses}`, version: 1 },
          ],
        },
      ],
      direction: null,
      format: '',
      indent: 0,
      version: 1,
    },
  }

  const created = await apiFetch('/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `JWT ${token}` },
    body: JSON.stringify({
      name: product.name,
      slug: product.slug,
      category: categoryId,
      manufacturer: manufacturerId,
      description: product.description,
      instructions,
      image: mediaId,
    }),
  })
  console.log(`  ✅ Proizvod kreiran (id: ${created.doc.id})`)
  return created.doc.id
}

// ─── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const CATEGORY_ID = 3 // Zaštita bilja

  fs.mkdirSync(TMP_DIR, { recursive: true })

  const token = await login()

  // Get BASF manufacturer id (already exists)
  const mfr = await apiFetch('/manufacturers?where[slug][equals]=basf')
  const basfId = mfr.docs[0].id
  console.log(`🏭 BASF id: ${basfId}\n`)

  // ── Priaxor: replace image only ───────────────────────────────────────────
  console.log('🔄 Priaxor — zamjena slike...')
  const priaxorSrc = path.join(IMAGES_DIR, PRIAXOR_UPDATE.filename)
  const priaxorOut = path.join(TMP_DIR, PRIAXOR_UPDATE.filename)
  try {
    await cropToSquare(priaxorSrc, priaxorOut)
    await patchMediaImage(token, PRIAXOR_UPDATE.existingMediaId, priaxorOut, PRIAXOR_UPDATE.filename)
  } catch (err) {
    console.error(`  ❌ Priaxor slika: ${err.message}`)
  }

  // ── New products ──────────────────────────────────────────────────────────
  console.log('')
  let success = 0, skipped = 0, failed = 0

  for (const product of PRODUCTS) {
    console.log(`📦 ${product.name}`)
    const srcPath = path.join(IMAGES_DIR, product.filename)
    const outPath = path.join(TMP_DIR, product.filename)

    if (!fs.existsSync(srcPath)) {
      console.warn(`  ⚠️  Slika nije pronađena: ${srcPath}`)
      failed++
      continue
    }

    try {
      await cropToSquare(srcPath, outPath)
      const mediaId = await uploadImage(token, outPath, product.filename, product.name)
      const result = await createProduct(token, product, CATEGORY_ID, basfId, mediaId)
      if (result) success++
      else skipped++
    } catch (err) {
      console.error(`  ❌ Greška: ${err.message}`)
      failed++
    }
    console.log('')
  }

  console.log(`${'─'.repeat(50)}`)
  console.log(`✅ Uspješno kreirano: ${success}`)
  console.log(`⏭️  Preskočeno:       ${skipped}`)
  console.log(`❌ Greške:           ${failed}`)
  console.log(`${'─'.repeat(50)}`)
}

main().catch((err) => {
  console.error('Fatalna greška:', err.message)
  process.exit(1)
})
