import type { Metadata } from "next";
import ContactForm from "@/components/contact/ContactForm";
import StoreLocations from "@/components/contact/StoreLocations";
import LegalData from "@/components/contact/LegalData";

export const metadata: Metadata = {
  title: "Kontakt",
  description: "Kontaktirajte Oroz PHARM d.o.o. - Pleternica i Pozega. Telefon, email, adrese i radno vrijeme nasih poslovnica.",
};

export default function ContactPage() {
  return (
    <>
      <ContactForm />
      <StoreLocations />
      <LegalData />
    </>
  );
}
