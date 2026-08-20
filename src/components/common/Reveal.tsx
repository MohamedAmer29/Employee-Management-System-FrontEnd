import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";

interface RevealProps {
  children: ReactNode;
  className?: string;
  y?: number;
  delay?: number;
  duration?: number;
  stagger?: boolean;
  staggerInterval?: number;
}

const Reveal = ({
  children,
  className,
  y = 28,
  delay = 0,
  duration = 0.5,
  stagger = false,
  staggerInterval = 0.07,
}: RevealProps) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const targets = stagger ? Array.from(el.children) : el;

    gsap.set(targets, { y, opacity: 0 });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            gsap.to(targets, {
              y: 0,
              opacity: 1,
              duration,
              stagger: stagger ? staggerInterval : 0,
              delay,
              ease: "power3.out",
            });
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [y, delay, duration, stagger, staggerInterval]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
};

export default Reveal;
