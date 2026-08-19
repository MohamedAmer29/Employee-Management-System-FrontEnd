import { type ReactNode } from "react";
import { motion, type Variants } from "motion/react";

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  y?: number;
  x?: number;
  scale?: number;
  once?: boolean;
  /** Use as a stagger parent — applies variants to children automatically */
  stagger?: boolean;
  staggerInterval?: number;
}

const singleVariants = (
  y: number,
  x: number,
  scale: number,
): Variants => ({
  hidden: { opacity: 0, y, x, scale },
  visible: { opacity: 1, y: 0, x: 0, scale: 1 },
});

const staggerParentVariants = (interval: number): Variants => ({
  hidden: {},
  visible: {
    transition: {
      staggerChildren: interval,
    },
  },
});

const Reveal = ({
  children,
  className,
  delay = 0,
  duration = 0.5,
  y = 28,
  x = 0,
  scale = 1,
  once = true,
  stagger = false,
  staggerInterval = 0.07,
}: RevealProps) => {
  if (stagger) {
    return (
      <motion.div
        className={className}
        variants={staggerParentVariants(staggerInterval)}
        initial="hidden"
        whileInView="visible"
        viewport={{ once, margin: "-40px" }}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      className={className}
      variants={singleVariants(y, x, scale)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: "-40px" }}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
    >
      {children}
    </motion.div>
  );
};

export default Reveal;
