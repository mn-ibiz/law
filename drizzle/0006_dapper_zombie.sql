ALTER TYPE "public"."user_role" ADD VALUE 'super_admin';--> statement-breakpoint
CREATE TABLE "organization_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" text DEFAULT 'member' NOT NULL,
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"email" text,
	"phone" text,
	"website" text,
	"address" text,
	"city" text,
	"county" text,
	"country" text DEFAULT 'KE' NOT NULL,
	"logo_url" text,
	"timezone" text DEFAULT 'Africa/Nairobi' NOT NULL,
	"locale" text DEFAULT 'en-KE' NOT NULL,
	"currency" text DEFAULT 'KES' NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"plan_id" uuid,
	"trial_ends_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "organizations_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"max_users" integer,
	"max_cases" integer,
	"max_storage_mb" integer,
	"features" text,
	"monthly_price" numeric(10, 2),
	"annual_price" numeric(10, 2),
	"currency" text DEFAULT 'KES' NOT NULL,
	"trial_days" integer DEFAULT 14 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "plans_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "attorneys" DROP CONSTRAINT "attorneys_bar_number_unique";--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_email_unique";--> statement-breakpoint
ALTER TABLE "credit_notes" DROP CONSTRAINT "credit_notes_credit_note_number_unique";--> statement-breakpoint
ALTER TABLE "invoices" DROP CONSTRAINT "invoices_invoice_number_unique";--> statement-breakpoint
ALTER TABLE "quotes" DROP CONSTRAINT "quotes_quote_number_unique";--> statement-breakpoint
ALTER TABLE "receipts" DROP CONSTRAINT "receipts_receipt_number_unique";--> statement-breakpoint
ALTER TABLE "trust_accounts" DROP CONSTRAINT "trust_accounts_account_number_unique";--> statement-breakpoint
ALTER TABLE "cases" DROP CONSTRAINT "cases_case_number_unique";--> statement-breakpoint
ALTER TABLE "bank_accounts" DROP CONSTRAINT "bank_accounts_account_number_unique";--> statement-breakpoint
ALTER TABLE "requisitions" DROP CONSTRAINT "requisitions_requisition_number_unique";--> statement-breakpoint
ALTER TABLE "firm_settings" DROP CONSTRAINT "firm_settings_key_unique";--> statement-breakpoint
ALTER TABLE "practice_areas" DROP CONSTRAINT "practice_areas_name_unique";--> statement-breakpoint
ALTER TABLE "tags" DROP CONSTRAINT "tags_name_unique";--> statement-breakpoint
DROP INDEX "role_permissions_role_resource_idx";--> statement-breakpoint
ALTER TABLE "attorney_licenses" ADD COLUMN "organization_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "attorney_practice_areas" ADD COLUMN "organization_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "attorneys" ADD COLUMN "organization_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "cpd_records" ADD COLUMN "organization_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "disciplinary_records" ADD COLUMN "organization_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "lsk_membership" ADD COLUMN "organization_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "practising_certificates" ADD COLUMN "organization_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "professional_indemnity" ADD COLUMN "organization_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "organization_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "credit_notes" ADD COLUMN "organization_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "invoice_line_items" ADD COLUMN "organization_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "organization_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "organization_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "quotes" ADD COLUMN "organization_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "receipts" ADD COLUMN "organization_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "trust_accounts" ADD COLUMN "organization_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "trust_transactions" ADD COLUMN "organization_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "branches" ADD COLUMN "organization_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "bring_ups" ADD COLUMN "organization_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "calendar_events" ADD COLUMN "organization_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "deadlines" ADD COLUMN "organization_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "event_attendees" ADD COLUMN "organization_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "organization_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "case_assignments" ADD COLUMN "organization_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "case_notes" ADD COLUMN "organization_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "case_parties" ADD COLUMN "organization_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "case_stage_history" ADD COLUMN "organization_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "case_timeline" ADD COLUMN "organization_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "cases" ADD COLUMN "organization_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "cases" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "pipeline_stages" ADD COLUMN "organization_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "stage_automations" ADD COLUMN "organization_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "client_contacts" ADD COLUMN "organization_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "client_risk_assessments" ADD COLUMN "organization_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "organization_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "conflict_checks" ADD COLUMN "organization_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "kyc_documents" ADD COLUMN "organization_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "cause_list_entries" ADD COLUMN "organization_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "cause_lists" ADD COLUMN "organization_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "court_filings" ADD COLUMN "organization_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "court_rules" ADD COLUMN "organization_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "service_of_documents" ADD COLUMN "organization_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "document_templates" ADD COLUMN "organization_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "document_versions" ADD COLUMN "organization_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "organization_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "bank_accounts" ADD COLUMN "organization_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "bank_reconciliations" ADD COLUMN "organization_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "bank_transactions" ADD COLUMN "organization_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "petty_cash_transactions" ADD COLUMN "organization_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "expenses" ADD COLUMN "organization_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "requisitions" ADD COLUMN "organization_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "time_entries" ADD COLUMN "organization_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "supplier_invoices" ADD COLUMN "organization_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "suppliers" ADD COLUMN "organization_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "organization_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "notifications" ADD COLUMN "organization_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "sms_log" ADD COLUMN "organization_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "workflow_templates" ADD COLUMN "organization_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "audit_log" ADD COLUMN "organization_id" uuid;--> statement-breakpoint
ALTER TABLE "billing_rates" ADD COLUMN "organization_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "custom_fields" ADD COLUMN "organization_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "email_templates" ADD COLUMN "organization_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "firm_settings" ADD COLUMN "organization_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "practice_areas" ADD COLUMN "organization_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD COLUMN "organization_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "sms_templates" ADD COLUMN "organization_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "tags" ADD COLUMN "organization_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_plan_id_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "org_members_org_user_idx" ON "organization_members" USING btree ("organization_id","user_id");--> statement-breakpoint
CREATE INDEX "organizations_slug_idx" ON "organizations" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "organizations_status_idx" ON "organizations" USING btree ("status");--> statement-breakpoint
ALTER TABLE "attorney_licenses" ADD CONSTRAINT "attorney_licenses_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attorney_practice_areas" ADD CONSTRAINT "attorney_practice_areas_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attorneys" ADD CONSTRAINT "attorneys_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cpd_records" ADD CONSTRAINT "cpd_records_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "disciplinary_records" ADD CONSTRAINT "disciplinary_records_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lsk_membership" ADD CONSTRAINT "lsk_membership_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "practising_certificates" ADD CONSTRAINT "practising_certificates_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "professional_indemnity" ADD CONSTRAINT "professional_indemnity_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credit_notes" ADD CONSTRAINT "credit_notes_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_line_items" ADD CONSTRAINT "invoice_line_items_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "receipts" ADD CONSTRAINT "receipts_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trust_accounts" ADD CONSTRAINT "trust_accounts_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trust_transactions" ADD CONSTRAINT "trust_transactions_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "branches" ADD CONSTRAINT "branches_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bring_ups" ADD CONSTRAINT "bring_ups_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deadlines" ADD CONSTRAINT "deadlines_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_attendees" ADD CONSTRAINT "event_attendees_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "case_assignments" ADD CONSTRAINT "case_assignments_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "case_notes" ADD CONSTRAINT "case_notes_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "case_parties" ADD CONSTRAINT "case_parties_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "case_stage_history" ADD CONSTRAINT "case_stage_history_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "case_timeline" ADD CONSTRAINT "case_timeline_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cases" ADD CONSTRAINT "cases_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pipeline_stages" ADD CONSTRAINT "pipeline_stages_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stage_automations" ADD CONSTRAINT "stage_automations_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_contacts" ADD CONSTRAINT "client_contacts_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_risk_assessments" ADD CONSTRAINT "client_risk_assessments_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clients" ADD CONSTRAINT "clients_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conflict_checks" ADD CONSTRAINT "conflict_checks_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kyc_documents" ADD CONSTRAINT "kyc_documents_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cause_list_entries" ADD CONSTRAINT "cause_list_entries_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cause_lists" ADD CONSTRAINT "cause_lists_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "court_filings" ADD CONSTRAINT "court_filings_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "court_rules" ADD CONSTRAINT "court_rules_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_of_documents" ADD CONSTRAINT "service_of_documents_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_templates" ADD CONSTRAINT "document_templates_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_versions" ADD CONSTRAINT "document_versions_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bank_accounts" ADD CONSTRAINT "bank_accounts_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bank_reconciliations" ADD CONSTRAINT "bank_reconciliations_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bank_transactions" ADD CONSTRAINT "bank_transactions_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "petty_cash_transactions" ADD CONSTRAINT "petty_cash_transactions_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "requisitions" ADD CONSTRAINT "requisitions_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "time_entries" ADD CONSTRAINT "time_entries_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier_invoices" ADD CONSTRAINT "supplier_invoices_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "suppliers" ADD CONSTRAINT "suppliers_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sms_log" ADD CONSTRAINT "sms_log_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflow_templates" ADD CONSTRAINT "workflow_templates_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "billing_rates" ADD CONSTRAINT "billing_rates_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "custom_fields" ADD CONSTRAINT "custom_fields_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_templates" ADD CONSTRAINT "email_templates_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "firm_settings" ADD CONSTRAINT "firm_settings_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "practice_areas" ADD CONSTRAINT "practice_areas_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sms_templates" ADD CONSTRAINT "sms_templates_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tags" ADD CONSTRAINT "tags_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "attorney_licenses_organization_id_idx" ON "attorney_licenses" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "attorney_practice_areas_organization_id_idx" ON "attorney_practice_areas" USING btree ("organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX "attorneys_org_bar_number_idx" ON "attorneys" USING btree ("organization_id","bar_number");--> statement-breakpoint
CREATE INDEX "attorneys_organization_id_idx" ON "attorneys" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "cpd_records_organization_id_idx" ON "cpd_records" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "disciplinary_records_organization_id_idx" ON "disciplinary_records" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "lsk_membership_organization_id_idx" ON "lsk_membership" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "practising_certificates_organization_id_idx" ON "practising_certificates" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "professional_indemnity_organization_id_idx" ON "professional_indemnity" USING btree ("organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_org_idx" ON "users" USING btree ("email","organization_id");--> statement-breakpoint
CREATE INDEX "users_organization_id_idx" ON "users" USING btree ("organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX "credit_notes_org_credit_note_number_idx" ON "credit_notes" USING btree ("organization_id","credit_note_number");--> statement-breakpoint
CREATE INDEX "credit_notes_organization_id_idx" ON "credit_notes" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "invoice_line_items_organization_id_idx" ON "invoice_line_items" USING btree ("organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX "invoices_org_invoice_number_idx" ON "invoices" USING btree ("organization_id","invoice_number");--> statement-breakpoint
CREATE INDEX "invoices_organization_id_idx" ON "invoices" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "payments_organization_id_idx" ON "payments" USING btree ("organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX "quotes_org_quote_number_idx" ON "quotes" USING btree ("organization_id","quote_number");--> statement-breakpoint
CREATE INDEX "quotes_organization_id_idx" ON "quotes" USING btree ("organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX "receipts_org_receipt_number_idx" ON "receipts" USING btree ("organization_id","receipt_number");--> statement-breakpoint
CREATE INDEX "receipts_organization_id_idx" ON "receipts" USING btree ("organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX "trust_accounts_org_account_number_idx" ON "trust_accounts" USING btree ("organization_id","account_number");--> statement-breakpoint
CREATE INDEX "trust_accounts_organization_id_idx" ON "trust_accounts" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "trust_transactions_organization_id_idx" ON "trust_transactions" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "branches_organization_id_idx" ON "branches" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "bring_ups_organization_id_idx" ON "bring_ups" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "calendar_events_organization_id_idx" ON "calendar_events" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "deadlines_organization_id_idx" ON "deadlines" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "event_attendees_organization_id_idx" ON "event_attendees" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "tasks_organization_id_idx" ON "tasks" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "case_assignments_organization_id_idx" ON "case_assignments" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "case_notes_organization_id_idx" ON "case_notes" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "case_parties_organization_id_idx" ON "case_parties" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "case_stage_history_organization_id_idx" ON "case_stage_history" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "case_timeline_organization_id_idx" ON "case_timeline" USING btree ("organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX "cases_org_case_number_idx" ON "cases" USING btree ("organization_id","case_number");--> statement-breakpoint
CREATE INDEX "cases_organization_id_idx" ON "cases" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "pipeline_stages_organization_id_idx" ON "pipeline_stages" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "stage_automations_organization_id_idx" ON "stage_automations" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "client_contacts_organization_id_idx" ON "client_contacts" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "client_risk_assessments_organization_id_idx" ON "client_risk_assessments" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "clients_organization_id_idx" ON "clients" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "conflict_checks_organization_id_idx" ON "conflict_checks" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "kyc_documents_organization_id_idx" ON "kyc_documents" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "cause_list_entries_organization_id_idx" ON "cause_list_entries" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "cause_lists_organization_id_idx" ON "cause_lists" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "court_filings_organization_id_idx" ON "court_filings" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "court_rules_organization_id_idx" ON "court_rules" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "service_of_documents_organization_id_idx" ON "service_of_documents" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "document_templates_organization_id_idx" ON "document_templates" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "document_versions_organization_id_idx" ON "document_versions" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "documents_organization_id_idx" ON "documents" USING btree ("organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX "bank_accounts_org_account_number_idx" ON "bank_accounts" USING btree ("organization_id","account_number");--> statement-breakpoint
CREATE INDEX "bank_accounts_organization_id_idx" ON "bank_accounts" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "bank_reconciliations_organization_id_idx" ON "bank_reconciliations" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "bank_transactions_organization_id_idx" ON "bank_transactions" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "petty_cash_transactions_organization_id_idx" ON "petty_cash_transactions" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "expenses_organization_id_idx" ON "expenses" USING btree ("organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX "requisitions_org_requisition_number_idx" ON "requisitions" USING btree ("organization_id","requisition_number");--> statement-breakpoint
CREATE INDEX "requisitions_organization_id_idx" ON "requisitions" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "time_entries_organization_id_idx" ON "time_entries" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "supplier_invoices_organization_id_idx" ON "supplier_invoices" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "suppliers_organization_id_idx" ON "suppliers" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "messages_organization_id_idx" ON "messages" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "notifications_organization_id_idx" ON "notifications" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "sms_log_organization_id_idx" ON "sms_log" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "workflow_templates_organization_id_idx" ON "workflow_templates" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "audit_log_organization_id_idx" ON "audit_log" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "billing_rates_organization_id_idx" ON "billing_rates" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "custom_fields_organization_id_idx" ON "custom_fields" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "email_templates_organization_id_idx" ON "email_templates" USING btree ("organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX "firm_settings_org_key_idx" ON "firm_settings" USING btree ("organization_id","key");--> statement-breakpoint
CREATE INDEX "firm_settings_organization_id_idx" ON "firm_settings" USING btree ("organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX "practice_areas_org_name_idx" ON "practice_areas" USING btree ("organization_id","name");--> statement-breakpoint
CREATE INDEX "practice_areas_organization_id_idx" ON "practice_areas" USING btree ("organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX "role_permissions_org_role_resource_idx" ON "role_permissions" USING btree ("organization_id","role","resource");--> statement-breakpoint
CREATE INDEX "role_permissions_organization_id_idx" ON "role_permissions" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "sms_templates_organization_id_idx" ON "sms_templates" USING btree ("organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX "tags_org_name_idx" ON "tags" USING btree ("organization_id","name");--> statement-breakpoint
CREATE INDEX "tags_organization_id_idx" ON "tags" USING btree ("organization_id");