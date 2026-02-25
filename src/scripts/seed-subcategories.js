'use strict'
/**
 * Seeds the subcategories collection from the original embedded subcategory data.
 *
 * Run with: npm run seed:subcategories
 */
const { Client } = require('pg')

const categorySubcategories = [
  { categorySlug: 'sjemenski-program', subs: [
    { name: 'Ratarskih kultura', slug: 'ratarskih-kultura' },
    { name: 'Uljarice', slug: 'uljarice' },
    { name: 'Trave i djeteline', slug: 'trave-i-djeteline' },
    { name: 'Hibridi povrća', slug: 'hibridi-povrca' },
    { name: 'Ostalo', slug: 'sjemenski-program-ostalo' },
  ]},
  { categorySlug: 'gnojiva', subs: [
    { name: 'Mineralna', slug: 'mineralna' },
    { name: 'Organska', slug: 'organska' },
    { name: 'Biostimulatori', slug: 'biostimulatori' },
    { name: 'Poboljšivači tla', slug: 'poboljsivaci-tla' },
    { name: 'Ostalo', slug: 'gnojiva-ostalo' },
  ]},
  { categorySlug: 'zastita-bilja', subs: [
    { name: 'Herbicidi', slug: 'herbicidi' },
    { name: 'Fungicidi', slug: 'fungicidi' },
    { name: 'Insekticidi', slug: 'insekticidi' },
    { name: 'Limacidi', slug: 'limacidi' },
    { name: 'Biocidi/Rodenticidi', slug: 'biocidi-rodenticidi' },
    { name: 'Ostalo', slug: 'zastita-bilja-ostalo' },
  ]},
  { categorySlug: 'stocna-hrana', subs: [
    { name: 'Sano', slug: 'sano' },
    { name: 'TSH Čakovec', slug: 'tsh-cakovec' },
    { name: 'Patent', slug: 'patent' },
    { name: 'Genera', slug: 'genera' },
    { name: 'Lek', slug: 'lek' },
    { name: 'Valpovka', slug: 'valpovka' },
    { name: 'Ostalo', slug: 'stocna-hrana-ostalo' },
  ]},
  { categorySlug: 'sadni-materijal', subs: [
    { name: 'Voćne sadnice', slug: 'vocne-sadnice' },
    { name: 'Sadnice vinove loze', slug: 'sadnice-vinove-loze' },
    { name: 'Prijesadnice cvijeća', slug: 'prijesadnice-cvijeca' },
    { name: 'Lučica', slug: 'lucica' },
    { name: 'Sjemenski krumpir', slug: 'sjemenski-krumpir' },
    { name: 'Ostalo', slug: 'sadni-materijal-ostalo' },
  ]},
  { categorySlug: 'oprema-za-povrtlarstvo', subs: [
    { name: 'Klasmann', slug: 'klasmann' },
    { name: 'Florabella', slug: 'florabella' },
    { name: 'Brill', slug: 'brill' },
    { name: 'Hawita', slug: 'hawita' },
    { name: 'Plantella', slug: 'plantella' },
    { name: 'Plastenička folija', slug: 'plastenička-folija' },
    { name: 'Mreže', slug: 'mreze' },
    { name: 'Ostalo', slug: 'oprema-povrtlarstvo-ostalo' },
  ]},
  { categorySlug: 'navodnjavanje', subs: [
    { name: 'Pumpe', slug: 'pumpe' },
    { name: 'Spojnice i ventili', slug: 'spojnice-i-ventili' },
    { name: 'Crijeva kap po kap', slug: 'crijeva-kap' },
    { name: 'Rasprskivači', slug: 'rasprskivaci' },
    { name: 'Ostalo', slug: 'navodnjavanje-ostalo' },
  ]},
  { categorySlug: 'enologija', subs: [
    { name: 'Boce', slug: 'boce' },
    { name: 'Kvasci', slug: 'kvasci' },
    { name: 'Inox bačve', slug: 'inox-bacve' },
    { name: 'Kanisteri', slug: 'kanisteri' },
    { name: 'Ostalo', slug: 'enologija-ostalo' },
  ]},
  { categorySlug: 'oprema-za-pcelarstvo', subs: [
    { name: 'Staklenke', slug: 'staklenke' },
    { name: 'Poklopci', slug: 'poklopci' },
    { name: 'Pogače', slug: 'pogace' },
    { name: 'Košnice', slug: 'kosnice' },
    { name: 'Ostalo', slug: 'pcelarstvo-ostalo' },
  ]},
  { categorySlug: 'poljoprivredni-strojevi', subs: [
    { name: 'Kosilice', slug: 'kosilice' },
    { name: 'Motorne pile', slug: 'motorne-pile' },
    { name: 'Trimeri', slug: 'trimeri' },
    { name: 'Ostalo', slug: 'strojevi-ostalo' },
  ]},
  { categorySlug: 'alati', subs: [
    { name: 'Škare i pile za rezidbu', slug: 'skare-i-pile-za-rezidbu' },
    { name: 'Alatke i držala', slug: 'alatke-i-drzala' },
  ]},
  { categorySlug: 'oprema-za-stocarstvo', subs: [
    { name: 'Hranilice i pojilice', slug: 'hranilice-i-pojilice' },
    { name: 'Pastiri i oprema', slug: 'pastiri-i-oprema' },
  ]},
  { categorySlug: 'ulja-i-maziva', subs: [
    { name: 'Ulja', slug: 'ulja' },
    { name: 'Maziva', slug: 'maziva' },
    { name: 'Antifriz', slug: 'antifriz' },
    { name: 'Tekućine za stakla', slug: 'tekucine-za-stakla' },
  ]},
  { categorySlug: 'kucni-ljubimci', subs: [
    { name: 'Hrana za golubove', slug: 'hrana-za-golubove' },
    { name: 'Hrana i oprema za pse i mačke', slug: 'hrana-i-oprema-za-pse-i-macke' },
    { name: 'Hrana za ptice i ribe', slug: 'hrana-za-ptice-i-ribe' },
  ]},
  { categorySlug: 'pribor-za-kolinje', subs: [
    { name: 'Crijeva', slug: 'crijeva' },
    { name: 'Punilice', slug: 'punilice' },
    { name: 'Mesoreznice', slug: 'mesoreznice' },
    { name: 'Noževi', slug: 'nozevi' },
    { name: 'Kuke', slug: 'kuke' },
  ]},
  { categorySlug: 'vrt-i-okucnica', subs: [
    { name: 'Tačke', slug: 'tacke' },
    { name: 'Nit za košnju', slug: 'nit-za-kosnju' },
    { name: 'Rukavice', slug: 'rukavice' },
    { name: 'Čizme', slug: 'cizme' },
    { name: 'Lampioni', slug: 'lampioni' },
  ]},
  { categorySlug: 'roba-siroke-potrosnje', subs: [
    { name: 'Kace', slug: 'kace' },
    { name: 'Bačve', slug: 'bacve' },
    { name: 'Kante', slug: 'kante' },
    { name: 'Lončanice za cvijeće', slug: 'loncanice-za-cvijece' },
    { name: 'Sprejevi', slug: 'sprejevi' },
  ]},
  // gume-i-zracnice i ekoloski-proizvodi nemaju podkategorija
]

async function seed() {
  const client = new Client({ connectionString: process.env.DATABASE_URI })
  await client.connect()

  try {
    let totalInserted = 0

    for (const { categorySlug, subs } of categorySubcategories) {
      // Dohvati category ID po slugu
      const catRes = await client.query(
        'SELECT id FROM categories WHERE slug = $1',
        [categorySlug]
      )
      if (catRes.rows.length === 0) {
        console.warn(`  ⚠ Kategorija '${categorySlug}' nije pronađena — preskačem`)
        continue
      }
      const categoryId = catRes.rows[0].id

      console.log(`\nKategorija: ${categorySlug} (id=${categoryId})`)

      for (const sub of subs) {
        await client.query(
          `INSERT INTO subcategories (name, slug, category_id, updated_at, created_at)
           VALUES ($1, $2, $3, NOW(), NOW())
           ON CONFLICT (slug) DO NOTHING`,
          [sub.name, sub.slug, categoryId]
        )
        console.log(`  + ${sub.name}`)
        totalInserted++
      }
    }

    console.log(`\nUkupno dodano: ${totalInserted} podkategorija`)
    console.log('Seeding subcategories complete!')
  } finally {
    await client.end()
  }
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
