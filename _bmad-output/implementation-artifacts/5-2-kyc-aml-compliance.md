# Story 5.2: KYC/AML Document Collection & Verification

Status: ready-for-dev

## Story

As an Admin/Attorney,
I want KYC document collection and verification per LSK AML/CFT Guidelines 2025,
so that the firm complies with POCAMLA.

## Acceptance Criteria (ACs)

1. **KYC tab on client detail page** — displays overall KYC status badge (Pending / Verified / Expired / Rejected) prominently at the top of the tab.
2. **Document checklist for Individual clients** — required documents: National ID or Passport, KRA PIN Certificate, Proof of Address (utility bill, bank statement), Passport Photo.
3. **Document checklist for Organization clients** — required documents: Certificate of Incorporation, CR12 (Company Registry Form 12 showing directors/shareholders), KRA PIN Certificate, Directors' National IDs, Beneficial Ownership Declaration.
4. **Document upload with validation** — each checklist item has an upload button; accepted file types: PDF, JPG, PNG; max 10MB per file; upload progress indicator.
5. **Verification workflow** — each document transitions through: Pending -> Verified / Rejected; verified by (user), verification date, rejection notes required on reject.
6. **Expiry tracking with 30-day warnings** — KYC documents have optional expiry dates; system highlights documents expiring within 30 days; expired documents change KYC status to Expired.
7. **Risk assessment** — per-client risk level (Low / Medium / High) set during or after intake; includes Politically Exposed Person (PEP) flag checkbox.
8. **Suspicious transaction flagging** — ability to flag individual clients AND individual transactions as suspicious; flagging triggers a reporting workflow with notes, flagged by, date, and resolution status.
9. **Enhanced Due Diligence (EDD)** — high-risk clients automatically require additional documentation and review steps; EDD checklist with additional verification requirements.
10. **AML compliance summary widget on admin dashboard** — shows: total clients by risk level, pending KYC count, expired KYC count, suspicious activity flags, PEP client count.

## Tasks / Subtasks

- [ ] **Create Zod schemas for KYC operations** (AC 2, 3, 4, 5, 7, 8)
  - [ ] `src/lib/validators/kyc.ts` — kycDocumentUploadSchema, kycVerificationSchema, riskAssessmentSchema, suspiciousActivitySchema
- [ ] **Build KYC tab component** (AC 1, 2, 3, 4, 5, 6)
  - [ ] `src/components/clients/kyc-tab.tsx` — main tab container with status badge
  - [ ] `src/components/clients/kyc-checklist.tsx` — dynamic checklist based on client type (Individual vs Organization)
  - [ ] Each checklist item shows: document type, status badge, upload date, expiry date (if set), action buttons (Upload, View, Verify, Reject)
  - [ ] Upload dialog with file picker, document number field, issue date, expiry date
  - [ ] Verification dialog with approve/reject actions and notes field
- [ ] **Build KYC server actions** (AC 4, 5, 6, 8)
  - [ ] `src/lib/actions/kyc.ts` — uploadKycDocument, verifyKycDocument, rejectKycDocument, updateClientRiskAssessment, flagSuspiciousActivity, resolveFlag
  - [ ] File upload handling via storage abstraction (Vercel Blob / local)
  - [ ] Auto-update client KYC status based on document statuses
  - [ ] Audit log on every KYC operation
- [ ] **Build KYC queries** (AC 1, 6, 10)
  - [ ] `src/lib/queries/kyc.ts` — getKycDocumentsByClient, getKycStatus, getExpiringDocuments, getAmlComplianceSummary, getSuspiciousFlags
- [ ] **Implement risk assessment form** (AC 7, 9)
  - [ ] `src/components/clients/risk-assessment-form.tsx` — risk level selector (Low/Medium/High), PEP checkbox, justification notes
  - [ ] Server action in `src/lib/actions/kyc.ts` — writes to client_risk_assessments table
  - [ ] High-risk selection triggers EDD checklist display
- [ ] **Build EDD checklist component** (AC 9)
  - [ ] `src/components/clients/edd-checklist.tsx` — additional verification items for high-risk clients
  - [ ] EDD items: source of funds declaration, enhanced background check, senior management approval, periodic review schedule
- [ ] **Build suspicious activity flagging** (AC 8)
  - [ ] `src/components/clients/suspicious-flag-form.tsx` — flag reason, notes, supporting evidence
  - [ ] Flag indicator on client profile and client list
  - [ ] Resolution workflow: review, resolve with notes, or escalate
- [ ] **Build AML dashboard widget** (AC 10)
  - [ ] `src/components/dashboard/aml-compliance-widget.tsx` — summary cards showing risk distribution, pending KYC, expired docs, flags
  - [ ] Add to admin dashboard page
- [ ] **Implement expiry tracking and warnings** (AC 6)
  - [ ] Query for documents expiring within 30 days
  - [ ] Visual indicators: yellow warning badge for expiring, red for expired
  - [ ] Auto-update KYC status to "Expired" when any required document expires
- [ ] **Add loading skeletons and empty states** (AC 1)
  - [ ] Skeleton for KYC tab content
  - [ ] Empty state when no KYC documents uploaded yet

## Dev Notes

### Architecture Patterns
- KYC documents stored via the storage abstraction layer (`src/lib/storage/`) — Vercel Blob for demo, local filesystem for production
- File uploads should go through an API route (`src/app/api/upload/kyc/route.ts`) that validates file type/size, then stores and returns the URL
- KYC status is computed from individual document statuses: all required docs Verified = client Verified; any Expired = client Expired; any Pending = client Pending; any Rejected = client Rejected
- The PEP flag and risk assessment should be prominently displayed on the client detail page header, not just within the KYC tab
- Suspicious activity flags are critical compliance features; they must be append-only (cannot be deleted, only resolved)

### Libraries
- shadcn/ui components: Badge, Card, Dialog, Upload (custom), Checkbox, Select, Textarea, Alert, Progress
- File upload: use native `<input type="file">` wrapped in a styled component with drag-and-drop support
- Date handling: consider `date-fns` for expiry calculations and "days until expiry" display

### Kenya Compliance Context
- POCAMLA = Proceeds of Crime and Anti-Money Laundering Act
- LSK AML/CFT Guidelines 2025 mandate KYC for every client engagement
- Kenya is on the FATF grey list — AML compliance is under heightened scrutiny
- CR12 is a Kenya-specific company registry form showing directors and shareholders
- Beneficial ownership disclosure is required for corporate clients

### Project Structure Notes

Files to create:
- `src/components/clients/kyc-tab.tsx` — KYC tab main component
- `src/components/clients/kyc-checklist.tsx` — document checklist
- `src/components/clients/risk-assessment-form.tsx` — risk assessment form
- `src/components/clients/edd-checklist.tsx` — enhanced due diligence checklist
- `src/components/clients/suspicious-flag-form.tsx` — suspicious activity form
- `src/components/dashboard/aml-compliance-widget.tsx` — admin dashboard widget
- `src/lib/validators/kyc.ts` — Zod schemas
- `src/lib/actions/kyc.ts` — server actions
- `src/lib/queries/kyc.ts` — data access queries
- `src/app/api/upload/kyc/route.ts` — KYC document upload endpoint

Files to modify:
- `src/app/(dashboard)/clients/[id]/page.tsx` — add KYC tab content
- `src/app/(dashboard)/dashboard/page.tsx` — add AML compliance widget for admin role

### References

- [Source: a.md - Module 15: Kenya Compliance & Practising Certificate Management] — KYC/AML compliance section, KYC record form fields
- [Source: epics.md - Epic 5, Story 5.2] — acceptance criteria
- [Source: a.md - Kenya Legal Requirements] — AML/CFT compliance, Data Protection Act 2019
- [Source: a.md - Feature Gap Analysis #7] — KYC/AML Compliance as MUST-HAVE
