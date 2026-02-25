import { getPayload } from "payload";
import config from "@payload-config";
import HeroSlideshow from "@/components/home/HeroSlideshow";
import ServicesIntro from "@/components/home/ServicesIntro";
import PartnersTestimonials from "@/components/home/PartnersTestimonials";
import LocationsPreview from "@/components/home/LocationsPreview";
import BlogPreview from "@/components/home/BlogPreview";
import LeafDivider from "@/components/shared/LeafDivider";
import type { BlogPost } from "@/types/views";
import { getImageUrl } from "@/lib/utils";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80";

export default async function HomePage() {
  const payload = await getPayload({ config });

  const [{ docs: blogDocs }, { docs: testimonialDocs }] = await Promise.all([
    payload.find({
      collection: "blogs",
      sort: "-date",
      depth: 1,
      limit: 3,
    }),
    payload.find({
      collection: "testimonials",
      sort: "order",
      limit: 100,
    }),
  ]);

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

  const testimonials = testimonialDocs.map((doc) => ({
    id: doc.id,
    quote: doc.quote,
    author: doc.author,
    company: doc.company,
  }));

  return (
    <>
      <HeroSlideshow />
      <ServicesIntro />
      <LeafDivider />
      <PartnersTestimonials testimonials={testimonials} />
      <LocationsPreview />
      <LeafDivider className="bg-green-50" />
      <BlogPreview posts={posts} />
    </>
  );
}
