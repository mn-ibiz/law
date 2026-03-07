import { and, eq, type SQL } from "drizzle-orm";
import type { PgColumn } from "drizzle-orm/pg-core";

/**
 * Creates a WHERE condition that scopes a query to the given organization.
 * Usage: db.select().from(cases).where(withTenant(cases.organizationId, orgId))
 */
export function withTenant(column: PgColumn, organizationId: string): SQL {
  return eq(column, organizationId);
}

/**
 * Combines tenant scoping with additional conditions.
 * Usage: db.select().from(cases).where(tenantAnd(cases.organizationId, orgId, eq(cases.status, "open")))
 */
export function tenantAnd(
  column: PgColumn,
  organizationId: string,
  ...conditions: (SQL | undefined)[]
): SQL {
  return and(eq(column, organizationId), ...conditions)!;
}
