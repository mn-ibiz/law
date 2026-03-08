/**
 * File Migration Script: Local filesystem -> Cloud storage (R2)
 *
 * Migrates all file URLs stored in the database from local paths to
 * tenant-isolated cloud storage keys.
 *
 * Usage: npx tsx src/lib/db/migrate-files-to-cloud.ts
 *
 * Prerequisites:
 * - R2 env vars must be configured
 * - Local files must be accessible at public/uploads/
 *
 * This script is idempotent — it skips entries that are already storage keys.
 */

import { db } from "@/lib/db";
import { documents, documentVersions, documentTemplates } from "@/lib/db/schema/documents";
import { kycDocuments } from "@/lib/db/schema/clients";
import { suppliers, supplierInvoices } from "@/lib/db/schema/suppliers";
import { courtFilings } from "@/lib/db/schema/courts";
import { users } from "@/lib/db/schema/auth";
import { organizations } from "@/lib/db/schema/organizations";
import { eq, isNotNull } from "drizzle-orm";
import { readLocalFile } from "@/lib/storage";
import { uploadFile, isStorageKey } from "@/lib/storage";
import { generateStorageKey } from "@/lib/storage";
import { lookup } from "mime-types";
import { extname } from "path";

interface MigrationRow {
  id: string;
  url: string | null;
  organizationId: string;
}

interface MigrationResult {
  table: string;
  total: number;
  migrated: number;
  skipped: number;
  errors: string[];
}

async function migrateRows(
  tableName: string,
  rows: MigrationRow[],
  category: "documents" | "avatars" | "logos",
  updateFn: (id: string, newKey: string) => Promise<void>
): Promise<MigrationResult> {
  const result: MigrationResult = {
    table: tableName,
    total: rows.length,
    migrated: 0,
    skipped: 0,
    errors: [],
  };

  for (const row of rows) {
    if (!row.url) {
      result.skipped++;
      continue;
    }

    // Skip if already a storage key
    if (isStorageKey(row.url)) {
      result.skipped++;
      continue;
    }

    try {
      // Extract relative path from URL
      let relativePath: string;
      try {
        const parsed = new URL(row.url);
        relativePath = parsed.pathname.replace(/^\//, "");
      } catch {
        relativePath = row.url.replace(/^\//, "");
      }

      const buffer = await readLocalFile(relativePath);
      if (!buffer) {
        result.errors.push(`${tableName}[${row.id}]: File not found at ${relativePath}`);
        result.skipped++;
        continue;
      }

      const ext = extname(relativePath) || ".bin";
      const mimeType = lookup(ext) || "application/octet-stream";
      const key = generateStorageKey(row.organizationId, category, ext);

      await uploadFile(key, buffer, mimeType);
      await updateFn(row.id, key);
      result.migrated++;

      if (result.migrated % 50 === 0) {
        console.log(`  ${tableName}: ${result.migrated}/${result.total} migrated...`);
      }
    } catch (err) {
      result.errors.push(`${tableName}[${row.id}]: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  return result;
}

async function main() {
  console.log("=== File Migration: Local -> Cloud Storage ===\n");
  const results: MigrationResult[] = [];

  // 1. Documents
  console.log("Migrating documents.fileUrl...");
  const docs = await db
    .select({ id: documents.id, url: documents.fileUrl, organizationId: documents.organizationId })
    .from(documents);
  results.push(
    await migrateRows("documents", docs, "documents", async (id, key) => {
      await db.update(documents).set({ fileUrl: key }).where(eq(documents.id, id));
    })
  );

  // 2. Document versions
  console.log("Migrating documentVersions.fileUrl...");
  const versions = await db
    .select({ id: documentVersions.id, url: documentVersions.fileUrl, organizationId: documentVersions.organizationId })
    .from(documentVersions);
  results.push(
    await migrateRows("documentVersions", versions, "documents", async (id, key) => {
      await db.update(documentVersions).set({ fileUrl: key }).where(eq(documentVersions.id, id));
    })
  );

  // 3. Document templates
  console.log("Migrating documentTemplates.fileUrl...");
  const templates = await db
    .select({ id: documentTemplates.id, url: documentTemplates.fileUrl, organizationId: documentTemplates.organizationId })
    .from(documentTemplates)
    .where(isNotNull(documentTemplates.fileUrl));
  results.push(
    await migrateRows("documentTemplates", templates as MigrationRow[], "documents", async (id, key) => {
      await db.update(documentTemplates).set({ fileUrl: key }).where(eq(documentTemplates.id, id));
    })
  );

  // 4. KYC Documents
  console.log("Migrating kycDocuments.fileUrl...");
  const kycRows = await db
    .select({ id: kycDocuments.id, url: kycDocuments.fileUrl, organizationId: kycDocuments.organizationId })
    .from(kycDocuments)
    .where(isNotNull(kycDocuments.fileUrl));
  results.push(
    await migrateRows("kycDocuments", kycRows as MigrationRow[], "documents", async (id, key) => {
      await db.update(kycDocuments).set({ fileUrl: key }).where(eq(kycDocuments.id, id));
    })
  );

  // 5. Supplier Invoices
  console.log("Migrating supplierInvoices.fileUrl...");
  const supplierInvoiceDocs = await db
    .select({ id: supplierInvoices.id, url: supplierInvoices.fileUrl, organizationId: supplierInvoices.organizationId })
    .from(supplierInvoices)
    .where(isNotNull(supplierInvoices.fileUrl));
  results.push(
    await migrateRows("supplierInvoices", supplierInvoiceDocs as MigrationRow[], "documents", async (id, key) => {
      await db.update(supplierInvoices).set({ fileUrl: key }).where(eq(supplierInvoices.id, id));
    })
  );

  // 6. Suppliers (logoUrl)
  console.log("Migrating suppliers.logoUrl...");
  const supplierLogos = await db
    .select({ id: suppliers.id, url: suppliers.logoUrl, organizationId: suppliers.organizationId })
    .from(suppliers)
    .where(isNotNull(suppliers.logoUrl));
  results.push(
    await migrateRows("suppliers.logoUrl", supplierLogos as MigrationRow[], "logos", async (id, key) => {
      await db.update(suppliers).set({ logoUrl: key }).where(eq(suppliers.id, id));
    })
  );

  // 7. Court filings (documentUrl)
  console.log("Migrating courtFilings.documentUrl...");
  const filings = await db
    .select({ id: courtFilings.id, url: courtFilings.documentUrl, organizationId: courtFilings.organizationId })
    .from(courtFilings)
    .where(isNotNull(courtFilings.documentUrl));
  results.push(
    await migrateRows("courtFilings", filings as MigrationRow[], "documents", async (id, key) => {
      await db.update(courtFilings).set({ documentUrl: key }).where(eq(courtFilings.id, id));
    })
  );

  // 8. Users (avatar)
  console.log("Migrating users.avatar...");
  const userAvatars = await db
    .select({ id: users.id, url: users.avatar, organizationId: users.organizationId })
    .from(users)
    .where(isNotNull(users.avatar));
  results.push(
    await migrateRows("users.avatar", userAvatars as MigrationRow[], "avatars", async (id, key) => {
      await db.update(users).set({ avatar: key }).where(eq(users.id, id));
    })
  );

  // 9. Organizations (logoUrl) — orgId is the row's own id
  console.log("Migrating organizations.logoUrl...");
  const orgLogos = await db
    .select({ id: organizations.id, url: organizations.logoUrl, organizationId: organizations.id })
    .from(organizations)
    .where(isNotNull(organizations.logoUrl));
  results.push(
    await migrateRows("organizations.logoUrl", orgLogos as MigrationRow[], "logos", async (id, key) => {
      await db.update(organizations).set({ logoUrl: key }).where(eq(organizations.id, id));
    })
  );

  // Print summary
  console.log("\n=== Migration Summary ===\n");
  let totalMigrated = 0;
  let totalErrors = 0;
  for (const r of results) {
    console.log(`${r.table}: ${r.migrated} migrated, ${r.skipped} skipped, ${r.errors.length} errors (of ${r.total} total)`);
    totalMigrated += r.migrated;
    totalErrors += r.errors.length;
    for (const err of r.errors) {
      console.log(`  ERROR: ${err}`);
    }
  }
  console.log(`\nTotal: ${totalMigrated} files migrated, ${totalErrors} errors`);
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
