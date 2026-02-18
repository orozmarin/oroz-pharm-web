"use client";

import { useInView } from "@/lib/useInView";
import { cn } from "@/lib/utils";

interface Props {
  children: React.ReactNode;
  className?: string;
  animation?: "fade-in-up" | "slide-in-left" | "slide-in-right" | "scale-in";
}

const animClasses = {
  "fade-in-up": "anim-fade-in-up",
  "slide-in-left": "anim-slide-in-left",
  "slide-in-right": "anim-slide-in-right",
  "scale-in": "anim-scale-in",
};

export default function AnimatedSection({
  children,
  className,
  animation = "fade-in-up",
}: Props) {
  const ref = useInView<HTMLElement>();

  return (
    <section
      ref={ref}
      className={cn(
        "animate-on-scroll",
        animClasses[animation],
        "px-4 md:px-8 lg:px-16",
        className,
      )}
    >
      {children}
    </section>
  );
}
