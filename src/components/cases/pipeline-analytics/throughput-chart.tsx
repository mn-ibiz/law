"use client";

import { useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

interface RawRow {
  month: string;
  stageName: string;
  stageColor: string | null;
  count: number;
}

const COLORS = ["#3b82f6", "#8b5cf6", "#f59e0b", "#ec4899", "#14b8a6", "#f97316", "#22c55e", "#6366f1"];

interface Props {
  data: RawRow[];
}

export function ThroughputChart({ data }: Props) {
  const { chartData, stageNames } = useMemo(() => {
    const stages = new Set<string>();
    const byMonth = new Map<string, Record<string, number>>();

    for (const row of data) {
      stages.add(row.stageName);
      if (!byMonth.has(row.month)) {
        byMonth.set(row.month, {});
      }
      byMonth.get(row.month)![row.stageName] = row.count;
    }

    const stageNames = Array.from(stages);
    const chartData = Array.from(byMonth.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, counts]) => ({ month, ...counts }));

    return { chartData, stageNames };
  }, [data]);

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">
              Monthly Throughput
            </CardTitle>
            <CardDescription className="text-xs">
              Cases entering each stage per month
            </CardDescription>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <p className="text-sm text-muted-foreground py-12 text-center">
            No throughput data available
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis dataKey="month" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid #e5e7eb",
                  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                }}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              {stageNames.map((name, i) => (
                <Line
                  key={name}
                  type="monotone"
                  dataKey={name}
                  stroke={COLORS[i % COLORS.length]}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
