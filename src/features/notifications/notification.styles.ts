import {
  CheckCircle2,
  Info,
  AlertTriangle,
  Megaphone,
  type LucideIcon,
} from "lucide-react";

export const typeStyles: Record<string, { icon: LucideIcon; className: string }> = {
  SYSTEM: {
    icon: Info,
    className: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
  },
  INFO: {
    icon: Info,
    className: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
  },
  WARNING: {
    icon: AlertTriangle,
    className:
      "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  },
  SUCCESS: {
    icon: CheckCircle2,
    className:
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
  ERROR: {
    icon: AlertTriangle,
    className: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
  },
};

export const getTypeStyle = (type: string) =>
  typeStyles[type] || {
    icon: Megaphone,
    className:
      "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  };
