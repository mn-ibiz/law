import { db } from "@/lib/db";
import { apiKeys } from "@/lib/db/schema/organizations";
import { organizations, plans } from "@/lib/db/schema/organizations";
import { and, eq, isNull } from "drizzle-orm";
import crypto from "crypto";

const API_KEY_PREFIX = "lfr_";

export interface ApiKeyContext {
  organizationId: string;
  permissions: string[];
  keyId: string;
  planSlug: string | null;
}

/**
 * Authenticate an API key from the Authorization header.
 * Returns the org context if valid, or null if invalid/missing.
 */
export async function authenticateApiKey(
  authHeader: string | null
): Promise<ApiKeyContext | null> {
  if (!authHeader) return null;

  const [scheme, token] = authHeader.split(" ", 2);
  if (scheme !== "Bearer" || !token?.startsWith(API_KEY_PREFIX)) return null;

  // Extract prefix for lookup (first 8 hex chars after "lfr_")
  const rawKey = token.slice(API_KEY_PREFIX.length);
  if (rawKey.length < 8) return null;
  const prefix = rawKey.slice(0, 8);

  // Look up by prefix (indexed). The unique index is (organizationId, keyPrefix),
  // so prefix collisions across orgs are theoretically possible. This is safe because
  // the SHA-256 hash comparison below is the true security boundary — a prefix match
  // against the wrong org's key will fail the hash check.
  const [keyRow] = await db
    .select({
      id: apiKeys.id,
      organizationId: apiKeys.organizationId,
      keyHash: apiKeys.keyHash,
      permissions: apiKeys.permissions,
      expiresAt: apiKeys.expiresAt,
    })
    .from(apiKeys)
    .where(
      and(
        eq(apiKeys.keyPrefix, prefix),
        isNull(apiKeys.revokedAt)
      )
    )
    .limit(1);

  if (!keyRow) return null;

  // Verify full key hash with constant-time comparison
  const providedHash = crypto.createHash("sha256").update(token).digest("hex");
  const storedHash = keyRow.keyHash;

  if (providedHash.length !== storedHash.length) return null;

  const isValid = crypto.timingSafeEqual(
    Buffer.from(providedHash, "utf-8"),
    Buffer.from(storedHash, "utf-8")
  );

  if (!isValid) return null;

  // Check expiry
  if (keyRow.expiresAt && new Date(keyRow.expiresAt) < new Date()) {
    return null;
  }

  // Verify org is active
  const [org] = await db
    .select({
      status: organizations.status,
      planSlug: plans.slug,
    })
    .from(organizations)
    .leftJoin(plans, eq(organizations.planId, plans.id))
    .where(
      and(
        eq(organizations.id, keyRow.organizationId),
        isNull(organizations.deletedAt)
      )
    )
    .limit(1);

  if (!org || org.status !== "active") return null;

  // Update lastUsedAt (fire-and-forget)
  db.update(apiKeys)
    .set({ lastUsedAt: new Date() })
    .where(eq(apiKeys.id, keyRow.id))
    .catch(() => {});

  return {
    organizationId: keyRow.organizationId,
    permissions: keyRow.permissions ? JSON.parse(keyRow.permissions) : [],
    keyId: keyRow.id,
    planSlug: org.planSlug ?? null,
  };
}
