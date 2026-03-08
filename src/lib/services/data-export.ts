import { db } from "@/lib/db";
import { users } from "@/lib/db/schema/auth";
import { attorneys, attorneyPracticeAreas, attorneyLicenses, practisingCertificates, cpdRecords, disciplinaryRecords, professionalIndemnity, lskMembership } from "@/lib/db/schema/attorneys";
import { clients, clientContacts, conflictChecks, kycDocuments, clientRiskAssessments } from "@/lib/db/schema/clients";
import { cases, caseAssignments, caseNotes, caseTimeline, caseParties, pipelineStages, caseStageHistory, stageAutomations } from "@/lib/db/schema/cases";
import { invoices, invoiceLineItems, payments, trustAccounts, trustTransactions, quotes, receipts, creditNotes } from "@/lib/db/schema/billing";
import { timeEntries, expenses, requisitions } from "@/lib/db/schema/time-expenses";
import { documents, documentVersions, documentTemplates } from "@/lib/db/schema/documents";
import { calendarEvents, eventAttendees, deadlines, tasks, bringUps } from "@/lib/db/schema/calendar";
import { messages, notifications, smsLog } from "@/lib/db/schema/messaging";
import { firmSettings, practiceAreas, billingRates, emailTemplates, smsTemplates, auditLog, customFields, tags, rolePermissions } from "@/lib/db/schema/settings";
import { branches, branchUsers } from "@/lib/db/schema/branches";
import { courtFilings, serviceOfDocuments, causeLists, causeListEntries, courtRules } from "@/lib/db/schema/courts";
import { pettyCashTransactions, bankAccounts, bankTransactions, bankReconciliations } from "@/lib/db/schema/financial";
import { workflowTemplates, workflowRules, workflowExecutionLog } from "@/lib/db/schema/workflows";
import { suppliers, supplierInvoices } from "@/lib/db/schema/suppliers";
import { organizations, organizationMembers, apiKeys } from "@/lib/db/schema/organizations";
import { eq } from "drizzle-orm";

/**
 * Export all data for an organization as a structured JSON object.
 * Excludes sensitive fields: passwords, tokens, key hashes.
 */
export async function exportOrgData(organizationId: string) {
  // Get org info
  const [org] = await db
    .select({
      id: organizations.id,
      name: organizations.name,
      slug: organizations.slug,
      email: organizations.email,
      phone: organizations.phone,
      country: organizations.country,
      currency: organizations.currency,
      timezone: organizations.timezone,
      createdAt: organizations.createdAt,
    })
    .from(organizations)
    .where(eq(organizations.id, organizationId))
    .limit(1);

  if (!org) throw new Error("Organization not found");

  // Query all tables in parallel for performance.
  // Users are explicitly selected to exclude passwords/tokens.
  // API keys exclude keyHash. All other tables use select() (full rows).
  const [
    usersData,
    attorneysData,
    attorneyPracticeAreasData,
    licensesData,
    certificatesData,
    cpdData,
    disciplinaryData,
    indemnityData,
    lskData,
    clientsData,
    clientContactsData,
    conflictChecksData,
    kycDocumentsData,
    clientRiskData,
    casesData,
    caseAssignmentsData,
    caseNotesData,
    caseTimelineData,
    casePartiesData,
    pipelineStagesData,
    caseStageHistoryData,
    stageAutomationsData,
    invoicesData,
    lineItemsData,
    paymentsData,
    trustAccountsData,
    trustTransactionsData,
    quotesData,
    receiptsData,
    creditNotesData,
    timeEntriesData,
    expensesData,
    requisitionsData,
    documentsData,
    documentVersionsData,
    documentTemplatesData,
    eventsData,
    attendeesData,
    deadlinesData,
    tasksData,
    bringUpsData,
    messagesData,
    notificationsData,
    smsLogData,
    settingsData,
    practiceAreasData,
    billingRatesData,
    emailTemplatesData,
    smsTemplatesData,
    auditLogData,
    customFieldsData,
    tagsData,
    rolePermissionsData,
    branchesData,
    branchUsersData,
    courtFilingsData,
    serviceOfDocsData,
    causeListsData,
    causeListEntriesData,
    courtRulesData,
    pettyCashData,
    bankAccountsData,
    bankTransactionsData,
    bankReconciliationsData,
    workflowTemplatesData,
    workflowRulesData,
    workflowExecutionLogData,
    suppliersData,
    supplierInvoicesData,
    orgMembersData,
    apiKeysData,
  ] = await Promise.all([
    // Users (exclude passwords/tokens)
    db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        phone: users.phone,
        isActive: users.isActive,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.organizationId, organizationId)),
    // Attorneys
    db.select().from(attorneys).where(eq(attorneys.organizationId, organizationId)),
    db.select().from(attorneyPracticeAreas).where(eq(attorneyPracticeAreas.organizationId, organizationId)),
    db.select().from(attorneyLicenses).where(eq(attorneyLicenses.organizationId, organizationId)),
    db.select().from(practisingCertificates).where(eq(practisingCertificates.organizationId, organizationId)),
    db.select().from(cpdRecords).where(eq(cpdRecords.organizationId, organizationId)),
    db.select().from(disciplinaryRecords).where(eq(disciplinaryRecords.organizationId, organizationId)),
    db.select().from(professionalIndemnity).where(eq(professionalIndemnity.organizationId, organizationId)),
    db.select().from(lskMembership).where(eq(lskMembership.organizationId, organizationId)),
    // Clients
    db.select().from(clients).where(eq(clients.organizationId, organizationId)),
    db.select().from(clientContacts).where(eq(clientContacts.organizationId, organizationId)),
    db.select().from(conflictChecks).where(eq(conflictChecks.organizationId, organizationId)),
    db.select().from(kycDocuments).where(eq(kycDocuments.organizationId, organizationId)),
    db.select().from(clientRiskAssessments).where(eq(clientRiskAssessments.organizationId, organizationId)),
    // Cases
    db.select().from(cases).where(eq(cases.organizationId, organizationId)),
    db.select().from(caseAssignments).where(eq(caseAssignments.organizationId, organizationId)),
    db.select().from(caseNotes).where(eq(caseNotes.organizationId, organizationId)),
    db.select().from(caseTimeline).where(eq(caseTimeline.organizationId, organizationId)),
    db.select().from(caseParties).where(eq(caseParties.organizationId, organizationId)),
    db.select().from(pipelineStages).where(eq(pipelineStages.organizationId, organizationId)),
    db.select().from(caseStageHistory).where(eq(caseStageHistory.organizationId, organizationId)),
    db.select().from(stageAutomations).where(eq(stageAutomations.organizationId, organizationId)),
    // Billing
    db.select().from(invoices).where(eq(invoices.organizationId, organizationId)),
    db.select().from(invoiceLineItems).where(eq(invoiceLineItems.organizationId, organizationId)),
    db.select().from(payments).where(eq(payments.organizationId, organizationId)),
    db.select().from(trustAccounts).where(eq(trustAccounts.organizationId, organizationId)),
    db.select().from(trustTransactions).where(eq(trustTransactions.organizationId, organizationId)),
    db.select().from(quotes).where(eq(quotes.organizationId, organizationId)),
    db.select().from(receipts).where(eq(receipts.organizationId, organizationId)),
    db.select().from(creditNotes).where(eq(creditNotes.organizationId, organizationId)),
    // Time & Expenses
    db.select().from(timeEntries).where(eq(timeEntries.organizationId, organizationId)),
    db.select().from(expenses).where(eq(expenses.organizationId, organizationId)),
    db.select().from(requisitions).where(eq(requisitions.organizationId, organizationId)),
    // Documents (metadata only)
    db.select().from(documents).where(eq(documents.organizationId, organizationId)),
    db.select().from(documentVersions).where(eq(documentVersions.organizationId, organizationId)),
    db.select().from(documentTemplates).where(eq(documentTemplates.organizationId, organizationId)),
    // Calendar
    db.select().from(calendarEvents).where(eq(calendarEvents.organizationId, organizationId)),
    db.select().from(eventAttendees).where(eq(eventAttendees.organizationId, organizationId)),
    db.select().from(deadlines).where(eq(deadlines.organizationId, organizationId)),
    db.select().from(tasks).where(eq(tasks.organizationId, organizationId)),
    db.select().from(bringUps).where(eq(bringUps.organizationId, organizationId)),
    // Messaging
    db.select().from(messages).where(eq(messages.organizationId, organizationId)),
    db.select().from(notifications).where(eq(notifications.organizationId, organizationId)),
    db.select().from(smsLog).where(eq(smsLog.organizationId, organizationId)),
    // Settings
    db.select().from(firmSettings).where(eq(firmSettings.organizationId, organizationId)),
    db.select().from(practiceAreas).where(eq(practiceAreas.organizationId, organizationId)),
    db.select().from(billingRates).where(eq(billingRates.organizationId, organizationId)),
    db.select().from(emailTemplates).where(eq(emailTemplates.organizationId, organizationId)),
    db.select().from(smsTemplates).where(eq(smsTemplates.organizationId, organizationId)),
    db.select().from(auditLog).where(eq(auditLog.organizationId, organizationId)),
    db.select().from(customFields).where(eq(customFields.organizationId, organizationId)),
    db.select().from(tags).where(eq(tags.organizationId, organizationId)),
    db.select().from(rolePermissions).where(eq(rolePermissions.organizationId, organizationId)),
    // Branches
    db.select().from(branches).where(eq(branches.organizationId, organizationId)),
    db.select().from(branchUsers).where(eq(branchUsers.organizationId, organizationId)),
    // Courts (courts + courtStations are global shared tables, not org-scoped)
    db.select().from(courtFilings).where(eq(courtFilings.organizationId, organizationId)),
    db.select().from(serviceOfDocuments).where(eq(serviceOfDocuments.organizationId, organizationId)),
    db.select().from(causeLists).where(eq(causeLists.organizationId, organizationId)),
    db.select().from(causeListEntries).where(eq(causeListEntries.organizationId, organizationId)),
    db.select().from(courtRules).where(eq(courtRules.organizationId, organizationId)),
    // Financial
    db.select().from(pettyCashTransactions).where(eq(pettyCashTransactions.organizationId, organizationId)),
    db.select().from(bankAccounts).where(eq(bankAccounts.organizationId, organizationId)),
    db.select().from(bankTransactions).where(eq(bankTransactions.organizationId, organizationId)),
    db.select().from(bankReconciliations).where(eq(bankReconciliations.organizationId, organizationId)),
    // Workflows
    db.select().from(workflowTemplates).where(eq(workflowTemplates.organizationId, organizationId)),
    db.select().from(workflowRules).where(eq(workflowRules.organizationId, organizationId)),
    db.select().from(workflowExecutionLog).where(eq(workflowExecutionLog.organizationId, organizationId)),
    // Suppliers
    db.select().from(suppliers).where(eq(suppliers.organizationId, organizationId)),
    db.select().from(supplierInvoices).where(eq(supplierInvoices.organizationId, organizationId)),
    // Organization members
    db.select().from(organizationMembers).where(eq(organizationMembers.organizationId, organizationId)),
    // API keys (exclude keyHash for security)
    db.select({
      id: apiKeys.id,
      name: apiKeys.name,
      keyPrefix: apiKeys.keyPrefix,
      permissions: apiKeys.permissions,
      lastUsedAt: apiKeys.lastUsedAt,
      expiresAt: apiKeys.expiresAt,
      revokedAt: apiKeys.revokedAt,
      createdBy: apiKeys.createdBy,
      createdAt: apiKeys.createdAt,
    }).from(apiKeys).where(eq(apiKeys.organizationId, organizationId)),
  ]);

  return {
    exportedAt: new Date().toISOString(),
    organizationId,
    organizationName: org.name,
    organization: org,
    tables: {
      users: usersData,
      attorneys: attorneysData,
      attorney_practice_areas: attorneyPracticeAreasData,
      attorney_licenses: licensesData,
      practising_certificates: certificatesData,
      cpd_records: cpdData,
      disciplinary_records: disciplinaryData,
      professional_indemnity: indemnityData,
      lsk_membership: lskData,
      clients: clientsData,
      client_contacts: clientContactsData,
      conflict_checks: conflictChecksData,
      kyc_documents: kycDocumentsData,
      client_risk_assessments: clientRiskData,
      cases: casesData,
      case_assignments: caseAssignmentsData,
      case_notes: caseNotesData,
      case_timeline: caseTimelineData,
      case_parties: casePartiesData,
      pipeline_stages: pipelineStagesData,
      case_stage_history: caseStageHistoryData,
      stage_automations: stageAutomationsData,
      invoices: invoicesData,
      invoice_line_items: lineItemsData,
      payments: paymentsData,
      trust_accounts: trustAccountsData,
      trust_transactions: trustTransactionsData,
      quotes: quotesData,
      receipts: receiptsData,
      credit_notes: creditNotesData,
      time_entries: timeEntriesData,
      expenses: expensesData,
      requisitions: requisitionsData,
      documents: documentsData,
      document_versions: documentVersionsData,
      document_templates: documentTemplatesData,
      calendar_events: eventsData,
      event_attendees: attendeesData,
      deadlines: deadlinesData,
      tasks: tasksData,
      bring_ups: bringUpsData,
      messages: messagesData,
      notifications: notificationsData,
      sms_log: smsLogData,
      firm_settings: settingsData,
      practice_areas: practiceAreasData,
      billing_rates: billingRatesData,
      email_templates: emailTemplatesData,
      sms_templates: smsTemplatesData,
      audit_log: auditLogData,
      custom_fields: customFieldsData,
      tags: tagsData,
      role_permissions: rolePermissionsData,
      branches: branchesData,
      branch_users: branchUsersData,
      court_filings: courtFilingsData,
      service_of_documents: serviceOfDocsData,
      cause_lists: causeListsData,
      cause_list_entries: causeListEntriesData,
      court_rules: courtRulesData,
      petty_cash_transactions: pettyCashData,
      bank_accounts: bankAccountsData,
      bank_transactions: bankTransactionsData,
      bank_reconciliations: bankReconciliationsData,
      workflow_templates: workflowTemplatesData,
      workflow_rules: workflowRulesData,
      workflow_execution_log: workflowExecutionLogData,
      suppliers: suppliersData,
      supplier_invoices: supplierInvoicesData,
      organization_members: orgMembersData,
      api_keys: apiKeysData,
    },
  };
}
