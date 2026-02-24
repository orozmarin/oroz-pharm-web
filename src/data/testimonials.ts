export interface Testimonial {
  id: number;
  quote: string;
  name: string;
  role: string;
  company: string;
  location?: string;
}

export const testimonials: Testimonial[] = [
  {
    id: 1,
    quote:
      "S Oroz PHARM-om surađujemo već više od deset godina. Uvijek su tu s pravim savjetom, kvalitetnim sjemenom i gnojivima na vrijeme. Bez njih naša bi OPG priča bila puno teža.",
    name: "Ivan Pavlović",
    role: "Vlasnik",
    company: "OPG Pavlović",
    location: "Pleternica",
  },
  {
    id: 2,
    quote:
      "Odlična ponuda sredstava za zaštitu vinograda i stručan pristup svakom upitu. Ekipa iz Požege uvijek preporuči pravo rješenje za naše potrebe, bez nepotrebne prodaje.",
    name: "Marija Horvat",
    role: "Vinogradarka",
    company: "Vinarija Horvat",
    location: "Kutjevo",
  },
  {
    id: 3,
    quote:
      "Nabavljamo pčelarsku opremu i prehranu za pčele isključivo kod njih. Asortiman je uvijek kompletan, a cijene su poštene. Preporučujem svim pčelarima u regiji.",
    name: "Stjepan Blažević",
    role: "Pčelar",
    company: "OPG Blažević",
    location: "Brestovac",
  },
  {
    id: 4,
    quote:
      "Koristimo njihova gnojiva i stočnu hranu već godinama. Kvaliteta je konstantna, a dostava uvijek točna. Pouzdani partner za svako gospodarstvo.",
    name: "Zdravko Marić",
    role: "Stočar",
    company: "Farma Marić",
    location: "Jakšić",
  },
  {
    id: 5,
    quote:
      "Kao mladi OPG, Oroz PHARM nam je pomogao savjetom pri prvom postavljanju navodnjavanja. Stručnost i strpljivost osoblja zaista se cijeni kad tek počinješ.",
    name: "Petra Jurić",
    role: "Voćarka",
    company: "OPG Jurić",
    location: "Vetovo",
  },
  {
    id: 6,
    quote:
      "Redovito nabavljamo sadnice, supstrat i opremu za povrtarstvo. Sve je na jednom mjestu, a savjeti su uvijek besplatni i stručni. Pravi partner u poslu.",
    name: "Ante Kovač",
    role: "Povrtlar",
    company: "OPG Kovač",
    location: "Požega",
  },
];
