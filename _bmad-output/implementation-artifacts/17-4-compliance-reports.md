# Story 17.4: Compliance Reports (AML, CPD, Certificates)

Status: ready-for-dev

## Story

As an Admin,
I want compliance reports for regulatory submission,
so that the firm demonstrates adherence to Kenya legal requirements including AML/CFT, CPD, and practising certificate obligations.

## Acceptance Criteria (ACs)

1. **AML Report - Clients by Risk Level:** Chart and table showing client distribution across risk levels (Low, Medium, High) with counts and percentages.
2. **AML Report - Incomplete KYC:** Table listing clients with incomplete KYC documentation, showing client name, missing documents, and KYC status.
3. **AML Report - Expired KYC Documents:** Table listing clients whose KYC documents have expired, showing document type, expiry date, and days overdue.
4. **AML Report - Suspicious Activity Flags:** Table showing flagged suspicious transactions/clients with date, client, description, reporting status, and resolution.
5. **AML Report - PEP Clients:** Table listing all Politically Exposed Persons (PEP) flagged clients with enhanced due diligence status.
6. **AML Report - High-Risk Without EDD:** Table listing high-risk clients who have not completed Enhanced Due Diligence, as a critical compliance gap indicator.
7. **CPD Report - Attorney CPD Status Table:** Table showing each attorney with columns: name, CPD units earned, required units (5), LSK program units earned, minimum LSK units required (2), compliance status badge (Compliant/Non-Compliant). Non-compliant attorneys highlighted in red/orange.
8. **CPD Report - Year Filter:** Dropdown to filter CPD data by year, defaulting to the current year.
9. **Practising Certificate Report:** Table showing each attorney with: name, certificate number, status (Valid/Expired/Pending Renewal), expiry date. Attorneys with certificates expiring within 60 days highlighted in yellow/orange.
10. **Branch-Specific Reports:** All compliance reports can be filtered by branch to show branch-level compliance.
11. **Revenue/Caseload/Productivity per Branch:** Branch-specific breakdowns for revenue, caseload, and productivity metrics (linking back to Stories 17.1 and 17.2 filtered by branch).
12. **PDF Export for Compliance Reports:** Generate downloadable PDF versions of AML, CPD, and Practising Certificate reports suitable for submission to LSK or auditors.
13. **CSV Export:** All compliance report tables have CSV export functionality.

## Tasks / Subtasks

- [ ] **Task 1: Implement AML compliance report queries** (AC 1, 2, 3, 4, 5, 6)
  - Create `src/lib/queries/reports/compliance.ts` with:
    - `getClientsByRiskLevel(filters)` - COUNT grouped by risk_level from client_risk_assessments
    - `getIncompleteKYC(filters)` - clients where KYC status != 'Verified', joined with kyc_documents to identify missing items
    - `getExpiredKYCDocs(filters)` - kyc_documents where expiry_date < today
    - `getSuspiciousActivityFlags(filters)` - flagged transactions/clients from suspicious activity records
    - `getPEPClients(filters)` - clients where pep_flag = true, joined with risk assessment
    - `getHighRiskWithoutEDD(filters)` - clients with risk_level = 'High' who lack completed EDD records

- [ ] **Task 2: Build AML report components** (AC 1, 2, 3, 4, 5, 6)
  - Create `src/components/reports/compliance/risk-level-distribution.tsx` - PieChart + summary table
  - Create `src/components/reports/compliance/incomplete-kyc-table.tsx` - DataTable with client name, missing docs, status badge
  - Create `src/components/reports/compliance/expired-kyc-table.tsx` - DataTable with document type, expiry date, days overdue (red)
  - Create `src/components/reports/compliance/suspicious-activity-table.tsx` - DataTable with flag details
  - Create `src/components/reports/compliance/pep-clients-table.tsx` - DataTable with PEP flag, EDD status
  - Create `src/components/reports/compliance/high-risk-no-edd-table.tsx` - DataTable highlighting critical gaps

- [ ] **Task 3: Implement CPD report queries** (AC 7, 8)
  - Add to `src/lib/queries/reports/compliance.ts`:
    - `getCPDStatus(year, filters)` - per-attorney CPD units from cpd_records, grouped by attorney, with LSK program units separated, computing compliance status (>= 5 total AND >= 2 LSK)

- [ ] **Task 4: Build CPD report component** (AC 7, 8)
  - Create `src/components/reports/compliance/cpd-status-table.tsx` - DataTable with attorney name, units earned, required (5), LSK units, LSK required (2), compliance badge
  - Year selector dropdown, defaulting to current year
  - Non-compliant rows highlighted with orange/red background or badge

- [ ] **Task 5: Implement practising certificate report query** (AC 9)
  - Add to `src/lib/queries/reports/compliance.ts`:
    - `getPractisingCertificateStatus(filters)` - per-attorney latest certificate with status and expiry date, flagging those expiring within 60 days

- [ ] **Task 6: Build practising certificate report component** (AC 9)
  - Create `src/components/reports/compliance/certificate-status-table.tsx` - DataTable with attorney name, certificate number, status badge (green=Valid, red=Expired, yellow=Pending Renewal), expiry date
  - Rows with expiry within 60 days highlighted yellow/orange

- [ ] **Task 7: Add branch-specific filtering** (AC 10, 11)
  - Add branch filter to compliance report filter bar
  - All compliance queries accept optional `branchId` parameter
  - When filtered by branch, show only attorneys/clients associated with that branch
  - Add "Branch Performance" sub-section linking to revenue/caseload filtered by branch

- [ ] **Task 8: Implement PDF export** (AC 12)
  - Create `src/lib/utils/pdf-export.ts` with function to generate PDF from report data
  - Options: use `@react-pdf/renderer` for React-based PDF generation, or `jspdf` + `jspdf-autotable` for simpler table-based PDFs
  - PDF includes: firm letterhead (logo, name, address), report title, date generated, tabular data, summary section
  - Add "Export PDF" button to each compliance report section

- [ ] **Task 9: Assemble compliance report pages** (AC 1-13)
  - Create `src/app/(dashboard)/reports/compliance/page.tsx` with sub-sections: AML, CPD, Practising Certificates
  - Or split into sub-routes: `/reports/compliance/aml`, `/reports/compliance/cpd`, `/reports/compliance/certificates`
  - Include filter bar, all table/chart components, CSV and PDF export buttons
  - Add Compliance tab to reports layout navigation
  - Add loading skeletons for each section

- [ ] **Task 10: Add CSV export to all compliance tables** (AC 13)
  - Wire CSV export using shared utility from Story 17.1
  - Ensure compliance-specific columns (risk level, PEP flag, etc.) are properly formatted in CSV

## Dev Notes

- **AML/CFT Context:** Kenya's Proceeds of Crime and Anti-Money Laundering Act (POCAMLA) and LSK AML/CFT Guidelines 2025 require law firms to maintain client risk assessments, KYC records, and report suspicious transactions. These reports must be audit-ready.
- **CPD Rules:** Law Society of Kenya requires 5 CPD units per year, with at least 2 units from LSK-organized programs. Compliance is checked annually.
- **Practising Certificates:** Issued annually by LSK, typically expiring December 31. Attorneys cannot appear in court without a valid certificate.
- **PDF Generation:** For LSK/auditor submission, PDFs should be professional. Consider using `@react-pdf/renderer` for full control, or `jspdf` + `jspdf-autotable` for quicker implementation. Include firm branding and generation timestamp.
- **Sensitive Data:** AML and suspicious activity reports contain sensitive information. Ensure only Admin role can access these reports (enforce in middleware and query layer).
- **Performance:** AML reports query across multiple tables (clients, kyc_documents, client_risk_assessments). Use JOINs and indexed lookups. Consider materialized views if performance is an issue.
- **Branch-Specific:** When filtering by branch, attorneys are linked via `branch_users`, clients via their cases' branch assignment.
- **Reuse:** Leverage the report filter component from Story 17.1 with additional year filter for CPD.

### Project Structure Notes

**New files to create:**
- `src/app/(dashboard)/reports/compliance/page.tsx` (or sub-routes for AML, CPD, Certificates)
- `src/components/reports/compliance/risk-level-distribution.tsx`
- `src/components/reports/compliance/incomplete-kyc-table.tsx`
- `src/components/reports/compliance/expired-kyc-table.tsx`
- `src/components/reports/compliance/suspicious-activity-table.tsx`
- `src/components/reports/compliance/pep-clients-table.tsx`
- `src/components/reports/compliance/high-risk-no-edd-table.tsx`
- `src/components/reports/compliance/cpd-status-table.tsx`
- `src/components/reports/compliance/certificate-status-table.tsx`
- `src/lib/queries/reports/compliance.ts`
- `src/lib/utils/pdf-export.ts`

**Files to modify:**
- `src/app/(dashboard)/reports/layout.tsx` (add Compliance nav tab)

### References

- [Source: a.md -- Law Firm Registry Implementation Plan]
- [Source: epics.md -- Epic 17: Reports & Analytics, Story 17.4]
- [Source: epics.md -- Epic 4: Attorney Management, Stories 4.2 and 4.3] (CPD and certificate data model)
- [Source: epics.md -- Epic 5: Client Management & KYC, Story 5.2] (KYC/AML data model)
- Kenya Proceeds of Crime and Anti-Money Laundering Act (POCAMLA)
- LSK AML/CFT Guidelines 2025
- Kenya Advocates Act (practising certificate requirements)

## Dev Agent Record

### Agent Model Used


### Debug Log References


### Completion Notes List


### Change Log
| Change | Details |
|--------|---------|
| | |

### File List
