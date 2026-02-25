"use client";

import { useInView } from "@/lib/useInView";
import type { BlogPost } from "@/types/views";
import BlogCard from "./BlogCard";

interface Props {
  posts: BlogPost[];
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
