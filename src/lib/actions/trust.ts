"use server";

import { db } from "@/lib/db";
import { trustAccounts, trustTransactions } from "@/lib/db/schema/billing";
import { pettyCashTransactions } from "@/lib/db/schema/financial";
import { auth } from "@/lib/auth/auth";
import { createAuditLog } from "@/lib/utils/audit";
import { createTrustTransactionSchema, createPettyCashSchema } from "@/lib/validators/trust";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createTrustTransaction(data: unknown) {
  const session = await auth();
  if (!session?.user || !["admin", "attorney"].includes(session.user.role as string)) {
    return { error: "Unauthorized" };
  }

  const validated = createTrustTransactionSchema.safeParse(data);
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  const result = await db
    .insert(trustTransactions)
    .values({
      accountId: validated.data.accountId,
      type: validated.data.type,
      amount: String(validated.data.amount),
      description: validated.data.description,
      reference: validated.data.referenceNumber,
      performedBy: session.user.id as string,
    })
    .returning();

  // Update account balance
  const account = await db.select().from(trustAccounts).where(eq(trustAccounts.id, validated.data.accountId)).limit(1);
  if (account[0]) {
    const current = Number(account[0].balance);
    const delta = ["deposit", "interest"].includes(validated.data.type) ? validated.data.amount : -validated.data.amount;
    await db
      .update(trustAccounts)
      .set({ balance: String(current + delta), updatedAt: new Date() })
      .where(eq(trustAccounts.id, validated.data.accountId));
  }

  await createAuditLog(
    session.user.id as string,
    "create",
    "trust_transaction",
    result[0].id,
    validated.data
  );

  revalidatePath("/trust-accounts");
  return { data: result[0] };
}

export async function createPettyCashTransaction(data: unknown) {
  const session = await auth();
  if (!session?.user || !["admin", "attorney"].includes(session.user.role as string)) {
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
      performedBy: session.user.id as string,
    })
    .returning();

  revalidatePath("/petty-cash");
  return { data: result[0] };
}
