import { pgEnum } from "drizzle-orm/pg-core";

// Auth
export const userRole = pgEnum("user_role", ["admin", "attorney", "client"]);

// Attorneys
export const attorneyTitle = pgEnum("attorney_title", [
  "partner",
  "senior_associate",
  "associate",
  "of_counsel",
  "paralegal",
]);
export const licenseStatus = pgEnum("license_status", [
  "active",
  "inactive",
  "suspended",
  "retired",
  "struck_off",
  "deceased",
]);

// Clients
export const clientType = pgEnum("client_type", ["individual", "organization"]);
export const clientStatus = pgEnum("client_status", ["active", "inactive", "prospective"]);
export const kycStatus = pgEnum("kyc_status", [
  "pending",
  "in_progress",
  "verified",
  "rejected",
  "expired",
]);
export const riskLevel = pgEnum("risk_level", ["low", "medium", "high", "critical"]);
export const leadSource = pgEnum("lead_source", [
  "referral",
  "website",
  "walk_in",
  "advertising",
  "social_media",
  "event",
  "other",
]);

// Cases
export const caseStatus = pgEnum("case_status", [
  "open",
  "in_progress",
  "hearing",
  "resolved",
  "closed",
  "archived",
]);
export const casePriority = pgEnum("case_priority", ["low", "medium", "high", "urgent"]);
export const billingType = pgEnum("billing_type", [
  "hourly",
  "flat_fee",
  "contingency",
  "retainer",
  "pro_bono",
]);
export const casePartyRole = pgEnum("case_party_role", [
  "client",
  "opposing_party",
  "opposing_counsel",
  "witness",
  "expert",
  "judge",
  "other",
]);
export const assignmentRole = pgEnum("assignment_role", [
  "lead",
  "assigned",
  "supervising",
  "of_counsel",
]);

// Documents
export const documentCategory = pgEnum("document_category", [
  "pleading",
  "correspondence",
  "contract",
  "evidence",
  "court_order",
  "filing",
  "template",
  "other",
]);
export const documentStatus = pgEnum("document_status", [
  "draft",
  "final",
  "signed",
  "archived",
]);
export const documentReviewStatus = pgEnum("document_review_status", [
  "pending_review",
  "approved",
  "rejected",
]);

// Calendar
export const eventType = pgEnum("event_type", [
  "court_hearing",
  "meeting",
  "deadline",
  "reminder",
  "consultation",
  "deposition",
  "mediation",
  "arbitration",
  "filing_deadline",
  "client_meeting",
  "internal_meeting",
  "court_mention",
  "site_visit",
  "training",
  "other",
]);
export const taskStatus = pgEnum("task_status", [
  "pending",
  "in_progress",
  "completed",
  "cancelled",
]);
export const deadlinePriority = pgEnum("deadline_priority", [
  "low",
  "medium",
  "high",
  "critical",
]);
export const bringUpStatus = pgEnum("bring_up_status", [
  "pending",
  "completed",
  "dismissed",
  "overdue",
]);

// Expenses
export const expenseCategory = pgEnum("expense_category", [
  "filing_fee",
  "travel",
  "courier",
  "printing",
  "expert_fee",
  "court_fee",
  "other",
]);

// Billing
export const invoiceStatus = pgEnum("invoice_status", [
  "draft",
  "sent",
  "viewed",
  "partially_paid",
  "paid",
  "overdue",
  "cancelled",
  "written_off",
]);
export const paymentMethod = pgEnum("payment_method", [
  "bank_transfer",
  "mpesa",
  "cash",
  "cheque",
  "credit_card",
  "other",
]);
export const trustAccountType = pgEnum("trust_account_type", ["client", "general"]);
export const trustTransactionType = pgEnum("trust_transaction_type", [
  "deposit",
  "withdrawal",
  "transfer",
  "interest",
  "fee",
]);
export const quoteStatus = pgEnum("quote_status", ["draft", "sent", "accepted", "rejected", "expired"]);

// Financial
export const pettyCashType = pgEnum("petty_cash_type", ["deposit", "withdrawal"]);
export const reconciliationStatus = pgEnum("reconciliation_status", [
  "pending",
  "in_progress",
  "completed",
  "discrepancy",
]);

// Courts
export const filingStatus = pgEnum("filing_status", [
  "pending",
  "filed",
  "accepted",
  "rejected",
  "served",
]);
export const serviceMethod = pgEnum("service_method", [
  "personal",
  "substituted",
  "email",
  "registered_mail",
  "court_process_server",
  "other",
]);

// Requisitions
export const requisitionStatus = pgEnum("requisition_status", [
  "draft",
  "pending_approval",
  "approved",
  "rejected",
  "completed",
]);

// Messaging
export const messageStatus = pgEnum("message_status", ["sent", "delivered", "read"]);
export const notificationType = pgEnum("notification_type", [
  "info",
  "warning",
  "deadline",
  "assignment",
  "billing",
  "system",
]);

// Workflows
export const workflowTriggerType = pgEnum("workflow_trigger_type", [
  "case_status_change",
  "deadline_approaching",
  "document_uploaded",
  "invoice_created",
  "payment_received",
  "task_completed",
  "manual",
]);
export const workflowActionType = pgEnum("workflow_action_type", [
  "send_email",
  "send_sms",
  "create_task",
  "update_status",
  "send_notification",
  "assign_attorney",
]);

// Audit
export const auditAction = pgEnum("audit_action", [
  "create",
  "update",
  "delete",
  "login",
  "logout",
  "export",
  "view",
]);

// Contact
export const contactType = pgEnum("contact_type", [
  "phone_call",
  "email",
  "in_person",
  "letter",
  "video_call",
]);

// Suppliers
export const supplierInvoiceStatus = pgEnum("supplier_invoice_status", [
  "pending",
  "approved",
  "paid",
  "cancelled",
]);

// Conflict checks
export const conflictSeverity = pgEnum("conflict_severity", [
  "clear",
  "potential",
  "conflict_found",
]);
