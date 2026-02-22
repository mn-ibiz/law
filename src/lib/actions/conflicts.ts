"use server";

import { db } from "@/lib/db";
import { clients, conflictChecks } from "@/lib/db/schema/clients";
import { cases, caseParties } from "@/lib/db/schema/cases";
import { auth } from "@/lib/auth/auth";
import { createAuditLog } from "@/lib/utils/audit";
import { ilike, or, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export interface ConflictResult {
  entityType: "client" | "opposing_party" | "opposing_counsel" | "case_party";
  entityName: string;
  entityId: string;
  matchType: string;
  caseReference?: string;
  severity: "none" | "low" | "medium" | "high";
}

export async function searchConflicts(query: string): Promise<ConflictResult[]> {
  if (!query || query.length < 2) return [];

  const pattern = `%${query}%`;
  const results: ConflictResult[] = [];

  // Search clients
  const clientMatches = await db
    .select({
      id: clients.id,
      firstName: clients.firstName,
      lastName: clients.lastName,
      status: clients.status,
    })
    .from(clients)
    .where(
      or(
        ilike(clients.firstName, pattern),
        ilike(clients.lastName, pattern),
        ilike(clients.companyName, pattern)
      )
    )
    .limit(10);

  for (const c of clientMatches) {
    const name = `${c.firstName} ${c.lastName}`;
    const isExact = name.toLowerCase() === query.toLowerCase();
    results.push({
      entityType: "client",
      entityName: name,
      entityId: c.id,
      matchType: isExact ? "Exact name match" : "Partial name match",
      severity: c.status === "active" ? (isExact ? "high" : "medium") : "low",
    });
  }

  // Search opposing parties in cases
  const opposingMatches = await db
    .select({
      id: cases.id,
      caseNumber: cases.caseNumber,
      opposingParty: cases.opposingParty,
      opposingCounsel: cases.opposingCounsel,
    })
    .from(cases)
    .where(
      or(
        ilike(cases.opposingParty, pattern),
        ilike(cases.opposingCounsel, pattern)
      )
    )
    .limit(10);

  for (const c of opposingMatches) {
    if (c.opposingParty?.toLowerCase().includes(query.toLowerCase())) {
      results.push({
        entityType: "opposing_party",
        entityName: c.opposingParty!,
        entityId: c.id,
        matchType: "Opposing party match",
        caseReference: c.caseNumber,
        severity: "high",
      });
    }
    if (c.opposingCounsel?.toLowerCase().includes(query.toLowerCase())) {
      results.push({
        entityType: "opposing_counsel",
        entityName: c.opposingCounsel!,
        entityId: c.id,
        matchType: "Opposing counsel match",
        caseReference: c.caseNumber,
        severity: "high",
      });
    }
  }

  // Search case parties
  const partyMatches = await db
    .select({
      id: caseParties.id,
      name: caseParties.name,
      caseId: caseParties.caseId,
      role: caseParties.role,
    })
    .from(caseParties)
    .where(ilike(caseParties.name, pattern))
    .limit(10);

  for (const p of partyMatches) {
    results.push({
      entityType: "case_party",
      entityName: p.name,
      entityId: p.caseId,
      matchType: `Case party (${p.role})`,
      severity: "low",
    });
  }

  return results;
}

export async function resolveConflict(
  clientId: string,
  searchQuery: string,
  result: "clear" | "potential" | "conflict_found",
  resolutionNotes?: string
) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  const record = await db
    .insert(conflictChecks)
    .values({
      clientId,
      searchQuery,
      result,
      resolutionNotes,
      checkedBy: session.user.id as string,
    })
    .returning();

  await createAuditLog(
    session.user.id as string,
    "create",
    "conflict_check",
    record[0].id,
    { clientId, searchQuery, result }
  );

  revalidatePath(`/clients/${clientId}`);
  return { data: record[0] };
}
