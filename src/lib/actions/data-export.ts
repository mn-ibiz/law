"use server";

import { db } from "@/lib/db";
import { platformAuditLog } from "@/lib/db/schema/organizations";
import { requireRole, getTenantContext } from "@/lib/auth/get-session";
import { rateLimit } from "@/lib/utils/rate-limit";
import { safeAction } from "@/lib/utils/safe-action";
import { exportOrgData } from "@/lib/services/data-export";

/**
 * Export all organization data as a JSON string.
 * Rate limited: 1 export per org per hour.
 */
export async function exportDataAction() {
  return safeAction(async () => {
    await requireRole("admin");
    const { organizationId, userId } = await getTenantContext();

    // Rate limit: 1 export per org per hour
    const rl = await rateLimit(`data-export:${organizationId}`, {
      maxRequests: 1,
      windowMs: 60 * 60 * 1000,
    });
    if (!rl.success) {
      return { error: "Data export limit reached. Please try again later." };
    }

    const data = await exportOrgData(organizationId);

    // Guard against extremely large exports that could cause memory issues.
    // Server actions serialize through RSC protocol — for very large orgs,
    // a streaming API route would be more appropriate.
    const jsonStr = JSON.stringify(data, null, 2);
    const sizeMb = Buffer.byteLength(jsonStr, "utf-8") / (1024 * 1024);
    if (sizeMb > 50) {
      return { error: `Export size (${Math.round(sizeMb)}MB) exceeds the 50MB limit. Please contact support.` };
    }

    // Audit log
    await db.insert(platformAuditLog).values({
      userId,
      action: "data_export",
      targetOrgId: organizationId,
      details: JSON.stringify({
        tables: Object.keys(data.tables).length,
        totalRecords: Object.values(data.tables).reduce(
          (sum, arr) => sum + (arr as unknown[]).length,
          0
        ),
      }),
    }).catch((err) => console.error("Failed to log data export:", err));

    return {
      success: true,
      data: jsonStr,
      filename: `${data.organization.slug}-export-${new Date().toISOString().slice(0, 10)}.json`,
    };
  });
}
