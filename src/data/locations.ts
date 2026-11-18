export interface StoreLocation {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  lat: number;
  lng: number;
  gmapsUrl: string;
  hours: { days: string; time: string }[];
  /** Strojno čitljivo radno vrijeme za schema.org (JSON-LD). Drži usklađeno s `hours`. */
  openingHours: { days: string[]; opens: string; closes: string }[];
  seasonal?: boolean;
  /** Podaci za stranicu poslovnice (/poslovnice/[slug]) */
  slug: string;
  cityName: string;
  heroImage: string;
  gallery: { src: string; alt: string }[];
  intro: string[];
  highlights: string[];
}

const STORE_HIGHLIGHTS = [
  "Sjeme i sadni materijal",
  "Gnojiva i supstrati",
  "Sredstva za zaštitu bilja",
  "Stočna hrana i oprema za stočarstvo",
  "Hrana i oprema za kućne ljubimce",
  "Navodnjavanje, alati i oprema za vrt",
];

export const storeServices = ["Plaćanje karticama", "Parkiralište", "Dostava"];

/** Blagdansko radno vrijeme za obje poslovnice. Bez opens/closes = zatvoreno. */
export const specialHours: {
  date: string; // YYYY-MM-DD
  label: string;
  opens?: string;
  closes?: string;
}[] = [
  { date: "2026-12-24", label: "Badnjak", opens: "07:00", closes: "16:00" },
  { date: "2026-12-25", label: "Božić" },
  { date: "2026-12-26", label: "Sveti Stjepan" },
  { date: "2026-12-31", label: "Stara godina", opens: "07:00", closes: "17:00" },
  { date: "2027-01-01", label: "Nova godina" },
  { date: "2027-01-06", label: "Sveta tri kralja" },
  { date: "2027-03-29", label: "Uskrsni ponedjeljak" },
  { date: "2027-05-01", label: "Praznik rada" },
  { date: "2027-05-27", label: "Tijelovo" },
  { date: "2027-06-22", label: "Dan antifašističke borbe" },
  { date: "2027-08-05", label: "Dan pobjede" },
  { date: "2027-11-01", label: "Svi sveti" },
  { date: "2027-11-18", label: "Dan sjećanja na Vukovar" },
];

const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export const locations: StoreLocation[] = [
  {
    id: "pleternica",
    slug: "pleternica",
    cityName: "Pleternica",
    heroImage: "/images/poslovnice/pleternica-procelje.jpg",
    gallery: [
      { src: "/images/poslovnice/pleternica-macak-mile.jpg", alt: "Mačak Mile čuva dvorište poslovnice u Pleternici" },
      { src: "/images/poslovnice/pleternica-unutra.jpg", alt: "Unutrašnjost poslovnice u Pleternici" },
      { src: "/images/poslovnice/pleternica-ogrlice-povodci.jpg", alt: "Zid s ogrlicama i povodcima za pse" },
      { src: "/images/poslovnice/pleternica-sjeme.jpg", alt: "Sjeme povrća i cvijeća" },
      { src: "/images/poslovnice/pleternica-kante.jpg", alt: "Kante za zalijevanje ispred poslovnice" },
      { src: "/images/poslovnice/pleternica-zastita-bilja.jpg", alt: "Sredstva za zaštitu bilja" },
      { src: "/images/poslovnice/pleternica-klupica.jpg", alt: "Drvene klupice za cvijeće s natpisom Dobrodošli" },
      { src: "/images/poslovnice/pleternica-skladiste.jpg", alt: "Skladište u Pleternici" },
      { src: "/images/poslovnice/pleternica-macak-mile-dvoriste.jpg", alt: "Mile prati utovar u dvorištu" },
      { src: "/images/poslovnice/pleternica-plin.jpg", alt: "Plinske boce za domaćinstvo" },
      { src: "/images/poslovnice/pleternica-pano.jpg", alt: "Pano Oroz PHARM uz cestu u Pleternici" },
      { src: "/images/poslovnice/pleternica-iz-zraka.jpg", alt: "Poslovnica Pleternica iz zraka" },
    ],
    intro: [
      "Poslovnica u Pleternici je sjedište Oroz PHARM-a. Ovdje radimo od 1998. godine, a danas vas na adresi Kralja Zvonimira 24 čeka više od 15.000 artikala za polje, vrt, voćnjak, vinograd, štalu i kućne ljubimce.",
      "Uz robu dobijete i savjet. Pitajte nas koje sredstvo, gnojivo ili sjeme odgovara vašoj kulturi i u kojem roku, pa da kupite ono što vam stvarno treba.",
      "Iza poslovnice je dvorište s vanjskim skladištem. Tamo su palete gnojiva i supstrata te krupnija roba, a teže stvari utovarimo viličarom.",
    ],
    highlights: STORE_HIGHLIGHTS,
    name: "Pleternica - Sjedište",
    address: "Kralja Zvonimira 24",
    city: "HR-34310 Pleternica",
    phone: "+385 34 251 053",
    lat: 45.2880556,
    lng: 17.8063889,
    gmapsUrl: "https://maps.app.goo.gl/gkdM4erJB1xFSS129",
    hours: [
      { days: "Pon - Pet", time: "7:00 - 19:00" },
      { days: "Sub", time: "7:00 - 15:00" },
    ],
    openingHours: [
      { days: WEEKDAYS, opens: "07:00", closes: "19:00" },
      { days: ["Saturday"], opens: "07:00", closes: "15:00" },
    ],
  },
  {
    id: "pozega",
    slug: "pozega",
    cityName: "Požega",
    heroImage: "/images/poslovnice/pozega-ulaz.jpg",
    gallery: [
      { src: "/images/poslovnice/pozega-iz-zraka.jpg", alt: "Poslovnica Požega iz zraka" },
      { src: "/images/poslovnice/pozega-natpis.jpg", alt: "Natpis Oroz PHARM uz cestu u Požegi" },
      { src: "/images/poslovnice/pozega-ulaz.jpg", alt: "Ulaz u poslovnicu u Požegi" },
    ],
    intro: [
      "U Požegi nas nađite u Frankopanskoj 53. Poslovnica je dio Oroz PHARM-a, obiteljske tvrtke iz Pleternice koja od 1998. opskrbljuje poljoprivrednike i vrtlare Požeško-slavonske županije.",
      "Kod nas ćete naći sjeme, gnojiva, sredstva za zaštitu bilja, stočnu hranu, opremu za vrt i navodnjavanje te hranu za kućne ljubimce, uz savjet za vašu kulturu.",
      "Subotom radimo kraće nego u Pleternici, od 8 do 13 sati, pa provjerite radno vrijeme prije nego što krenete.",
    ],
    highlights: STORE_HIGHLIGHTS,
    name: "Požega",
    address: "Frankopanska 53",
    city: "HR-34000 Požega",
    phone: "+385 34 211 224",
    lat: 45.3372368,
    lng: 17.662954,
    gmapsUrl: "https://maps.app.goo.gl/HLtjmFSzWKA21hPs9",
    hours: [
      { days: "Pon - Pet", time: "7:00 - 19:00" },
      { days: "Sub", time: "8:00 - 13:00" },
    ],
    openingHours: [
      { days: WEEKDAYS, opens: "07:00", closes: "19:00" },
      { days: ["Saturday"], opens: "08:00", closes: "13:00" },
    ],
  },
];

export const contactInfo = {
  director: "Perica Oroz, dipl. ing.",
  directorPhone: "+385 34 311 090",
  accounting: "+385 34 311 089",
  email: "perica@orozpharm.hr",
  emailAlt: "perica.oroz82@gmail.com",
};

export const legalData = {
  companyName: "OROZ PHARM D.O.O.",
  mbs: "050029164",
  oib: "16715315328",
  iban: "HR17 2386 0021 1300 1135 8",
  bank: "Podravska banka d.d.",
  capital: "18.000,00 kuna (uplaćen u cijelosti)",
  director: "Perica Oroz, dipl. ing.",
  court: "Trgovački sud u Osijeku",
};
