"use server";

import { db } from "@/lib/db";
import { clients, conflictChecks } from "@/lib/db/schema/clients";
import { cases, caseParties } from "@/lib/db/schema/cases";
import { auth } from "@/lib/auth/auth";
import { createAuditLog } from "@/lib/utils/audit";
import { ilike, or, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { safeAction } from "@/lib/utils/safe-action";

export interface ConflictResult {
  entityType: "client" | "opposing_party" | "opposing_counsel" | "case_party";
  entityName: string;
  entityId: string;
  matchType: string;
  caseReference?: string;
  severity: "none" | "low" | "medium" | "high";
}

export async function searchConflicts(query: string) {
  return safeAction(async () => {
    const session = await auth();
    if (!session?.user) return [];

    if (!query || query.length < 2) return [];

    // Only attorneys and admins can run conflict searches
    if (session.user.role === "client") return [];

    // Escape LIKE-special characters to prevent pattern injection
    const escaped = query.replace(/[%_\\]/g, "\\$&");
    const pattern = `%${escaped}%`;
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
  });
}

export interface ConflictMatch {
  type: string;
  name: string;
  detail: string;
}

export interface ConflictCheckResult {
  hasConflict: boolean;
  matches: ConflictMatch[];
}

/**
 * Internal helper: run a conflict check against existing clients and cases.
 * Does NOT require auth — caller is responsible for authorization.
 */
export async function runConflictCheck(query: string): Promise<ConflictCheckResult> {
  if (!query || query.length < 2) return { hasConflict: false, matches: [] };

  // Escape LIKE-special characters to prevent pattern injection
  const escaped = query.replace(/[%_\\]/g, "\\$&");
  const pattern = `%${escaped}%`;
  const matches: ConflictMatch[] = [];

  // Search clients by name and company name
  const clientMatches = await db
    .select({
      id: clients.id,
      firstName: clients.firstName,
      lastName: clients.lastName,
      companyName: clients.companyName,
    })
    .from(clients)
    .where(
      or(
        ilike(clients.firstName, pattern),
        ilike(clients.lastName, pattern),
        ilike(clients.companyName, pattern)
      )
    )
    .limit(20);

  for (const c of clientMatches) {
    const name = `${c.firstName} ${c.lastName}`;
    matches.push({
      type: "client",
      name,
      detail: c.companyName
        ? `Client (${c.companyName})`
        : "Client",
    });
  }

  // Search opposing parties and opposing counsel in cases
  const caseMatches = await db
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
    .limit(20);

  for (const c of caseMatches) {
    if (c.opposingParty?.toLowerCase().includes(query.toLowerCase())) {
      matches.push({
        type: "opposing_party",
        name: c.opposingParty!,
        detail: `Opposing party in case ${c.caseNumber}`,
      });
    }
    if (c.opposingCounsel?.toLowerCase().includes(query.toLowerCase())) {
      matches.push({
        type: "opposing_counsel",
        name: c.opposingCounsel!,
        detail: `Opposing counsel in case ${c.caseNumber}`,
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
    .limit(20);

  for (const p of partyMatches) {
    matches.push({
      type: "case_party",
      name: p.name,
      detail: `Case party (${p.role})`,
    });
  }

  return { hasConflict: matches.length > 0, matches };
}

export async function resolveConflict(
  clientId: string,
  searchQuery: string,
  result: "clear" | "potential" | "conflict_found",
  resolutionNotes?: string
) {
  return safeAction(async () => {
    const session = await auth();
    if (!session?.user) return { error: "Unauthorized" };
    if (!["admin", "attorney"].includes(session.user.role)) {
      return { error: "Unauthorized" };
    }

    // Verify client exists before creating conflict check record
    const [client] = await db
      .select({ id: clients.id })
      .from(clients)
      .where(eq(clients.id, clientId))
      .limit(1);
    if (!client) return { error: "Client not found" };

    const record = await db
      .insert(conflictChecks)
      .values({
        clientId,
        searchQuery,
        result,
        resolutionNotes,
        checkedBy: session.user.id,
      })
      .returning();

    await createAuditLog(
      session.user.id,
      "create",
      "conflict_check",
      record[0].id,
      { clientId, searchQuery, result }
    );

    revalidatePath(`/clients/${clientId}`);
    return { data: record[0] };
  });
}
