import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import "./globals.css";

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
  title: {
    default: "Oroz PHARM d.o.o. | Poljoprivredna ljekarna",
    template: "%s | Oroz PHARM",
  },
  description:
    "Vaš pouzdan partner u poljoprivredi od 1998. Preko 12.000 artikala - zaštita bilja, gnojiva, sjeme, navodnjavanje i još mnogo toga. Pleternica i Požega.",
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
  openGraph: {
    title: "Oroz PHARM d.o.o.",
    description: "Poljoprivredna ljekarna - Vaš partner od 1998.",
    locale: "hr_HR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="hr">
      <body className={`${playfair.variable} ${inter.variable} antialiased`}>
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
