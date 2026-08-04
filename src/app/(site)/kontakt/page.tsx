import type { Metadata } from "next";
import { getPayload } from "payload";
import config from "@payload-config";
import ContactForm from "@/components/contact/ContactForm";
import StoreLocations from "@/components/contact/StoreLocations";
import LegalData from "@/components/contact/LegalData";
import { GRID_ORDER } from "@/data/categoryOrder";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Kontakt",
  description: "Kontaktirajte Oroz PHARM d.o.o. - Pleternica i Pozega. Telefon, email, adrese i radno vrijeme nasih poslovnica.",
  alternates: { canonical: "/kontakt" },
};

export default async function ContactPage() {
  const payload = await getPayload({ config });
  const { docs } = await payload.find({ collection: "categories", depth: 0, limit: 100 });

  const categoryNames = [...docs]
    .sort((a, b) => {
      const aIndex = a.gridArea ? GRID_ORDER.indexOf(a.gridArea) : -1;
      const bIndex = b.gridArea ? GRID_ORDER.indexOf(b.gridArea) : -1;
      const aRank = aIndex === -1 ? GRID_ORDER.length : aIndex;
      const bRank = bIndex === -1 ? GRID_ORDER.length : bIndex;
      if (aRank !== bRank) return aRank - bRank;
      return a.name.localeCompare(b.name, "hr");
    })
    .map((doc) => doc.name);

  const categories = [...categoryNames, "Ostalo"];

  return (
    <>
      <ContactForm categories={categories} />
      <StoreLocations />
      <LegalData />
    </>
  );
}
