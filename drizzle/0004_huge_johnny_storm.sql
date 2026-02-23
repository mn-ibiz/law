CREATE TYPE "public"."document_review_status" AS ENUM('pending_review', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."lead_source" AS ENUM('referral', 'website', 'walk_in', 'advertising', 'social_media', 'event', 'other');--> statement-breakpoint
ALTER TYPE "public"."event_type" ADD VALUE 'mediation' BEFORE 'other';--> statement-breakpoint
ALTER TYPE "public"."event_type" ADD VALUE 'arbitration' BEFORE 'other';--> statement-breakpoint
ALTER TYPE "public"."event_type" ADD VALUE 'filing_deadline' BEFORE 'other';--> statement-breakpoint
ALTER TYPE "public"."event_type" ADD VALUE 'client_meeting' BEFORE 'other';--> statement-breakpoint
ALTER TYPE "public"."event_type" ADD VALUE 'internal_meeting' BEFORE 'other';--> statement-breakpoint
ALTER TYPE "public"."event_type" ADD VALUE 'court_mention' BEFORE 'other';--> statement-breakpoint
ALTER TYPE "public"."event_type" ADD VALUE 'site_visit' BEFORE 'other';--> statement-breakpoint
ALTER TYPE "public"."event_type" ADD VALUE 'training' BEFORE 'other';--> statement-breakpoint
CREATE TABLE "lsk_membership" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"attorney_id" uuid NOT NULL,
	"year" text NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"payment_date" timestamp with time zone,
	"receipt_number" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "lsk_membership_attorney_year" UNIQUE("attorney_id","year")
);
--> statement-breakpoint
CREATE TABLE "professional_indemnity" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"attorney_id" uuid NOT NULL,
	"insurer" text NOT NULL,
	"policy_number" text NOT NULL,
	"coverage_amount" numeric(14, 2) NOT NULL,
	"premium" numeric(12, 2),
	"start_date" timestamp with time zone NOT NULL,
	"expiry_date" timestamp with time zone NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cause_list_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cause_list_id" uuid NOT NULL,
	"case_id" uuid,
	"case_number" text,
	"parties" text,
	"matter" text,
	"time" text,
	"order" integer DEFAULT 0 NOT NULL,
	"outcome" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cause_lists" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"court_id" uuid,
	"date" timestamp with time zone NOT NULL,
	"judge" text,
	"court_room" text,
	"notes" text,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "court_rules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"court_id" uuid,
	"name" text NOT NULL,
	"description" text,
	"trigger_event" text DEFAULT 'hearing_date' NOT NULL,
	"offset_days" integer NOT NULL,
	"deadline_title" text NOT NULL,
	"priority" text DEFAULT 'high' NOT NULL,
	"is_statutory" boolean DEFAULT true NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "cases" ADD COLUMN "file_number" text;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "lead_source" "lead_source";--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "lead_score" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "follow_up_date" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "lost_reason" text;--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "review_status" "document_review_status";--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "reviewed_by" uuid;--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "reviewed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "review_notes" text;--> statement-breakpoint
ALTER TABLE "lsk_membership" ADD CONSTRAINT "lsk_membership_attorney_id_attorneys_id_fk" FOREIGN KEY ("attorney_id") REFERENCES "public"."attorneys"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "professional_indemnity" ADD CONSTRAINT "professional_indemnity_attorney_id_attorneys_id_fk" FOREIGN KEY ("attorney_id") REFERENCES "public"."attorneys"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cause_list_entries" ADD CONSTRAINT "cause_list_entries_cause_list_id_cause_lists_id_fk" FOREIGN KEY ("cause_list_id") REFERENCES "public"."cause_lists"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cause_list_entries" ADD CONSTRAINT "cause_list_entries_case_id_cases_id_fk" FOREIGN KEY ("case_id") REFERENCES "public"."cases"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cause_lists" ADD CONSTRAINT "cause_lists_court_id_courts_id_fk" FOREIGN KEY ("court_id") REFERENCES "public"."courts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cause_lists" ADD CONSTRAINT "cause_lists_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "court_rules" ADD CONSTRAINT "court_rules_court_id_courts_id_fk" FOREIGN KEY ("court_id") REFERENCES "public"."courts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "cause_lists_date_idx" ON "cause_lists" USING btree ("date");--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "cases_file_number_idx" ON "cases" USING btree ("file_number");