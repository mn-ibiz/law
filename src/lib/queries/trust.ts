import { db } from "@/lib/db";
import { trustAccounts, trustTransactions } from "@/lib/db/schema/billing";
import { pettyCashTransactions, bankAccounts, bankReconciliations } from "@/lib/db/schema/financial";
import { clients } from "@/lib/db/schema/clients";
import { users } from "@/lib/db/schema/auth";
import { eq, desc, sql } from "drizzle-orm";

export async function getTrustAccounts() {
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
    })
    .from(trustAccounts)
    .leftJoin(clients, eq(trustAccounts.clientId, clients.id))
    .orderBy(desc(trustAccounts.createdAt));
}

export async function getTrustTransactions(accountId: string) {
  return db
    .select({
      id: trustTransactions.id,
      type: trustTransactions.type,
      amount: trustTransactions.amount,
      description: trustTransactions.description,
      reference: trustTransactions.reference,
      createdAt: trustTransactions.createdAt,
      performedByName: users.name,
    })
    .from(trustTransactions)
    .innerJoin(users, eq(trustTransactions.performedBy, users.id))
    .where(eq(trustTransactions.accountId, accountId))
    .orderBy(desc(trustTransactions.createdAt));
}

export async function getPettyCashTransactions() {
  return db
    .select({
      id: pettyCashTransactions.id,
      type: pettyCashTransactions.type,
      amount: pettyCashTransactions.amount,
      description: pettyCashTransactions.description,
      category: pettyCashTransactions.category,
      transactionDate: pettyCashTransactions.transactionDate,
      performedByName: users.name,
    })
    .from(pettyCashTransactions)
    .innerJoin(users, eq(pettyCashTransactions.performedBy, users.id))
    .orderBy(desc(pettyCashTransactions.transactionDate));
}

export async function getBankAccounts() {
  return db.select().from(bankAccounts).where(eq(bankAccounts.isActive, true));
}

export async function getBankReconciliations() {
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
    .orderBy(desc(bankReconciliations.statementDate));
}
