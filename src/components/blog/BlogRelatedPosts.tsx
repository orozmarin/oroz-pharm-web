"use client";

import { useInView } from "@/lib/useInView";
import { blogPosts } from "@/data/blogs";
import BlogCard from "./BlogCard";

interface Props {
  posts: typeof blogPosts;
}

export default function BlogRelatedPosts({ posts }: Props) {
  const ref = useInView<HTMLDivElement>();

  return (
    <div ref={ref} className="stagger-children grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
      {posts.map((post) => (
        <BlogCard key={post.slug} post={post} />
      ))}
    </div>
  );
}
