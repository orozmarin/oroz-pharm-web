import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/api/", "/proizvodi/dokumenti/"],
    },
    sitemap: "https://www.orozpharm.hr/sitemap.xml",
  };
}
