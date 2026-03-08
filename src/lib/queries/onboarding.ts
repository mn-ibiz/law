import { db } from "@/lib/db";
import { organizations } from "@/lib/db/schema/organizations";
import { users } from "@/lib/db/schema/auth";
import { attorneys } from "@/lib/db/schema/attorneys";
import { clients } from "@/lib/db/schema/clients";
import { billingRates } from "@/lib/db/schema/settings";
import { eq, and, sql, isNull } from "drizzle-orm";

export async function getOnboardingData(organizationId: string) {
  const [org] = await db
    .select({
      name: organizations.name,
      logoUrl: organizations.logoUrl,
      createdAt: organizations.createdAt,
    })
    .from(organizations)
    .where(eq(organizations.id, organizationId))
    .limit(1);

  if (!org) return null;

  const daysOld = Math.floor(
    (Date.now() - new Date(org.createdAt).getTime()) / (1000 * 60 * 60 * 24)
  );

  // Derive checklist completion from actual data
  const [[attorneyResult], [clientResult], [billingResult], [teamResult]] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(attorneys)
      .where(eq(attorneys.organizationId, organizationId)),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(clients)
      .where(eq(clients.organizationId, organizationId)),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(billingRates)
      .where(eq(billingRates.organizationId, organizationId)),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(users)
      .where(
        and(
          eq(users.organizationId, organizationId),
          isNull(users.deletedAt),
          sql`${users.role} != 'client'`
        )
      ),
  ]);

  return {
    firmName: org.name,
    daysOld,
    hasAttorneys: attorneyResult.count > 0,
    hasBranding: !!org.logoUrl,
    hasClients: clientResult.count > 0,
    hasBillingRates: billingResult.count > 0,
    hasTeamMembers: teamResult.count > 1, // More than just the admin
  };
}
