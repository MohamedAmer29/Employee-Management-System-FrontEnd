import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  hint?: string;
  accentClass?: string;
}

const StatCard = ({
  icon: Icon,
  label,
  value,
  hint,
  accentClass = "bg-primary/10 text-primary",
}: StatCardProps) => {
  return (
    <div className="rounded-2xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
            {label}
          </p>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-50">
            {value}
          </p>
          {hint && (
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">{hint}</p>
          )}
        </div>
        <span
          className={`flex items-center justify-center h-11 w-11 rounded-xl shrink-0 ${accentClass}`}
        >
          <Icon className="w-5 h-5" aria-hidden="true" />
        </span>
      </div>
    </div>
  );
};

export default StatCard;
