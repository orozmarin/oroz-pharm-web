import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";

const nextConfig: NextConfig = {
  transpilePackages: ['@payloadcms/ui', '@payloadcms/richtext-lexical', '@payloadcms/next'],
  eslint: {
    // ESLint flat config compatibility issue with eslint-config-next — run linting separately with `npm run lint`
    ignoreDuringBuilds: true,
  },
  images: {
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
    ],
  },
};

export default withPayload(nextConfig);
