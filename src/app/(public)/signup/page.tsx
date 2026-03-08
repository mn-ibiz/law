import type { Metadata } from "next";
import { db } from "@/lib/db";
import { plans } from "@/lib/db/schema/organizations";
import { eq } from "drizzle-orm";
import { SignupWizard } from "./signup-wizard";

export const metadata: Metadata = {
  title: "Sign Up — Law Firm Registry",
  description: "Set up your law firm on Law Firm Registry",
};

export default async function SignupPage() {
  const availablePlans = await db
    .select({
      id: plans.id,
      name: plans.name,
      slug: plans.slug,
      description: plans.description,
      maxUsers: plans.maxUsers,
      maxCases: plans.maxCases,
      maxStorageMb: plans.maxStorageMb,
      monthlyPrice: plans.monthlyPrice,
      currency: plans.currency,
      trialDays: plans.trialDays,
    })
    .from(plans)
    .where(eq(plans.isActive, true))
    .orderBy(plans.monthlyPrice);

  return <SignupWizard plans={availablePlans} />;
}
