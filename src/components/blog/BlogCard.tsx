import Link from "next/link";
import Image from "next/image";
import { BlogPost } from "@/types/views";
import { ArrowRight, Clock } from "lucide-react";

interface Props {
  post: BlogPost;
  featured?: boolean;
}

export default function BlogCard({ post, featured }: Props) {
  const dateObj = new Date(post.date);
  const day = dateObj.getDate();
  const month = dateObj.toLocaleDateString("hr-HR", { month: "short" });

  if (featured) {
    return (
      <div className="animate-on-scroll anim-fade-in-up">
        <Link
          href={`/blog/${post.slug}`}
          className="group block rounded-2xl overflow-hidden bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 border border-green-50"
        >
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="relative h-64 md:h-full min-h-[300px] overflow-hidden">
              <Image
                src={post.coverImage}
                alt={post.title}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="p-8 md:p-10 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-10 h-10 rounded-full bg-green-700 text-white text-xs font-bold flex items-center justify-center leading-tight text-center">
                  {day}<br/>{month}
                </span>
                <span className="text-gray-400 text-sm flex items-center gap-1">
                  <Clock size={14} /> {post.readingTime} min čitanja
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-green-900 mb-3 font-[family-name:var(--font-heading)] group-hover:text-green-700 transition-colors">
                {post.title}
              </h2>
              <p className="text-gray-500 leading-relaxed mb-6">
                {post.excerpt}
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.map((tag) => (
                  <span key={tag} className="text-xs bg-green-50 text-green-700 px-3 py-1 rounded-full font-medium">
                    {tag}
                  </span>
                ))}
              </div>
              <span className="text-green-700 font-medium inline-flex items-center gap-1 group-hover:gap-2 transition-[gap] duration-200">
                Čitaj više <ArrowRight size={16} />
              </span>
            </div>
          </div>
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-on-scroll anim-fade-in-up">
      <Link
        href={`/blog/${post.slug}`}
        className="group block rounded-2xl overflow-hidden bg-white shadow-md hover:shadow-xl transition-shadow duration-300 border border-green-50 h-full"
      >
        <div className="relative h-52 overflow-hidden">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {/* Wax seal date badge */}
          <div className="absolute top-4 left-4 w-12 h-12 rounded-full bg-green-700 text-white text-xs font-bold flex flex-col items-center justify-center shadow-lg">
            <span className="text-base leading-none">{day}</span>
            <span className="text-[10px] uppercase leading-none mt-0.5">
              {month}
            </span>
          </div>
        </div>
        <div className="p-6">
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
            <Clock size={12} /> {post.readingTime} min čitanja
          </div>
          <h3 className="font-bold text-green-900 text-lg mb-2 font-[family-name:var(--font-heading)] line-clamp-2 group-hover:text-green-700 transition-colors">
            {post.title}
          </h3>
          <p className="text-gray-500 text-sm line-clamp-3 mb-4">
            {post.excerpt}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {post.tags.slice(0, 2).map((tag) => (
              <span key={tag} className="text-xs bg-green-50 text-green-700 px-2.5 py-1 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </Link>
    </div>
  );
}
