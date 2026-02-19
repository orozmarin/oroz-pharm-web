export interface StoreLocation {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  lat: number;
  lng: number;
  hours: { days: string; time: string }[];
  seasonal?: boolean;
}

export const locations: StoreLocation[] = [
  {
    id: "pleternica",
    name: "Pleternica - Sjedište",
    address: "Kralja Zvonimira 24",
    city: "HR-34310 Pleternica",
    phone: "+385 34 251 053",
    lat: 45.2936771,
    lng: 17.8075799,
    hours: [
      { days: "Pon - Pet", time: "7:00 - 19:00" },
      { days: "Sub", time: "7:00 - 15:00" },
    ],
  },
  {
    id: "pozega",
    name: "Požega",
    address: "Frankopanska 53",
    city: "HR-34000 Požega",
    phone: "+385 34 211 224",
    lat: 45.3382851,
    lng: 17.6523297,
    hours: [
      { days: "Pon - Pet", time: "7:00 - 19:00" },
      { days: "Sub", time: "8:00 - 13:00" },
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
