import { db } from "@/lib/db";
import { organizations, platformAuditLog } from "@/lib/db/schema/organizations";
import { users } from "@/lib/db/schema/auth";
import { and, eq, isNull, ne } from "drizzle-orm";

export interface CronJobResult {
  job: string;
  success: boolean;
  processed: number;
  errors: number;
  details?: string;
}

export type CronJobFn = () => Promise<CronJobResult>;

// ---------------------------------------------------------------------------
// Job registry — import each job lazily to keep the runner module light
// ---------------------------------------------------------------------------

const JOB_REGISTRY: Record<string, () => Promise<{ default: CronJobFn }>> = {
  "overdue-invoices": () => import("./jobs/overdue-invoices"),
  "deadline-alerts": () => import("./jobs/deadline-alerts"),
  "certificate-expiry": () => import("./jobs/certificate-expiry"),
  "subscription-check": () => import("./jobs/subscription-check"),
  "token-cleanup": () => import("./jobs/token-cleanup"),
  "data-purge": () => import("./jobs/data-purge"),
  "usage-alerts": () => import("./jobs/usage-alerts"),
};

// ---------------------------------------------------------------------------
// Execute a named job
// ---------------------------------------------------------------------------

export async function runJob(jobName: string): Promise<CronJobResult> {
  const loader = JOB_REGISTRY[jobName];
  if (!loader) {
    // Unknown job — return error without logging to audit (unsanitized input)
    return {
      job: "unknown",
      success: false,
      processed: 0,
      errors: 1,
      details: "Unknown job name",
    };
  }

  const startTime = Date.now();
  let result: CronJobResult;

  try {
    const mod = await loader();
    result = await mod.default();
  } catch (err) {
    result = {
      job: jobName,
      success: false,
      processed: 0,
      errors: 1,
      details: err instanceof Error ? err.message : String(err),
    };
  }

  const durationMs = Date.now() - startTime;

  // Log execution to platform audit log (only for known/validated job names)
  await db
    .insert(platformAuditLog)
    .values({
      action: `cron:${jobName}`,
      details: JSON.stringify({
        ...result,
        durationMs,
      }),
    })
    .catch((err) => console.error("Failed to log cron execution:", err));

  console.log(
    `[cron] ${jobName} completed in ${durationMs}ms — processed: ${result.processed}, errors: ${result.errors}`
  );

  return result;
}

// ---------------------------------------------------------------------------
// Shared helper: get active organizations (for jobs to iterate over)
// ---------------------------------------------------------------------------

export async function getActiveOrganizations() {
  return db
    .select({ id: organizations.id, name: organizations.name })
    .from(organizations)
    .where(
      and(
        eq(organizations.status, "active"),
        isNull(organizations.deletedAt),
        ne(organizations.slug, "_platform")
      )
    );
}

// ---------------------------------------------------------------------------
// Shared helper: get admin users for an organization
// ---------------------------------------------------------------------------

export async function getOrgAdmins(organizationId: string) {
  return db
    .select({ id: users.id })
    .from(users)
    .where(
      and(
        eq(users.organizationId, organizationId),
        eq(users.role, "admin"),
        eq(users.isActive, true),
        isNull(users.deletedAt)
      )
    );
}
