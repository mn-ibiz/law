# Story 20.3: Data Protection Act 2019 Compliance

Status: ready-for-dev

## Story

As an Admin,
I want the system to comply with Kenya's Data Protection Act 2019,
so that the firm meets GDPR-equivalent requirements for personal data protection, consent management, and data subject rights.

## Acceptance Criteria (ACs)

1. **Consent Management - Tracking:** The system tracks consent per client with fields: consent date, consent type (e.g., Data Processing, Marketing Communications, Third-Party Sharing), consent text accepted (the exact text the client agreed to), consent method (Online Form, In-Person, Email), and revocation date (if revoked).
2. **Consent Management - Audit Trail:** A complete audit trail of consent events: when consent was given, modified, or revoked, by whom, and the exact consent text version.
3. **Consent on Intake:** The client intake form (Story 5.4) and portal registration include a mandatory Data Protection Act 2019 consent checkbox with the specific consent text. Registration cannot proceed without consent.
4. **Data Minimization Documentation:** A documented data inventory page or section listing: what personal data is collected, the purpose for each data element, the legal basis for processing, and the retention period. This serves as the firm's data processing record required by the Act.
5. **Right to Access - Data Export:** Clients can request a data export from the portal. A "Download My Data" button generates a comprehensive package (CSV and/or PDF) containing all personal data the system holds about them: profile information, case summaries (non-privileged), documents shared with them, invoice history, communication history.
6. **Right to Deletion - Request Workflow:** Admin can process a deletion request from a client. The process: anonymize personal data (replace name, email, phone, national_id, address with "REDACTED" or hash), preserve case history and billing records for legal retention requirements (Advocates Act mandates 7-year retention), mark client as "Data Deleted". Deletion does not destroy case records needed for regulatory compliance.
7. **Deletion Request Log:** A log of all deletion requests with fields: client, request date, requested_by, reason, status (Pending/Approved/Completed/Rejected), processed_by, processed_date, notes.
8. **Data Breach Notification - Incident Form:** A form for recording data breach incidents with fields: breach date, discovery date, description, data types affected (dropdown: Personal Data, Financial Data, Legal Records, Health Data), clients affected (multi-select or count), severity (Low/Medium/High/Critical), containment actions taken, root cause.
9. **Data Breach Notification Template:** A pre-built notification template for notifying affected clients and the Office of the Data Protection Commissioner (ODPC), as required within 72 hours of discovery under the Act.
10. **Data Breach Log:** A log of all breach incidents viewable by Admin, showing: date, description, severity, clients affected, notification status (Not Notified/Clients Notified/ODPC Notified/Fully Notified), resolution status.
11. **DPA Compliance Dashboard Widget:** A summary widget on the Admin dashboard showing: total clients with consent, clients without consent, pending deletion requests, recent breach incidents (if any).
12. **Audit Logging:** All DPA-related actions (consent changes, data exports, deletion processing, breach recording) are captured in the audit log.

## Tasks / Subtasks

- [ ] **Task 1: Create consent management schema and actions** (AC 1, 2, 12)
  - Create/extend `src/lib/db/schema/consent.ts` with `client_consents` table:
    - `id`, `client_id` (FK), `consent_type` (enum: data_processing, marketing, third_party_sharing), `consent_text` (text, the exact version accepted), `consent_date` (timestamptz), `consent_method` (enum: online_form, in_person, email), `revoked_at` (timestamptz, nullable), `revoked_by` (FK to users, nullable), `created_by` (FK to users), `ip_address` (varchar)
  - Create `src/lib/actions/consent.ts` with:
    - `recordConsent(clientId, consentType, consentText, method)` - insert consent record
    - `revokeConsent(clientId, consentType, reason)` - set revoked_at, create audit entry
    - `getClientConsents(clientId)` - all consent records for a client with history
  - All actions create audit log entries

- [ ] **Task 2: Integrate consent into client intake and portal** (AC 3)
  - Modify public intake form (`/intake`) to include DPA consent checkbox with full consent text
  - Consent text should be configurable (stored in firm_settings or a dedicated consent_texts table)
  - On intake submission, call `recordConsent()` alongside client creation
  - Portal registration also requires consent
  - Consent checkbox is required - form cannot submit without it

- [ ] **Task 3: Build consent management UI** (AC 1, 2)
  - Create `src/components/dpa/consent-manager.tsx` - displayed on client detail page (DPA tab)
  - Shows current consent status per type (Active/Revoked/Not Given)
  - Consent history timeline showing all consent events
  - "Record Consent" button for in-person consent capture
  - "Revoke Consent" button with reason field and confirmation

- [ ] **Task 4: Create data inventory documentation page** (AC 4)
  - Create `src/app/(dashboard)/settings/data-protection/page.tsx` as the DPA management hub
  - Include a "Data Inventory" section or sub-page listing:
    - Personal data fields collected (name, email, phone, national_id, KRA PIN, etc.)
    - Purpose for each field (legal services, billing, compliance, communication)
    - Legal basis (contractual necessity, legal obligation, consent)
    - Retention period (active client: indefinite, closed client: 7 years per Advocates Act, then eligible for deletion)
  - This can be a static/semi-static page with admin-editable content or a markdown-rendered document

- [ ] **Task 5: Implement Right to Access - data export** (AC 5, 12)
  - Create `src/lib/actions/dpa-export.ts` with:
    - `generateClientDataPackage(clientId)` - compiles all personal data into a downloadable package
  - Data included: profile info, case summaries (titles, statuses, dates - not privileged content), shared documents list, invoice history, payment history, communication log, consent history
  - Output format: ZIP file containing CSV files per category and/or a single PDF summary
  - Add "Download My Data" button to client portal profile page
  - Admin can also trigger data export from client detail page
  - Export action creates audit log entry

- [ ] **Task 6: Implement Right to Deletion** (AC 6, 12)
  - Create `src/lib/actions/dpa-deletion.ts` with:
    - `processDataDeletion(clientId, approvedBy)` - anonymizes client personal data:
      - Replace name with "REDACTED CLIENT #{hash}"
      - Replace email with "redacted_{hash}@deleted.local"
      - Clear phone, national_id, kra_pin, address fields
      - Preserve: case records (with anonymized client reference), billing records (for financial audit), trust transactions
      - Set client status to 'data_deleted'
      - Cannot be undone (confirmation with typed acknowledgment)
  - Preserve case_id, invoice amounts, trust balances for regulatory compliance
  - Audit log records the deletion with metadata

- [ ] **Task 7: Build deletion request workflow** (AC 7, 12)
  - Create/extend schema with `deletion_requests` table: `id, client_id, request_date, requested_by, reason, status (pending/approved/completed/rejected), processed_by, processed_date, notes`
  - Create `src/lib/actions/deletion-requests.ts` with:
    - `createDeletionRequest(clientId, reason)` - submit request
    - `approveDeletionRequest(requestId)` - approve and process
    - `rejectDeletionRequest(requestId, notes)` - reject with reason
  - Create `src/components/dpa/deletion-request-form.tsx` - form for submitting requests
  - Create `src/components/dpa/deletion-requests-list.tsx` - Admin view of all requests with status badges and action buttons
  - Notification to Admin on new deletion request

- [ ] **Task 8: Implement data breach management** (AC 8, 9, 10, 12)
  - Create/extend schema with `breach_incidents` table: `id, breach_date, discovery_date, description, data_types_affected (JSONB array), clients_affected_count, severity (enum), containment_actions, root_cause, notification_status (enum), resolution_status (enum), reported_by, created_at`
  - Create `src/lib/actions/breach-incidents.ts` with CRUD actions
  - Create `src/components/dpa/breach-incident-form.tsx` - form for recording incidents
  - Create `src/components/dpa/breach-incidents-list.tsx` - list of all incidents with severity and notification status badges
  - Breach notification template: pre-filled email/letter template with placeholders (breach description, data affected, remediation steps, ODPC contact) downloadable as PDF or copyable text
  - 72-hour notification deadline shown as countdown from discovery_date
  - All breach actions create audit log entries

- [ ] **Task 9: Build DPA dashboard widget** (AC 11)
  - Create `src/components/dpa/dpa-compliance-widget.tsx`
  - Cards: clients with active consent (count), clients missing consent, pending deletion requests, active breach incidents
  - Add to Admin dashboard
  - Click-through to respective DPA management pages

- [ ] **Task 10: Create DPA settings navigation** (AC 4)
  - Add "Data Protection" link to settings navigation
  - Sub-pages: Overview/Data Inventory, Consent Log, Deletion Requests, Breach Incidents
  - Create `src/app/(dashboard)/settings/data-protection/layout.tsx` with sub-navigation

## Dev Notes

- **Kenya Data Protection Act 2019:** This Act is Kenya's equivalent of GDPR. Key provisions:
  - **Section 25:** Data processing must have lawful basis (consent, contractual necessity, legal obligation)
  - **Section 26:** Data subjects have rights: access, correction, deletion, portability
  - **Section 40:** Data breach notification to ODPC within 72 hours
  - **Section 41:** Notification to affected data subjects "without unreasonable delay"
  - **Office of the Data Protection Commissioner (ODPC):** Kenya's supervisory authority
- **Anonymization vs Deletion:** The Act requires deletion, but the Advocates Act requires retention of client matter records for 7 years. The compromise: anonymize personal identifying information while preserving case and financial records. This approach is documented in the data inventory.
- **Consent Text Versioning:** Store the exact consent text the client agreed to, not a reference to a template. If consent text changes, new consents use the new text, old consents retain the historical text. This is legally important.
- **Data Export Package:** The "Download My Data" feature should generate a comprehensive but non-privileged package. Exclude: attorney work product, case strategies, internal notes marked private. Include: all personal data, shared documents, billing records.
- **Breach 72-Hour Clock:** The 72-hour notification deadline starts from the moment the breach is discovered, not when it occurred. The UI should show a clear countdown and change color as the deadline approaches (green > 48h, yellow 24-48h, red < 24h).
- **Encryption at Rest:** National IDs and KRA PINs should be encrypted in the database (pgcrypto or application-layer encryption). This story should verify encryption is in place per Story 5.1.
- **ODPC Notification:** The breach notification template should be formatted according to ODPC requirements. Include: firm name, DPO contact, nature of breach, data types, number affected, consequences, mitigation measures.

### Project Structure Notes

**New files to create:**
- `src/app/(dashboard)/settings/data-protection/page.tsx`
- `src/app/(dashboard)/settings/data-protection/layout.tsx`
- `src/components/dpa/consent-manager.tsx`
- `src/components/dpa/deletion-request-form.tsx`
- `src/components/dpa/deletion-requests-list.tsx`
- `src/components/dpa/breach-incident-form.tsx`
- `src/components/dpa/breach-incidents-list.tsx`
- `src/components/dpa/dpa-compliance-widget.tsx`
- `src/lib/db/schema/consent.ts` (or extend existing schema)
- `src/lib/actions/consent.ts`
- `src/lib/actions/dpa-export.ts`
- `src/lib/actions/dpa-deletion.ts`
- `src/lib/actions/deletion-requests.ts`
- `src/lib/actions/breach-incidents.ts`
- `src/lib/validators/dpa.ts`
- `src/lib/queries/dpa.ts`

**Files to modify:**
- `src/app/(dashboard)/settings/layout.tsx` (add Data Protection nav)
- Public intake form (add DPA consent checkbox)
- Portal registration (add DPA consent checkbox)
- Client detail page (add DPA/Consent tab)
- Client portal profile page (add "Download My Data" button)
- Admin dashboard (add DPA compliance widget)
- Database schema (add client_consents, deletion_requests, breach_incidents tables)

### References

- [Source: a.md -- Law Firm Registry Implementation Plan]
- [Source: epics.md -- Epic 20: Data Management, Compliance & Polish, Story 20.3]
- Kenya Data Protection Act, 2019 (Act No. 24 of 2019)
- Office of the Data Protection Commissioner (ODPC) Kenya
- Kenya Advocates Act (7-year record retention requirement)
- [Source: epics.md -- Epic 5: Client Management & KYC, Story 5.1] (client data fields)
- [Source: epics.md -- Epic 5: Client Management & KYC, Story 5.4] (intake form consent)

## Dev Agent Record

### Agent Model Used


### Debug Log References


### Completion Notes List


### Change Log
| Change | Details |
|--------|---------|
| | |

### File List
