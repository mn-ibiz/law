import { PublicIntakeForm } from "@/components/forms/intake-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Client Intake",
  description: "Submit your information for legal consultation",
};

export default function IntakePage() {
  return (
    <div className="mx-auto max-w-2xl py-10 px-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Law Firm Registry</h1>
        <p className="mt-2 text-muted-foreground">
          Submit your information for a legal consultation. Our team will review
          your details and contact you within 2 business days.
        </p>
      </div>
      <PublicIntakeForm />
    </div>
  );
}
