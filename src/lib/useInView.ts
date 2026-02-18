"use client";

import { useEffect, useRef } from "react";

/**
 * Lightweight IntersectionObserver hook that adds the `is-visible` class
 * to the element when it enters the viewport. Fires once, then disconnects.
 */
export function useInView<T extends HTMLElement = HTMLDivElement>(
  margin = "-80px",
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("is-visible");

          // Also mark stagger children as visible with stagger index
          const children = el.querySelectorAll(":scope > .animate-on-scroll");
          children.forEach((child, i) => {
            (child as HTMLElement).style.setProperty(
              "--stagger-index",
              String(i),
            );
            // Small rAF delay so the browser batches transitions
            requestAnimationFrame(() => {
              child.classList.add("is-visible");
            });
          });

          observer.disconnect();
        }
      },
      { rootMargin: margin, threshold: 0 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [margin]);

  return ref;
}
