import { useEffect, useRef, useState } from "react";

interface AnimatedNumberProps {
  value: number | string;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

const AnimatedNumber = ({
  value,
  duration = 800,
  decimals = 0,
  prefix = "",
  suffix = "",
  className,
}: AnimatedNumberProps) => {
  const [display, setDisplay] = useState<string>(
    typeof value === "string" ? value : `${prefix}0${suffix}`,
  );
  const rafRef = useRef<number>(0);
  const startRef = useRef<number | null>(null);
  const fromRef = useRef(0);

  useEffect(() => {
    if (typeof value === "string") {
      setDisplay(value);
      return;
    }

    const target = Number(value);
    const from = fromRef.current;
    const diff = target - from;

    if (diff === 0) {
      setDisplay(`${prefix}${target.toLocaleString()}${suffix}`);
      return;
    }

    startRef.current = null;

    const step = (timestamp: number) => {
      if (startRef.current === null) startRef.current = timestamp;
      const elapsed = timestamp - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = from + diff * eased;

      setDisplay(
        `${prefix}${current.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}${suffix}`,
      );

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        fromRef.current = target;
      }
    };

    rafRef.current = requestAnimationFrame(step);

    return () => cancelAnimationFrame(rafRef.current);
  }, [value, duration, decimals, prefix, suffix]);

  return <span className={className}>{display}</span>;
};

export { AnimatedNumber };
export default AnimatedNumber;
