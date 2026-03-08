"use client";

import { useState } from "react";
import { createCheckoutSession, createBillingPortalSession } from "@/lib/stripe/actions";

interface Plan {
  id: string;
  name: string;
  slug: string;
  maxUsers: number | null;
  maxCases: number | null;
  maxStorageMb: number | null;
  monthlyPrice: string | null;
  currency: string;
  description: string | null;
}

interface SubscriptionActionsProps {
  hasSubscription: boolean;
  currentPlanSlug: string | null;
  availablePlans: Plan[];
}

export function SubscriptionActions({
  hasSubscription,
  currentPlanSlug,
  availablePlans,
}: SubscriptionActionsProps) {
  const [loading, setLoading] = useState<string | null>(null);

  async function handleUpgrade(planSlug: string) {
    setLoading(planSlug);
    try {
      const result = await createCheckoutSession(planSlug);
      if (result?.data?.url) {
        window.location.href = result.data.url;
      } else if (result?.error) {
        alert(result.error);
      }
    } catch {
      alert("Failed to create checkout session.");
    } finally {
      setLoading(null);
    }
  }

  async function handleManageBilling() {
    setLoading("portal");
    try {
      const result = await createBillingPortalSession();
      if (result?.data?.url) {
        window.location.href = result.data.url;
      } else if (result?.error) {
        alert(result.error);
      }
    } catch {
      alert("Failed to open billing portal.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Manage Billing */}
      {hasSubscription && (
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h3 className="font-semibold">Billing</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your payment method, view invoices, and update billing details.
          </p>
          <button
            onClick={handleManageBilling}
            disabled={loading === "portal"}
            className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {loading === "portal" ? "Opening..." : "Manage Billing"}
          </button>
        </div>
      )}

      {/* Available Plans */}
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <h3 className="font-semibold">{hasSubscription ? "Change Plan" : "Choose a Plan"}</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {availablePlans.map((plan) => {
            const isCurrent = plan.slug === currentPlanSlug;
            return (
              <div
                key={plan.id}
                className={`rounded-lg border p-4 ${
                  isCurrent ? "border-primary bg-primary/5" : ""
                }`}
              >
                <h4 className="font-semibold">{plan.name}</h4>
                {plan.description && (
                  <p className="mt-1 text-xs text-muted-foreground">{plan.description}</p>
                )}
                <p className="mt-2 text-xl font-bold">
                  {plan.currency} {Number(plan.monthlyPrice ?? 0).toLocaleString()}
                  <span className="text-sm font-normal text-muted-foreground">/mo</span>
                </p>
                <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
                  <li>{plan.maxUsers ?? "Unlimited"} users</li>
                  <li>{plan.maxCases ? plan.maxCases.toLocaleString() : "Unlimited"} cases</li>
                  <li>
                    {plan.maxStorageMb
                      ? `${(plan.maxStorageMb / 1024).toFixed(0)} GB storage`
                      : "Unlimited storage"}
                  </li>
                </ul>
                {isCurrent ? (
                  <button
                    disabled
                    className="mt-4 w-full rounded-lg border px-3 py-1.5 text-xs font-medium text-muted-foreground"
                  >
                    Current Plan
                  </button>
                ) : (
                  <button
                    onClick={() => handleUpgrade(plan.slug)}
                    disabled={loading === plan.slug}
                    className="mt-4 w-full rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                  >
                    {loading === plan.slug ? "Processing..." : "Select Plan"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
