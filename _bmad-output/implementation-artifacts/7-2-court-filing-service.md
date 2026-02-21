# Story 7.2: Court Filing Tracking & Service of Documents

Status: ready-for-dev

## Story

As an Attorney,
I want to track filings and service of documents,
so that court interactions are documented.

## Acceptance Criteria (ACs)

1. **Court filings section on case detail** — new section or sub-tab within the case detail page showing all court filings for this case; list includes: document title, filing date, status, court fee amount (KES).
2. **Filing status workflow** — each filing transitions through: Filed -> Accepted / Rejected -> Served; status badge displayed per filing.
3. **Filing checklist per case type** — predefined checklist of typical filings per case type (e.g., Plaint, Defence, Reply to Defence for civil litigation; Charge Sheet, Plea, Bail Application for criminal); checklist items can be checked off as filed.
4. **Service of documents log** — separate log tracking service of court documents to parties; each entry records: document served, served to (party name), served by (process server name), method of service (Personal / Substituted / Email / Registered Post / Process Server / Affidavit of Service), date served, proof of service upload.
5. **Document bundle preparation** — ability to select multiple documents, set their order, and generate a document index/cover sheet; used when filing a bundle of documents with the court.
6. **Court fee tracking summary per case** — aggregated view showing total court fees paid for a case, broken down by filing; summary displayed in the billing tab or as part of the court info section.

## Tasks / Subtasks

- [ ] **Create Zod schemas for filings and service** (AC 1, 2, 4)
  - [ ] `src/lib/validators/court-filing.ts` — courtFilingSchema, serviceOfDocumentSchema, documentBundleSchema
  - [ ] Filing: document reference, filing date, status, court fee (KES, min 0)
  - [ ] Service: served to, served by, method (enum), date, proof upload
- [ ] **Build court filings server actions** (AC 1, 2, 6)
  - [ ] `src/lib/actions/court-filings.ts` — createFiling, updateFilingStatus, deleteFiling
  - [ ] createFiling: create filing record, associate with case and document
  - [ ] updateFilingStatus: transition status (Filed -> Accepted/Rejected -> Served)
  - [ ] Track court fee per filing; sum for case total
  - [ ] Create timeline event on filing status changes
  - [ ] Audit log entries
- [ ] **Build court filings queries** (AC 1, 6)
  - [ ] `src/lib/queries/court-filings.ts` — getFilingsByCase, getFilingById, getCourtFeeSummary, getServiceLog
- [ ] **Build court filings section UI** (AC 1, 2)
  - [ ] `src/components/cases/court-filings-section.tsx` — list/table of filings for a case
  - [ ] Columns: document title (linked), filing date, status badge, court fee (KES formatted), actions
  - [ ] "Add Filing" dialog with form: select document (from case documents), filing date, court fee amount, notes
  - [ ] Status transition buttons per filing (Filed -> Accepted/Rejected; Accepted -> Served)
  - [ ] Filing detail expandable view
- [ ] **Build filing checklist component** (AC 3)
  - [ ] `src/components/cases/filing-checklist.tsx` — checklist based on case type
  - [ ] Pre-defined checklist items per case type:
    - Civil: Plaint, Supporting Affidavit, List of Documents, List of Witnesses, Defence, Reply, Submissions
    - Criminal: Charge Sheet, Plea, Bail Application, Witness Statements, Submissions
    - Family: Petition, Response, Affidavit of Means, Children's Best Interest Report
    - Conveyancing: Sale Agreement, Title Search, Land Board Consent, Transfer Forms, Stamp Duty Receipt
  - [ ] Checkbox per item; links to filed document when available
  - [ ] Store checklist state per case in database
- [ ] **Build service of documents log** (AC 4)
  - [ ] `src/components/cases/service-log.tsx` — table of service entries
  - [ ] "Add Service Record" dialog: served to, served by, method dropdown, date, proof upload
  - [ ] Server actions: `src/lib/actions/court-filings.ts` — createServiceRecord, updateServiceRecord
  - [ ] Proof of service file upload via storage abstraction
  - [ ] Display method badge (Personal, Substituted, Email, etc.)
- [ ] **Build document bundle preparation** (AC 5)
  - [ ] `src/components/cases/document-bundle.tsx` — multi-select documents from case
  - [ ] Drag-and-drop reordering of selected documents
  - [ ] Generate document index/cover sheet (list of documents with numbers)
  - [ ] Option to generate index as PDF
  - [ ] Server action: generateDocumentIndex — creates a formatted index document
- [ ] **Build court fee summary** (AC 6)
  - [ ] `src/components/cases/court-fee-summary.tsx` — aggregated court fees display
  - [ ] Total fees (KES), breakdown by filing type
  - [ ] Add to case detail billing tab or overview court section
  - [ ] Query: sum of court fees from all filings for the case
- [ ] **Integrate filings into case detail page** (AC 1, 3, 4, 5, 6)
  - [ ] Add Court Filings section to case detail (as sub-tab under Documents or as separate section in Overview)
  - [ ] Include filing checklist, filings list, service log, document bundle tool, fee summary

## Dev Notes

### Architecture Patterns
- Court filings are tightly coupled with both cases and documents; a filing record references a case and optionally a document
- Service of documents is a separate log table from filings; one filing may have multiple service records (served to different parties)
- The filing checklist is a configuration-driven component; checklist items are defined per case type in a constants file
- Document bundle preparation is a UI-only feature (ordering and index generation); the actual documents remain in their storage location
- Court fee tracking feeds into the billing tab and financial reports

### Filing Status Transitions
```typescript
const FILING_STATUS_TRANSITIONS: Record<string, string[]> = {
  filed: ['accepted', 'rejected'],
  accepted: ['served'],
  rejected: [], // terminal state; can create new filing
  served: [],   // terminal state
};
```

### Service Methods (Kenya Practice)
- **Personal Service** — direct delivery to the party
- **Substituted Service** — court-ordered alternative method
- **Email Service** — where permitted by court rules
- **Registered Post** — postal service with tracking
- **Process Server** — professional process server
- **Affidavit of Service** — sworn statement confirming service

### Libraries
- shadcn/ui: Table, Dialog, Badge, Checkbox, Select, Button, Card
- `@dnd-kit/sortable` for document bundle reordering
- jsPDF or @react-pdf/renderer for document index PDF generation
- Lucide icons: FileCheck (filed), FileX (rejected), FileScan (served), Scale (court fee)

### Project Structure Notes

Files to create:
- `src/components/cases/court-filings-section.tsx` — filings list UI
- `src/components/cases/filing-checklist.tsx` — case type checklist
- `src/components/cases/service-log.tsx` — service of documents log
- `src/components/cases/document-bundle.tsx` — bundle preparation tool
- `src/components/cases/court-fee-summary.tsx` — fee aggregation display
- `src/lib/validators/court-filing.ts` — Zod schemas
- `src/lib/actions/court-filings.ts` — server actions
- `src/lib/queries/court-filings.ts` — data queries
- `src/lib/utils/filing-checklists.ts` — checklist definitions per case type

Files to modify:
- `src/app/(dashboard)/cases/[id]/page.tsx` — add court filings section/tab
- `src/components/cases/case-detail-tabs.tsx` — integrate filings content
- `src/components/cases/billing-tab.tsx` — add court fee summary

### References

- [Source: a.md - Module 16: Kenya Court & E-Filing Integration] — court fee tracking, filing checklist, document bundle, service of documents
- [Source: epics.md - Epic 7, Story 7.2] — acceptance criteria
- [Source: a.md - Best Practices from WakiliCMS] — supplier management for tracking process servers and court fees

## Dev Agent Record

### Agent Model Used


### Debug Log References


### Completion Notes List


### Change Log
| Change | Details |
|--------|---------|
| | |

### File List
