import type { Metadata } from "next";
import { getPayload } from "payload";
import config from "@payload-config";
import HeroSlideshow from "@/components/home/HeroSlideshow";
import ServicesIntro from "@/components/home/ServicesIntro";
import StoresStrip from "@/components/home/StoresStrip";
import BlogPreview from "@/components/home/BlogPreview";
import type { BlogPost } from "@/types/views";
import { getImageUrl } from "@/lib/utils";

export const revalidate = 3600;

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80";

export default async function HomePage() {
  const payload = await getPayload({ config });

  const { docs: blogDocs } = await payload.find({
    collection: "blogs",
    sort: "-date",
    depth: 1,
    limit: 3,
  });

  const posts: BlogPost[] = blogDocs.map((doc) => ({
    slug: doc.slug,
    title: doc.title,
    excerpt: doc.excerpt,
    coverImage: getImageUrl(doc.coverImage, FALLBACK_IMAGE),
    date: doc.date,
    readingTime: doc.readingTime ?? 5,
    content: doc.content,
    tags: doc.tags?.map((t) => t.tag) ?? [],
  }));

  return (
    <>
      <HeroSlideshow />
      <ServicesIntro />
      <StoresStrip />
      <BlogPreview posts={posts} />
    </>
  );
}
