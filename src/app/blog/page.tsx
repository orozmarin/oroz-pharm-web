import type { Metadata } from "next";
import BlogListClient from "@/components/blog/BlogListClient";

export const metadata: Metadata = {
  title: "Blog",
  description: "Korisni savjeti i novosti iz svijeta poljoprivrede - proljetna gnojidba, zastita bilja, navodnjavanje i jos mnogo toga.",
};

export default function BlogPage() {
  return <BlogListClient />;
}
