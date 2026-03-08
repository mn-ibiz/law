/**
 * Format a monetary amount using the given currency and locale.
 */
export function formatCurrency(amount: number, currency: string, locale: string): string {
  if (!Number.isFinite(amount)) return `${currency} 0`;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(n: number, locale = "en-KE"): string {
  return new Intl.NumberFormat(locale).format(n);
}

export function formatDate(
  date: Date | string | null | undefined,
  locale: string,
  options?: Intl.DateTimeFormatOptions,
): string {
  if (!date) return "\u2014";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString(locale, options ?? { month: "short", day: "numeric", year: "numeric" });
}

export function formatRelativeDate(date: Date | null | undefined, locale = "en-KE"): string {
  if (!date) return "\u2014";
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays === -1) return "Yesterday";
  if (diffDays > 0 && diffDays <= 7) return `in ${diffDays} days`;
  if (diffDays < 0 && diffDays >= -7) return `${Math.abs(diffDays)} days ago`;

  return date.toLocaleDateString(locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
