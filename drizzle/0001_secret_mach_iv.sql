CREATE TYPE "public"."disciplinary_status" AS ENUM('pending', 'resolved', 'dismissed');--> statement-breakpoint
CREATE TYPE "public"."supplier_invoice_status" AS ENUM('pending', 'approved', 'paid', 'cancelled');--> statement-breakpoint
CREATE TABLE "disciplinary_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"attorney_id" uuid NOT NULL,
	"date" timestamp with time zone NOT NULL,
	"case_reference" text NOT NULL,
	"status" "disciplinary_status" DEFAULT 'pending' NOT NULL,
	"outcome" text,
	"notes" text,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "case_stage_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"case_id" uuid NOT NULL,
	"stage_id" uuid NOT NULL,
	"entered_at" timestamp with time zone NOT NULL,
	"exited_at" timestamp with time zone,
	"moved_by" uuid
);
--> statement-breakpoint
CREATE TABLE "stage_automations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"stage_id" uuid NOT NULL,
	"trigger_on" text NOT NULL,
	"action_type" text NOT NULL,
	"action_config" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "attorneys" DROP CONSTRAINT "attorneys_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "credit_notes" DROP CONSTRAINT "credit_notes_created_by_users_id_fk";
--> statement-breakpoint
ALTER TABLE "invoices" DROP CONSTRAINT "invoices_created_by_users_id_fk";
--> statement-breakpoint
ALTER TABLE "quotes" DROP CONSTRAINT "quotes_created_by_users_id_fk";
--> statement-breakpoint
ALTER TABLE "trust_transactions" DROP CONSTRAINT "trust_transactions_performed_by_users_id_fk";
--> statement-breakpoint
ALTER TABLE "bring_ups" DROP CONSTRAINT "bring_ups_created_by_users_id_fk";
--> statement-breakpoint
ALTER TABLE "calendar_events" DROP CONSTRAINT "calendar_events_created_by_users_id_fk";
--> statement-breakpoint
ALTER TABLE "tasks" DROP CONSTRAINT "tasks_created_by_users_id_fk";
--> statement-breakpoint
ALTER TABLE "case_assignments" DROP CONSTRAINT "case_assignments_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "case_notes" DROP CONSTRAINT "case_notes_author_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "court_filings" DROP CONSTRAINT "court_filings_filed_by_users_id_fk";
--> statement-breakpoint
ALTER TABLE "document_versions" DROP CONSTRAINT "document_versions_uploaded_by_users_id_fk";
--> statement-breakpoint
ALTER TABLE "documents" DROP CONSTRAINT "documents_uploaded_by_users_id_fk";
--> statement-breakpoint
ALTER TABLE "petty_cash_transactions" DROP CONSTRAINT "petty_cash_transactions_performed_by_users_id_fk";
--> statement-breakpoint
ALTER TABLE "expenses" DROP CONSTRAINT "expenses_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "requisitions" DROP CONSTRAINT "requisitions_requested_by_users_id_fk";
--> statement-breakpoint
ALTER TABLE "time_entries" DROP CONSTRAINT "time_entries_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "messages" DROP CONSTRAINT "messages_sender_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "messages" DROP CONSTRAINT "messages_recipient_id_users_id_fk";
--> statement-breakpoint
DROP INDEX "users_email_idx";--> statement-breakpoint
ALTER TABLE "supplier_invoices" ALTER COLUMN "status" SET DEFAULT 'pending'::"public"."supplier_invoice_status";--> statement-breakpoint
ALTER TABLE "supplier_invoices" ALTER COLUMN "status" SET DATA TYPE "public"."supplier_invoice_status" USING "status"::"public"."supplier_invoice_status";--> statement-breakpoint
ALTER TABLE "workflow_rules" ALTER COLUMN "order" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "workflow_rules" ALTER COLUMN "order" SET DEFAULT 1;--> statement-breakpoint
ALTER TABLE "custom_fields" ALTER COLUMN "order" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "custom_fields" ALTER COLUMN "order" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "cpd_records" ADD COLUMN "is_lsk_program" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "failed_attempts" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "locked_until" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "cases" ADD COLUMN "stage_entered_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "pipeline_stages" ADD COLUMN "practice_area_id" uuid;--> statement-breakpoint
ALTER TABLE "pipeline_stages" ADD COLUMN "max_duration_days" integer;--> statement-breakpoint
ALTER TABLE "disciplinary_records" ADD CONSTRAINT "disciplinary_records_attorney_id_attorneys_id_fk" FOREIGN KEY ("attorney_id") REFERENCES "public"."attorneys"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "disciplinary_records" ADD CONSTRAINT "disciplinary_records_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "case_stage_history" ADD CONSTRAINT "case_stage_history_case_id_cases_id_fk" FOREIGN KEY ("case_id") REFERENCES "public"."cases"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "case_stage_history" ADD CONSTRAINT "case_stage_history_stage_id_pipeline_stages_id_fk" FOREIGN KEY ("stage_id") REFERENCES "public"."pipeline_stages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "case_stage_history" ADD CONSTRAINT "case_stage_history_moved_by_users_id_fk" FOREIGN KEY ("moved_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stage_automations" ADD CONSTRAINT "stage_automations_stage_id_pipeline_stages_id_fk" FOREIGN KEY ("stage_id") REFERENCES "public"."pipeline_stages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "case_stage_history_case_id_idx" ON "case_stage_history" USING btree ("case_id");--> statement-breakpoint
CREATE INDEX "case_stage_history_stage_id_idx" ON "case_stage_history" USING btree ("stage_id");--> statement-breakpoint
CREATE INDEX "case_stage_history_entered_at_idx" ON "case_stage_history" USING btree ("entered_at");--> statement-breakpoint
ALTER TABLE "attorney_practice_areas" ADD CONSTRAINT "attorney_practice_areas_practice_area_id_practice_areas_id_fk" FOREIGN KEY ("practice_area_id") REFERENCES "public"."practice_areas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attorneys" ADD CONSTRAINT "attorneys_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credit_notes" ADD CONSTRAINT "credit_notes_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_line_items" ADD CONSTRAINT "invoice_line_items_time_entry_id_time_entries_id_fk" FOREIGN KEY ("time_entry_id") REFERENCES "public"."time_entries"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_line_items" ADD CONSTRAINT "invoice_line_items_expense_id_expenses_id_fk" FOREIGN KEY ("expense_id") REFERENCES "public"."expenses"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trust_transactions" ADD CONSTRAINT "trust_transactions_performed_by_users_id_fk" FOREIGN KEY ("performed_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bring_ups" ADD CONSTRAINT "bring_ups_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "case_assignments" ADD CONSTRAINT "case_assignments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "case_notes" ADD CONSTRAINT "case_notes_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cases" ADD CONSTRAINT "cases_pipeline_stage_id_pipeline_stages_id_fk" FOREIGN KEY ("pipeline_stage_id") REFERENCES "public"."pipeline_stages"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pipeline_stages" ADD CONSTRAINT "pipeline_stages_practice_area_id_practice_areas_id_fk" FOREIGN KEY ("practice_area_id") REFERENCES "public"."practice_areas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "court_filings" ADD CONSTRAINT "court_filings_filed_by_users_id_fk" FOREIGN KEY ("filed_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_versions" ADD CONSTRAINT "document_versions_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "petty_cash_transactions" ADD CONSTRAINT "petty_cash_transactions_performed_by_users_id_fk" FOREIGN KEY ("performed_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "requisitions" ADD CONSTRAINT "requisitions_requested_by_users_id_fk" FOREIGN KEY ("requested_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "time_entries" ADD CONSTRAINT "time_entries_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_parent_message_id_messages_id_fk" FOREIGN KEY ("parent_message_id") REFERENCES "public"."messages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_recipient_id_users_id_fk" FOREIGN KEY ("recipient_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "calendar_events_start_time_idx" ON "calendar_events" USING btree ("start_time");--> statement-breakpoint
CREATE INDEX "calendar_events_created_by_idx" ON "calendar_events" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "tasks_assigned_to_idx" ON "tasks" USING btree ("assigned_to");--> statement-breakpoint
CREATE INDEX "tasks_status_idx" ON "tasks" USING btree ("status");--> statement-breakpoint
CREATE INDEX "case_assignments_user_id_idx" ON "case_assignments" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "case_assignments_case_id_idx" ON "case_assignments" USING btree ("case_id");--> statement-breakpoint
CREATE UNIQUE INDEX "case_assignments_case_user_idx" ON "case_assignments" USING btree ("case_id","user_id");--> statement-breakpoint
CREATE INDEX "expenses_user_id_idx" ON "expenses" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "expenses_date_idx" ON "expenses" USING btree ("date");--> statement-breakpoint
CREATE INDEX "messages_sender_id_idx" ON "messages" USING btree ("sender_id");--> statement-breakpoint
CREATE INDEX "messages_recipient_id_idx" ON "messages" USING btree ("recipient_id");--> statement-breakpoint
ALTER TABLE "attorney_practice_areas" ADD CONSTRAINT "attorney_practice_areas_unique" UNIQUE("attorney_id","practice_area_id");--> statement-breakpoint
ALTER TABLE "attorneys" ADD CONSTRAINT "attorneys_bar_number_unique" UNIQUE("bar_number");--> statement-breakpoint
ALTER TABLE "branch_users" ADD CONSTRAINT "branch_users_branch_user_unique" UNIQUE("branch_id","user_id");--> statement-breakpoint
ALTER TABLE "event_attendees" ADD CONSTRAINT "event_attendees_event_user_unique" UNIQUE("event_id","user_id");--> statement-breakpoint
ALTER TABLE "bank_accounts" ADD CONSTRAINT "bank_accounts_account_number_unique" UNIQUE("account_number");