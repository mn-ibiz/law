"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { upsertFirmSetting } from "@/lib/actions/settings";
import { useRouter } from "next/navigation";
import { Scale } from "lucide-react";

interface BrandingFormProps {
  initialData: {
    logoUrl: string | null;
    firmName: string | null;
    primaryColor: string | null;
    accentColor: string | null;
  };
}

export function BrandingForm({ initialData }: BrandingFormProps) {
  const router = useRouter();
  const [logoUrl, setLogoUrl] = useState(initialData.logoUrl ?? "");
  const [firmName, setFirmName] = useState(initialData.firmName ?? "");
  const [primaryColor, setPrimaryColor] = useState(initialData.primaryColor ?? "#1e40af");
  const [accentColor, setAccentColor] = useState(initialData.accentColor ?? "#3b82f6");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await Promise.all([
        upsertFirmSetting({ key: "firm_logo_url", value: logoUrl, description: "Firm logo URL" }),
        upsertFirmSetting({ key: "firm_name", value: firmName, description: "Firm display name" }),
        upsertFirmSetting({ key: "firm_primary_color", value: primaryColor, description: "Primary brand color" }),
        upsertFirmSetting({ key: "firm_accent_color", value: accentColor, description: "Accent brand color" }),
      ]);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Firm Identity</CardTitle>
          <CardDescription>Set your firm name and logo</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="firmName">Firm Name</Label>
            <Input
              id="firmName"
              value={firmName}
              onChange={(e) => setFirmName(e.target.value)}
              placeholder="Enter firm name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="logoUrl">Logo URL</Label>
            <Input
              id="logoUrl"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="https://example.com/logo.png"
            />
            <p className="text-xs text-muted-foreground">
              Enter a URL to your firm&apos;s logo image. Recommended: 200x200px PNG or SVG.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Brand Colors</CardTitle>
          <CardDescription>Customize sidebar and accent colors</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="primaryColor">Primary Color</Label>
            <div className="flex gap-2">
              <Input
                id="primaryColor"
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="h-10 w-14 cursor-pointer p-1"
              />
              <Input
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                placeholder="#1e40af"
                className="flex-1"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="accentColor">Accent Color</Label>
            <div className="flex gap-2">
              <Input
                id="accentColor"
                type="color"
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                className="h-10 w-14 cursor-pointer p-1"
              />
              <Input
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                placeholder="#3b82f6"
                className="flex-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="md:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
            <CardDescription>How your branding will appear</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 rounded-lg border p-4">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt="Firm logo"
                  className="h-10 w-10 rounded-lg object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              ) : (
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-lg"
                  style={{ backgroundColor: primaryColor }}
                >
                  <Scale className="h-5 w-5 text-white" />
                </div>
              )}
              <span className="text-lg font-bold">{firmName || "LFR"}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="md:col-span-2 flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Branding"}
        </Button>
      </div>
    </div>
  );
}
