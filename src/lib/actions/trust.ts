"use server";

import { db } from "@/lib/db";
import { trustAccounts, trustTransactions } from "@/lib/db/schema/billing";
import { pettyCashTransactions } from "@/lib/db/schema/financial";
import { auth } from "@/lib/auth/auth";
import { createAuditLog } from "@/lib/utils/audit";
import { createTrustTransactionSchema, createTrustAccountSchema, createPettyCashSchema } from "@/lib/validators/trust";
import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { safeAction } from "@/lib/utils/safe-action";

export async function createTrustTransaction(data: unknown) {
  return safeAction(async () => {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return { error: "Unauthorized: admin access required" };
    }

    const validated = createTrustTransactionSchema.safeParse(data);
    if (!validated.success) {
      return { error: validated.error.issues[0].message };
    }

    // Insert transaction record FIRST as audit trail, then update balance
    const result = await db
      .insert(trustTransactions)
      .values({
        accountId: validated.data.accountId,
        type: validated.data.type,
        amount: String(validated.data.amount),
        description: validated.data.description,
        reference: validated.data.referenceNumber,
        performedBy: session.user.id,
      })
      .returning();

    const isDeposit = ["deposit", "interest"].includes(validated.data.type);
    if (isDeposit) {
      await db
        .update(trustAccounts)
        .set({ balance: sql`${trustAccounts.balance}::numeric + ${String(validated.data.amount)}::numeric`, updatedAt: new Date() })
        .where(eq(trustAccounts.id, validated.data.accountId));
    } else {
      // Atomic conditional withdrawal — prevents TOCTOU race condition
      const withdrawResult = await db
        .update(trustAccounts)
        .set({
          balance: sql`${trustAccounts.balance}::numeric - ${String(validated.data.amount)}::numeric`,
          updatedAt: new Date(),
        })
        .where(sql`${trustAccounts.id} = ${validated.data.accountId} AND ${trustAccounts.balance}::numeric >= ${String(validated.data.amount)}::numeric`)
        .returning({ id: trustAccounts.id });

      if (withdrawResult.length === 0) {
        return { error: "Insufficient funds" };
      }
    }

    await createAuditLog(
      session.user.id,
      "create",
      "trust_transaction",
      result[0].id,
      validated.data
    );

    revalidatePath("/trust-accounts");
    return { data: result[0] };
  });
}

export async function createTrustAccount(data: unknown) {
  return safeAction(async () => {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return { error: "Unauthorized: admin access required" };
    }

    const validated = createTrustAccountSchema.safeParse(data);
    if (!validated.success) {
      return { error: validated.error.issues[0].message };
    }

    // Generate a unique account number
    const year = new Date().getFullYear();
    const prefix = `TRUST-${year}-`;
    const [maxResult] = await db
      .select({ maxNum: sql<string>`MAX(${trustAccounts.accountNumber})` })
      .from(trustAccounts)
      .where(sql`${trustAccounts.accountNumber} LIKE ${prefix + "%"}`);

    let next = 1;
    if (maxResult?.maxNum) {
      const parts = maxResult.maxNum.split("-");
      const lastNum = parseInt(parts[parts.length - 1], 10);
      if (!isNaN(lastNum)) next = lastNum + 1;
    }
    const accountNumber = `${prefix}${String(next).padStart(4, "0")}`;

    const result = await db
      .insert(trustAccounts)
      .values({
        accountName: validated.data.accountName,
        accountNumber,
        type: validated.data.accountType,
        clientId: validated.data.clientId,
        balance: String(validated.data.initialBalance),
        bankName: validated.data.bankName || null,
        branchName: validated.data.branchName || null,
      })
      .returning();

    await createAuditLog(
      session.user.id,
      "create",
      "trust_account",
      result[0].id,
      validated.data
    );

    revalidatePath("/trust-accounts");
    return { data: result[0] };
  });
}

export async function createPettyCashTransaction(data: unknown) {
  return safeAction(async () => {
    const session = await auth();
    if (!session?.user || !["admin", "attorney"].includes(session.user.role)) {
      return { error: "Unauthorized" };
    }

    const validated = createPettyCashSchema.safeParse(data);
    if (!validated.success) {
      return { error: validated.error.issues[0].message };
    }

    const result = await db
      .insert(pettyCashTransactions)
      .values({
        type: validated.data.type,
        amount: String(validated.data.amount),
        description: validated.data.description,
        category: validated.data.category,
        performedBy: session.user.id,
      })
      .returning();

    await createAuditLog(
      session.user.id,
      "create",
      "petty_cash_transaction",
      result[0].id,
      validated.data
    );

    revalidatePath("/petty-cash");
    return { data: result[0] };
  });
}
