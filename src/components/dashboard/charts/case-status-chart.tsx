"use client";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatEnum } from "@/lib/utils/format-enum";
import { PieChart as PieChartIcon } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  open: "#3b82f6",
  in_progress: "#f59e0b",
  hearing: "#8b5cf6",
  resolved: "#22c55e",
  closed: "#94a3b8",
  appeal: "#ef4444",
};

interface CaseStatusChartProps {
  data: { status: string; count: number }[];
}

export function CaseStatusChart({ data }: CaseStatusChartProps) {
  const chartData = data.map((d) => ({
    name: formatEnum(d.status),
    value: d.count,
    status: d.status,
  }));

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">Cases by Status</CardTitle>
            <CardDescription className="text-xs">Current distribution</CardDescription>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
            <PieChartIcon className="h-4 w-4 text-blue-600" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <p className="text-sm text-muted-foreground py-12 text-center">
            No cases yet
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
                strokeWidth={2}
                stroke="#fff"
              >
                {chartData.map((entry) => (
                  <Cell
                    key={entry.status}
                    fill={STATUS_COLORS[entry.status] ?? "#94a3b8"}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid #e5e7eb",
                  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                }}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: "12px" }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
