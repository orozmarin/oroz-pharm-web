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
}

const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export const locations: StoreLocation[] = [
  {
    id: "pleternica",
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
