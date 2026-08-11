const parseDate = (dateString: string) => {
  const raw = dateString.trim();
  const hasTimezone = /Z$|[+-]\d{2}:?\d{2}$/.test(raw);
  if (hasTimezone) return new Date(raw);
  return new Date(`${raw.replace(" ", "T")}Z`);
};

export const formatDateInUserZone = (
  dateString: string,
  options?: {
    month?: "short" | "long" | "numeric";
    includeSeconds?: boolean;
    dateOnly?: boolean;
  },
) => {
  const date = parseDate(dateString);
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  if (options?.dateOnly) {
    return date.toLocaleDateString("en-US", {
      timeZone,
      year: "numeric",
      month: options.month ?? "short",
      day: "numeric",
    });
  }

  const formatted = date.toLocaleString("en-US", {
    timeZone,
    year: "numeric",
    month: options?.month ?? "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    ...(options?.includeSeconds ? { second: "2-digit" as const } : {}),
  });
  const zoneName =
    new Intl.DateTimeFormat("en-US", { timeZone, timeZoneName: "short" })
      .formatToParts(date)
      .find((part) => part.type === "timeZoneName")?.value ?? timeZone;
  return `${formatted} (${zoneName})`;
};
