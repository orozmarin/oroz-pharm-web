#!/usr/bin/env node
/**
 * seed-bayer.mjs
 * Uploads Bayer (and associated) products to Oroz PHARM production via Payload REST API.
 *
 * Usage:
 *   ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=secret node src/scripts/seed-bayer.mjs
 *
 * Optionally override the API base URL:
 *   API_BASE=http://localhost:3000 node src/scripts/seed-bayer.mjs
 */

import fs from 'node:fs'
import path from 'node:path'
// FormData and Blob are globals in Node.js 18+
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const API_BASE = process.env.API_BASE ?? 'http://128.140.74.214'
const ADMIN_EMAIL = process.env.ADMIN_EMAIL
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD
const IMAGES_DIR = '/Users/marinoroz/Documents/OrozPHARM-materijali-partneri/Bayer/compressed'

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error('Postavi ADMIN_EMAIL i ADMIN_PASSWORD env varijable.')
  process.exit(1)
}

// ─── Product data ──────────────────────────────────────────────────────────────

const PRODUCTS = [
  {
    filename: 'Aliette-flash_1-kg.jpg',
    name: 'Aliette Flash',
    slug: 'aliette-flash',
    manufacturer: 'bayer',
    productType: 'fungicid',
    description:
      'Sistemični fungicid za suzbijanje bolesti uzrokovanih oomicetama (Phytophthora, Plasmopara, Peronospora). Aktivna tvar fosetil-aluminij brzo se apsorbira i kreće kroz biljku u oba smjera, štiteći je preventivno i kurativno od korijena do nadzemnih dijelova.',
    activeIngredients: 'fosetil-aluminij 800 g/kg',
    mainUses: 'vinova loza, krastavac, rajčica, luk, hmelj, jabuka',
  },
  {
    filename: 'Decis 1 L.jpg',
    name: 'Decis 2,5 EC',
    slug: 'decis-25-ec',
    manufacturer: 'bayer',
    productType: 'insekticid',
    description:
      'Kontaktni i digestivni insekticid na bazi deltametrina iz grupe sintetičkih piretroida, namijenjen suzbijanju štetnih kukaca u ratarstvu, voćarstvu i vinogradarstvu. Djeluje brzo onesposobljujući živčani sustav štetnika, remećenjem protoka natrijevih iona.',
    activeIngredients: 'deltametrin 25 g/l',
    mainUses: 'jabuka, vinova loza, krumpir, uljana repica, žitarice, ukrasno bilje',
  },
  {
    filename: 'Delaro.jpg',
    name: 'Delaro 325 SC',
    slug: 'delaro-325-sc',
    manufacturer: 'bayer',
    productType: 'fungicid',
    description:
      'Kombinirani sistemični fungicid s dvije aktivne tvari različitih mehanizama djelovanja za zaštitu strnih žita od lisnih i klasnih bolesti. Protiokonazol inhibira sintezu ergosterola, dok trifloksistrobin ometa stanično disanje gljiva. Pruža preventivno, kurativno i eradikativno djelovanje.',
    activeIngredients: 'protiokonazol 175 g/l + trifloksistrobin 150 g/l',
    mainUses: 'pšenica, ječam, raž — pepelnica, rđa, siva pjegavost, fuzarioza klasa',
  },
  {
    filename: 'Falcon Forte 5 L.jpg',
    name: 'Falcon Forte EC 460',
    slug: 'falcon-forte-ec-460',
    manufacturer: 'bayer',
    productType: 'fungicid',
    description:
      'Trokomponentni sistemični fungicid koji kombinira spiroksamin, tebukonazol i triadimenol za zaštitu žitarica od najvažnijih gljivičnih bolesti. Preventivno i kurativno djeluje na pepelnicu, rđu i fuzariozu zahvaljujući sinergijskom učinku triju aktivnih tvari. Brzo se apsorbira i otporan je na ispiranje kišom.',
    activeIngredients: 'spiroksamin 250 g/l + tebukonazol 167 g/l + triadimenol 43 g/l',
    mainUses: 'pšenica, ječam, vinova loza — pepelnica, rđa, siva pjegavost lista i klasa',
  },
  {
    filename: 'Folicur.jpg',
    name: 'Folicur 250 EW',
    slug: 'folicur-250-ew',
    manufacturer: 'bayer',
    productType: 'fungicid',
    description:
      'Sistemični fungicid iz triazolne grupe s aktivnom tvari tebukonazolom koji inhibira biosintezu ergosterola u stanicama gljiva. Brzo se apsorbira i ravnomjerno raspoređuje po biljci, djelujući preventivno, kurativno i eradikativno. Posebno učinkovit u suzbijanju fuzarioze klasa i zaštiti prinosa žitarica.',
    activeIngredients: 'tebukonazol 250 g/l',
    mainUses: 'pšenica, ječam, uljana repica, suncokret — pepelnica, rđa, septorioza, fuzarioza klasa',
  },
  {
    filename: 'Luna ex.jpg',
    name: 'Luna Experience',
    slug: 'luna-experience',
    manufacturer: 'bayer',
    productType: 'fungicid',
    description:
      'Kombinirani sistemični fungicid s fluopiramom (SDHI inhibitor) i tebukonazolom (triazol) koji zajedno pružaju dugotrajnu zaštitu od širokog spektra gljivičnih bolesti. Fluopiram blokira energetsku proizvodnju gljiva, dok tebukonazol ometa izgradnju stanične stijenke. Poboljšava i opće zdravlje biljke te kvalitetu ploda.',
    activeIngredients: 'fluopiram 200 g/l + tebukonazol 200 g/l',
    mainUses: 'vinova loza, jabuka, jagoda, luk — siva plijesan (Botrytis), pepelnica, hrđa, alternarioza',
  },
  {
    filename: 'Mero.jpg',
    name: 'Mero',
    slug: 'mero',
    manufacturer: 'bayer',
    productType: 'adjuvant',
    description:
      'Pomoćno sredstvo na bazi metil estera ulja uljane repice koje se dodaje herbicidima u tankvajnom miješanju radi poboljšanja njihove učinkovitosti. Snižava površinsku napetost tekućine i poboljšava kvašenje, disperziju i prodiranje aktivnih tvari kroz kutikulu korova. Posebno se preporučuje uz sulfonilurejske i graminicide.',
    activeIngredients: 'metil esteri ulja uljane repice 733 g/l',
    mainUses: 'uz herbicide u šećernoj repi, kukuruzu, žitaricama',
  },
  {
    filename: 'Mikal-flash_1-kg.jpg',
    name: 'Mikal Flash',
    slug: 'mikal-flash',
    manufacturer: 'bayer',
    productType: 'fungicid',
    description:
      'Kombinirani fungicid u obliku vododispergirajućih granula koji kombinira sistemičnu aktivnu tvar fosetil-aluminij s kontaktnim folpetom za zaštitu vinove loze od plamenjače i crne pjegavosti. Fosetil-aluminij stimulira prirodnu obranu biljke i djeluje preventivno i kurativno, dok folpet pruža dugotrajnu kontaktnu zaštitu.',
    activeIngredients: 'fosetil-aluminij 500 g/kg + folpet 250 g/kg',
    mainUses: 'vinova loza — plamenjača (Plasmopara viticola), crna pjegavost (Phomopsis viticola)',
  },
  {
    filename: 'Mikal-premium_1-kg.jpg',
    name: 'Mikal Premium',
    slug: 'mikal-premium',
    manufacturer: 'bayer',
    productType: 'fungicid',
    description:
      'Trokomponentni fungicid za zaštitu vinove loze koji kombinira fosetil-aluminij, iprovalikarb i folpet za maksimalnu zaštitu od plamenjače. Iprovalikarb s preventivnim i kurativnim djelovanjem blokira rast micelija i sporulaciju, dok fosetil-aluminij potiče prirodnu otpornost biljke. Superioran u uvjetima visokog infektivnog pritiska.',
    activeIngredients: 'fosetil-aluminij 500 g/kg + folpet 250 g/kg + iprovalikarb 40 g/kg',
    mainUses: 'vinova loza — plamenjača (Plasmopara viticola), crna pjegavost (Phomopsis viticola)',
  },
  {
    filename: 'Monsoon.jpg',
    name: 'Monsoon Active',
    slug: 'monsoon-active',
    manufacturer: 'bayer',
    productType: 'herbicid',
    description:
      'Selektivni sistemični herbicid s trima aktivnim tvarima iz grupe inhibitora ALS-a za suzbijanje jednogodišnjih i višegodišnjih uskolisnih i nekih širokolisnih korova u kukuruzu. Primjenjuje se postemergentno u fazi 2–8 listova kukuruza, kada su korovi najosjetljiviji. Može se primijeniti jednokratno ili u split-aplikaciji.',
    activeIngredients: 'foramsulfuron 30 g/l + ciprosulfamid 15 g/l + tienkarbazon-metil 10 g/l',
    mainUses: 'kukuruz — sirak iz sjemena, muhar, svračica, loboda, štir i drugi jednogodišnji korovi',
  },
  {
    filename: 'Prosaro_10 l_.jpg',
    name: 'Prosaro 250 EC',
    slug: 'prosaro-250-ec',
    manufacturer: 'bayer',
    productType: 'fungicid',
    description:
      'Kombinirani sistemični fungicid s dvjema triazolnim aktivnim tvarima za zaštitu strnih žita od bolesti lista i klasa. Protiokonazol se posebno ističe u suzbijanju bolesti klasa uključujući fuzariozu, dok tebukonazol pruža široki spektar djelovanja na lisne bolesti. Primjenjuje se od busanja do kraja cvatnje.',
    activeIngredients: 'protiokonazol 125 g/l + tebukonazol 125 g/l',
    mainUses: 'pšenica, ječam, raž, triticale — pepelnica, rđa, septorioza, siva pjegavost, fuzarioza klasa',
  },
  {
    filename: 'Teldor.jpg',
    name: 'Teldor SC 500',
    slug: 'teldor-sc-500',
    manufacturer: 'bayer',
    productType: 'fungicid',
    description:
      'Kontaktni fungicid s aktivnom tvari fenheksamidom, specifično namijenjen suzbijanju sive plijesni (Botrytis cinerea) na vinovoj lozi, jagodi i povrću. Preventivno inhibira klijanje spora i zarazu, a primjenjuje se u kritičnim fazama kada je rizik od infekcije Botrytinom najveći. Maksimalno dva tretmana po vegetaciji.',
    activeIngredients: 'fenheksamid 500 g/l',
    mainUses: 'vinova loza, jagoda, rajčica, paprika, krastavac — siva plijesan (Botrytis cinerea)',
  },
]

// ─── Helper functions ──────────────────────────────────────────────────────────

async function apiFetch(path, options = {}) {
  const url = `${API_BASE}/api${path}`
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
  console.log('✅ Prijava uspješna.')
  return data.token
}

async function getOrCreateManufacturer(token, name, slug) {
  console.log(`\n🏭 Tražim proizvođača "${name}"...`)
  const existing = await apiFetch(`/manufacturers?where[slug][equals]=${slug}`)
  if (existing.docs?.length > 0) {
    console.log(`  ℹ️  Već postoji (id: ${existing.docs[0].id})`)
    return existing.docs[0].id
  }
  console.log(`  ➕ Kreiram "${name}"...`)
  const created = await apiFetch('/manufacturers', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `JWT ${token}`,
    },
    body: JSON.stringify({ name, slug }),
  })
  console.log(`  ✅ Kreiran (id: ${created.doc.id})`)
  return created.doc.id
}

async function uploadImage(token, imagePath, filename, altText) {
  console.log(`  📸 Uploading ${filename}...`)
  const fileBuffer = fs.readFileSync(imagePath)
  const blob = new Blob([fileBuffer], { type: 'image/jpeg' })
  const form = new FormData()
  form.append('file', blob, filename)
  // Payload v3 REST upload: non-file fields go in _payload JSON string
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

async function createProduct(token, product, categoryId, manufacturerId, mediaId) {
  // Check if slug already exists
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

  const payload = {
    name: product.name,
    slug: product.slug,
    category: categoryId,
    manufacturer: manufacturerId,
    description: product.description,
    instructions,
    image: mediaId,
  }

  const created = await apiFetch('/products', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `JWT ${token}`,
    },
    body: JSON.stringify(payload),
  })
  console.log(`  ✅ Proizvod kreiran (id: ${created.doc.id})`)
  return created.doc.id
}

// ─── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const CATEGORY_ID = 3 // Zaštita bilja

  const token = await login()
  const bayerId = await getOrCreateManufacturer(token, 'Bayer', 'bayer')

  let success = 0
  let skipped = 0
  let failed = 0

  for (const product of PRODUCTS) {
    const imagePath = path.join(IMAGES_DIR, product.filename)
    if (!fs.existsSync(imagePath)) {
      console.warn(`  ⚠️  Slika nije pronađena: ${imagePath}`)
      failed++
      continue
    }

    console.log(`\n📦 ${product.name}`)
    try {
      const mediaId = await uploadImage(token, imagePath, product.filename, product.name)
      const result = await createProduct(token, product, CATEGORY_ID, bayerId, mediaId)
      if (result) success++
      else skipped++
    } catch (err) {
      console.error(`  ❌ Greška: ${err.message}`)
      failed++
    }
  }

  console.log(`\n${'─'.repeat(50)}`)
  console.log(`✅ Uspješno kreirano: ${success}`)
  console.log(`⏭️  Preskočeno:       ${skipped}`)
  console.log(`❌ Greške:           ${failed}`)
  console.log(`${'─'.repeat(50)}`)
}

main().catch((err) => {
  console.error('Fatalna greška:', err.message)
  process.exit(1)
})
