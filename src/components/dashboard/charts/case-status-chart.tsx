"use client";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const STATUS_COLORS: Record<string, string> = {
  open: "#3b82f6",
  in_progress: "#f59e0b",
  hearing: "#8b5cf6",
  resolved: "#22c55e",
  closed: "#6b7280",
  appeal: "#ef4444",
};

interface CaseStatusChartProps {
  data: { status: string; count: number }[];
}

export function CaseStatusChart({ data }: CaseStatusChartProps) {
  const chartData = data.map((d) => ({
    name: d.status.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    value: d.count,
    status: d.status,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Cases by Status</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <p className="text-sm text-muted-foreground py-12 text-center">
            No cases yet
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry) => (
                  <Cell
                    key={entry.status}
                    fill={STATUS_COLORS[entry.status] ?? "#94a3b8"}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
