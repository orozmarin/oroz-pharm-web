import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import Script from "next/script";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import LocalBusinessJsonLd from "@/components/seo/LocalBusinessJsonLd";
import { openGraph } from "@/lib/seo";
import "../globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.orozpharm.hr"),
  title: {
    default: "Oroz PHARM | Poljoprivredna ljekarna",
    template: "%s | Oroz PHARM",
  },
  description:
    "Vaš pouzdan partner u poljoprivredi od 1998. Preko 15.000 artikala - zaštita bilja, gnojiva, sjeme, navodnjavanje i još mnogo toga. Pleternica i Požega.",
  keywords: [
    "poljoprivredna ljekarna",
    "Pleternica",
    "Požega",
    "zaštita bilja",
    "gnojiva",
    "sjeme",
    "navodnjavanje",
    "stočna hrana",
    "Oroz PHARM",
  ],
  icons: {
    icon: "/images/logo-oroz.png",
    apple: "/images/logo-oroz.png",
  },
  openGraph: openGraph({
    title: "Oroz PHARM | Poljoprivredna ljekarna",
    description: "Poljoprivredna ljekarna u Pleternici i Požegi. Vaš partner od 1998.",
  }),
};

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="hr">
      <body className={`${playfair.variable} ${inter.variable} antialiased site-body`}>
        <LocalBusinessJsonLd />
        <Header />
        <main className="pt-20 md:pt-32 min-h-screen">{children}</main>
        <Footer />
        <Script
          defer
          src="https://analytics.orozpharm.hr/script.js"
          data-website-id="dc479c6a-69ff-4835-b8ea-97096fabeb79"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
