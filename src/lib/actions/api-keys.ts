"use server";

import { db } from "@/lib/db";
import { apiKeys, platformAuditLog } from "@/lib/db/schema/organizations";
import { requireRole, getTenantContext } from "@/lib/auth/get-session";
import { checkFeatureAccess } from "@/lib/utils/plan-limits";
import { safeAction } from "@/lib/utils/safe-action";
import { and, eq, isNull, desc } from "drizzle-orm";
import crypto from "crypto";
import { z } from "zod";

const ALLOWED_PERMISSIONS = [
  "cases:read",
  "cases:write",
  "clients:read",
  "clients:write",
  "billing:read",
  "documents:read",
] as const;

const createKeySchema = z.object({
  name: z.string().min(1).max(100),
  permissions: z.array(z.enum(ALLOWED_PERMISSIONS)).min(1),
  expiresAt: z.string().datetime().optional(),
});

export async function createApiKey(data: unknown) {
  return safeAction(async () => {
    await requireRole("admin");
    const { organizationId, userId } = await getTenantContext();

    // Feature gate: Enterprise plan only
    const access = await checkFeatureAccess(organizationId, "api_access");
    if (!access.allowed) {
      return { error: access.error };
    }

    const validated = createKeySchema.safeParse(data);
    if (!validated.success) {
      return { error: validated.error.issues[0].message };
    }

    const { name, permissions, expiresAt } = validated.data;

    // Generate API key: lfr_ + 48 random hex bytes
    const randomBytes = crypto.randomBytes(48).toString("hex");
    const fullKey = `lfr_${randomBytes}`;
    const keyPrefix = randomBytes.slice(0, 8);
    const keyHash = crypto.createHash("sha256").update(fullKey).digest("hex");

    await db.insert(apiKeys).values({
      organizationId,
      name,
      keyHash,
      keyPrefix,
      permissions: JSON.stringify(permissions),
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      createdBy: userId,
    });

    // Audit log
    await db.insert(platformAuditLog).values({
      userId,
      action: "api_key_created",
      targetOrgId: organizationId,
      details: JSON.stringify({ name, keyPrefix, permissions }),
    }).catch((err) => console.error("Failed to log API key creation:", err));

    // Return the full key ONCE — it cannot be retrieved after this
    return {
      success: true,
      key: fullKey,
      prefix: keyPrefix,
      message: "API key created. Copy the key now — it will not be shown again.",
    };
  });
}

export async function listApiKeys() {
  return safeAction(async () => {
    await requireRole("admin");
    const { organizationId } = await getTenantContext();

    const keys = await db
      .select({
        id: apiKeys.id,
        name: apiKeys.name,
        keyPrefix: apiKeys.keyPrefix,
        permissions: apiKeys.permissions,
        lastUsedAt: apiKeys.lastUsedAt,
        expiresAt: apiKeys.expiresAt,
        revokedAt: apiKeys.revokedAt,
        createdAt: apiKeys.createdAt,
      })
      .from(apiKeys)
      .where(eq(apiKeys.organizationId, organizationId))
      .orderBy(desc(apiKeys.createdAt));

    return {
      success: true,
      keys: keys.map((k) => ({
        ...k,
        permissions: k.permissions ? JSON.parse(k.permissions) : [],
        status: k.revokedAt
          ? "revoked"
          : k.expiresAt && new Date(k.expiresAt) < new Date()
            ? "expired"
            : "active",
      })),
    };
  });
}

export async function revokeApiKey(keyId: string) {
  return safeAction(async () => {
    await requireRole("admin");
    const { organizationId, userId } = await getTenantContext();

    if (!keyId) {
      return { error: "Key ID is required." };
    }

    const [key] = await db
      .select({ id: apiKeys.id, revokedAt: apiKeys.revokedAt })
      .from(apiKeys)
      .where(
        and(
          eq(apiKeys.id, keyId),
          eq(apiKeys.organizationId, organizationId)
        )
      )
      .limit(1);

    if (!key) {
      return { error: "API key not found." };
    }

    if (key.revokedAt) {
      return { error: "API key is already revoked." };
    }

    await db
      .update(apiKeys)
      .set({ revokedAt: new Date() })
      .where(eq(apiKeys.id, keyId));

    // Audit log
    await db.insert(platformAuditLog).values({
      userId,
      action: "api_key_revoked",
      targetOrgId: organizationId,
      details: JSON.stringify({ keyId }),
    }).catch((err) => console.error("Failed to log API key revocation:", err));

    return { success: true, message: "API key revoked." };
  });
}
