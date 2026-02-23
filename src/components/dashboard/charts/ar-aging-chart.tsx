"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatKES } from "@/lib/utils/format";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface ARAgingChartProps {
  data: { bucket: string; total: number; count: number }[];
}

const bucketLabels: Record<string, string> = {
  current: "Current",
  "1-30": "1-30 days",
  "31-60": "31-60 days",
  "61-90": "61-90 days",
  "90+": "90+ days",
};

const bucketColors = ["#3b82f6", "#f59e0b", "#f97316", "#ef4444", "#dc2626"];

export function ARAgingChart({ data }: ARAgingChartProps) {
  const totalOutstanding = data.reduce((sum, d) => sum + d.total, 0);
  const chartData = data.map((d) => ({
    ...d,
    name: bucketLabels[d.bucket] ?? d.bucket,
  }));

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">Accounts Receivable Aging</CardTitle>
            <CardDescription className="text-xs">
              Total outstanding: {formatKES(totalOutstanding)}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {totalOutstanding === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">No outstanding receivables.</p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis
                tick={{ fontSize: 11 }}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`}
              />
              <Tooltip
                formatter={(value: number) => formatKES(value)}
                labelStyle={{ fontWeight: 600 }}
              />
              <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                {chartData.map((_, i) => (
                  <Cell key={i} fill={bucketColors[i]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
