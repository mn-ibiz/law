"use server";

import { db } from "@/lib/db";
import { trustAccounts, trustTransactions } from "@/lib/db/schema/billing";
import { pettyCashTransactions } from "@/lib/db/schema/financial";
import { getTenantContext } from "@/lib/auth/get-session";
import { createAuditLog } from "@/lib/utils/audit";
import { createTrustTransactionSchema, createTrustAccountSchema, createPettyCashSchema, updateTrustAccountSchema } from "@/lib/validators/trust";
import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { safeAction } from "@/lib/utils/safe-action";
import { getOrgConfig } from "@/lib/utils/tenant-config";

export async function createTrustTransaction(data: unknown) {
  return safeAction(async () => {
    const { organizationId, userId, role } = await getTenantContext();
    if (role !== "admin") return { error: "Unauthorized: admin access required" };

    const validated = createTrustTransactionSchema.safeParse(data);
    if (!validated.success) {
      return { error: validated.error.issues[0].message };
    }

    // Insert transaction record FIRST as audit trail, then update balance
    const result = await db
      .insert(trustTransactions)
      .values({
        organizationId,
        accountId: validated.data.accountId,
        type: validated.data.type,
        amount: String(validated.data.amount),
        description: validated.data.description,
        reference: validated.data.referenceNumber,
        performedBy: userId,
      })
      .returning();

    const isDeposit = ["deposit", "interest"].includes(validated.data.type);
    if (isDeposit) {
      await db
        .update(trustAccounts)
        .set({ balance: sql`${trustAccounts.balance}::numeric + ${String(validated.data.amount)}::numeric`, updatedAt: new Date() })
        .where(and(eq(trustAccounts.id, validated.data.accountId), eq(trustAccounts.organizationId, organizationId)));
    } else {
      // Atomic conditional withdrawal — prevents TOCTOU race condition
      const withdrawResult = await db
        .update(trustAccounts)
        .set({
          balance: sql`${trustAccounts.balance}::numeric - ${String(validated.data.amount)}::numeric`,
          updatedAt: new Date(),
        })
        .where(sql`${trustAccounts.id} = ${validated.data.accountId} AND ${trustAccounts.organizationId} = ${organizationId} AND ${trustAccounts.balance}::numeric >= ${String(validated.data.amount)}::numeric`)
        .returning({ id: trustAccounts.id });

      if (withdrawResult.length === 0) {
        return { error: "Insufficient funds" };
      }
    }

    await createAuditLog(
      organizationId,
      userId,
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
    const { organizationId, userId, role } = await getTenantContext();
    if (role !== "admin") return { error: "Unauthorized: admin access required" };

    const validated = createTrustAccountSchema.safeParse(data);
    if (!validated.success) {
      return { error: validated.error.issues[0].message };
    }

    // Generate a unique account number
    const config = await getOrgConfig(organizationId);
    const year = new Date().getFullYear();
    const prefix = `${config.prefixes.trustAccount}-${year}-`;
    const [maxResult] = await db
      .select({ maxNum: sql<string>`MAX(${trustAccounts.accountNumber})` })
      .from(trustAccounts)
      .where(sql`${trustAccounts.organizationId} = ${organizationId} AND ${trustAccounts.accountNumber} LIKE ${prefix + "%"}`);

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
        organizationId,
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
      organizationId,
      userId,
      "create",
      "trust_account",
      result[0].id,
      validated.data
    );

    revalidatePath("/trust-accounts");
    return { data: result[0] };
  });
}

export async function updateTrustAccount(id: string, data: unknown) {
  return safeAction(async () => {
    const { organizationId, userId, role } = await getTenantContext();
    if (role !== "admin") return { error: "Unauthorized: admin access required" };

    if (!id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      return { error: "Invalid ID" };
    }

    const validated = updateTrustAccountSchema.safeParse(data);
    if (!validated.success) {
      return { error: validated.error.issues[0].message };
    }

    const result = await db
      .update(trustAccounts)
      .set({
        accountName: validated.data.accountName,
        type: validated.data.type,
        bankName: validated.data.bankName || null,
        branchName: validated.data.branchName || null,
        updatedAt: new Date(),
      })
      .where(and(eq(trustAccounts.id, id), eq(trustAccounts.organizationId, organizationId)))
      .returning({ id: trustAccounts.id });

    if (result.length === 0) {
      return { error: "Trust account not found" };
    }

    await createAuditLog(
      organizationId,
      userId,
      "update",
      "trust_account",
      id,
      validated.data
    );

    revalidatePath("/trust-accounts");
    revalidatePath(`/trust-accounts/${id}`);
    return { success: true };
  });
}

export async function createPettyCashTransaction(data: unknown) {
  return safeAction(async () => {
    const { organizationId, userId } = await getTenantContext();

    const validated = createPettyCashSchema.safeParse(data);
    if (!validated.success) {
      return { error: validated.error.issues[0].message };
    }

    const result = await db
      .insert(pettyCashTransactions)
      .values({
        organizationId,
        type: validated.data.type,
        amount: String(validated.data.amount),
        description: validated.data.description,
        category: validated.data.category,
        receiptUrl: validated.data.receiptUrl || null,
        performedBy: userId,
      })
      .returning();

    await createAuditLog(
      organizationId,
      userId,
      "create",
      "petty_cash_transaction",
      result[0].id,
      validated.data
    );

    revalidatePath("/petty-cash");
    return { data: result[0] };
  });
}
