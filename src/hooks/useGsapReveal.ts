import { useEffect, useRef } from "react";
import gsap from "gsap";

interface RevealOptions {
  y?: number;
  x?: number;
  opacity?: number;
  duration?: number;
  delay?: number;
  ease?: string;
  stagger?: number;
}

export const useGsapReveal = <T extends HTMLElement = HTMLDivElement>(
  enabled = true,
  options: RevealOptions = {},
) => {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!enabled || !ref.current) return;

    const el = ref.current;
    const children = el.children;

    if (options.stagger && children.length > 0) {
      gsap.set(children, {
        y: options.y ?? 30,
        x: options.x ?? 0,
        opacity: options.opacity ?? 0,
      });

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              gsap.to(children, {
                y: 0,
                x: 0,
                opacity: 1,
                duration: options.duration ?? 0.5,
                stagger: options.stagger ?? 0.07,
                delay: options.delay ?? 0,
                ease: options.ease ?? "power3.out",
              });
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1 },
      );

      observer.observe(el);
      return () => observer.disconnect();
    }

    gsap.set(el, {
      y: options.y ?? 30,
      x: options.x ?? 0,
      opacity: options.opacity ?? 0,
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            gsap.to(el, {
              y: 0,
              x: 0,
              opacity: 1,
              duration: options.duration ?? 0.5,
              delay: options.delay ?? 0,
              ease: options.ease ?? "power3.out",
            });
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [enabled, options.y, options.x, options.opacity, options.duration, options.delay, options.ease, options.stagger]);

  return ref;
};
