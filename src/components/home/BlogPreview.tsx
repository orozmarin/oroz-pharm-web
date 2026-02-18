"use client";

import Link from "next/link";
import Image from "next/image";
import { useInView } from "@/lib/useInView";
import { blogPosts } from "@/data/blogs";
import SectionHeading from "@/components/shared/SectionHeading";
import Button from "@/components/shared/Button";
import { formatDate } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

export default function BlogPreview() {
  const latestPosts = blogPosts.slice(0, 3);
  const ref = useInView<HTMLDivElement>();

  return (
    <section className="py-20 md:py-28 px-4 md:px-8">
      <SectionHeading
        title="Najnovije iz bloga"
        subtitle="Korisni savjeti i novosti iz svijeta poljoprivrede"
      />

      <div
        ref={ref}
        className="stagger-children max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8"
      >
        {latestPosts.map((post) => (
          <div key={post.slug} className="animate-on-scroll anim-fade-in-up">
            <Link
              href={`/blog/${post.slug}`}
              className="group block bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 border border-green-50"
            >
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={post.coverImage}
                  alt={post.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-4 left-4 bg-green-700 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                  {formatDate(post.date)}
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-bold text-green-900 text-lg mb-2 font-[family-name:var(--font-heading)] line-clamp-2 group-hover:text-green-700 transition-colors">
                  {post.title}
                </h3>
                <p className="text-gray-500 text-sm line-clamp-3 mb-4">
                  {post.excerpt}
                </p>
                <span className="text-green-700 text-sm font-medium inline-flex items-center gap-1 group-hover:gap-2 transition-[gap] duration-200">
                  Čitaj više <ArrowRight size={14} />
                </span>
              </div>
            </Link>
          </div>
        ))}
      </div>

      <div className="text-center mt-12">
        <Button href="/blog" variant="outline">
          Pogledaj sve objave
        </Button>
      </div>
    </section>
  );
}
