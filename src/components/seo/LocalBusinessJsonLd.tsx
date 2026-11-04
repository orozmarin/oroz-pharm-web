import { locations, legalData } from "@/data/locations";

const BASE_URL = "https://www.orozpharm.hr";

/**
 * schema.org podaci o tvrtki i poslovnicama za Google (adresa, telefon,
 * radno vrijeme, koordinate). Izvor istine je src/data/locations.ts.
 */
export default function LocalBusinessJsonLd() {
  const organizationId = `${BASE_URL}/#organization`;

  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": organizationId,
        name: "Oroz PHARM",
        legalName: legalData.companyName,
        url: BASE_URL,
        logo: `${BASE_URL}/images/logo-oroz.png`,
        email: "info@orozpharm.hr",
        foundingDate: "1998",
        vatID: `HR${legalData.oib}`,
        sameAs: [
          "https://www.facebook.com/oroz.pharm/",
          "https://www.instagram.com/orozpharm/",
        ],
      },
      ...locations.map((loc) => ({
        "@type": "Store",
        "@id": `${BASE_URL}/#store-${loc.id}`,
        name: `Oroz PHARM ${loc.id === "pozega" ? "Požega" : "Pleternica"}`,
        parentOrganization: { "@id": organizationId },
        url: `${BASE_URL}/kontakt`,
        image: `${BASE_URL}/images/logo-oroz.png`,
        telephone: loc.phone,
        address: {
          "@type": "PostalAddress",
          streetAddress: loc.address,
          postalCode: loc.city.match(/\d{5}/)?.[0],
          addressLocality: loc.city.replace(/^HR-\d{5}\s*/, ""),
          addressRegion: "Požeško-slavonska županija",
          addressCountry: "HR",
        },
        geo: { "@type": "GeoCoordinates", latitude: loc.lat, longitude: loc.lng },
        hasMap: loc.gmapsUrl,
        openingHoursSpecification: loc.openingHours.map((h) => ({
          "@type": "OpeningHoursSpecification",
          dayOfWeek: h.days,
          opens: h.opens,
          closes: h.closes,
        })),
      })),
    ],
  };

  return (
    <script
      type="application/ld+json"
      // JSON.stringify ne escapea "<", pa ga ručno escapeamo da sadržaj ne može zatvoriti <script>
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
