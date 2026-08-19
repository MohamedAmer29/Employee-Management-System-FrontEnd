import { type ReactNode } from "react";
import { motion } from "motion/react";

export const RevealChild = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => (
  <motion.div
    className={className}
    variants={{
      hidden: { opacity: 0, y: 24 },
      visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] },
      },
    }}
  >
    {children}
  </motion.div>
);
