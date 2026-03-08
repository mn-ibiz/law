import { PublicIntakeForm } from "@/components/forms/intake-form";
import { headers } from "next/headers";
import type { Metadata } from "next";
import { extractTenantSlug } from "@/lib/utils/extract-tenant-slug";
import { db } from "@/lib/db";
import { organizations } from "@/lib/db/schema/organizations";
import { eq } from "drizzle-orm";
import { siteConfig } from "@/lib/config/site";

export const metadata: Metadata = {
  title: "Client Intake",
  description: "Submit your information for legal consultation",
};

export default async function IntakePage() {
  const headersList = await headers();
  const host = headersList.get("host") ?? "";
  const organizationSlug = extractTenantSlug(host) ?? "";

  // Fetch org name for the heading
  let orgName: string = siteConfig.name;
  if (organizationSlug) {
    const [org] = await db
      .select({ name: organizations.name })
      .from(organizations)
      .where(eq(organizations.slug, organizationSlug))
      .limit(1);
    if (org) orgName = org.name;
  }

  return (
    <div className="mx-auto max-w-2xl py-10 px-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">{orgName}</h1>
        <p className="mt-2 text-muted-foreground">
          Submit your information for a legal consultation. Our team will review
          your details and contact you within 2 business days.
        </p>
      </div>
      <PublicIntakeForm organizationSlug={organizationSlug} />
    </div>
  );
}
