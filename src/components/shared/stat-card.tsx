import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: { value: number; label: string };
  color?: "blue" | "amber" | "emerald" | "rose" | "purple" | "cyan";
}

const colorMap = {
  blue: {
    gradient: "from-blue-500 to-blue-600",
    bg: "bg-blue-500/10",
    icon: "text-blue-600",
    border: "border-blue-100 dark:border-blue-500/20",
  },
  amber: {
    gradient: "from-amber-500 to-orange-500",
    bg: "bg-amber-500/10",
    icon: "text-amber-600",
    border: "border-amber-100 dark:border-amber-500/20",
  },
  emerald: {
    gradient: "from-emerald-500 to-teal-500",
    bg: "bg-emerald-500/10",
    icon: "text-emerald-600",
    border: "border-emerald-100 dark:border-emerald-500/20",
  },
  rose: {
    gradient: "from-rose-500 to-pink-500",
    bg: "bg-rose-500/10",
    icon: "text-rose-600",
    border: "border-rose-100 dark:border-rose-500/20",
  },
  purple: {
    gradient: "from-purple-500 to-violet-500",
    bg: "bg-purple-500/10",
    icon: "text-purple-600",
    border: "border-purple-100 dark:border-purple-500/20",
  },
  cyan: {
    gradient: "from-cyan-500 to-sky-500",
    bg: "bg-cyan-500/10",
    icon: "text-cyan-600",
    border: "border-cyan-100 dark:border-cyan-500/20",
  },
};

export function StatCard({
  label,
  value,
  icon: Icon,
  description,
  trend,
  color = "blue",
}: StatCardProps) {
  const colors = colorMap[color];

  return (
    <div className="relative overflow-hidden rounded-xl border bg-card p-5 shadow-sm transition-all hover:shadow-md">
      {/* Subtle gradient accent at top */}
      <div className={cn("absolute inset-x-0 top-0 h-1 bg-gradient-to-r", colors.gradient)} />
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <p className="text-2xl font-bold tracking-tight">{value}</p>
        </div>
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
            colors.bg
          )}
        >
          <Icon className={cn("h-5 w-5", colors.icon)} />
        </div>
      </div>
      {(description || trend) && (
        <div className="mt-3 flex items-center gap-2">
          {trend && (
            <span
              className={cn(
                "text-xs font-semibold",
                trend.value >= 0 ? "text-emerald-600" : "text-rose-600"
              )}
            >
              {trend.value >= 0 ? "+" : ""}
              {trend.value}%
            </span>
          )}
          {description && (
            <span className="text-xs text-muted-foreground">{description}</span>
          )}
        </div>
      )}
    </div>
  );
}
