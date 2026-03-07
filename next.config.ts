import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";

const nextConfig: NextConfig = {
  transpilePackages: ['@payloadcms/ui', '@payloadcms/richtext-lexical', '@payloadcms/next'],
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
