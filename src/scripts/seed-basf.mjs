#!/usr/bin/env node
/**
 * seed-basf.mjs
 * Uploads BASF products to Oroz PHARM production via Payload REST API.
 *
 * Usage:
 *   ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=secret node src/scripts/seed-basf.mjs
 *
 * Optionally override the API base URL:
 *   API_BASE=http://localhost:3000 node src/scripts/seed-basf.mjs
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const API_BASE = process.env.API_BASE ?? 'http://128.140.74.214'
const ADMIN_EMAIL = process.env.ADMIN_EMAIL
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD
const IMAGES_DIR =
  '/Users/marinoroz/Documents/OrozDigital/materijali/dobavljaci/basf/slike/basf-ap-croatia-product-packages/for-upload'

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error('Postavi ADMIN_EMAIL i ADMIN_PASSWORD env varijable.')
  process.exit(1)
}

// ─── Product data ──────────────────────────────────────────────────────────────

const PRODUCTS = [
  {
    filename: 'basagran-480-58097750-hr.png',
    name: 'Basagran 480',
    slug: 'basagran-480',
    productType: 'herbicid',
    description:
      'Basagran 480 je selektivni kontaktni herbicid za suzbijanje jednogodišnjih i nekih višegodišnjih širokolisnih korova u ratarskim kulturama i povrću. Djeluje inhibicijom fotosinteze (fotosistem II), a biljke ga usvajaju isključivo lisnom površinom pa je primjena na korove u aktivnom porastu ključna za učinkovitost. Primjenjuje se postnikalnim tretiranjem, obično u fazi 2–6 listova korova.',
    activeIngredients: 'bentazon 480 g/l',
    mainUses:
      'soja, kukuruz, grašak, lucerna (zasnovana), krumpir; suzbijanje lobode, štira, gorušice, dvornika, tatule i ostalih jednogodišnjih širokolisnih korova',
  },
  {
    filename: 'butisan-s-58080448-hr.png',
    name: 'Butisan S',
    slug: 'butisan-s',
    productType: 'herbicid',
    description:
      'Butisan S je herbicid u formulaciji mikrokapsulirane suspenzije za suzbijanje jednogodišnjih uskolisnih i širokolisnih sjemenskih korova u uljanoj repici i kupusu. Biljke usvajaju aktivnu tvar korjenom i hipokotilom prije nicanja, a mehanizam djelovanja temelji se na inhibiciji stanične diobe i sinteze masnih kiselina dugog lanca. Može se primijeniti predsjetveno ili postsjetveno prije nicanja usjeva.',
    activeIngredients: 'metazaklor 500 g/l',
    mainUses:
      'ozima uljana repica, bijeli i crveni kupus; suzbijanje jednogodišnjih trava (livadna vlasnjača, mišjakinja) i jednogodišnjih dikotiledonih korova (kamilica, gorušica, čestoslavica)',
  },
  {
    filename: 'cantus-58238658-hr.png',
    name: 'Cantus',
    slug: 'cantus',
    productType: 'fungicid',
    description:
      'Cantus je fungicid u formulaciji vodotopivog granulata koji djeluje kao inhibitor sukcinat dehidrogenaze (SDHI) s kontaktnim i translaminarnim sistemičnim učinkom. Primarna namjena je suzbijanje sive plijesni (Botrytis cinerea) na vinovoj lozi, a istovremeno smanjuje zarazu pepelnicom (Uncinula necator). Primjenjuje se uz maksimalno dva tretiranja po vegetaciji.',
    activeIngredients: 'boskalid 500 g/kg',
    mainUses:
      'vinova loza — suzbijanje sive plijesni (Botrytis cinerea) i pepelnice vinove loze (Uncinula necator)',
  },
  {
    filename: 'corum-58095664-hr.png',
    name: 'Corum',
    slug: 'corum',
    productType: 'herbicid',
    description:
      'Corum je kombinirani sistemični i kontaktni herbicid koji objedinjuje dva mehanizma djelovanja — inhibiciju fotosinteze (bentazon) i inhibiciju ALS enzima (imazamoks) — čime osigurava široki spektar suzbijanja korova u leguminozama. Namijenjen je postnikalnoj primjeni u usjevu soje, lucerne, graška i slanutkova, a sinergistički učinak dviju aktivnih tvari omogućuje suzbijanje i korova koji su tolerantni prema pojedinačnim tvarima.',
    activeIngredients: 'bentazon 480 g/l + imazamoks 22,4 g/l',
    mainUses:
      'soja, lucerna, grašak, slanutak; suzbijanje jednogodišnjih i nekih višegodišnjih uskolisnih i širokolisnih korova, uključujući ambroziju, lobodu, štir i divlji sirak',
  },
  {
    filename: 'dash-58184214-hr.png',
    name: 'Dash',
    slug: 'dash-basf',
    productType: 'adjuvant',
    subcategory: 'okvasivaci',
    description:
      'Dash je adjuvant (okvašivač) u formulaciji emulzijskog koncentrata koji se dodaje u tankmiješavinu s herbicidima radi poboljšanja prodiranja aktivne tvari kroz kutikulu lista i povećanja učinkovitosti tretiranja. Smješom metil estera masnih kiselina i površinski aktivnih tvari poboljšava benetzanje i raspodjelu herbicidne kapljice po lisnoj površini. Primjenjuje se u dozi 0,5–1,0 l/ha zajedno s herbicidima kao što su Pulsar 40 i Focus Ultra.',
    activeIngredients:
      'metil esteri masnih kiselina 348,8 g/l + fosfatni ester polietoksiliranih masnih alkohola 209,3 g/l + oleinska kiselina 46,5 g/l',
    mainUses:
      'koristi se u kombinaciji s herbicidima (posebno imazamoks- i cikloksidim-baziranim preparatima) na svim kulturama na kojima su ti herbicidi registrirani',
  },
  {
    filename: 'delan-pro-58044723-hr.png',
    name: 'Delan Pro',
    slug: 'delan-pro',
    productType: 'fungicid',
    description:
      'Delan Pro je kombinirani fungicid koji objedinjuje kontaktno zaštitno djelovanje ditianona i sistemičnu stimulaciju prirodne obrane biljke putem kalijevih fosfita. Ditianon sprječava klijanje spora i penetraciju gljivica u tkivo, dok fosfonati aktiviraju fitoimunosni odgovor domaćina. Primjenjuje se preventivno od faze zelenog vrha do početka dozrijevanja, s maksimalno šest primjena po vegetaciji.',
    activeIngredients: 'ditianon 125 g/l + kalijevi fosfiti 561,2 g/l',
    mainUses:
      'jabuka i kruška — suzbijanje krastavosti (Venturia inaequalis, Venturia pyrina); vinova loza — suzbijanje plamenjače (Plasmopara viticola)',
  },
  {
    filename: 'focus-ultra-58086532-hr-2.png',
    name: 'Focus Ultra',
    slug: 'focus-ultra',
    productType: 'herbicid',
    description:
      'Focus Ultra je selektivni postnikalani folijarni graminicid koji suzbija jednogodišnje i višegodišnje uskolisne korove u dikotilednim kulturama. Aktivna tvar cikloksidim inhibira enzim acetil-CoA karboksilazu (ACCase) zaustavljajući sintezu masnih kiselina u travama, bez učinka na dvosupnice. Za optimalnu učinkovitost preporučuje se miješanje s adjuvantom Dash.',
    activeIngredients: 'cikloksidim 100 g/l',
    mainUses:
      'soja, suncokret, šećerna repa, uljana repica, krumpir, povrće, voćnjaci i vinogradi; suzbijanje divljeg sirka, pirike, muharike, ljulja i ostalih jednogodišnjih i višegodišnjih trava',
  },
  {
    // Two images exist for Frontier X2 — using the cleaner filename (no suffix)
    filename: 'frontier-x2-58944861-hr.png',
    name: 'Frontier X2',
    slug: 'frontier-x2',
    productType: 'herbicid',
    description:
      'Frontier X2 je predsjetveni ili postsjetveno-prednikalani zemljišni herbicid koji suzbija klijanje sjemenskih uskolisnih i nekih širokolisnih korova. Aktivna tvar dimetamid-P inhibira diobu stanica i diferencijaciju tkiva te sintezu masnih kiselina dugog lanca, apsorbirajući se hipokotilom i korjenom klijanaca. Doza se prilagođava tipu tla: niže doze na lakim, više doze na teškim i humusom bogatim tlima.',
    activeIngredients: 'dimetamid-P 720 g/l',
    mainUses:
      'kukuruz, soja, suncokret, šećerna repa, duhan; suzbijanje jednogodišnjih trava (muharika, koštanac, divlja prosa) i nekih jednogodišnjih dikotiledonih korova',
  },
  {
    filename: 'medax-top-58184689-hr.png',
    name: 'Medax Top',
    slug: 'medax-top',
    productType: 'regulatori rasta',
    subcategory: 'zastita-bilja-ostalo',
    description:
      'Medax Top je regulator rasta strnih žitarica koji kombinira dva mehanizma inhibicije giberelinske biosinteze za učinkovitije skraćivanje i ojačavanje stabljike. Sinergistički učinak mepikvatova klorida i proheksadion-kalcija smanjuje rizik od polijeganja čak i pri gustim sklopovima i intenzivnoj gnojidbi dušikom. Primjenjuje se u dozi 0,6–1,0 l/ha od početka busanja do pojave zastavičara (BBCH 30–39).',
    activeIngredients: 'mepikvatov klorid 300 g/l + proheksadion-kalcij 50 g/l',
    mainUses:
      'ozima i jara pšenica, ozimi i jari ječam, tritikale, raž; regulacija porasta stabljike, prevencija polijeganja usjeva',
  },
  {
    filename: 'priaxor-58091420-hr-1.png',
    name: 'Priaxor',
    slug: 'priaxor',
    productType: 'fungicid',
    description:
      'Priaxor je kombinirani fungicid koji objedinjuje SDHI inhibitor (fluksapiroksad/Xemium®) i strobilurin (piraklostrobin/F500®) za sinergistično preventivno i kurativno djelovanje na široki spektar bolesti žitarica i uljane repice. Piraklostrobin poboljšava fiziološku efikasnost biljke (plant health efekt), a fluksapiroksad osigurava dugotrajnu zaštitu od rezidualne zaraze. Primjenjuje se u dozi 0,75–1,5 l/ha.',
    activeIngredients: 'fluksapiroksad 75 g/l + piraklostrobin 150 g/l',
    mainUses:
      'ozima i jara pšenica, ječam, tritikale, raž, uljana repica; suzbijanje pepelnice, sive pjegavosti lista (Septoria tritici), rđe (Puccinia spp.), mrežaste pjegavosti ječma, bijele i sive truleži uljane repice',
  },
  {
    filename: 'pulsar-40-58096517-hr-2.png',
    name: 'Pulsar 40',
    slug: 'pulsar-40',
    productType: 'herbicid',
    description:
      'Pulsar 40 je sistemični folijarni i zemljišni herbicid iz grupe imidazolinona za suzbijanje jednogodišnjih i višegodišnjih uskolisnih i širokolisnih korova u IMI tolerantnim kulturama. Aktivna tvar imazamoks inhibira enzim ALS zaustavljajući sintezu aminokiselina valina, leucina i izoleucina, što rezultira zaustavljanjem rasta i odumiranjem korova. Za bolji učinak preporučuje se miješanje s adjuvantom Dash (1 l/ha).',
    activeIngredients: 'imazamoks 40 g/l',
    mainUses:
      'IMI suncokret, soja, grašak, bob, lucerna; suzbijanje ambrozije, lobode, štira, gorušice, palamide, divljeg sirka, muharike i ostalih jednogodišnjih i višegodišnjih korova',
  },
  {
    filename: 'sercadis-58051653-hr.png',
    name: 'Sercadis',
    slug: 'sercadis',
    productType: 'fungicid',
    description:
      'Sercadis je fungicid koji sadrži visoku koncentraciju fluksapiroksada (Xemium®), SDHI inhibitora sukcinat dehidrogenaze iz BASF-ove tehnologije. Djeluje preventivno i kurativno s izraženom translokacijskom aktivnošću u biljnom tkivu, osiguravajući dugotrajnu zaštitu od pepelnice, krastavosti i ostalih gljivičnih bolesti. Zahvaljujući niskoj temperaturnoj osjetljivosti može se primijeniti i u hladnijim proljetnim uvjetima.',
    activeIngredients: 'fluksapiroksad 300 g/l',
    mainUses:
      'jabuka, kruška — suzbijanje pepelnice (Podosphaera leucotricha) i krastavosti (Venturia inaequalis/pyrina); vinova loza — suzbijanje pepelnice (Uncinula necator); breskva, nektarina, marelica — suzbijanje pepelnice (Sphaerotheca pannosa)',
  },
  {
    filename: 'stomp-aqua-58967501-hr.png',
    name: 'Stomp Aqua',
    slug: 'stomp-aqua',
    productType: 'herbicid',
    description:
      'Stomp Aqua je herbicid u formulaciji enkapsuliranog suspenzijskog koncentrata za predsjetvenu ili postsjetveno-prednikalanu primjenu u širokom spektru ratarskih, povrtlarskih i višegodišnjih nasada. Pendimetalin inhibira diobu stanica u meristematskim tkivima klijanaca korova vežući se na tubulin, a mikrokapsularna formulacija osigurava postupno otpuštanje aktivne tvari iz tla i smanjuje isparavanje. Formulacija CS ne ostavlja mrlje, lakše se ispire s opreme i ne oštećuje beton.',
    activeIngredients: 'pendimetalin 455 g/l',
    mainUses:
      'kukuruz, suncokret, soja, krumpir, luk, mrkva, kupus, šećerna repa, voćnjaci, vinogradi, ukrasno bilje; suzbijanje jednogodišnjih uskolisnih i nekih širokolisnih sjemenskih korova',
  },
]

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
  console.log('✅ Prijava uspješna.')
  return data.token
}

async function getOrCreateSubcategory(token, name, slug, categoryId) {
  const existing = await apiFetch(`/subcategories?where[slug][equals]=${slug}&where[category][equals]=${categoryId}`)
  if (existing.docs?.length > 0) {
    console.log(`  ℹ️  Podkategorija "${name}" već postoji (id: ${existing.docs[0].id})`)
    return existing.docs[0].id
  }
  const created = await apiFetch('/subcategories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `JWT ${token}` },
    body: JSON.stringify({ name, slug, category: categoryId }),
  })
  console.log(`  ✅ Kreirana podkategorija "${name}" (id: ${created.doc.id})`)
  return created.doc.id
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
  const blob = new Blob([fileBuffer], { type: 'image/png' })
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

async function createProduct(token, product, categoryId, manufacturerId, mediaId, subcategoryIds) {
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
            {
              type: 'text',
              text: `Aktivne tvari: ${product.activeIngredients}`,
              version: 1,
            },
          ],
        },
        {
          type: 'paragraph',
          version: 1,
          children: [
            {
              type: 'text',
              text: `Primjena: ${product.mainUses}`,
              version: 1,
            },
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
    ...(product.subcategory ? { subcategory: subcategoryIds[product.subcategory] } : {}),
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
  const basfId = await getOrCreateManufacturer(token, 'BASF', 'basf')

  console.log('\n📂 Kreiram podkategorije...')
  const subcategoryIds = {
    okvasivaci: await getOrCreateSubcategory(token, 'Okvašivači', 'okvasivaci', CATEGORY_ID),
    'zastita-bilja-ostalo': await getOrCreateSubcategory(token, 'Ostalo', 'zastita-bilja-ostalo', CATEGORY_ID),
  }

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
      const result = await createProduct(token, product, CATEGORY_ID, basfId, mediaId, subcategoryIds)
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
