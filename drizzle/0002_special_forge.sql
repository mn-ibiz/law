ALTER TABLE "clients" ADD COLUMN "is_pep" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "pep_details" text;