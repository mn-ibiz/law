/**
 * Data Migration Script: Assign existing records to a default organization.
 *
 * This script is used when migrating an existing single-tenant database
 * to multi-tenant. It creates a default "Legacy" organization and assigns
 * all existing records (that have NULL organizationId) to it.
 *
 * Usage: npx tsx src/lib/db/migrate-to-multi-tenant.ts
 *
 * IMPORTANT: Run this BEFORE applying NOT NULL constraints on organizationId columns.
 * This script is idempotent and safe to run multiple times.
 */

import { db } from "@/lib/db";
import { organizations, plans } from "@/lib/db/schema/organizations";
import { users } from "@/lib/db/schema/auth";
import { branches, branchUsers } from "@/lib/db/schema/branches";
import { attorneys, attorneyLicenses, attorneyPracticeAreas, practisingCertificates, cpdRecords, disciplinaryRecords, professionalIndemnity, lskMembership } from "@/lib/db/schema/attorneys";
import { clients, clientContacts, conflictChecks, kycDocuments, clientRiskAssessments } from "@/lib/db/schema/clients";
import { cases, caseAssignments, caseNotes, caseTimeline, caseParties, pipelineStages, stageAutomations, caseStageHistory } from "@/lib/db/schema/cases";
import { invoices, invoiceLineItems, payments, trustAccounts, trustTransactions, quotes, receipts, creditNotes } from "@/lib/db/schema/billing";
import { pettyCashTransactions, bankAccounts, bankReconciliations, bankTransactions } from "@/lib/db/schema/financial";
import { requisitions } from "@/lib/db/schema/time-expenses";
import { documents, documentVersions, documentTemplates } from "@/lib/db/schema/documents";
import { calendarEvents, eventAttendees, deadlines, tasks, bringUps } from "@/lib/db/schema/calendar";
import { courtFilings, serviceOfDocuments, causeLists, causeListEntries, courtRules } from "@/lib/db/schema/courts";
import { messages, notifications, smsLog } from "@/lib/db/schema/messaging";
import { firmSettings, practiceAreas, billingRates, customFields, tags, emailTemplates, smsTemplates, rolePermissions, auditLog } from "@/lib/db/schema/settings";
import { workflowTemplates, workflowRules, workflowExecutionLog } from "@/lib/db/schema/workflows";
import { suppliers, supplierInvoices } from "@/lib/db/schema/suppliers";
import { timeEntries, expenses } from "@/lib/db/schema/time-expenses";
import { eq, sql, isNull } from "drizzle-orm";

const LEGACY_ORG_SLUG = "legacy";
const LEGACY_ORG_NAME = "Legacy Organization";

async function migrateToMultiTenant() {
  console.log("Starting multi-tenant data migration...\n");

  // 1. Create or find default plan
  let [defaultPlan] = await db
    .select({ id: plans.id })
    .from(plans)
    .where(eq(plans.slug, "professional"))
    .limit(1);

  if (!defaultPlan) {
    [defaultPlan] = await db
      .insert(plans)
      .values({
        name: "Professional",
        slug: "professional",
        description: "Default plan for migrated organizations",
        maxUsers: 25,
        maxCases: 1000,
        maxStorageMb: 51200,
        monthlyPrice: "0",
        annualPrice: "0",
        currency: "KES",
        trialDays: 0,
        isActive: true,
      })
      .returning({ id: plans.id });
    console.log("Created default plan: Professional");
  }

  // 2. Create or find legacy organization
  let [legacyOrg] = await db
    .select({ id: organizations.id })
    .from(organizations)
    .where(eq(organizations.slug, LEGACY_ORG_SLUG))
    .limit(1);

  if (!legacyOrg) {
    [legacyOrg] = await db
      .insert(organizations)
      .values({
        name: LEGACY_ORG_NAME,
        slug: LEGACY_ORG_SLUG,
        country: "KE",
        timezone: "Africa/Nairobi",
        locale: "en-KE",
        currency: "KES",
        status: "active",
        planId: defaultPlan.id,
      })
      .returning({ id: organizations.id });
    console.log(`Created legacy organization: ${LEGACY_ORG_NAME} (${legacyOrg.id})`);
  } else {
    console.log(`Found existing legacy organization: ${legacyOrg.id}`);
  }

  const orgId = legacyOrg.id;

  // 3. Migrate all tables - order matters for foreign key constraints
  // Tables are grouped by dependency order

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tablesToMigrate: Array<{ name: string; table: any; column: any }> = [
    // Core tables first
    { name: "users", table: users, column: users.organizationId },
    { name: "branches", table: branches, column: branches.organizationId },
    { name: "branchUsers", table: branchUsers, column: branchUsers.organizationId },

    // Attorneys
    { name: "attorneys", table: attorneys, column: attorneys.organizationId },
    { name: "attorneyLicenses", table: attorneyLicenses, column: attorneyLicenses.organizationId },
    { name: "attorneyPracticeAreas", table: attorneyPracticeAreas, column: attorneyPracticeAreas.organizationId },
    { name: "practisingCertificates", table: practisingCertificates, column: practisingCertificates.organizationId },
    { name: "cpdRecords", table: cpdRecords, column: cpdRecords.organizationId },
    { name: "disciplinaryRecords", table: disciplinaryRecords, column: disciplinaryRecords.organizationId },
    { name: "professionalIndemnity", table: professionalIndemnity, column: professionalIndemnity.organizationId },
    { name: "lskMembership", table: lskMembership, column: lskMembership.organizationId },

    // Clients
    { name: "clients", table: clients, column: clients.organizationId },
    { name: "clientContacts", table: clientContacts, column: clientContacts.organizationId },
    { name: "conflictChecks", table: conflictChecks, column: conflictChecks.organizationId },
    { name: "kycDocuments", table: kycDocuments, column: kycDocuments.organizationId },
    { name: "clientRiskAssessments", table: clientRiskAssessments, column: clientRiskAssessments.organizationId },

    // Cases
    { name: "cases", table: cases, column: cases.organizationId },
    { name: "caseAssignments", table: caseAssignments, column: caseAssignments.organizationId },
    { name: "caseNotes", table: caseNotes, column: caseNotes.organizationId },
    { name: "caseTimeline", table: caseTimeline, column: caseTimeline.organizationId },
    { name: "caseParties", table: caseParties, column: caseParties.organizationId },
    { name: "pipelineStages", table: pipelineStages, column: pipelineStages.organizationId },
    { name: "stageAutomations", table: stageAutomations, column: stageAutomations.organizationId },
    { name: "caseStageHistory", table: caseStageHistory, column: caseStageHistory.organizationId },

    // Billing
    { name: "invoices", table: invoices, column: invoices.organizationId },
    { name: "invoiceLineItems", table: invoiceLineItems, column: invoiceLineItems.organizationId },
    { name: "payments", table: payments, column: payments.organizationId },
    { name: "trustAccounts", table: trustAccounts, column: trustAccounts.organizationId },
    { name: "trustTransactions", table: trustTransactions, column: trustTransactions.organizationId },
    { name: "quotes", table: quotes, column: quotes.organizationId },
    { name: "receipts", table: receipts, column: receipts.organizationId },
    { name: "creditNotes", table: creditNotes, column: creditNotes.organizationId },

    // Financial
    { name: "pettyCashTransactions", table: pettyCashTransactions, column: pettyCashTransactions.organizationId },
    { name: "bankAccounts", table: bankAccounts, column: bankAccounts.organizationId },
    { name: "bankReconciliations", table: bankReconciliations, column: bankReconciliations.organizationId },
    { name: "bankTransactions", table: bankTransactions, column: bankTransactions.organizationId },
    { name: "requisitions", table: requisitions, column: requisitions.organizationId },

    // Documents
    { name: "documents", table: documents, column: documents.organizationId },
    { name: "documentVersions", table: documentVersions, column: documentVersions.organizationId },
    { name: "documentTemplates", table: documentTemplates, column: documentTemplates.organizationId },

    // Calendar
    { name: "calendarEvents", table: calendarEvents, column: calendarEvents.organizationId },
    { name: "eventAttendees", table: eventAttendees, column: eventAttendees.organizationId },
    { name: "deadlines", table: deadlines, column: deadlines.organizationId },
    { name: "tasks", table: tasks, column: tasks.organizationId },
    { name: "bringUps", table: bringUps, column: bringUps.organizationId },

    // Courts (operational tables only - courts/courtStations are global)
    { name: "courtFilings", table: courtFilings, column: courtFilings.organizationId },
    { name: "serviceOfDocuments", table: serviceOfDocuments, column: serviceOfDocuments.organizationId },
    { name: "causeLists", table: causeLists, column: causeLists.organizationId },
    { name: "causeListEntries", table: causeListEntries, column: causeListEntries.organizationId },
    { name: "courtRules", table: courtRules, column: courtRules.organizationId },

    // Communications
    { name: "messages", table: messages, column: messages.organizationId },
    { name: "notifications", table: notifications, column: notifications.organizationId },
    { name: "smsLog", table: smsLog, column: smsLog.organizationId },

    // Settings
    { name: "firmSettings", table: firmSettings, column: firmSettings.organizationId },
    { name: "practiceAreas", table: practiceAreas, column: practiceAreas.organizationId },
    { name: "billingRates", table: billingRates, column: billingRates.organizationId },
    { name: "customFields", table: customFields, column: customFields.organizationId },
    { name: "tags", table: tags, column: tags.organizationId },
    { name: "emailTemplates", table: emailTemplates, column: emailTemplates.organizationId },
    { name: "smsTemplates", table: smsTemplates, column: smsTemplates.organizationId },
    { name: "rolePermissions", table: rolePermissions, column: rolePermissions.organizationId },
    { name: "auditLog", table: auditLog, column: auditLog.organizationId },

    // Workflows
    { name: "workflowTemplates", table: workflowTemplates, column: workflowTemplates.organizationId },
    { name: "workflowRules", table: workflowRules, column: workflowRules.organizationId },
    { name: "workflowExecutionLog", table: workflowExecutionLog, column: workflowExecutionLog.organizationId },

    // Suppliers
    { name: "suppliers", table: suppliers, column: suppliers.organizationId },
    { name: "supplierInvoices", table: supplierInvoices, column: supplierInvoices.organizationId },

    // Time & Expenses
    { name: "timeEntries", table: timeEntries, column: timeEntries.organizationId },
    { name: "expenses", table: expenses, column: expenses.organizationId },
  ];

  let totalMigrated = 0;

  for (const { name, table, column } of tablesToMigrate) {
    try {
      const result = await db
        .update(table)
        .set({ organizationId: orgId })
        .where(isNull(column));

      const count = result.rowCount ?? 0;
      if (count > 0) {
        console.log(`  ${name}: ${count} records assigned to legacy org`);
        totalMigrated += count;
      }
    } catch (error) {
      // Table might not have any NULL records or might not exist yet
      const errMsg = error instanceof Error ? error.message : String(error);
      if (!errMsg.includes("does not exist")) {
        console.warn(`  ${name}: Warning - ${errMsg}`);
      }
    }
  }

  console.log(`\nMigration complete. ${totalMigrated} total records assigned to organization ${orgId}`);

  // 4. Verify no NULL organizationId records remain
  console.log("\nVerification - checking for remaining NULL organizationId records...");
  let hasNulls = false;
  for (const { name, table, column } of tablesToMigrate) {
    try {
      const [result] = await db
        .select({ count: sql<number>`count(*)` })
        .from(table)
        .where(isNull(column));

      if (result && Number(result.count) > 0) {
        console.warn(`  WARNING: ${name} still has ${result.count} records with NULL organizationId`);
        hasNulls = true;
      }
    } catch {
      // Skip tables that don't exist
    }
  }

  if (!hasNulls) {
    console.log("  All records have organizationId assigned. Safe to apply NOT NULL constraints.");
  } else {
    console.warn("\n  Some records still have NULL organizationId. Investigate before applying NOT NULL constraints.");
  }
}

migrateToMultiTenant()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Migration failed:", error);
    process.exit(1);
  });
