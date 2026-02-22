"use server";

import { db } from "@/lib/db";
import { cases } from "@/lib/db/schema/cases";
import { clients } from "@/lib/db/schema/clients";
import { users } from "@/lib/db/schema/auth";
import { documents } from "@/lib/db/schema/documents";
import { invoices } from "@/lib/db/schema/billing";
import { attorneys } from "@/lib/db/schema/attorneys";
import { ilike, or, sql } from "drizzle-orm";

export interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  type: "case" | "client" | "attorney" | "document" | "invoice";
  href: string;
}

export async function globalSearch(query: string): Promise<SearchResult[]> {
  if (!query || query.length < 2) return [];

  const pattern = `%${query}%`;

  const [caseResults, clientResults, attorneyResults, docResults, invoiceResults] =
    await Promise.all([
      db
        .select({
          id: cases.id,
          caseNumber: cases.caseNumber,
          title: cases.title,
        })
        .from(cases)
        .where(
          or(ilike(cases.title, pattern), ilike(cases.caseNumber, pattern))
        )
        .limit(5),

      db
        .select({
          id: clients.id,
          firstName: clients.firstName,
          lastName: clients.lastName,
          email: clients.email,
        })
        .from(clients)
        .where(
          or(
            ilike(clients.firstName, pattern),
            ilike(clients.lastName, pattern),
            ilike(clients.email, pattern)
          )
        )
        .limit(5),

      db
        .select({
          id: attorneys.id,
          userId: attorneys.userId,
          lskNumber: attorneys.lskNumber,
          userName: users.name,
        })
        .from(attorneys)
        .innerJoin(users, sql`${attorneys.userId} = ${users.id}`)
        .where(
          or(
            ilike(users.name, pattern),
            ilike(attorneys.lskNumber, pattern)
          )
        )
        .limit(5),

      db
        .select({
          id: documents.id,
          title: documents.title,
          fileName: documents.fileName,
        })
        .from(documents)
        .where(
          or(
            ilike(documents.title, pattern),
            ilike(documents.fileName, pattern)
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
        .where(ilike(invoices.invoiceNumber, pattern))
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
}
