import { APP_LOCALE } from "@/lib/constants/locale";

export function formatKES(amount: number): string {
  if (!Number.isFinite(amount)) return "KES 0";
  return new Intl.NumberFormat(APP_LOCALE, {
    style: "currency",
    currency: "KES",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat(APP_LOCALE).format(n);
}

export function formatRelativeDate(date: Date | null | undefined): string {
  if (!date) return "\u2014";
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays === -1) return "Yesterday";
  if (diffDays > 0 && diffDays <= 7) return `in ${diffDays} days`;
  if (diffDays < 0 && diffDays >= -7) return `${Math.abs(diffDays)} days ago`;

  return date.toLocaleDateString(APP_LOCALE, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
