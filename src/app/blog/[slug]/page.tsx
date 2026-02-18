import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { blogPosts } from "@/data/blogs";
import { formatDate } from "@/lib/utils";
import BlogPostContent from "@/components/blog/BlogPostContent";
import BlogRelatedPosts from "@/components/blog/BlogRelatedPosts";
import { ArrowLeft, Clock, Calendar } from "lucide-react";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) notFound();

  const related = blogPosts.filter((p) => p.slug !== post.slug).slice(0, 2);

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
            <span key={tag} className="text-sm bg-green-50 text-green-700 px-3 py-1.5 rounded-full font-medium">
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
