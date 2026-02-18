"use client";

import { useInView } from "@/lib/useInView";
import { blogPosts } from "@/data/blogs";
import BlogCard from "./BlogCard";
import SectionHeading from "@/components/shared/SectionHeading";
import { Leaf } from "lucide-react";

export default function BlogListClient() {
  const [featured, ...rest] = blogPosts;
  const featuredRef = useInView<HTMLDivElement>();
  const gridRef = useInView<HTMLDivElement>();

  return (
    <>
      {/* Hero */}
      <div className="bg-green-900 pt-32 pb-16 px-4 md:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <Leaf size={48} className="mx-auto text-green-400 mb-4" />
          <h1 className="text-4xl md:text-6xl font-bold text-white font-[family-name:var(--font-heading)] mb-3">
            Blog
          </h1>
          <p className="text-green-200 text-lg max-w-xl mx-auto">
            Savjeti, novosti i korisne informacije iz svijeta poljoprivrede
          </p>
        </div>
      </div>

      <section className="py-16 md:py-24 px-4 md:px-8 bg-earth-100/50">
        <div className="max-w-6xl mx-auto">
          {/* Featured post */}
          <div ref={featuredRef} className="stagger-children mb-12">
            <BlogCard post={featured} featured />
          </div>

          {/* Grid of remaining posts */}
          {rest.length > 0 && (
            <>
              <SectionHeading title="Starije objave" className="mt-8" />
              <div
                ref={gridRef}
                className="stagger-children grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                {rest.map((post) => (
                  <BlogCard key={post.slug} post={post} />
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}
