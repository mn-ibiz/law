"use client";

import { useState, useCallback } from "react";
import { signupAction } from "@/lib/actions/onboarding";
import { Check, Loader2, Building2, User, CreditCard, CheckCircle } from "lucide-react";
import { siteConfig } from "@/lib/config/site";

const BASE_DOMAIN = new URL(siteConfig.url).hostname;

interface Plan {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  maxUsers: number | null;
  maxCases: number | null;
  maxStorageMb: number | null;
  monthlyPrice: string | null;
  currency: string;
  trialDays: number;
}

interface SignupWizardProps {
  plans: Plan[];
}

const STEPS = ["Firm Details", "Admin Account", "Select Plan", "Review"];

const COUNTRIES = [
  { code: "KE", name: "Kenya", currency: "KES", locale: "en-KE", timezone: "Africa/Nairobi" },
  { code: "UG", name: "Uganda", currency: "UGX", locale: "en-UG", timezone: "Africa/Kampala" },
  { code: "TZ", name: "Tanzania", currency: "TZS", locale: "en-TZ", timezone: "Africa/Dar_es_Salaam" },
  { code: "NG", name: "Nigeria", currency: "NGN", locale: "en-NG", timezone: "Africa/Lagos" },
  { code: "GH", name: "Ghana", currency: "GHS", locale: "en-GH", timezone: "Africa/Accra" },
  { code: "ZA", name: "South Africa", currency: "ZAR", locale: "en-ZA", timezone: "Africa/Johannesburg" },
  { code: "RW", name: "Rwanda", currency: "RWF", locale: "en-RW", timezone: "Africa/Kigali" },
  { code: "GB", name: "United Kingdom", currency: "GBP", locale: "en-GB", timezone: "Europe/London" },
  { code: "US", name: "United States", currency: "USD", locale: "en-US", timezone: "America/New_York" },
];

export function SignupWizard({ plans }: SignupWizardProps) {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slugStatus, setSlugStatus] = useState<{ checking: boolean; valid?: boolean; error?: string }>({ checking: false });

  const [form, setForm] = useState({
    firmName: "",
    slug: "",
    country: "KE",
    currency: "KES",
    timezone: "Africa/Nairobi",
    locale: "en-KE",
    adminName: "",
    adminEmail: "",
    adminPassword: "",
    adminPhone: "",
    planSlug: plans[0]?.slug ?? "starter",
  });

  const update = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleCountryChange = (code: string) => {
    const c = COUNTRIES.find((c) => c.code === code);
    if (c) {
      setForm((prev) => ({
        ...prev,
        country: c.code,
        currency: c.currency,
        locale: c.locale,
        timezone: c.timezone,
      }));
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 50);
  };

  const handleFirmNameChange = (name: string) => {
    update("firmName", name);
    const slug = generateSlug(name);
    update("slug", slug);
    if (slug.length >= 3) checkSlug(slug);
  };

  const checkSlug = useCallback(async (slug: string) => {
    if (slug.length < 3) return;
    setSlugStatus({ checking: true });
    try {
      const res = await fetch(`/api/check-slug?slug=${encodeURIComponent(slug)}`);
      const data = await res.json();
      setSlugStatus({ checking: false, valid: data.valid, error: data.error });
    } catch {
      setSlugStatus({ checking: false, valid: false, error: "Failed to check availability." });
    }
  }, []);

  const canAdvance = () => {
    switch (step) {
      case 0: return form.firmName.length >= 2 && form.slug.length >= 3 && slugStatus.valid === true;
      case 1: return form.adminName.length >= 2 && form.adminEmail.includes("@") && form.adminPassword.length >= 8;
      case 2: return !!form.planSlug;
      default: return true;
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await signupAction(form);
      if (result && "error" in result && result.error) {
        setError(result.error as string);
      } else if (result && "success" in result && result.success) {
        setStep(4); // Success state
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const selectedPlan = plans.find((p) => p.slug === form.planSlug);

  if (step === 4) {
    return (
      <div className="rounded-xl border bg-card p-8 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="mt-4 text-xl font-bold">Your firm is ready!</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          We&apos;ve sent a welcome email to <strong>{form.adminEmail}</strong> with your login details.
        </p>
        <div className="mt-4 rounded-lg bg-muted p-4">
          <p className="text-sm font-medium">Your firm URL:</p>
          <a
            href={`https://${form.slug}.${BASE_DOMAIN}/login`}
            className="text-lg font-semibold text-primary hover:underline"
          >
            {form.slug}.{BASE_DOMAIN}
          </a>
        </div>
        <a
          href={`https://${form.slug}.${BASE_DOMAIN}/login`}
          className="mt-6 inline-block rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Go to Login
        </a>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card shadow-sm">
      {/* Step indicator */}
      <div className="flex border-b px-6 py-4">
        {STEPS.map((label, i) => (
          <div key={label} className="flex flex-1 items-center gap-2">
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium ${
                i < step
                  ? "bg-primary text-primary-foreground"
                  : i === step
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}
            </div>
            <span className={`hidden text-xs sm:inline ${i === step ? "font-medium" : "text-muted-foreground"}`}>
              {label}
            </span>
          </div>
        ))}
      </div>

      <div className="p-6">
        {error && (
          <div className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
        )}

        {/* Step 0: Firm Details */}
        {step === 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <Building2 className="h-5 w-5" /> Firm Details
            </div>
            <div>
              <label className="text-sm font-medium">Firm Name *</label>
              <input
                type="text"
                value={form.firmName}
                onChange={(e) => handleFirmNameChange(e.target.value)}
                className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Acme Law Associates"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Subdomain *</label>
              <div className="mt-1 flex items-center">
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => {
                    const s = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "");
                    update("slug", s);
                    if (s.length >= 3) checkSlug(s);
                  }}
                  className="w-full rounded-l-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="acme-law"
                />
                <span className="rounded-r-lg border border-l-0 bg-muted px-3 py-2 text-sm text-muted-foreground">
                  .{BASE_DOMAIN}
                </span>
              </div>
              {slugStatus.checking && <p className="mt-1 text-xs text-muted-foreground">Checking availability...</p>}
              {!slugStatus.checking && slugStatus.valid === true && (
                <p className="mt-1 text-xs text-green-600">This subdomain is available!</p>
              )}
              {!slugStatus.checking && slugStatus.error && (
                <p className="mt-1 text-xs text-destructive">{slugStatus.error}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium">Country *</label>
              <select
                value={form.country}
                onChange={(e) => handleCountryChange(e.target.value)}
                className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Step 1: Admin Account */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <User className="h-5 w-5" /> Admin Account
            </div>
            <div>
              <label className="text-sm font-medium">Full Name *</label>
              <input
                type="text"
                value={form.adminName}
                onChange={(e) => update("adminName", e.target.value)}
                className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Email *</label>
              <input
                type="email"
                value={form.adminEmail}
                onChange={(e) => update("adminEmail", e.target.value)}
                className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="john@acmelaw.co.ke"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Password *</label>
              <input
                type="password"
                value={form.adminPassword}
                onChange={(e) => update("adminPassword", e.target.value)}
                className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Minimum 8 characters"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Phone</label>
              <input
                type="tel"
                value={form.adminPhone}
                onChange={(e) => update("adminPhone", e.target.value)}
                className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="+254 7XX XXX XXX"
              />
            </div>
          </div>
        )}

        {/* Step 2: Plan Selection */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <CreditCard className="h-5 w-5" /> Select a Plan
            </div>
            <p className="text-sm text-muted-foreground">
              Start with a {plans[0]?.trialDays ?? 14}-day free trial. No credit card required.
            </p>
            <div className="grid gap-3 md:grid-cols-3">
              {plans.map((plan) => (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => update("planSlug", plan.slug)}
                  className={`rounded-lg border p-4 text-left transition-all ${
                    form.planSlug === plan.slug
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "hover:border-primary/50"
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
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <CheckCircle className="h-5 w-5" /> Review & Create
            </div>
            <div className="rounded-lg bg-muted/50 p-4 text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Firm</span>
                <span className="font-medium">{form.firmName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subdomain</span>
                <span className="font-medium">{form.slug}.{BASE_DOMAIN}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Country</span>
                <span className="font-medium">{COUNTRIES.find((c) => c.code === form.country)?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Admin</span>
                <span className="font-medium">{form.adminName} ({form.adminEmail})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Plan</span>
                <span className="font-medium">
                  {selectedPlan?.name} — {selectedPlan?.trialDays}-day free trial
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-6 flex justify-between">
          <button
            type="button"
            onClick={() => setStep(step - 1)}
            disabled={step === 0}
            className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted disabled:invisible"
          >
            Back
          </button>
          {step < 3 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              disabled={!canAdvance()}
              className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              Continue
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Creating...
                </span>
              ) : (
                "Create My Firm"
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
