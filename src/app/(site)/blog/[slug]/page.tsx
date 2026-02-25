import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { getPayload } from "payload";
import config from "@payload-config";
import { formatDate, getImageUrl } from "@/lib/utils";
import BlogPostContent from "@/components/blog/BlogPostContent";
import BlogRelatedPosts from "@/components/blog/BlogRelatedPosts";
import { ArrowLeft, Clock, Calendar } from "lucide-react";
import type { BlogPost } from "@/types/views";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const payload = await getPayload({ config });
  const { docs } = await payload.find({
    collection: "blogs",
    limit: 1000,
  });
  return docs.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const payload = await getPayload({ config });
  const { docs } = await payload.find({
    collection: "blogs",
    where: { slug: { equals: slug } },
    limit: 1,
  });
  const post = docs[0];
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const payload = await getPayload({ config });

  const [{ docs: postDocs }, { docs: relatedDocs }] = await Promise.all([
    payload.find({
      collection: "blogs",
      where: { slug: { equals: slug } },
      depth: 1,
      limit: 1,
    }),
    payload.find({
      collection: "blogs",
      where: { slug: { not_equals: slug } },
      depth: 1,
      sort: "-date",
      limit: 2,
    }),
  ]);

  const rawPost = postDocs[0];
  if (!rawPost) notFound();

  const post: BlogPost = {
    slug: rawPost.slug,
    title: rawPost.title,
    excerpt: rawPost.excerpt,
    coverImage: getImageUrl(rawPost.coverImage, FALLBACK_IMAGE),
    date: rawPost.date,
    readingTime: rawPost.readingTime ?? 5,
    content: rawPost.content,
    tags: rawPost.tags?.map((t) => t.tag) ?? [],
  };

  const related: BlogPost[] = relatedDocs.map((p) => ({
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    coverImage: getImageUrl(p.coverImage, FALLBACK_IMAGE),
    date: p.date,
    readingTime: p.readingTime ?? 5,
    content: p.content,
    tags: p.tags?.map((t) => t.tag) ?? [],
  }));

  return (
    <>
      {/* Hero */}
      <div className="relative h-[50vh] min-h-[400px] overflow-hidden">
        <Image
          src={post.coverImage}
          alt={post.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <div className="absolute inset-0 flex items-end pb-12">
          <div className="max-w-4xl mx-auto px-4 md:px-8 w-full">
            <Link
              href="/blog"
              className="inline-flex items-center gap-1 text-green-300 text-sm mb-4 hover:text-white transition-colors"
            >
              <ArrowLeft size={16} /> Natrag na blog
            </Link>
            <h1 className="text-3xl md:text-5xl font-bold text-white font-[family-name:var(--font-heading)] mb-4">
              {post.title}
            </h1>
            <div className="flex items-center gap-4 text-white/70 text-sm">
              <span className="flex items-center gap-1">
                <Calendar size={14} /> {formatDate(post.date)}
              </span>
              <span className="flex items-center gap-1">
                <Clock size={14} /> {post.readingTime} min čitanja
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <article className="max-w-3xl mx-auto px-4 md:px-8 py-12 md:py-16">
        <div className="flex flex-wrap gap-2 mb-8">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="text-sm bg-green-50 text-green-700 px-3 py-1.5 rounded-full font-medium"
            >
              {tag}
            </span>
          ))}
        </div>

        <BlogPostContent content={post.content} />
      </article>

      {/* Related posts */}
      {related.length > 0 && (
        <section className="py-16 bg-earth-100/50 px-4 md:px-8">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold text-green-900 mb-8 font-[family-name:var(--font-heading)] text-center">
              Povezani članci
            </h2>
            <BlogRelatedPosts posts={related} />
          </div>
        </section>
      )}
    </>
  );
}
