import { PublicIntakeForm } from "@/components/forms/intake-form";
import { headers } from "next/headers";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Client Intake",
  description: "Submit your information for legal consultation",
};

function extractSlugFromHost(host: string): string {
  const hostname = host.split(":")[0];
  if (hostname === "localhost" || hostname === "127.0.0.1") return "";
  const parts = hostname.split(".");
  if (parts.length >= 3) {
    const subdomain = parts[0];
    if (subdomain !== "www" && subdomain !== "app") return subdomain;
  }
  return "";
}

export default async function IntakePage() {
  const headersList = await headers();
  const host = headersList.get("host") ?? "";
  const organizationSlug = extractSlugFromHost(host);

  return (
    <div className="mx-auto max-w-2xl py-10 px-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Law Firm Registry</h1>
        <p className="mt-2 text-muted-foreground">
          Submit your information for a legal consultation. Our team will review
          your details and contact you within 2 business days.
        </p>
      </div>
      <PublicIntakeForm organizationSlug={organizationSlug} />
    </div>
  );
}
