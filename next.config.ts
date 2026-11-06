import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";

const nextConfig: NextConfig = {
  transpilePackages: ['@payloadcms/ui', '@payloadcms/richtext-lexical', '@payloadcms/next'],
  // Next.js 15.2+ za većinu posjetitelja, pa i za Googlebot, "streama" <title>,
  // description i canonical u <body>. Google canonical u bodyju ignorira (Search
  // Console je javljao "Kanonski URL koji je naveo korisnik: Ništa" i 132 duplikata),
  // a status 404 se ne može postaviti nakon što je stream krenuo. S ovim se metapodaci
  // uvijek renderiraju u <head> prije slanja stranice.
  htmlLimitedBots: /.*/,
  eslint: {
    // ESLint flat config compatibility issue with eslint-config-next — run linting separately with `npm run lint`
    ignoreDuringBuilds: true,
  },
  images: {
    // R2 is Cloudflare CDN — bypass Next.js proxy to avoid timeout on simultaneous image requests
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "unpkg.com",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "https",
        hostname: "*.r2.dev",
      },
    ],
  },
};

export default withPayload(nextConfig);
