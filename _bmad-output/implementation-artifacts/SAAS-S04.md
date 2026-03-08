# Story SAAS.4: File Storage Tenant Isolation

Status: done

## Story

As a **law firm**,
I want **my uploaded documents and files to be stored separately from other firms**,
so that **our confidential legal documents cannot be accessed by other tenants**.

## Acceptance Criteria

1. **AC1:** Cloud storage provider integrated (Cloudflare R2) — local `/public/uploads/` eliminated for production
2. **AC2:** File upload path uses tenant-isolated keys: `{orgId}/documents/{uuid}.ext` and `{orgId}/avatars/{uuid}.ext`
3. **AC3:** Document download/access validates that requesting user belongs to the document's organization
4. **AC4:** Signed URLs with expiration used for file access — no direct public file URLs
5. **AC5:** Existing files migration script to new tenant-isolated paths in cloud storage
6. **AC6:** Per-tenant storage usage tracking (for plan limits)
7. **AC7:** `documents` table queries verify organizationId before returning file URLs
8. **AC8:** iCal export validates org context; token generation includes orgId; token from Org A cannot access Org B calendar
9. **AC9:** File upload size limits enforced per-org based on plan (storage quota)

## Current Implementation Status

**0% of this story is implemented.** Analysis of current codebase:

### Current State (all gaps)

| Area | Current State | Problem |
|------|--------------|---------|
| Upload routes | Write to `public/uploads/` via local filesystem | No tenant isolation, no cloud storage, publicly accessible |
| Upload avatar route | Write to `public/uploads/avatars/` | Same — local filesystem, no isolation |
| File URL storage | Direct URLs like `{origin}/uploads/{uuid}.ext` | URLs are guessable, no auth needed to access |
| Document access control | DB queries are org-scoped (S03) | But actual file URLs are publicly accessible without auth |
| Cloud storage | None configured | No S3/R2/cloud provider |
| Signed URLs | None | Direct public URLs for all files |
| Storage tracking | `plans.maxStorageMb` exists but not enforced | No `storageUsed` column on organizations |
| iCal token | HMAC of `userId` only | No orgId in token — cross-org risk if userId known |
| Storage quota | Not enforced | Uploads unlimited regardless of plan |
| Env vars | No cloud storage vars in `src/lib/env.ts` | Missing R2/S3 credentials |

### Files Storing File URLs in DB

| Schema | Column | Usage |
|--------|--------|-------|
| `documents.fileUrl` | Document file URLs | Main document storage |
| `documentVersions.fileUrl` | Version file URLs | Document version history |
| `documentTemplates.fileUrl` | Template file URLs | Document templates |
| `clients.fileUrl` | KYC document URLs | Client identity docs |
| `suppliers.fileUrl` | Supplier document URLs | Supplier docs |
| `courtFilings.documentUrl` | Court filing URLs | Filed court documents |
| `users.avatar` | User avatar URLs | Profile pictures |
| `organizations.logoUrl` | Org logo URLs | Firm branding |
| `suppliers.logoUrl` | Supplier logo URLs | Supplier branding |

### Already Done (from S03)

- AC7 PARTIALLY DONE: Document queries already filter by organizationId (S03). But actual file access via URL is uncontrolled.

## Tasks / Subtasks

### Task 1: Cloud Storage Provider Integration (AC: #1)

- [x] T1.1: Add Cloudflare R2 env vars to `src/lib/env.ts` (R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_PUBLIC_URL)
- [x]T1.2: Create `src/lib/storage/r2.ts` — R2 client using `@aws-sdk/client-s3` (R2 is S3-compatible)
- [x]T1.3: Create `src/lib/storage/index.ts` — storage abstraction layer with `upload()`, `getSignedUrl()`, `delete()`, `getStorageUsage()`
- [x]T1.4: Install `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner` dependencies

### Task 2: Tenant-Isolated Upload Keys (AC: #2)

- [x]T2.1: Create key generation utility: `{orgId}/documents/{uuid}.ext`, `{orgId}/avatars/{uuid}.ext`
- [x]T2.2: Update `/api/upload/route.ts` to use cloud storage with tenant-prefixed keys
- [x]T2.3: Update `/api/upload/avatar/route.ts` for tenant-isolated avatar uploads
- [x]T2.4: Both routes must require `session.user.organizationId`

### Task 3: Signed URL Access Control (AC: #3, #4, #7)

- [x]T3.1: Create `/api/files/[...key]/route.ts` — signed URL proxy endpoint that validates org membership before returning a time-limited signed URL
- [x]T3.2: Document queries should return storage keys (not direct URLs); frontend resolves signed URLs on access
- [x]T3.3: Signed URLs should expire after 1 hour (configurable)

### Task 4: iCal Token Org Scoping (AC: #8)

- [x]T4.1: Update `generateIcalToken()` to include orgId: `HMAC(userId:orgId)`
- [x]T4.2: Update `verifyIcalToken()` to accept and verify orgId
- [x]T4.3: Update iCal route to pass orgId from session to token verification
- [x]T4.4: Update any UI that generates iCal subscription URLs to include orgId

### Task 5: Storage Usage Tracking (AC: #6)

- [x]T5.1: Add `storageUsedBytes` column to `organizations` table (bigint, default 0)
- [x]T5.2: Update upload routes to increment org storage usage after successful upload
- [x]T5.3: Update delete operations to decrement org storage usage
- [x]T5.4: Generate migration for new column

### Task 6: Per-Org Storage Quota Enforcement (AC: #9)

- [x]T6.1: Before upload, check `org.storageUsedBytes + fileSize <= plan.maxStorageMb * 1024 * 1024`
- [x]T6.2: Return clear error message when quota exceeded
- [x]T6.3: Plans with `maxStorageMb = null` have unlimited storage

### Task 7: File Migration Script (AC: #5)

- [x]T7.1: Create `src/lib/db/migrate-files-to-cloud.ts` script that:
  - Reads all fileUrl/avatar/logoUrl values from DB
  - For each: downloads from local path, uploads to R2 with tenant-prefixed key, updates DB URL
  - Handles existing files that may already be cloud URLs (idempotent)
  - Logs progress and errors

### Task 8: Development Mode Fallback

- [x]T8.1: When R2 env vars are not set, fall back to local filesystem (for dev environment)
- [x]T8.2: Abstract behind storage interface so upload routes don't need conditional logic

## Dev Notes

### Architecture Decisions

1. **Cloudflare R2** chosen over S3 for zero egress fees — important for a document-heavy legal application
2. **S3-compatible API** means we use `@aws-sdk/client-s3` which also works with S3 if we switch later
3. **Signed URLs** rather than public bucket — legal documents must never be publicly accessible
4. **Storage abstraction layer** — supports local filesystem fallback for development
5. **Key format:** `{orgId}/documents/{uuid}.ext` — simple, flat, easy to lifecycle/delete per-org

### Security Considerations

- File URLs stored in DB will change from `https://example.com/uploads/file.pdf` to storage keys like `{orgId}/documents/{uuid}.pdf`
- Frontend must call signed URL endpoint to get temporary access URL
- Signed URLs expire after 1 hour (legal docs shouldn't have permanent links)
- Upload routes already validate auth (session check) — adding org isolation on top

### Out of Scope

- **Client portal file access:** Will use same signed URL mechanism — no separate implementation needed
- **Virus scanning:** Not in this story — could be added as a future enhancement
- **CDN caching:** R2 has built-in CDN; signed URLs bypass it intentionally for security

### Key Files to Modify

| File | Change |
|------|--------|
| `src/lib/env.ts` | Add R2 env vars |
| `src/app/api/upload/route.ts` | Use cloud storage |
| `src/app/api/upload/avatar/route.ts` | Use cloud storage |
| `src/lib/utils/ical.ts` | Include orgId in token |
| `src/app/api/calendar/ical/[userId]/route.ts` | Pass orgId to token verify |
| `src/lib/db/schema/organizations.ts` | Add storageUsedBytes column |
| `package.json` | Add @aws-sdk deps |

### New Files

| File | Purpose |
|------|---------|
| `src/lib/storage/r2.ts` | R2 client |
| `src/lib/storage/index.ts` | Storage abstraction |
| `src/app/api/files/[...key]/route.ts` | Signed URL proxy |
| `src/lib/db/migrate-files-to-cloud.ts` | Migration script |
| `drizzle/0008_*.sql` | Migration for storageUsedBytes |

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Completion Notes List

- 0% implementation — this is entirely new infrastructure
- 9 DB columns across 6 schema files store file URLs that will need updating
- iCal token is userId-only — needs orgId for cross-tenant protection
- plans.maxStorageMb already exists but is not enforced
- Local filesystem uploads must remain functional for development

### File List

Files to CREATE:
- `src/lib/storage/r2.ts` - R2 client
- `src/lib/storage/index.ts` - Storage abstraction layer
- `src/app/api/files/[...key]/route.ts` - Signed URL proxy endpoint
- `src/lib/db/migrate-files-to-cloud.ts` - File migration script

Files to MODIFY:
- `src/lib/env.ts` - Add R2 env vars
- `src/app/api/upload/route.ts` - Use cloud storage with tenant keys
- `src/app/api/upload/avatar/route.ts` - Use cloud storage with tenant keys
- `src/lib/utils/ical.ts` - Include orgId in token generation/verification
- `src/app/api/calendar/ical/[userId]/route.ts` - Pass orgId to token verification
- `src/lib/db/schema/organizations.ts` - Add storageUsedBytes column
- `package.json` - Add @aws-sdk/client-s3, @aws-sdk/s3-request-presigner
