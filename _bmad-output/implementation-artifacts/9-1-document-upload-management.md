# Story 9.1: Document Upload & Management

Status: ready-for-dev

## Story

As an Admin/Attorney,
I want to upload, organize, and manage documents,
so that legal documents are centrally stored.

## Acceptance Criteria (ACs)

1. Documents page with DataTable (search, filter by category/status/case/client/date range) using @tanstack/react-table
2. Drag-and-drop upload area plus file picker supporting single and batch upload (up to 10 files at once)
3. Document metadata form: title (auto-populated from filename), description, category (Pleading/Correspondence/Contract/Evidence/Court Order/Internal Memo/Template/KYC/Other), associated case, associated client, status (Draft/Review/Approved/Final/Archived), "Share with client" checkbox
4. Supported file types: PDF, DOCX, XLSX, JPG, PNG, TXT, CSV with 25MB per-file size limit
5. Upload progress indicator visible during file transfer
6. Storage abstraction layer: Vercel Blob (demo) / Local filesystem (prod) configurable via `STORAGE_PROVIDER` environment variable
7. Document detail page: file preview (PDF inline viewer, image display), full metadata display, download button
8. Delete document restricted to Admin role only with confirmation dialog
9. Edit metadata functionality for document owner and Admin
10. Audit log entry created on upload, edit, delete, and download actions

## Tasks / Subtasks

- [ ] **Task 1: Zod validation schemas for document upload and metadata** (AC 3, 4)
  - [ ] Create `src/lib/validators/documents.ts` with `documentUploadSchema` and `documentMetadataSchema`
  - [ ] Validate file types (PDF, DOCX, XLSX, JPG, PNG, TXT, CSV) and 25MB size limit
  - [ ] Validate category, status enums, optional case/client references

- [ ] **Task 2: Storage abstraction layer** (AC 6)
  - [ ] Create `src/lib/storage/index.ts` with `StorageProvider` interface (upload, download, delete, getUrl)
  - [ ] Implement `src/lib/storage/vercel-blob.ts` using `@vercel/blob`
  - [ ] Implement `src/lib/storage/local-filesystem.ts` for production on-prem
  - [ ] Factory function that reads `STORAGE_PROVIDER` env var to select provider
  - [ ] Add `STORAGE_PROVIDER` and `LOCAL_STORAGE_PATH` to `.env.local`

- [ ] **Task 3: Server actions for document CRUD** (AC 2, 3, 7, 8, 9, 10)
  - [ ] Create `src/lib/actions/documents.ts`
  - [ ] `uploadDocument(formData)` — validate, store file, insert DB record, audit log
  - [ ] `uploadBatchDocuments(formData)` — handle up to 10 files
  - [ ] `updateDocumentMetadata(id, data)` — update title/description/category/status/sharing, audit log
  - [ ] `deleteDocument(id)` — admin-only check, remove file from storage, soft-delete DB record, audit log
  - [ ] `downloadDocument(id)` — generate signed URL or stream, audit log

- [ ] **Task 4: Data queries for documents** (AC 1, 7)
  - [ ] Create `src/lib/queries/documents.ts`
  - [ ] `getDocuments(filters)` — paginated, filterable by category/status/case/client/date, searchable by title
  - [ ] `getDocumentById(id)` — full metadata including case and client details
  - [ ] `getDocumentsByCase(caseId)` — for case detail documents tab
  - [ ] `getDocumentsByClient(clientId)` — for client detail documents tab

- [ ] **Task 5: Documents list page with DataTable** (AC 1)
  - [ ] Create `src/app/(dashboard)/documents/page.tsx` as Server Component
  - [ ] Implement DataTable with columns: title, category badge, status badge, case link, client link, uploaded by, date, actions
  - [ ] Add search input, filter dropdowns (category, status, case, client), date range picker
  - [ ] Pagination controls
  - [ ] "Upload Document" button in header

- [ ] **Task 6: Document upload form with drag-and-drop** (AC 2, 3, 4, 5)
  - [ ] Create `src/components/forms/document-upload-form.tsx`
  - [ ] Implement drag-and-drop zone using native HTML5 drag events or `react-dropzone`
  - [ ] File picker fallback button
  - [ ] Batch upload support (up to 10 files)
  - [ ] Progress bar per file during upload
  - [ ] Auto-populate title from filename
  - [ ] Category, case, client, status, share-with-client fields
  - [ ] Upload dialog/sheet triggered from documents page

- [ ] **Task 7: Document detail page** (AC 7, 8, 9)
  - [ ] Create `src/app/(dashboard)/documents/[id]/page.tsx`
  - [ ] PDF preview using `<iframe>` or `react-pdf`
  - [ ] Image preview using `<img>` with zoom
  - [ ] Metadata card: title, description, category, status, case, client, uploaded by, dates
  - [ ] Download button
  - [ ] Edit metadata button (opens form sheet)
  - [ ] Delete button (admin only, with AlertDialog confirmation)

- [ ] **Task 8: Audit log integration** (AC 10)
  - [ ] Call `createAuditLog()` in all document server actions
  - [ ] Log entity_type: "document", actions: Create/Update/Delete/Download

## Dev Notes

- Use `@vercel/blob` for demo deployment on Vercel; for production Windows Server, use `fs` module writing to a configurable directory path
- The storage abstraction must expose a consistent interface: `upload(file, key): Promise<string>`, `getUrl(key): string`, `delete(key): Promise<void>`
- File keys should use the pattern `documents/{documentId}/{version}/{filename}` to support future versioning (Story 9.2)
- For drag-and-drop, consider using the `react-dropzone` library or implementing with native HTML5 API plus shadcn styling
- PDF preview can use `<iframe src={url}>` for simplicity; `react-pdf` is optional for more control
- The DataTable component should follow the same patterns established in earlier epics (attorneys, clients, cases)
- All KES currency amounts on documents page are not applicable, but file sizes should be displayed in human-readable format (KB, MB)
- Server actions must validate user session and role before executing; use `auth()` from NextAuth
- Batch upload should process files sequentially server-side to avoid overwhelming the storage provider

### Project Structure Notes

Files to create:
- `src/lib/storage/index.ts` — storage provider interface and factory
- `src/lib/storage/vercel-blob.ts` — Vercel Blob implementation
- `src/lib/storage/local-filesystem.ts` — local filesystem implementation
- `src/lib/validators/documents.ts` — Zod schemas
- `src/lib/actions/documents.ts` — server actions
- `src/lib/queries/documents.ts` — data queries
- `src/app/(dashboard)/documents/page.tsx` — documents list page
- `src/app/(dashboard)/documents/[id]/page.tsx` — document detail page
- `src/components/forms/document-upload-form.tsx` — upload form component

Files to modify:
- `.env.local` — add `STORAGE_PROVIDER`, `LOCAL_STORAGE_PATH`
- `src/app/(dashboard)/layout.tsx` — ensure documents nav item is present

### References

- [Source: a.md - Module 6: Document Management]
- [Source: epics.md - Epic 9, Story 9.1]
- [Source: a.md - Architecture Patterns: Server Actions for all mutations]
- [Source: a.md - Project Structure: src/lib/storage/]

## Dev Agent Record

### Agent Model Used


### Debug Log References


### Completion Notes List


### Change Log
| Change | Details |
|--------|---------|
| | |

### File List
