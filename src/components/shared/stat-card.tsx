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
    bg: "bg-blue-500/10",
    icon: "text-blue-600",
    trend: "text-blue-600",
  },
  amber: {
    bg: "bg-amber-500/10",
    icon: "text-amber-600",
    trend: "text-amber-600",
  },
  emerald: {
    bg: "bg-emerald-500/10",
    icon: "text-emerald-600",
    trend: "text-emerald-600",
  },
  rose: {
    bg: "bg-rose-500/10",
    icon: "text-rose-600",
    trend: "text-rose-600",
  },
  purple: {
    bg: "bg-purple-500/10",
    icon: "text-purple-600",
    trend: "text-purple-600",
  },
  cyan: {
    bg: "bg-cyan-500/10",
    icon: "text-cyan-600",
    trend: "text-cyan-600",
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
    <div className="rounded-xl border bg-card p-5 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <p className="text-2xl font-bold tracking-tight">{value}</p>
        </div>
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
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
