import { db } from "@/lib/db";
import { plans } from "@/lib/db/schema/organizations";
import { eq } from "drizzle-orm";

/**
 * Fetch all active plans for the public pricing page.
 * Returns plans ordered by monthly price ascending (free/cheapest first).
 */
export async function getPublicPlans() {
  return db
    .select({
      id: plans.id,
      name: plans.name,
      slug: plans.slug,
      description: plans.description,
      maxUsers: plans.maxUsers,
      maxCases: plans.maxCases,
      maxStorageMb: plans.maxStorageMb,
      features: plans.features,
      monthlyPrice: plans.monthlyPrice,
      annualPrice: plans.annualPrice,
      currency: plans.currency,
      trialDays: plans.trialDays,
    })
    .from(plans)
    .where(eq(plans.isActive, true))
    .orderBy(plans.monthlyPrice);
}
