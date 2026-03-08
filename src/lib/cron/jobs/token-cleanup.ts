import { db } from "@/lib/db";
import { users } from "@/lib/db/schema/auth";
import { and, lt, isNotNull, isNull, eq } from "drizzle-orm";
import type { CronJobResult } from "../runner";

/**
 * Purges expired password reset tokens and expired invite tokens
 * for inactive users with no password set.
 */
export default async function tokenCleanup(): Promise<CronJobResult> {
  let processed = 0;
  let errors = 0;
  const now = new Date();

  try {
    // Clear expired password reset tokens
    const resetResult = await db
      .update(users)
      .set({
        resetToken: null,
        resetTokenExpiry: null,
        updatedAt: now,
      })
      .where(
        and(
          isNotNull(users.resetToken),
          isNotNull(users.resetTokenExpiry),
          lt(users.resetTokenExpiry, now)
        )
      )
      .returning({ id: users.id });

    processed += resetResult.length;

    // Clear expired invite tokens for inactive users without a password
    const inviteResult = await db
      .update(users)
      .set({
        inviteToken: null,
        inviteExpiresAt: null,
        updatedAt: now,
      })
      .where(
        and(
          isNotNull(users.inviteToken),
          isNotNull(users.inviteExpiresAt),
          lt(users.inviteExpiresAt, now),
          eq(users.isActive, false),
          isNull(users.password)
        )
      )
      .returning({ id: users.id });

    processed += inviteResult.length;

    console.log(
      `[cron:token-cleanup] Cleared ${resetResult.length} reset tokens, ${inviteResult.length} invite tokens`
    );
  } catch (err) {
    console.error("[cron:token-cleanup] Error:", err);
    errors++;
  }

  return {
    job: "token-cleanup",
    success: errors === 0,
    processed,
    errors,
  };
}
