# Story 13.2: Portal Case & Document Access

Status: ready-for-dev

## Story

As a Client,
I want to view my cases and download shared documents,
so that I stay informed about my legal matters.

## Acceptance Criteria (ACs)

1. My Cases page displays a list of the client's cases showing: case number, title, status (badge), case type, lead attorney name, and last update date.
2. Case detail page is read-only and displays: case overview, current status with status badge, court information (court name, court case number, judge), assigned attorney contact details, and key dates (date filed, next court date, statute of limitations).
3. Case detail displays shared notes only; private/attorney-only notes are never visible in the portal.
4. Case detail includes a documents tab showing only documents marked as "shared with client" for that specific case.
5. My Documents page displays all documents shared with the client across all of their cases, with document name, case reference, date, and category.
6. Client can download shared documents from both the My Documents page and case detail documents tab.
7. Client can preview PDF and image documents inline before downloading.
8. No upload capability is available from the portal; there is no upload button or file input on any portal page.
9. Server-side enforcement ensures a client can only see their own cases; queries filter by the authenticated client's ID.
10. Server-side enforcement ensures a client can only see documents that belong to their cases AND are marked as shared; no other documents are accessible.

## Tasks / Subtasks

- [ ] **Task 1: Build My Cases List Page** (AC 1, AC 9)
  - [ ] Create `src/app/(portal)/portal/cases/page.tsx` with a list/table of the client's cases
  - [ ] Create `src/lib/queries/portal-cases.ts` with `getClientCases(clientId)` returning case number, title, status, type, lead attorney, last update
  - [ ] Display status as shadcn Badge with color coding per status (Open=blue, In Progress=yellow, Hearing=purple, Resolved=green, Closed=gray)
  - [ ] Lead attorney shown as name with optional email/phone
  - [ ] Ensure query joins `cases` with `case_assignments` and `attorneys`/`users` tables, filtered by `cases.clientId = clientId`
  - [ ] Add empty state: "No cases found" message

- [ ] **Task 2: Build Portal Case Detail Page (Read-Only)** (AC 2, AC 3, AC 4, AC 8, AC 9)
  - [ ] Create `src/app/(portal)/portal/cases/[id]/page.tsx` as a read-only case detail
  - [ ] Create `src/lib/queries/portal-case-detail.ts` with `getClientCaseDetail(caseId, clientId)` that returns case only if it belongs to the authenticated client
  - [ ] Display case header: case number, title, status badge, case type, priority badge
  - [ ] Display Overview section: description, court info (court name, station, case number, judge), key dates (filed date, next court date, SoL date with countdown), billing type
  - [ ] Display attorney contact section: lead attorney name, email, phone
  - [ ] Display shared notes only: query `case_notes` where `isPrivate = false` AND `caseId = caseId`; private notes are excluded at the query level
  - [ ] Display documents tab: documents linked to the case where `sharedWithClient = true`
  - [ ] No edit buttons, no status change buttons, no upload buttons anywhere on the page
  - [ ] Return 404 if case does not belong to the authenticated client

- [ ] **Task 3: Build My Documents Page** (AC 5, AC 6, AC 7, AC 8, AC 10)
  - [ ] Create `src/app/(portal)/portal/documents/page.tsx`
  - [ ] Create `src/lib/queries/portal-documents.ts` with `getClientSharedDocuments(clientId)` that fetches documents across all client's cases where `sharedWithClient = true`
  - [ ] Display list: document title, case reference (number + title), upload date, category badge, file type icon
  - [ ] Add download button per document that triggers file download via API route
  - [ ] Add preview functionality: inline PDF viewer (e.g., iframe or embed) and image viewer for JPG/PNG files
  - [ ] No upload button or file input on the page
  - [ ] Ensure the document download API route at `src/app/api/documents/[id]/download/route.ts` verifies the authenticated client owns the associated case AND the document is shared

- [ ] **Task 4: Document Download & Preview API** (AC 6, AC 7, AC 10)
  - [ ] Create or update `src/app/api/documents/[id]/download/route.ts` with client-scoped access check
  - [ ] Verify: session exists, role is Client, document belongs to a case owned by this client, document `sharedWithClient = true`
  - [ ] Return 403 if any check fails
  - [ ] Stream the file from storage (Vercel Blob or local filesystem depending on env config)
  - [ ] For preview, return the file with appropriate Content-Type header

## Dev Notes

- **Architecture:** All pages are Server Components. Data is fetched server-side using Drizzle ORM. The case detail page uses dynamic route segments `[id]`.
- **Security:** Double enforcement is critical. The middleware ensures only Client role can access `/(portal)/*` routes. Additionally, every query function must filter by `clientId` derived from the session. Never trust the URL parameter alone.
- **Notes Filtering:** The `case_notes` table has an `isPrivate` boolean field. Portal queries must always include `WHERE isPrivate = false`. This is a hard security requirement.
- **Document Sharing:** The `documents` table has a `sharedWithClient` boolean. Only documents where this is `true` appear in the portal. This applies to both the case detail documents tab and the My Documents page.
- **File Preview:** For PDF preview, use an `<iframe>` or `<object>` element with the document URL. For images, use a standard `<img>` tag or a lightbox component. Consider using a shadcn Dialog for the preview modal.
- **No Upload:** Do not render any file input, drag-and-drop zone, or upload button anywhere in the portal pages. This is enforced at the UI level and also at the API level (reject POST requests from Client role on document upload endpoints).

### Project Structure Notes

**Files to Create:**
- `src/app/(portal)/portal/cases/page.tsx` — My Cases list page
- `src/app/(portal)/portal/cases/[id]/page.tsx` — Case detail (read-only)
- `src/app/(portal)/portal/documents/page.tsx` — My Documents page
- `src/lib/queries/portal-cases.ts` — Client cases query functions
- `src/lib/queries/portal-case-detail.ts` — Client case detail query
- `src/lib/queries/portal-documents.ts` — Client shared documents query

**Files to Modify:**
- `src/app/api/documents/[id]/download/route.ts` — Add client role access check and shared document verification

### References

- [Source: epics.md — Epic 13, Story 13.2: Portal Case & Document Access]
- [Source: a.md — Module 11: Client Portal — Case status view, Document access]
- [Source: a.md — Module 5: Case/Matter Management — Case Detail Page, Status Transitions]
- [Source: a.md — Module 6: Document Management — Share with client checkbox]
- [Source: a.md — Module 1: Authentication & Authorization — RBAC Permissions Matrix (Client row)]

## Dev Agent Record

### Agent Model Used


### Debug Log References


### Completion Notes List


### Change Log
| Change | Details |
|--------|---------|
| | |

### File List
