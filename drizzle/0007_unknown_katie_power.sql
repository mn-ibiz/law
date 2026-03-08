-- Phase 1: Safe column additions (nullable first for populated databases)
ALTER TABLE "attorneys" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "branch_users" ADD COLUMN "organization_id" uuid;--> statement-breakpoint
ALTER TABLE "workflow_execution_log" ADD COLUMN "organization_id" uuid;--> statement-breakpoint
ALTER TABLE "workflow_rules" ADD COLUMN "organization_id" uuid;--> statement-breakpoint

-- Phase 2: Backfill organization_id from parent tables for existing data
-- branch_users: inherit from parent branch
UPDATE "branch_users" bu SET "organization_id" = (
  SELECT b."organization_id" FROM "branches" b WHERE b."id" = bu."branch_id"
) WHERE bu."organization_id" IS NULL;--> statement-breakpoint
-- workflow_rules: inherit from parent template
UPDATE "workflow_rules" wr SET "organization_id" = (
  SELECT wt."organization_id" FROM "workflow_templates" wt WHERE wt."id" = wr."template_id"
) WHERE wr."organization_id" IS NULL;--> statement-breakpoint
-- workflow_execution_log: inherit from parent template
UPDATE "workflow_execution_log" wel SET "organization_id" = (
  SELECT wt."organization_id" FROM "workflow_templates" wt WHERE wt."id" = wel."template_id"
) WHERE wel."organization_id" IS NULL;--> statement-breakpoint

-- Phase 3: Apply NOT NULL constraints (safe now that data is backfilled)
ALTER TABLE "audit_log" ALTER COLUMN "organization_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "branch_users" ALTER COLUMN "organization_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "workflow_execution_log" ALTER COLUMN "organization_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "workflow_rules" ALTER COLUMN "organization_id" SET NOT NULL;--> statement-breakpoint

-- Phase 4: Add foreign key constraints and indexes
ALTER TABLE "branch_users" ADD CONSTRAINT "branch_users_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflow_execution_log" ADD CONSTRAINT "workflow_execution_log_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflow_rules" ADD CONSTRAINT "workflow_rules_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "branch_users_organization_id_idx" ON "branch_users" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "workflow_execution_log_organization_id_idx" ON "workflow_execution_log" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "workflow_rules_organization_id_idx" ON "workflow_rules" USING btree ("organization_id");
