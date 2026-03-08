import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getRevenueMetrics } from "@/lib/queries/admin";
import { DollarSign, TrendingUp, TrendingDown, BarChart3 } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Revenue - Platform Admin",
};

export default async function RevenuePage() {
  const metrics = await getRevenueMetrics();

  const growth =
    metrics.newOrgsLastMonth > 0
      ? Math.round(
          ((metrics.newOrgsThisMonth - metrics.newOrgsLastMonth) /
            metrics.newOrgsLastMonth) *
            100
        )
      : metrics.newOrgsThisMonth > 0
        ? 100
        : 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Revenue</h2>
        <p className="text-muted-foreground">Platform revenue metrics and growth analytics.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">MRR</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat("en-US", { style: "currency", currency: "KES" }).format(metrics.mrr)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Orgs (This Month)</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.newOrgsThisMonth}</div>
            {growth !== 0 && (
              <p className={`text-xs ${growth > 0 ? "text-green-600" : "text-red-600"}`}>
                {growth > 0 ? "+" : ""}
                {growth}% vs last month
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Churn (This Month)</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.churnThisMonth}</div>
            <p className="text-xs text-muted-foreground">cancelled subscriptions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Plans</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.planDistribution.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Plan Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          {metrics.planDistribution.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No active subscriptions.</p>
          ) : (
            <div className="space-y-4">
              {metrics.planDistribution.map((pd) => {
                const total = metrics.planDistribution.reduce((s, d) => s + d.count, 0);
                const percentage = total > 0 ? Math.round((pd.count / total) * 100) : 0;
                return (
                  <div key={pd.planSlug} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{pd.planName}</span>
                      <span className="text-muted-foreground">
                        {pd.count} subscriber{pd.count !== 1 ? "s" : ""} ({percentage}%)
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-muted">
                      <div
                        className="h-2 rounded-full bg-primary"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
