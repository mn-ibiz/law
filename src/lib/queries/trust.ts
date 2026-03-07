import { cache } from "react";
import { db } from "@/lib/db";
import { trustAccounts, trustTransactions } from "@/lib/db/schema/billing";
import { pettyCashTransactions, bankAccounts, bankReconciliations } from "@/lib/db/schema/financial";
import { clients } from "@/lib/db/schema/clients";
import { cases } from "@/lib/db/schema/cases";
import { users } from "@/lib/db/schema/auth";
import { eq, desc, sql, and } from "drizzle-orm";

export async function getTrustAccounts(organizationId: string) {
  return db
    .select({
      id: trustAccounts.id,
      accountName: trustAccounts.accountName,
      accountNumber: trustAccounts.accountNumber,
      type: trustAccounts.type,
      balance: trustAccounts.balance,
      bankName: trustAccounts.bankName,
      currency: trustAccounts.currency,
      clientName: sql<string>`coalesce(${clients.firstName} || ' ' || ${clients.lastName}, 'General')`,
      clientPhotoUrl: clients.photoUrl,
    })
    .from(trustAccounts)
    .leftJoin(clients, eq(trustAccounts.clientId, clients.id))
    .where(eq(trustAccounts.organizationId, organizationId))
    .orderBy(desc(trustAccounts.createdAt));
}

export const getTrustAccountById = cache(async (organizationId: string, id: string) => {
  const result = await db
    .select({
      id: trustAccounts.id,
      accountName: trustAccounts.accountName,
      accountNumber: trustAccounts.accountNumber,
      type: trustAccounts.type,
      balance: trustAccounts.balance,
      bankName: trustAccounts.bankName,
      branchName: trustAccounts.branchName,
      currency: trustAccounts.currency,
      clientId: trustAccounts.clientId,
      clientName: sql<string>`coalesce(${clients.firstName} || ' ' || ${clients.lastName}, 'General')`,
      createdAt: trustAccounts.createdAt,
      updatedAt: trustAccounts.updatedAt,
    })
    .from(trustAccounts)
    .leftJoin(clients, eq(trustAccounts.clientId, clients.id))
    .where(and(eq(trustAccounts.organizationId, organizationId), eq(trustAccounts.id, id)))
    .limit(1);

  return result[0] ?? null;
});

export async function getTrustTransactions(organizationId: string, accountId: string) {
  return db
    .select({
      id: trustTransactions.id,
      type: trustTransactions.type,
      amount: trustTransactions.amount,
      description: trustTransactions.description,
      reference: trustTransactions.reference,
      caseNumber: cases.caseNumber,
      createdAt: trustTransactions.createdAt,
      performedByName: users.name,
    })
    .from(trustTransactions)
    .innerJoin(users, eq(trustTransactions.performedBy, users.id))
    .leftJoin(cases, eq(trustTransactions.caseId, cases.id))
    .where(and(eq(trustTransactions.organizationId, organizationId), eq(trustTransactions.accountId, accountId)))
    .orderBy(desc(trustTransactions.createdAt));
}

export async function getClientsForSelect(organizationId: string) {
  return db
    .select({
      id: clients.id,
      name: sql<string>`${clients.firstName} || ' ' || ${clients.lastName}`,
    })
    .from(clients)
    .where(and(eq(clients.organizationId, organizationId), eq(clients.status, "active")))
    .orderBy(clients.firstName, clients.lastName);
}

export async function getCasesForSelect(organizationId: string) {
  return db
    .select({
      id: cases.id,
      caseNumber: cases.caseNumber,
      title: cases.title,
    })
    .from(cases)
    .where(eq(cases.organizationId, organizationId))
    .orderBy(desc(cases.createdAt))
    .limit(200);
}

export async function getPettyCashTransactions(organizationId: string) {
  return db
    .select({
      id: pettyCashTransactions.id,
      type: pettyCashTransactions.type,
      amount: pettyCashTransactions.amount,
      description: pettyCashTransactions.description,
      category: pettyCashTransactions.category,
      receiptUrl: pettyCashTransactions.receiptUrl,
      transactionDate: pettyCashTransactions.transactionDate,
      performedByName: users.name,
    })
    .from(pettyCashTransactions)
    .innerJoin(users, eq(pettyCashTransactions.performedBy, users.id))
    .where(eq(pettyCashTransactions.organizationId, organizationId))
    .orderBy(desc(pettyCashTransactions.transactionDate));
}

export async function getBankAccounts(organizationId: string) {
  return db.select().from(bankAccounts).where(and(eq(bankAccounts.organizationId, organizationId), eq(bankAccounts.isActive, true)));
}

export async function getBankReconciliations(organizationId: string) {
  return db
    .select({
      id: bankReconciliations.id,
      statementDate: bankReconciliations.statementDate,
      statementBalance: bankReconciliations.statementBalance,
      systemBalance: bankReconciliations.systemBalance,
      difference: bankReconciliations.difference,
      status: bankReconciliations.status,
      accountName: bankAccounts.accountName,
    })
    .from(bankReconciliations)
    .innerJoin(bankAccounts, eq(bankReconciliations.bankAccountId, bankAccounts.id))
    .where(eq(bankReconciliations.organizationId, organizationId))
    .orderBy(desc(bankReconciliations.statementDate));
}
