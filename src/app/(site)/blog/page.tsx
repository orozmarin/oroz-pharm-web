import type { Metadata } from "next";
import { getPayload } from "payload";
import config from "@payload-config";
import BlogListClient from "@/components/blog/BlogListClient";
import type { BlogPost } from "@/types/views";
import { getImageUrl } from "@/lib/utils";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80";

export const metadata: Metadata = {
  title: "Blog",
  description: "Korisni savjeti i novosti iz svijeta poljoprivrede - proljetna gnojidba, zastita bilja, navodnjavanje i jos mnogo toga.",
};

export default async function BlogPage() {
  const payload = await getPayload({ config });
  const { docs } = await payload.find({
    collection: "blogs",
    sort: "-date",
    depth: 1,
    limit: 100,
  });

  const posts: BlogPost[] = docs.map((doc) => ({
    slug: doc.slug,
    title: doc.title,
    excerpt: doc.excerpt,
    coverImage: getImageUrl(doc.coverImage, FALLBACK_IMAGE),
    date: doc.date,
    readingTime: doc.readingTime ?? 5,
    content: doc.content,
    tags: doc.tags?.map((t) => t.tag) ?? [],
  }));

  return <BlogListClient posts={posts} />;
}
