import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPlansWithCounts } from "@/lib/queries/admin";
import { PlanEditor } from "@/components/admin/plan-editor";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Plans - Platform Admin",
};

export default async function PlansPage() {
  const plans = await getPlansWithCounts();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Plans</h2>
          <p className="text-muted-foreground">Manage subscription plan tiers and pricing.</p>
        </div>
        <PlanEditor mode="create" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{plan.name}</CardTitle>
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                    plan.isActive
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {plan.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              {plan.description && (
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              )}
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Monthly</span>
                  <span className="font-medium">
                    {plan.monthlyPrice
                      ? `${plan.currency} ${parseFloat(plan.monthlyPrice).toLocaleString()}`
                      : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Annual</span>
                  <span className="font-medium">
                    {plan.annualPrice
                      ? `${plan.currency} ${parseFloat(plan.annualPrice).toLocaleString()}`
                      : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Max Users</span>
                  <span>{plan.maxUsers ?? "Unlimited"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Max Cases</span>
                  <span>{plan.maxCases ?? "Unlimited"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Storage</span>
                  <span>
                    {plan.maxStorageMb
                      ? plan.maxStorageMb >= 1024
                        ? `${Math.round(plan.maxStorageMb / 1024)} GB`
                        : `${plan.maxStorageMb} MB`
                      : "Unlimited"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Trial</span>
                  <span>{plan.trialDays} days</span>
                </div>
              </div>

              <div className="border-t pt-3 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {plan.subscriberCount} subscriber{plan.subscriberCount !== 1 ? "s" : ""}
                </span>
                <PlanEditor mode="edit" plan={plan} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
