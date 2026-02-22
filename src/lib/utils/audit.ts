import { db } from "@/lib/db";
import { auditLog } from "@/lib/db/schema/settings";

export async function createAuditLog(
  userId: string,
  action: "create" | "update" | "delete" | "login" | "logout" | "export",
  entityType: string,
  entityId: string,
  details?: Record<string, unknown>
) {
  await db.insert(auditLog).values({
    userId,
    action,
    entityType,
    entityId,
    details: details ? JSON.stringify(details) : null,
  });
}
