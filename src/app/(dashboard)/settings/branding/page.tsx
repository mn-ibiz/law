import { requireAdmin } from "@/lib/auth/get-session";
import { getFirmBranding } from "@/lib/queries/settings";
import { BrandingForm } from "@/components/settings/branding-form";
import { Paintbrush } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Branding Settings",
  description: "Customize firm branding and appearance",
};

export default async function BrandingSettingsPage() {
  await requireAdmin();
  const branding = await getFirmBranding();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Paintbrush className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Branding</h1>
          <p className="text-sm text-muted-foreground">
            Customize your firm&apos;s identity, colors, typography, and
            document appearance.
          </p>
        </div>
      </div>

      <BrandingForm initialData={branding} />
    </div>
  );
}
