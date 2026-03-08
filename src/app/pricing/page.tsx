import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Scale, ArrowRight } from "lucide-react";
import { siteConfig } from "@/lib/config/site";
import { getPublicPlans } from "@/lib/queries/plans";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing",
  description: `Simple, transparent pricing for ${siteConfig.name}. Start your free trial today.`,
};

function formatPrice(price: string | null, currency: string): string {
  if (!price) return "Free";
  const num = parseFloat(price);
  if (!Number.isFinite(num) || num === 0) return "Free";
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

function parsePlanFeatures(features: string | null): string[] {
  if (!features) return [];
  try {
    const parsed = JSON.parse(features);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default async function PricingPage() {
  const plans = await getPublicPlans();
  const trialDays = Math.max(...plans.map((p) => p.trialDays ?? 0), 14);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Scale className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold">{siteConfig.name}</span>
          </Link>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-16">
        {/* Hero */}
        <div className="mb-16 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Simple, Transparent Pricing
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Choose the plan that fits your firm. All plans include a{" "}
            {trialDays}-day free trial — no credit card required.
          </p>
        </div>

        {/* Plan Cards */}
        {plans.length === 0 ? (
          <p className="text-center text-muted-foreground">
            Plans are being configured. Please check back soon.
          </p>
        ) : (
          <div className={`grid gap-8 ${plans.length === 1 ? "max-w-md mx-auto" : plans.length === 2 ? "md:grid-cols-2 max-w-3xl mx-auto" : "md:grid-cols-3"}`}>
            {plans.map((plan, idx) => {
              // Middle plan highlighted as "Most Popular" in a 3-tier layout
              const isPopular = idx === 1 && plans.length === 3;
              const features = parsePlanFeatures(plan.features);

              return (
                <Card
                  key={plan.id}
                  className={`relative flex flex-col ${
                    isPopular ? "border-primary shadow-lg" : ""
                  }`}
                >
                  {isPopular && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                      Most Popular
                    </Badge>
                  )}
                  <CardHeader className="text-center">
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    {plan.description && (
                      <p className="text-sm text-muted-foreground">
                        {plan.description}
                      </p>
                    )}
                    <div className="mt-4">
                      <span className="text-4xl font-bold">
                        {formatPrice(plan.monthlyPrice, plan.currency)}
                      </span>
                      {plan.monthlyPrice &&
                        parseFloat(plan.monthlyPrice) > 0 && (
                          <span className="text-muted-foreground">/month</span>
                        )}
                    </div>
                    {plan.annualPrice &&
                      parseFloat(plan.annualPrice) > 0 && (
                        <p className="text-sm text-muted-foreground">
                          or {formatPrice(plan.annualPrice, plan.currency)}/year
                        </p>
                      )}
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col">
                    {/* Limits */}
                    <div className="mb-6 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Users</span>
                        <span className="font-medium">
                          {plan.maxUsers ?? "Unlimited"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Cases</span>
                        <span className="font-medium">
                          {plan.maxCases ?? "Unlimited"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Storage</span>
                        <span className="font-medium">
                          {plan.maxStorageMb
                            ? `${plan.maxStorageMb >= 1024 ? `${(plan.maxStorageMb / 1024).toFixed(0)} GB` : `${plan.maxStorageMb} MB`}`
                            : "Unlimited"}
                        </span>
                      </div>
                    </div>

                    {/* Features */}
                    {features.length > 0 && (
                      <ul className="mb-6 space-y-2">
                        {features.map((feature, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {/* CTA */}
                    <div className="mt-auto">
                      <Button
                        className="w-full gap-2"
                        variant={isPopular ? "default" : "outline"}
                        asChild
                      >
                        <Link href={`/signup?plan=${plan.slug}`}>
                          Start Free Trial
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* FAQ */}
        <div className="mx-auto mt-24 max-w-3xl">
          <h2 className="mb-8 text-center text-2xl font-bold">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {[
              {
                q: "How does the free trial work?",
                a: `Every plan includes a ${trialDays}-day free trial with full access to all features. No credit card required to start. You can upgrade, downgrade, or cancel at any time.`,
              },
              {
                q: "Can I change plans later?",
                a: "Yes. You can upgrade or downgrade your plan at any time from your account settings. Changes take effect at the start of your next billing period.",
              },
              {
                q: "Is my data secure?",
                a: "Absolutely. All data is encrypted at rest and in transit. Each organization's data is fully isolated. We follow industry best practices for security and compliance.",
              },
              {
                q: "Do you support M-Pesa payments?",
                a: "Yes. We support both card payments via Stripe and M-Pesa for Kenya-based firms.",
              },
              {
                q: "What happens when my trial ends?",
                a: "You'll be prompted to choose a plan and add payment details. If you don't, your account enters a grace period before being suspended. Your data is never deleted without notice.",
              },
            ].map(({ q, a }, i) => (
              <div key={i} className="rounded-lg border p-6">
                <h3 className="font-semibold">{q}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        <p>
          &copy; {new Date().getFullYear()} {siteConfig.name}. All rights
          reserved.
        </p>
      </footer>
    </div>
  );
}
