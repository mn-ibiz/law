"use server";

import { db } from "@/lib/db";
import { cases } from "@/lib/db/schema/cases";
import { clients } from "@/lib/db/schema/clients";
import { users } from "@/lib/db/schema/auth";
import { documents } from "@/lib/db/schema/documents";
import { invoices } from "@/lib/db/schema/billing";
import { attorneys } from "@/lib/db/schema/attorneys";
import { ilike, or, sql, eq, and } from "drizzle-orm";
import { getTenantContext } from "@/lib/auth/get-session";
import { safeAction } from "@/lib/utils/safe-action";

export interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  type: "case" | "client" | "attorney" | "document" | "invoice";
  href: string;
}

export async function globalSearch(query: string) {
  return safeAction(async () => {
    const { organizationId, role, userId } = await getTenantContext();

    if (!query || query.length < 2) return [];

    const isClient = role === "client";

    // Escape LIKE-special characters to prevent pattern injection
    const escaped = query.replace(/[%_\\]/g, "\\$&");
    const pattern = `%${escaped}%`;

    // For clients, find their client record to scope results
    let clientRecordId: string | null = null;
    if (isClient) {
      const [clientRecord] = await db
        .select({ id: clients.id })
        .from(clients)
        .where(and(eq(clients.userId, userId), eq(clients.organizationId, organizationId)))
        .limit(1);
      clientRecordId = clientRecord?.id ?? null;
      if (!clientRecordId) return [];
    }

    const caseFilter = isClient && clientRecordId
      ? and(or(ilike(cases.title, pattern), ilike(cases.caseNumber, pattern)), eq(cases.clientId, clientRecordId), eq(cases.organizationId, organizationId))
      : and(or(ilike(cases.title, pattern), ilike(cases.caseNumber, pattern)), eq(cases.organizationId, organizationId));

    const [caseResults, clientResults, attorneyResults, docResults, invoiceResults] =
      await Promise.all([
        db
          .select({
            id: cases.id,
            caseNumber: cases.caseNumber,
            title: cases.title,
          })
          .from(cases)
          .where(caseFilter)
          .limit(5),

        // Clients cannot search other clients
        isClient ? Promise.resolve([]) : db
          .select({
            id: clients.id,
            firstName: clients.firstName,
            lastName: clients.lastName,
            email: clients.email,
          })
          .from(clients)
          .where(
            and(
              eq(clients.organizationId, organizationId),
              or(
                ilike(clients.firstName, pattern),
                ilike(clients.lastName, pattern),
                ilike(clients.email, pattern)
              )
            )
          )
          .limit(5),

        // Clients cannot search attorneys
        isClient ? Promise.resolve([]) : db
          .select({
            id: attorneys.id,
            userId: attorneys.userId,
            lskNumber: attorneys.lskNumber,
            userName: users.name,
          })
          .from(attorneys)
          .innerJoin(users, sql`${attorneys.userId} = ${users.id}`)
          .where(
            and(
              eq(attorneys.organizationId, organizationId),
              or(
                ilike(users.name, pattern),
                ilike(attorneys.lskNumber, pattern)
              )
            )
          )
          .limit(5),

        // Clients can only see documents for their own cases
        isClient ? Promise.resolve([]) : db
          .select({
            id: documents.id,
            title: documents.title,
            fileName: documents.fileName,
          })
          .from(documents)
          .where(
            and(
              eq(documents.organizationId, organizationId),
              or(
                ilike(documents.title, pattern),
                ilike(documents.fileName, pattern)
              )
            )
          )
          .limit(5),

        db
          .select({
            id: invoices.id,
            invoiceNumber: invoices.invoiceNumber,
            totalAmount: invoices.totalAmount,
          })
          .from(invoices)
          .where(
            isClient && clientRecordId
              ? and(ilike(invoices.invoiceNumber, pattern), eq(invoices.clientId, clientRecordId), eq(invoices.organizationId, organizationId))
              : and(ilike(invoices.invoiceNumber, pattern), eq(invoices.organizationId, organizationId))
          )
          .limit(5),
      ]);

    const results: SearchResult[] = [];

    for (const c of caseResults) {
      results.push({
        id: c.id,
        title: c.title,
        subtitle: c.caseNumber,
        type: "case",
        href: `/cases/${c.id}`,
      });
    }

    for (const c of clientResults) {
      results.push({
        id: c.id,
        title: `${c.firstName} ${c.lastName}`,
        subtitle: c.email,
        type: "client",
        href: `/clients/${c.id}`,
      });
    }

    for (const a of attorneyResults) {
      results.push({
        id: a.id,
        title: a.userName,
        subtitle: a.lskNumber ?? "",
        type: "attorney",
        href: `/attorneys/${a.id}`,
      });
    }

    for (const d of docResults) {
      results.push({
        id: d.id,
        title: d.title,
        subtitle: d.fileName,
        type: "document",
        href: `/documents/${d.id}`,
      });
    }

    for (const inv of invoiceResults) {
      results.push({
        id: inv.id,
        title: inv.invoiceNumber,
        subtitle: `KES ${inv.totalAmount}`,
        type: "invoice",
        href: `/billing/${inv.id}`,
      });
    }

    return results;
  });
}
