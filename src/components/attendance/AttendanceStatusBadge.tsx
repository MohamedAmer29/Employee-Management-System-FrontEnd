interface AttendanceStatusBadgeProps {
  status: string;
}

const STATUS_STYLES: Record<string, string> = {
  PRESENT: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  ABSENT: "bg-red-500/10 text-red-600 dark:text-red-400",
  ON_LEAVE: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  LEAVE: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  LATE: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  WEEKEND: "bg-gray-500/10 text-gray-500 dark:text-gray-400",
  UPCOMING: "bg-gray-500/10 text-gray-500 dark:text-gray-400",
};

const normalize = (status: string) =>
  (status ?? "").toUpperCase().replace(/\s+/g, "_");

const DISPLAY: Record<string, string> = {
  PRESENT: "Present",
  ABSENT: "Absent",
  ON_LEAVE: "On leave",
  LEAVE: "On leave",
  LATE: "Late",
  WEEKEND: "Weekend",
  UPCOMING: "Upcoming",
};

export const AttendanceStatusBadge = ({
  status,
}: AttendanceStatusBadgeProps) => {
  const key = normalize(status);
  const style = STATUS_STYLES[key] ?? STATUS_STYLES.ABSENT;
  const label = DISPLAY[key] ?? (status || "Unknown");

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${style}`}
    >
      {label}
    </span>
  );
};