#!/usr/bin/env node
/**
 * seed-bayer-batch2.mjs
 * Druga runda Bayer proizvoda — zaštita bilja (novi) + DKC hibridi kukuruza.
 *
 * Komprimira PNG slike u /compressed/ (sharp) prije uploada.
 *
 * Usage:
 *   ADMIN_EMAIL=... ADMIN_PASSWORD=... node src/scripts/seed-bayer-batch2.mjs
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const API_BASE = process.env.API_BASE ?? 'http://128.140.74.214'
const ADMIN_EMAIL = process.env.ADMIN_EMAIL
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD
const SLANJE_DIR = '/Users/marinoroz/Documents/OrozDigital/materijali/dobavljaci/bayer/slike/slanje'
const COMPRESSED_DIR = '/Users/marinoroz/Documents/OrozDigital/materijali/dobavljaci/bayer/slike/compressed'

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error('Postavi ADMIN_EMAIL i ADMIN_PASSWORD env varijable.')
  process.exit(1)
}

// ─── Kategorije (IDs iz produkcije) ────────────────────────────────────────
const CATEGORY_ZASTITA_BILJA = 3   // zastita-bilja
const CATEGORY_SJEMENSKI_PROGRAM = 1 // sjemenski-program

// ─── Zaštita bilja — novi proizvodi ───────────────────────────────────────

const PRODUCTS_ZASTITA = [
  {
    filename: 'adengo-1-l.png',
    name: 'Adengo',
    slug: 'adengo',
    productType: 'herbicid',
    description:
      'Selektivni pred-emergentni herbicid za primjenu u kukuruzu koji kombinira izoksaflutol i ciprosulfamid. Izoksaflutol (HPPD inhibitor) sprječava sintezu karotenoida u korovima uzrokujući njihovo bijeljenje i odumiranje, dok ciprosulfamid djeluje kao safener koji poboljšava selektivnost prema kukuruzu. Aktivira se prvim oborinama nakon primjene na vlažno tlo.',
    activeIngredients: 'izoksaflutol 225 g/l + ciprosulfamid 112,5 g/l',
    mainUses: 'kukuruz — jednogodišnji uskolisni i širokolisni korovi prije nicanja',
  },
  {
    filename: 'alister-new-1-l.png',
    name: 'Alister New',
    slug: 'alister-new',
    productType: 'herbicid',
    description:
      'Kombinirani post-emergentni herbicid s trima aktivnim tvarima za suzbijanje jednogodišnjih uskolisnih i nekih širokolisnih korova u ozimim žitaricama. Mesosulfuron-metil i propoksikarbazón-natrij djeluju kao ALS inhibitori, a mefenpir-dietil kao safener štiti kulturnu biljku. Primjenjuje se proljetno od faze 3 lista do pojave 2. nodija.',
    activeIngredients: 'mesosulfuron-metil 6 g/l + propoksikarbazón-natrij 9 g/l + mefenpir-dietil 30 g/l',
    mainUses: 'pšenica, ječam — divlji ovas, mišje uho, kuštica, zelenica, sijak',
  },
  {
    filename: 'ambition-5-l.png',
    name: 'Ambition 520 SC',
    slug: 'ambition-520-sc',
    productType: 'herbicid',
    description:
      'Kombinirani pred-emergentni herbicid koji kombinira flufenacet i diflufenikan za suzbijanje jednogodišnjih travnih i širokolisnih korova u ozimim žitaricama. Flufenacet inhibira biosinteza masnih kiselina u klici korova, dok diflufenikan ometa sintezu karotenoida. Dugotrajno rezidualno djelovanje u tlu pruža zaštitu od nicanja korova do proljeća.',
    activeIngredients: 'flufenacet 400 g/l + diflufenikan 120 g/l',
    mainUses: 'pšenica, ječam — divlji ovas, kuštica, maslačak, broć, zaboravak',
  },
  {
    filename: 'ascra-1-l.png',
    name: 'Ascra Xpro',
    slug: 'ascra-xpro',
    productType: 'fungicid',
    description:
      'Trojni sistemični fungicid najnovije generacije koji kombinira biksafen, fluopiram i protiokonazol za sveobuhvatnu zaštitu strnih žita. Biksafen i fluopiram (SDHI inhibitori) blokiraju lančani prijenos elektrona u mitohondrijima gljiva, dok protiokonazol (DMI inhibitor) inhibira sintezu ergosterola. Sinergijsko djelovanje pruža dugotrajnu zaštitu s izraženim zelenim efektom.',
    activeIngredients: 'biksafen 75 g/l + fluopiram 75 g/l + protiokonazol 150 g/l',
    mainUses: 'pšenica, ječam, raž, triticale — septorioza, fuzarioza klasa, smeđa i žuta rđa, pepelnica, helmintosporioza',
  },
  {
    filename: 'challenge-600-1-l.png',
    name: 'Challenge 600',
    slug: 'challenge-600',
    productType: 'herbicid',
    description:
      'Selektivni kontaktni herbicid na bazi aklonofen a (difenil-eter herbicid) za primjenu u šećernoj repi, soji i krumpiru. Inhibira protoporfirin-oksigenazu (PPO), uzrokujući nakupljanje toksičnih porfirina koji razaraju stanične membrane korova. Primjenjuje se pred-emergentno ili na ranom stadiju nicanja korova.',
    activeIngredients: 'aklonofen 600 g/l',
    mainUses: 'šećerna repa, soja, krumpir, suncokret — jednogodišnji širokolisni korovi',
  },
  {
    filename: 'hussar-star-1-l.png',
    name: 'Hussar Star',
    slug: 'hussar-star',
    productType: 'herbicid',
    description:
      'Kombinirani post-emergentni herbicid s jodosulfuron-metil-natrijem, amidosulfuronom i mefenpir-dietilom za suzbijanje travnih i širokolisnih korova u pšenici. Obje aktivne tvari (ALS inhibitori) sinergistički djeluju na različite korove, a mefenpir-dietil poboljšava selektivnost prema kulturnoj biljci. Brzo se apsorbira te je otporan na ispiranje kišom već sat vremena nakon primjene.',
    activeIngredients: 'jodosulfuron-metil-natrij 5 g/l + amidosulfuron 7,5 g/l + mefenpir-dietil 22,5 g/l',
    mainUses: 'pšenica — divlji ovas, kuštica, loboda, štir, čičak, maslačak, broć, tratinčica',
  },
  {
    filename: 'hussar-od-1-l.png',
    name: 'Hussar OD',
    slug: 'hussar-od',
    productType: 'herbicid',
    description:
      'Sistemični post-emergentni herbicid na bazi jodosulfuron-metil-natrija za suzbijanje jednogodišnjih i višegodišnjih travnih te nekih širokolisnih korova u pšenici i ječmu. ALS inhibitor koji zaustavljuje rast korova unutar 48 sati, uz mefenpir-dietil koji poboljšava selektivnost. Formulacija u obliku uljne disperzije osigurava brzu apsorpciju i djelotvornost čak i u suhim uvjetima.',
    activeIngredients: 'jodosulfuron-metil-natrij 100 g/l + mefenpir-dietil 250 g/l',
    mainUses: 'pšenica, ječam, raž — divlji ovas, kuštica, travni i neki širokolisni korovi',
  },
  {
    filename: 'infinito-1-l.png',
    name: 'Infinito 687,5 SC',
    slug: 'infinito-687-5-sc',
    productType: 'fungicid',
    description:
      'Kombinirani sistemični fungicid s propamokarb-hidrokloridom i fluopikolidom za suzbijanje plamenjače i ostalih oomiceta na krumpiru i povrću. Fluopikolid ometa lokalizaciju spektrina u membranama zoospora i micelija, dok propamokarb blokira sintezu fosfolipida stanične stijenke. Lokalno se kreće kroz tkivo lista te djeluje preventivno i kurativno.',
    activeIngredients: 'propamokarb-hidroklorid 625 g/l + fluopikolid 62,5 g/l',
    mainUses: 'krumpir, rajčica, paprika, krastavac — plamenjača (Phytophthora infestans, Pseudoperonospora)',
  },
  {
    filename: 'laudis-1-l.png',
    name: 'Laudis',
    slug: 'laudis',
    productType: 'herbicid',
    description:
      'Selektivni post-emergentni herbicid koji kombinira tembotrion i isoksadifenol za suzbijanje jednogodišnjih travnih i širokolisnih korova te sirka iz rizoma u kukuruzu. Tembotrion (HPPD inhibitor) uzrokuje bijeljenje i odumiranje korova, dok isoksadifenol djeluje kao safener koji štiti kukuruz. Primjenjuje se od faze 2 do 8 listova kukuruza.',
    activeIngredients: 'tembotrion 44 g/l + isoksadifenol 22 g/l',
    mainUses: 'kukuruz — sirak iz rizoma i sjemena, muhar, svračica, loboda, štir, ambrozija, pirika',
  },
  {
    filename: 'nativo-1-kg.png',
    name: 'Nativo 75 WG',
    slug: 'nativo-75-wg',
    productType: 'fungicid',
    description:
      'Kombinirani sistemični fungicid u obliku vododispergirajućih granula koji kombinira tebukonazol i trifloksistrobin za zaštitu raznolikih kultura. Tebukonazol (DMI inhibitor) inhibira biosintezu ergosterola, dok trifloksistrobin (QoI inhibitor) blokira stanično disanje gljiva. Brzo prodire u tkivo lista i pruža dugotrajnu preventivnu, kurativnu i eradikativnu zaštitu.',
    activeIngredients: 'tebukonazol 500 g/kg + trifloksistrobin 250 g/kg',
    mainUses: 'vinova loza, jabuka, pšenica, ječam, šećerna repa — pepelnica, hrđa, septorioza, plamenjača, fuzarioza',
  },
  {
    filename: 'profiler-1kg.png',
    name: 'Profiler',
    slug: 'profiler',
    productType: 'fungicid',
    description:
      'Kombinirani fungicid koji spaja fosetil-aluminij i fluopikolid za zaštitu vinove loze od plamenjače u uvjetima visokog infektivnog pritiska. Fosetil-aluminij stimulira prirodnu otpornost biljke i sistemično se kreće u oba smjera (xylem i floem), dok fluopikolid specifično blokira razvoj micelija i sporulaciju Plasmopara viticola. Učinkovit i u povoljnim uvjetima za zarazu.',
    activeIngredients: 'fosetil-aluminij 726,4 g/kg + fluopikolid 62,5 g/kg',
    mainUses: 'vinova loza — plamenjača (Plasmopara viticola)',
  },
  {
    filename: 'propulse-1-l.png',
    name: 'Propulse',
    slug: 'propulse',
    productType: 'fungicid',
    description:
      'Kombinirani sistemični fungicid koji spaja fluopiram i protiokonazol za zaštitu suncokreta, uljane repice i leguminoza od bolesti uzrokovanih sklerotinijom i sivom plijesni. Fluopiram (SDHI) blokira sukcinat-dehidrogenazu inhibirajući energetski metabolizam gljiva, a protiokonazol (DMI) ometa biosintezu ergosterola. Iznimno učinkovit u suzbijanju Sclerotinia sclerotiorum.',
    activeIngredients: 'fluopiram 125 g/l + protiokonazol 125 g/l',
    mainUses: 'suncokret, uljana repica, soja — bijela trulež, siva plijesan, verticilij',
  },
  {
    filename: 'prosper-1-l.png',
    name: 'Prosper EC 250',
    slug: 'prosper-ec-250',
    productType: 'fungicid',
    description:
      'Sistemični fungicid iz grupe spiroksamina za zaštitu strnih žita od pepelnice i hrđe. Spiroksamin inhibira biosintezu ergosterola na drugom koraku u lancu (SBI inhibitor), djelujući preventivno, kurativno i eradikativno. Brzo prodire kroz lisnu kutikulu i ravnomjerno se raspodjeljuje po biljci, neovisno o oborinama.',
    activeIngredients: 'spiroksamin 500 g/l',
    mainUses: 'pšenica, ječam, raž — pepelnica (Blumeria graminis), smeđa i žuta rđa',
  },
  {
    filename: 'sekator-1-l.png',
    name: 'Sekator OD',
    slug: 'sekator-od',
    productType: 'herbicid',
    description:
      'Kombinirani post-emergentni herbicid koji kombinira amidosulfuron i jodosulfuron-metil-natrij za suzbijanje jednogodišnjih i višegodišnjih širokolisnih korova u pšenici i ječmu. Oba ALS inhibitora sinergistički djeluju na različite korove, a mefenpir-dietil poboljšava selektivnost prema kulturnoj biljci. Posebno učinkovit na tetranim korovima.',
    activeIngredients: 'amidosulfuron 25 g/l + jodosulfuron-metil-natrij 1,25 g/l + mefenpir-dietil 125 g/l',
    mainUses: 'pšenica, ječam — dikotiledonski korovi: štir, loboda, čičak, maslačak, broć, tratinčica',
  },
  {
    filename: 'sivanto-1-l.png',
    name: 'Sivanto Prime',
    slug: 'sivanto-prime',
    productType: 'insekticid',
    description:
      'Sistemični insekticid iz nove kemijske klase butenolida s aktivnom tvari flupiradiburon (IRAC Skupina 4D). Selektivno aktivira nikotinski acetilkolinski receptor štetnih kukaca uz iznimno povoljan utjecaj na korisne kukce — pčele i predatore. Brzo se apsorbira i kreće kroz biljku, otporan na ispiranje kišom, a primjenjuje se kada su pčele neaktivne.',
    activeIngredients: 'flupiradiburon 200 g/l',
    mainUses: 'uljana repica, šećerna repa, krumpir, vinova loza, voćnjaci — lisne uši, bijela mušica, thrips',
  },
  {
    filename: 'sivanto-energy-5-l-play.png',
    name: 'Sivanto Energy',
    slug: 'sivanto-energy',
    productType: 'insekticid',
    description:
      'Sistemični insekticid na bazi flupiradiburona (IRAC Skupina 4D) formuliran za profesionalnu primjenu u ratarskim i povrtlarskim kulturama na većim površinama. Selektivni neonikotinoid nove generacije koji čuva korisnu entomofaunu uz visoku učinkovitost na sisajuće i neke žvakajuće štetnike. Brzo se apsorbira kroz list i korijenov sustav.',
    activeIngredients: 'flupiradiburon 200 g/l',
    mainUses: 'žitarice, kukuruz, šećerna repa, krumpir — lisne uši, štitaste uši, bijela mušica',
  },
]

// ─── Hibridi kukuruza DKC ─────────────────────────────────────────────────

const HYBRIDS = [
  {
    filename: '4125.png',
    name: 'DKC4125',
    slug: 'dkc4125',
    description:
      'Rani hibrid kukuruza FAO grupe 410 s izraženom tolerancijom na sušu i visoke temperature. Stabilan prinos zrna u različitim agroklimatskim uvjetima, brzo otpuštanje vlage iz zrna omogućuje raniju berbu uz niže troškove sušenja. Prikladna morfologija biljke s dobrim ukorijenjenjem otpornim na polijeganje.',
    instructions: 'Gustoća sjetve: 70.000–75.000 biljaka/ha. Preporučeno gnojidba startnom i dopunskom prihranom. Rokovi sjetve: travanj–početak svibnja pri temperaturi tla ≥ 8 °C.',
  },
  {
    filename: '4933.png',
    name: 'DKC4933',
    slug: 'dkc4933',
    description:
      'Srednje rani hibrid kukuruza FAO grupe 490 s visokim i stabilnim prinosom zrna. Odlična adaptabilnost na različite tipove tla, robusna biljka otporna na polijeganje i slomljene stabljike. Pogodna zdravstvena stabilnost klasa s dobrom otpornošću na fuzariozu. Preporučen za uzgoj u kontinentalnoj Hrvatskoj.',
    instructions: 'Gustoća sjetve: 68.000–73.000 biljaka/ha. Sjetva u travnju ili početkom svibnja. Prilagođen standardnim agrotehničkim mjerama ratarskog uzgoja kukuruza.',
  },
  {
    filename: '5092.png',
    name: 'DKC5092',
    slug: 'dkc5092',
    description:
      'Hibrid kukuruza FAO grupe 500 optimiziran za visoke prinose u povoljnim uzgojnim uvjetima. Visok potencijal zrna uz dobru zdravstvenu stabilnost klasa i otpornost na gljivične bolesti stabljike. Dobra tolerancija na sušu u kritičnoj fazi metličanja i svilanja. Preporučen za plodna tla s višim uzgojnim intenzitetom.',
    instructions: 'Gustoća sjetve: 68.000–72.000 biljaka/ha. Optimalan rok sjetve: travanj–početak svibnja. Reagira povoljno na intenzivnu gnojidbu dušikom.',
  },
  {
    filename: '5110.png',
    name: 'DKC5110',
    slug: 'dkc5110',
    description:
      'Srednji hibrid kukuruza FAO grupe 510 s visokim prinosom i izvrsnom zdravstvenom stabilnošću. Dobra otpornost na polijeganje i slomljene stabljike, snažan korijenov sustav. Prilagodljiv hibrid za različite tipove tla, preporučen za široko područje uzgoja u panonskom dijelu Hrvatske.',
    instructions: 'Gustoća sjetve: 66.000–70.000 biljaka/ha. Gnojidba prema analizi tla s naglaskom na uravnoteženu NPK ishranu. Berba pri vlagi zrna 22–26%.',
  },
  {
    filename: '5182.png',
    name: 'DKC5182',
    slug: 'dkc5182',
    description:
      'Hibrid kukuruza FAO grupe 510–520 s visokim prinosom zrna i dobrom plastičnošću u nestabilnim vremenskim uvjetima. Visoka energija klijanja i brz početni razvoj biljke. Dobra otpornost na uzročnike truleži stabljike i klasa, što osigurava stabilnost prinosa i niske gubitke pri berbi.',
    instructions: 'Gustoća sjetve: 65.000–70.000 biljaka/ha. Primjeren za standardne i intenzivne sustave uzgoja. Sjetva: travanj–početak svibnja.',
  },
  {
    filename: '5206.png',
    name: 'DKC5206',
    slug: 'dkc5206',
    description:
      'Srednje kasni hibrid kukuruza FAO grupe 520 s visokim potencijalom zrna i izvrsnom stabilnošću prinosa. Robusna biljka s jako razvijenim korijenjem i dobrom otpornošću na polijeganje. Visoka tolerancija na nedostatak vlage u tlu, preporučen za toplije mikrolokacije i plodna tla panonske Hrvatske.',
    instructions: 'Gustoća sjetve: 65.000–68.000 biljaka/ha. Optimalna sjetva u travnju. Osigurati adekvatnu gnojidbu startnim NPK gnojivom i prihranom.',
  },
  {
    filename: '5709.png',
    name: 'DKC5709',
    slug: 'dkc5709',
    description:
      'Kasni hibrid kukuruza FAO grupe 570 s iznimno visokim prinosom zrna za toplije klimatske uvjete. Visoko stabljika s dobrim ukorijenjenjem i odlična zdravstvena stabilnost. Prilagođen uzgoju u toplijim regijama s dovoljno toplote za sazrijevanje. Preporučen za Slavoniju i Baranju na plodnim tlima s intenzivnom agrotehnikoma.',
    instructions: 'Gustoća sjetve: 63.000–67.000 biljaka/ha. Sjetva u travnju. Zahtijeva toplije uzgojne uvjete i duži vegetacijski period za ostvarenje punog prinosa.',
  },
  {
    filename: '5810.png',
    name: 'DKC5810',
    slug: 'dkc5810',
    description:
      'Kasni hibrid kukuruza FAO grupe 580 s visokim prinosom i izuzetnom adaptabilnošću na tople regije uzgoja. Snažna i robusna biljka s dobrim ukorijenjenjem i visokom otpornošću na polijeganje. Pogodna zdravstvena stabilnost klasa s niskim rizikom od fuzarioze. Ideal za intenzivni uzgoj kukuruza na plodnim tlima Posavine i Baranje.',
    instructions: 'Gustoća sjetve: 62.000–66.000 biljaka/ha. Sjetva travanj–rani svibanj. Preporuča se uzgoj na toplim lokacijama uz visoki gnojidba dušikom.',
  },
]

// ─── Helper functions ──────────────────────────────────────────────────────

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

async function getOrCreateManufacturer(token, name, slug) {
  const existing = await apiFetch(`/manufacturers?where[slug][equals]=${slug}`)
  if (existing.docs?.length > 0) {
    console.log(`  ℹ️  Proizvođač "${name}" već postoji (id: ${existing.docs[0].id})`)
    return existing.docs[0].id
  }
  const created = await apiFetch('/manufacturers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `JWT ${token}` },
    body: JSON.stringify({ name, slug }),
  })
  console.log(`  ✅ Kreiran proizvođač "${name}" (id: ${created.doc.id})`)
  return created.doc.id
}

async function getOrCreateSubcategory(token, name, slug, categoryId) {
  const existing = await apiFetch(`/subcategories?where[slug][equals]=${slug}`)
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

async function compressImage(srcFilename) {
  const srcPath = path.join(SLANJE_DIR, srcFilename)
  // Output always as .jpg
  const outFilename = srcFilename.replace(/\.png$/i, '.jpg')
  const outPath = path.join(COMPRESSED_DIR, outFilename)

  if (fs.existsSync(outPath)) {
    console.log(`  ⏭️  Kompresija: ${outFilename} (već postoji)`)
    return { outPath, outFilename }
  }

  await sharp(srcPath)
    .flatten({ background: { r: 255, g: 255, b: 255 } })
    .resize({ width: 1500, withoutEnlargement: true })
    .jpeg({ quality: 85, progressive: true })
    .toFile(outPath)

  const srcStat = fs.statSync(srcPath)
  const outStat = fs.statSync(outPath)
  console.log(`  🗜️  ${srcFilename} → ${outFilename} (${Math.round(srcStat.size / 1024)} KB → ${Math.round(outStat.size / 1024)} KB)`)
  return { outPath, outFilename }
}

async function uploadImage(token, filePath, filename, altText) {
  console.log(`  📸 Upload: ${filename}...`)
  const fileBuffer = fs.readFileSync(filePath)
  const blob = new Blob([fileBuffer], { type: 'image/jpeg' })
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

function buildInstructions(text) {
  return {
    root: {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          version: 1,
          children: [{ type: 'text', text, version: 1 }],
        },
      ],
      direction: null,
      format: '',
      indent: 0,
      version: 1,
    },
  }
}

function buildZastitaInstructions(activeIngredients, mainUses) {
  return {
    root: {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          version: 1,
          children: [{ type: 'text', text: `Aktivne tvari: ${activeIngredients}`, version: 1 }],
        },
        {
          type: 'paragraph',
          version: 1,
          children: [{ type: 'text', text: `Primjena: ${mainUses}`, version: 1 }],
        },
      ],
      direction: null,
      format: '',
      indent: 0,
      version: 1,
    },
  }
}

async function createProduct(token, payload) {
  const existing = await apiFetch(`/products?where[slug][equals]=${payload.slug}`)
  if (existing.docs?.length > 0) {
    console.log(`  ⏭️  Preskačem "${payload.name}" (slug već postoji)`)
    return null
  }
  const created = await apiFetch('/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `JWT ${token}` },
    body: JSON.stringify(payload),
  })
  console.log(`  ✅ Proizvod "${payload.name}" kreiran (id: ${created.doc.id})`)
  return created.doc.id
}

// ─── Main ──────────────────────────────────────────────────────────────────

async function main() {
  const token = await login()

  // Proizvođači
  console.log('🏭 Provjera proizvođača...')
  const bayerId = await getOrCreateManufacturer(token, 'Bayer', 'bayer')
  const dekalbId = await getOrCreateManufacturer(token, 'DEKALB', 'dekalb')

  // Podkategorija za hibride kukuruza
  console.log('\n📂 Provjera podkategorije...')
  const subcategoryId = await getOrCreateSubcategory(
    token, 'Hibridi kukuruza', 'hibridi-kukuruza', CATEGORY_SJEMENSKI_PROGRAM
  )

  let success = 0, skipped = 0, failed = 0

  // ── Zaštita bilja ──────────────────────────────────────────────────────
  console.log('\n══════════════════════════════════════════')
  console.log('🌿 Zaštita bilja — novi proizvodi')
  console.log('══════════════════════════════════════════')

  for (const product of PRODUCTS_ZASTITA) {
    console.log(`\n📦 ${product.name}`)
    try {
      const { outPath, outFilename } = await compressImage(product.filename)
      const mediaId = await uploadImage(token, outPath, outFilename, product.name)
      const result = await createProduct(token, {
        name: product.name,
        slug: product.slug,
        category: CATEGORY_ZASTITA_BILJA,
        manufacturer: bayerId,
        description: product.description,
        instructions: buildZastitaInstructions(product.activeIngredients, product.mainUses),
        image: mediaId,
      })
      if (result) success++
      else skipped++
    } catch (err) {
      console.error(`  ❌ Greška: ${err.message}`)
      failed++
    }
  }

  // ── Hibridi kukuruza ───────────────────────────────────────────────────
  console.log('\n══════════════════════════════════════════')
  console.log('🌽 Hibridi kukuruza — DKC serija')
  console.log('══════════════════════════════════════════')

  for (const hybrid of HYBRIDS) {
    console.log(`\n📦 ${hybrid.name}`)
    try {
      const { outPath, outFilename } = await compressImage(hybrid.filename)
      const mediaId = await uploadImage(token, outPath, outFilename, hybrid.name)
      const result = await createProduct(token, {
        name: hybrid.name,
        slug: hybrid.slug,
        category: CATEGORY_SJEMENSKI_PROGRAM,
        subcategory: subcategoryId,
        manufacturer: dekalbId,
        description: hybrid.description,
        instructions: buildInstructions(hybrid.instructions),
        image: mediaId,
      })
      if (result) success++
      else skipped++
    } catch (err) {
      console.error(`  ❌ Greška: ${err.message}`)
      failed++
    }
  }

  console.log(`\n${'═'.repeat(50)}`)
  console.log(`✅ Uspješno kreirano: ${success}`)
  console.log(`⏭️  Preskočeno:       ${skipped}`)
  console.log(`❌ Greške:           ${failed}`)
  console.log(`${'═'.repeat(50)}`)
}

main().catch((err) => {
  console.error('Fatalna greška:', err.message)
  process.exit(1)
})
