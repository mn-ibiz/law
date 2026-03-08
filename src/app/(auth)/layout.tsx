import { Scale } from "lucide-react";
import { getFirmBranding } from "@/lib/queries/settings";
import { requireOrg } from "@/lib/auth/get-session";
import { siteConfig } from "@/lib/config/site";
import Image from "next/image";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const { organizationId } = await requireOrg();
  const branding = await getFirmBranding(organizationId);

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-amber-500/5" />
        <div className="absolute right-0 top-0 h-[500px] w-[500px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-amber-500/5 blur-3xl" />
      </div>

      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          {branding.logoUrl ? (
            <Image
              src={branding.logoUrl}
              alt={branding.firmName ?? "Firm logo"}
              width={48}
              height={48}
              className="mb-3 h-12 w-12 rounded-xl object-contain"
              unoptimized
            />
          ) : (
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary shadow-lg">
              <Scale className="h-6 w-6 text-primary-foreground" />
            </div>
          )}
          <h1 className="text-xl font-bold tracking-tight">
            {branding.firmName ?? siteConfig.name}
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            {siteConfig.tagline}
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
