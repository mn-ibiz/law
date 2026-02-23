# Law Firm Registry — Gap Analysis & Roadmap to 100%

## Research Methodology

This analysis was compiled from:
- **10 Exa web searches** covering global legal tech (CosmoLex, Clio, Centerbase, PracticePanther, RunSensible, Lawcus, StrongSuit, Intapp, CaseGen, LEAP, CARET Legal, LawVu, Crespect), Kenya-specific systems (Wakili CRM, WakiliCMS, EliteLaw, Wakili Digital, Sisu by Lenhac), and regulatory sources (LSK, Advocates Act, FATF, POCAMLA)
- **Full codebase audit** of all 55 pages, 50+ database tables, 98+ server actions, 18 validators, 73+ components
- **Kenya regulatory documents**: LSK CPD Accreditation Guidelines 2023, Advocates (CPD) Rules LN 43/2014, Advocates (Practising Certificate)(Fees) Rules LN 110/2024, LSK AML/CFT/CPF Guidelines Oct 2025, Advocates (Accounts) Rules, Kenya Data Protection Act 2019

**Current Overall Score: 123 of 194 features implemented (63%), 22 partial, 49 missing**

---

## Summary Scorecard

| Category | Total | Done | Partial | Missing | Score |
|----------|-------|------|---------|---------|-------|
| 1. Case & Matter Management | 15 | 13 | 1 | 1 | **90%** |
| 2. Client / CRM | 12 | 9 | 1 | 2 | **75%** |
| 3. Kenya Regulatory Compliance | 16 | 10 | 1 | 5 | **63%** |
| 4. Conflict of Interest | 7 | 4 | 1 | 2 | **57%** |
| 5. Document Management | 11 | 5 | 1 | 5 | **45%** |
| 6. Billing & Invoicing | 15 | 10 | 2 | 3 | **67%** |
| 7. Trust / Client Money | 10 | 8 | 2 | 0 | **80%** |
| 8. Time Tracking & Expenses | 10 | 7 | 1 | 2 | **70%** |
| 9. Calendar & Deadlines | 11 | 9 | 1 | 1 | **82%** |
| 10. Court & Filing | 7 | 5 | 0 | 2 | **71%** |
| 11. Communication | 7 | 3 | 2 | 2 | **43%** |
| 12. Reporting & Analytics | 9 | 5 | 1 | 3 | **56%** |
| 13. Security & Data Protection | 14 | 11 | 1 | 2 | **79%** |
| 14. Workflow Automation | 6 | 3 | 3 | 0 | **50%** |
| 15. Financial Management | 8 | 5 | 1 | 2 | **63%** |
| 16. System Administration | 10 | 7 | 2 | 1 | **70%** |
| 17. Client Portal | 10 | 6 | 0 | 4 | **60%** |
| 18. Public Intake | 6 | 3 | 0 | 3 | **50%** |
| 19. Advanced / Emerging | 10 | 0 | 1 | 9 | **0%** |
| **TOTALS** | **194** | **123** | **22** | **49** | **63%** |

---

## 1. CASE & MATTER MANAGEMENT — Currently 90%

### What's Implemented
Full CRUD, 6-status workflow (open, in_progress, hearing, resolved, closed, archived), auto case numbering, 4 priority levels, pipeline/Kanban with custom stages and colors, multi-attorney assignments with 4 roles (lead, assigned, supervising, of_counsel), private/public notes, auto-generated timeline, 7 case party roles including judge/expert/witness, opposing party/counsel fields, statute of limitations field, estimated value, tags system.

### To Reach 100% — 2 Items

| # | Gap | What to Build | Why It Matters | Effort |
|---|-----|---------------|----------------|--------|
| 1 | **Case budgeting** | Add `budget` (decimal) and `budgetNotes` (text) columns to `cases` table. Create a "Budget vs Actual" tab on case detail showing: budget amount, total billed time + expenses, remaining budget, burn rate percentage. Add budget exceeded alert (workflow trigger). | Clio, Filevine, and Crespect all offer per-matter budgets. Corporate clients in Kenya increasingly demand budget certainty. Without this, firms cannot track profitability per case or alert when costs exceed estimates. WakiliCMS enterprise clients cite this as a top request. | Small — 1 schema column, 1 query, 1 UI component |
| 2 | **Full multi-currency on invoices** | Currently trust accounts support currency but invoices are KES-only. Add `currency` column to `invoices` table (default KES). Add exchange rate field. Support USD, GBP, EUR for international matters. Display amounts in selected currency on invoice PDF. | Kenya law firms handling cross-border transactions (trade, IP, maritime) bill in USD/GBP. Crespect lists multi-currency as a top-5 feature. EliteLaw and WakiliCMS both support this. Without it, firms must create invoices outside the system for international clients. | Medium — schema change, form update, PDF formatting |

---

## 2. CLIENT / CRM — Currently 75%

### What's Implemented
Full CRUD, individual + organization types, Kenya-specific fields (National ID, KRA PIN, county, PO Box), 3 client statuses (active, inactive, prospective), contact log with 5 contact types, referral source tracking, client portal with full case/document/invoice/message access, profile management.

### To Reach 100% — 3 Items

| # | Gap | What to Build | Why It Matters | Effort |
|---|-----|---------------|----------------|--------|
| 1 | **Lead/prospect CRM pipeline** | Currently only a `prospective` status exists but no visual pipeline. Build a dedicated CRM pipeline view: Lead → Contacted → Consultation Scheduled → Engaged → Retained (or Lost). Add `leadSource`, `leadScore`, `followUpDate`, `lostReason` fields to clients. Create a Kanban board at `/clients/pipeline`. Add conversion analytics (lead-to-client rate, average time to conversion). | Lawmatics (2026 best CRM for law firms), Clio Grow, and PracticePanther all provide intake-to-retention pipelines. Wakili CRM advertises "Simplified Client Intake" as a headline feature. Without a pipeline, the firm cannot track which prospects are converting, where leads drop off, or which marketing channels work. 53% of legal consumers now research firms online before engaging (NYSBA survey). | Medium — new fields, new page, Kanban component |
| 2 | **Client satisfaction tracking** | Add a `client_feedback` table: `clientId`, `caseId`, `rating` (1-5), `feedbackText`, `feedbackDate`, `surveyType` (post_case, periodic, nps). Build a simple survey form that can be sent via email/portal link after case closure. Display average satisfaction score on client profile and in firm-wide reports. Add Net Promoter Score (NPS) calculation. | MyCase and Clio both offer client satisfaction features. The Law Society UK recommends client feedback as best practice. Kenyan firms competing for corporate clients need measurable service quality. Without this, there's no data-driven way to improve client service or identify at-risk relationships. | Medium — new table, form, report widget |
| 3 | **Relationship mapping** | Add a `client_relationships` table: `clientId`, `relatedClientId`, `relationshipType` (spouse, parent_company, subsidiary, director, partner, guarantor, beneficiary). Display relationship graph on client detail page. Cross-reference during conflict checks (a conflict with Company X should flag Director Y). | Intapp and Clio list relationship intelligence as a premium feature. Kenyan law frequently involves family and corporate relationships where conflicts cascade (e.g., conveyancing between related parties, corporate groups). Without this, conflict checks miss indirect relationships. Crespect's 21-feature guide lists "opponents and third parties" tracking as feature #1. | Medium — new table, UI graph, conflict search enhancement |

**Note on marketing automation (Advanced):** Email/SMS templates exist in the system but there's no campaign engine. This requires integration with an email service (SendGrid, Resend) and is better deferred to a future phase. Most Kenya-focused systems (EliteLaw, Wakili Digital) don't offer this either.

---

## 3. KENYA REGULATORY COMPLIANCE — Currently 63%

### What's Implemented
Practising certificates with year/status/dates, CPD tracking with units/LSK program flag/certificate URLs, unique bar number registry, disciplinary records with case reference/status/outcome, attorney licenses with 6 statuses (active, inactive, suspended, retired, struck_off, deceased), KYC documents with 5-status verification workflow, client risk assessments with 4 levels (low, medium, high, critical), trust accounts with overdraft prevention (TOCTOU), Senior Counsel / Commissioner for Oaths / Notary Public boolean flags.

### To Reach 100% — 6 Items

| # | Gap | What to Build | Why It Matters | Effort |
|---|-----|---------------|----------------|--------|
| 1 | **Professional indemnity insurance tracking** | Add `professional_indemnity` table: `attorneyId`, `insurerName`, `policyNumber`, `coverAmount`, `premiumAmount`, `startDate`, `expiryDate`, `status` (active, expired, pending_renewal), `certificateUrl`. Add expiry alerts (60, 30, 7 days before expiry). Display on attorney profile compliance tab. Block/warn on practising certificate renewal if PI is expired. | **Mandatory under the Advocates Act.** Section 26(2)(c) requires proof of professional indemnity insurance for practising certificate issuance. The LSK mandates minimum cover of KES 5 million. An attorney cannot legally practise without valid PI insurance. The LSK portal checks this during annual PC renewal. No Kenya system currently tracks this well — this is a competitive advantage. | Small — new table, form, alert logic |
| 2 | **STR (Suspicious Transaction Report) filing** | Add `suspicious_transaction_reports` table: `clientId`, `caseId`, `reportedBy`, `reportDate`, `transactionDetails`, `suspicionBasis`, `riskIndicators`, `status` (draft, filed_with_frc, acknowledged), `frcReferenceNumber`, `filingDate`. Build STR form matching FRC (Financial Reporting Centre) requirements. Add "Flag as Suspicious" button on trust transactions and client payments. Generate STR document in prescribed FRC format. | **Mandatory under POCAMLA 2009, Section 44.** Advocates are "reporting institutions" under the Proceeds of Crime and Anti-Money Laundering Act. Failure to file STRs carries criminal penalties including imprisonment. Kenya was placed on the FATF grey list in 2024, and the LSK AML/CFT Guidelines (Oct 2025) specifically require law firms to have STR procedures. This is the single most critical compliance gap in the system. | Medium — new table, form, document generation |
| 3 | **AML compliance officer designation** | Add `amlComplianceOfficer` field to `firmSettings` (reference to a user). Add AML compliance dashboard showing: pending KYC verifications, high-risk clients, overdue risk assessments, STR filing status, training compliance. Add annual AML compliance report generation. | **Required by LSK AML/CFT Guidelines 2025.** Every law firm must designate an AML Compliance Officer responsible for ensuring the firm's AML/CFT program. The LSK actively recruited for this role (per their Dec 2024 job posting). The compliance officer must oversee CDD, file STRs, conduct staff training, and submit periodic reports. Without this designation in the system, there's no accountability chain. | Small — settings field, dashboard page |
| 4 | **LSK membership fees tracking** | Add `lsk_membership` table: `attorneyId`, `year`, `membershipCategory` (Advocate, Senior Counsel), `annualFee`, `paymentDate`, `paymentReference`, `status` (paid, unpaid, overdue). Track annual fee of KES 15,000 (per Advocates (Practising Certificate)(Fees) Rules, LN 110/2024). Add payment reminders. Show compliance status on attorney profile. | Practising certificate issuance requires current LSK membership fees to be paid. Late application incurs a 25% penalty. WakiliCMS tracks this. Without tracking, the firm risks attorneys practising without valid membership — a disciplinary offence under the Advocates Act. | Small — new table, form, reminder |
| 5 | **Data Protection Act 2019 compliance** | Add `data_consents` table: `userId`/`clientId`, `consentType` (data_processing, marketing, third_party_sharing), `consentGiven` (boolean), `consentDate`, `withdrawalDate`, `ipAddress`. Add consent checkboxes to client intake and portal registration forms. Build "My Data" page in client portal with: download my data (JSON/CSV export), request deletion, view processing purposes. Add data breach notification template. Add privacy policy acceptance tracking. | **Mandatory under Kenya Data Protection Act 2019.** The Office of the Data Protection Commissioner (ODPC) actively enforces this. Fines up to KES 5 million or 1% of annual turnover. The Act requires: lawful basis for processing (consent), data subject rights (access, rectification, deletion, portability), data breach notification within 72 hours, and a Data Protection Impact Assessment for high-risk processing. Law firms process highly sensitive personal data. Wakili CRM advertises "end-to-end encryption" and the Data Protection Act as compliance features. | Medium — new table, consent UI, data export, portal page |
| 6 | **PEP (Politically Exposed Persons) screening** | Add `isPep` boolean and `pepDetails` text to `clients` table. Add PEP flag in client intake form with enhanced due diligence workflow. When PEP is flagged, require: senior partner approval, enhanced KYC documentation, ongoing monitoring schedule. Log all PEP-related decisions in audit trail. | **Required by LSK AML/CFT Guidelines 2025 and POCAMLA.** PEPs and their associates require Enhanced Customer Due Diligence (ECDD). The FATF grey list puts extra pressure on Kenya to demonstrate PEP screening. The LSK guidelines specifically mention PEPs as high-risk categories. Failure to screen is a compliance violation. | Small — schema fields, form checkbox, conditional workflow |

---

## 4. CONFLICT OF INTEREST — Currently 57%

### What's Implemented
Cross-entity conflict search with LIKE escaping (prevents SQL injection), 3 severity levels (clear, potential, conflict_found), resolution tracking with role-based authorization check, conflict audit trail stored in `conflict_checks` table.

### To Reach 100% — 3 Items

| # | Gap | What to Build | Why It Matters | Effort |
|---|-----|---------------|----------------|--------|
| 1 | **Automated new-matter conflict check** | Modify `submitIntake()` in `src/lib/actions/intake.ts` and `createCase()` in `src/lib/actions/cases.ts` to automatically trigger `searchConflicts()` on submission. Store auto-check results. If potential/found conflict detected, block case creation and notify admin. Add conflict check to `createClient()` as well. | The LSK Code of Conduct (Gazette Notice 5212, 2017) requires advocates to check for conflicts before accepting instructions. Manual-only checks are easily forgotten — the system should enforce this. Centerbase, Intapp, and every major system auto-run conflicts on new matter opening. Intapp reports that auto-checks reduce conflict clearance time by 60%. | Small — wire existing function into intake/case/client actions |
| 2 | **Lateral hire conflict screening** | Add "Attorney Conflict Check" flow: when a new attorney is added via `createAttorney()`, auto-search the attorney's name, previous firms, and known clients against existing cases and parties. Display results before confirming the hire. Add `previousFirms` field to attorney profile. | Intapp Conflicts specifically markets this feature. When a new attorney joins, their prior client relationships may conflict with current firm matters. The LSK Code of Conduct requires this. Large Kenyan firms (e.g., those with 50+ advocates) regularly face this during lateral hires. Without this, the firm risks unknowing conflicts that could lead to disqualification motions. | Medium — new field, search flow, UI |
| 3 | **Ethical wall management** | Add `ethical_walls` table: `caseId`, `attorneyId`, `reason`, `createdBy`, `createdAt`, `active` (boolean). When an attorney has a conflict on a case, create an ethical wall that restricts that attorney's access to the case data. Modify case queries to filter out walled attorneys. Add wall status indicator on case detail page. Log all wall creation/removal in audit trail. | Intapp and Clio both offer ethical wall/screen features. The LSK Code of Conduct (Part IV — Conflict of Interest) allows firms to manage conflicts through Chinese walls/ethical screens in some circumstances. Without system-enforced walls, access restrictions rely on verbal agreements — which are indefensible in disciplinary proceedings. | Medium — new table, query modifications, access control logic |

---

## 5. DOCUMENT MANAGEMENT — Currently 45%

### What's Implemented
Document upload/storage (URL-based with file metadata), 8 categories (pleading, correspondence, contract, evidence, court order, filing, template, other), version control with version numbers and change notes, 4 statuses (draft, final, signed, archived), templates with placeholder support.

### To Reach 100% — 6 Items

| # | Gap | What to Build | Why It Matters | Effort |
|---|-----|---------------|----------------|--------|
| 1 | **Full-text search** | Integrate PostgreSQL full-text search (`tsvector`/`tsquery`) on document titles and descriptions. For document content search, extract text from uploaded PDFs/DOCX on upload (using `pdf-parse` or `mammoth`) and store in a `searchContent` column. Add full-text search index. Update document list page with content search toggle. | Wakili CRM advertises "full-text search across Swahili or English docs" as a headline feature. LEAP Legal calls this "one-click search." Centerbase lists document search as a must-have. Without content search, attorneys must open individual documents to find relevant information — a massive time waste when a case has 100+ documents. | Medium — text extraction library, DB index, search query |
| 2 | **Document automation/merge engine** | Build a merge engine that replaces template placeholders (e.g., `{{client_name}}`, `{{case_number}}`, `{{date}}`, `{{court_name}}`) with actual data from case/client records. Add "Generate from Template" button on case detail and document list pages. Support output as DOCX (using `docx` npm package) or PDF. Pre-build Kenya-specific templates: demand letter, engagement letter, power of attorney, affidavit, statutory declaration. | Smokeball's #1 feature is document automation. Clio, Lawcus, and Filevine all offer template merge. WakiliCMS offers document templates. Kenya law firms generate repetitive documents daily (demand letters, affidavits, court pleadings). Manual copy-paste from templates is error-prone and slow. This is a high-value productivity feature. | Medium — merge engine, DOCX generation, template builder |
| 3 | **E-signature integration** | Integrate with a signature service. Options: (a) Simple in-app signature (canvas-based signature pad stored as image), (b) External integration with DocuSign/SignNow API. Add signature request workflow: attorney sends document for signature → client receives link → client signs → document status updates to "signed." Store signed copy as new version. | Clio, MyCase, and PracticePanther all offer e-signatures. The Kenya Electronic Transactions Act (2008) recognizes electronic signatures as legally valid. Wakili CRM advertises "sign documents electronically" in their portal. Without this, clients must print, sign, scan, and return documents — adding days to conveyancing and corporate transactions. | Medium-Large — third-party API or canvas implementation |
| 4 | **Court bundle generation** | Add "Create Court Bundle" action on case detail page. Allow selecting documents and ordering them. Generate a combined PDF with: cover page (case title, court, file number), table of contents with page numbers, sequential pagination across all documents, bundle index. Support Kenya court filing requirements (numbered pages, indexed). | Specific to litigation practice. Kenya courts require organized bundles for hearings. LEAP Legal offers this as "matter management" feature. OpusTwo specializes in this for litigation. Without this, paralegals spend hours manually assembling and paginating court bundles — a task that should be automated. | Medium — PDF merge library, cover page generation, pagination |
| 5 | **OCR / document scanning** | Add OCR capability for scanned documents using Tesseract.js (client-side) or a cloud OCR API. On upload of image/scanned PDF, extract text and store for full-text search. Add "Scan Document" option that processes uploaded images. | Many Kenya court documents are still physical. Firms receive hand-delivered documents, faxes, and scanned copies. Without OCR, scanned documents are unsearchable black boxes in the system. Clio and Smokeball both offer OCR. | Medium — OCR library integration, processing pipeline |
| 6 | **Bilingual document support (English/Swahili)** | Add `language` field to documents and templates. Support Swahili metadata and search terms. Create Swahili versions of standard templates (statutory declaration, affidavit). | Wakili CRM specifically lists Swahili document search. Kenya's Constitution recognizes both English and Swahili as official languages. Some court proceedings (especially in lower courts) use Swahili. | Small — metadata field, template translations |

---

## 6. BILLING & INVOICING — Currently 67%

### What's Implemented
Full invoice CRUD with line items, 5 billing types (hourly, flat_fee, contingency, retainer, pro_bono), 8-status workflow (draft, sent, viewed, partially_paid, paid, overdue, cancelled, written_off), server-side line item amount computation (fraud prevention), 16% VAT auto-calculation, 6 payment methods including M-Pesa with transaction ID field, receipt generation, credit notes with reason, quotes with 5 statuses and validity period.

### To Reach 100% — 5 Items

| # | Gap | What to Build | Why It Matters | Effort |
|---|-----|---------------|----------------|--------|
| 1 | **M-Pesa API integration** | Integrate with Safaricom Daraja API for: (a) STK Push — send payment request to client's phone, (b) C2B — receive payments to firm's Paybill/Till, (c) Transaction status query, (d) Auto-reconciliation of M-Pesa statements. Configure Paybill/Till number in firm settings. Auto-match incoming M-Pesa payments to invoices by account reference. | **This is the #1 competitive feature for Kenya.** Wakili CRM and EliteLaw both offer M-Pesa integration. M-Pesa processes over KES 35 trillion annually in Kenya. Most client payments for small-to-mid firms come via M-Pesa. Currently our system only records M-Pesa transaction codes manually — there's no auto-reconciliation or payment request capability. Without API integration, payment recording is manual and error-prone. | Medium-Large — Daraja API integration, callback handling, reconciliation |
| 2 | **Online payment portal** | Add a payment page accessible from client portal invoice view. Support: M-Pesa (via STK Push), card payments (via a gateway like Pesapal, Flutterwave, or Stripe). Generate payment link that can be emailed/WhatsApped to clients. Update invoice status automatically on successful payment. | PracticePanther, MyCase, and Clio all offer online payments. 70% of legal consumers expect electronic payment options (NYSBA survey). Pesapal is Kenya's leading payment gateway supporting M-Pesa, Airtel Money, cards, and bank transfers. Without this, clients must make payments outside the system and the firm must manually reconcile. | Medium-Large — payment gateway integration, webhook handling |
| 3 | **KRA e-TIMS integration** | Integrate with KRA's Electronic Tax Invoice Management System (e-TIMS) for: (a) auto-submission of tax invoices to KRA, (b) retrieval of e-TIMS invoice number, (c) QR code on invoices for KRA verification. Store e-TIMS control unit number in firm settings. Add e-TIMS submission status to invoice records. | **Becoming mandatory for all VAT-registered businesses in Kenya.** KRA is phasing in e-TIMS requirements. Law firms billing above the VAT threshold (KES 5 million annually) must comply. Non-compliance carries penalties. No Kenya legal software currently offers this integration — it's a major competitive advantage. | Medium — KRA API integration, QR code generation |
| 4 | **Bulk invoicing** | Add "Generate Invoices" batch action: select multiple cases with unbilled time/expenses, preview all invoices, confirm and create in batch. Add batch send capability (email all generated invoices). Add batch PDF download (zip file of all invoice PDFs). | Clio and PracticePanther offer bulk invoicing. Firms with 50+ active cases need to generate monthly invoices efficiently. Without this, creating invoices one-by-one for each case takes hours at month-end. WakiliCMS users report this as a top time-saver. | Medium — batch action, multi-invoice generation, zip download |
| 5 | **Invoice aging report** | Build dedicated aging report page showing: Current (0-30 days), 31-60 days, 61-90 days, 90+ days buckets. Display by client with subtotals. Show total outstanding per bucket. Add aging chart (stacked bar). Export to CSV/PDF. Add aging badge on billing dashboard. | Every major legal billing system offers aging reports. The American Bar Association lists aging reports as essential for firm financial health. Without this, the firm cannot identify collection problems or prioritize follow-up on overdue accounts. This was listed in Phase 8 of the original plan but not yet implemented. | Small-Medium — query grouping by date ranges, report UI |

---

## 7. TRUST / CLIENT MONEY ACCOUNTING — Currently 80%

### What's Implemented
Client + general account types, atomic deposit/withdrawal with TOCTOU protection (conditional UPDATE WHERE balance >= amount), balance tracking per account, full transaction log with 5 types (deposit, withdrawal, transfer, interest, fee), overdraft prevention, transfer type for trust-to-operating, interest tracking, case-associated transactions.

### To Reach 100% — 2 Items

| # | Gap | What to Build | Why It Matters | Effort |
|---|-----|---------------|----------------|--------|
| 1 | **Three-way reconciliation UI** | The `bankReconciliations` schema exists but needs a dedicated reconciliation page. Build: (a) Bank balance input (from bank statement), (b) System/book balance (sum of all trust transactions), (c) Client balances total (sum of all per-client sub-ledgers). Display all three with a reconciliation status. Highlight discrepancies. Generate reconciliation statement PDF. Add reconciliation date tracking and history. | **Mandatory under Advocates (Accounts) Rules.** Three-way reconciliation is the gold standard for trust accounting compliance. AJS Legal Software (South Africa, 45+ years) lists this as their #1 feature. The LSK requires firms to maintain reconciled trust accounts and may audit at any time. Discrepancies can lead to suspension or striking off. The schema exists — it just needs the UI and reconciliation logic. | Medium — reconciliation logic, comparison UI, PDF generation |
| 2 | **Trust account reporting** | Build dedicated trust reports: (a) Client trust balance summary (all clients with trust balances), (b) Trust transaction report (filterable by date, client, type), (c) Trust reconciliation report (for LSK submission), (d) Dormant trust funds report (balances with no activity for 12+ months), (e) Annual trust account return (format prescribed by LSK). Export all to PDF/CSV. | **Required by the Advocates (Accounts) Rules.** Advocates must file annual returns to the LSK showing trust account status. The Advocates Complaints Commission can request trust reports at any time. LexPro (South Africa) specifically highlights "Legal Practice Act compliant trust reports" as a key feature. Without dedicated reports, generating LSK-required returns is a manual spreadsheet exercise. | Medium — queries, report pages, PDF generation |

---

## 8. TIME TRACKING & EXPENSES — Currently 70%

### What's Implemented
Full time entry CRUD with hours/rate/amount, billable/non-billable toggle, timer with start/end timestamps, 7 expense categories (filing_fee, travel, courier, printing, expert_fee, court_fee, other) with receipt URLs, requisition approval workflow with 5 statuses (draft, pending_approval, approved, rejected, completed), invoice linkage for both time entries and expenses, billing rates table with currency and default flag.

### To Reach 100% — 3 Items

| # | Gap | What to Build | Why It Matters | Effort |
|---|-----|---------------|----------------|--------|
| 1 | **Batch time entry / weekly timesheet** | Add "Weekly Timesheet" view: grid with days as columns, cases as rows. Allow entering hours in each cell. Save all entries in one submit. Add "Copy from Previous Week" function for recurring work patterns. | Smokeball and Clio offer batch/weekly timesheet entry. Attorneys who forget to log time daily need to catch up weekly. Without batch entry, each entry requires opening a form, selecting a case, and submitting — tedious for 20+ entries. | Medium — grid UI component, batch insert action |
| 2 | **UTBMS activity codes** | Add `activityCode` field to `timeEntries` table. Pre-populate with UTBMS (Uniform Task-Based Management System) codes: L110 (Fact Investigation), L120 (Analysis/Strategy), L130 (Experts), L140 (Documents), L150 (Court Proceedings), etc. Allow custom activity codes. Use in reports for time analysis by activity type. | Filevine and Centerbase support UTBMS. Corporate clients in Kenya (especially multinational companies) increasingly require UTBMS-coded billing for audit purposes. The standard enables firms to analyze where time is spent across activity types. Without this, time analysis is limited to case-level granularity. | Small — enum/lookup table, field on time entry form |
| 3 | **Mileage/travel calculator** | Enhance the "travel" expense category with: `distanceKm` field, configurable per-km rate (currently KES 10-15/km in Kenya), auto-calculated amount from distance x rate, origin/destination fields. Optionally integrate with Google Maps API for distance calculation. | Travel is a significant expense for Kenya litigation firms (attending courts across 47 counties). Manual calculation is error-prone. WakiliCMS and Sisu by Lenhac both track travel expenses. Without auto-calculation, travel reimbursements are inconsistent and may be under/over-claimed. | Small — additional fields, calculation logic |

---

## 9. CALENDAR & SCHEDULING — Currently 82%

### What's Implemented
Full event CRUD with 7 types (court_hearing, meeting, deadline, reminder, consultation, deposition, other), court hearing type + court date flag, deadline tracking with priority and statutory flag, recurring event support, reminder configuration (minutes before), event attendees with response status (pending, accepted, declined), 4-status task workflow (pending, in_progress, completed, cancelled), bring-up system with 4 statuses (pending, completed, dismissed, overdue).

### To Reach 100% — 2 Items

| # | Gap | What to Build | Why It Matters | Effort |
|---|-----|---------------|----------------|--------|
| 1 | **External calendar sync (Google/Outlook)** | Implement iCal (.ics) feed generation: create an API route (`/api/calendar/ical/[userId]`) that generates an iCal feed of the user's events. Users subscribe to this URL in Google Calendar or Outlook. For two-way sync (future), integrate with Google Calendar API or Microsoft Graph API. Add "Subscribe to Calendar" button in settings with the feed URL. | Clio, PracticePanther, and MyCase all offer calendar sync. Attorneys use personal calendars alongside firm calendars. Without sync, attorneys must manually cross-reference two calendars, leading to double-bookings and missed court dates. 87% of attorneys use smartphones for scheduling (ABA TechReport). The iCal feed is the simplest approach requiring no OAuth setup. | Medium — iCal generation library, API route, settings UI |
| 2 | **Court rules-based deadline auto-calculation** | Build a `court_rules` table: `courtType`, `eventType`, `deadlineName`, `daysFromEvent`, `direction` (before/after), `isBusinessDays`. Pre-populate with Kenya court rules (e.g., Civil Procedure Rules: response 15 days after service, appeal 30 days after judgment). When a court hearing date is added, auto-generate all rule-based deadlines. Allow custom rules per court type. | Clio and Smokeball offer rules-based deadline calculators. Kenya's Civil Procedure Rules, Appellate Jurisdiction Rules, and various tribunal rules prescribe specific timeframes. Missing a statutory deadline is malpractice. Currently, attorneys must manually calculate and create each deadline — this should be automated from court rules. No Kenya system offers this — major competitive advantage. | Medium — rules table, calculation engine, auto-deadline creation |

---

## 10. COURT & FILING MANAGEMENT — Currently 71%

### What's Implemented
Court registry with level/jurisdiction/contacts, court stations by county with location data, 5-status filing tracking (pending, filed, accepted, rejected, served), 6 service methods (personal, substituted, email, registered_mail, court_process_server, other), proof of service URLs with served_to/served_by tracking.

### To Reach 100% — 2 Items

| # | Gap | What to Build | Why It Matters | Effort |
|---|-----|---------------|----------------|--------|
| 1 | **E-filing integration readiness** | Add `eFilingReference` and `eFilingStatus` fields to `courtFilings`. Build document preparation workflow matching Kenya Judiciary e-filing format requirements. Add e-filing checklist per case type. Store e-filing confirmation receipts. Add link/button to Kenya Judiciary e-filing portal (https://efiling.court.go.ke). Future phase: direct API integration when Kenya Judiciary opens their API. | The Kenya Judiciary has been rolling out electronic filing since 2020 (Practice Directions on Electronic Case Management). The Nairobi High Court and Court of Appeal already use e-filing. This is expanding to all courts. WakiliCMS and Sisu already prepare documents for e-filing. Without readiness, firms must prepare documents separately for the e-filing portal. | Small-Medium — fields, checklist UI, link integration |
| 2 | **Cause list tracking** | Add `cause_lists` table: `courtId`, `date`, `caseNumber`, `caseTitle`, `courtRoom`, `time`, `judge`, `status` (listed, heard, adjourned, struck_out). Build daily cause list view showing all firm cases appearing in court today. Add "Today's Court Appearances" dashboard widget. Allow manual entry or future scraping from Kenya Judiciary cause list portal. | WakiliCMS offers cause list tracking. Kenya courts publish daily cause lists showing which cases will be heard. Attorneys must check these daily to know when their cases are called. Without tracking, attorneys miss cause list entries and fail to appear — resulting in cases being struck out or adverse orders. | Small-Medium — new table, dashboard widget, list view |

---

## 11. COMMUNICATION & MESSAGING — Currently 43%

### What's Implemented
Internal direct messaging with thread support (parent message ID), client messaging via portal with read status tracking, 6 notification types (info, warning, deadline, assignment, billing, system) with link URLs.

### To Reach 100% — 4 Items

| # | Gap | What to Build | Why It Matters | Effort |
|---|-----|---------------|----------------|--------|
| 1 | **SMS API integration** | Integrate with Africa's Talking API (Kenya's leading SMS gateway): (a) Send SMS from system (court reminders, payment confirmations, appointment reminders), (b) Delivery status tracking, (c) SMS cost per message tracking, (d) Bulk SMS capability. Configure API key and sender ID in firm settings. Use existing SMS templates. Phone format validation: +254XXXXXXXXX. | Wakili CRM and Sisu both offer SMS. Africa's Talking is the standard SMS API for Kenya (used by Safaricom, banks, and government). SMS reaches attorneys and clients who may not check email. Kenya has 60M+ mobile subscriptions. Without SMS integration, the `smsLog` table and SMS templates are unused infrastructure sitting in the codebase. | Medium — API integration, sending service, delivery tracking |
| 2 | **WhatsApp Business API integration** | Integrate with WhatsApp Business API (via Africa's Talking or Meta Cloud API): (a) Send case updates to clients, (b) Share documents via WhatsApp, (c) Receive messages from clients, (d) WhatsApp number field on client record. Add notification preference per client (SMS, email, WhatsApp, in-app). | Wakili CRM lists WhatsApp integration as a feature. WhatsApp has 15M+ users in Kenya — it's the dominant messaging platform. Clients prefer WhatsApp over email for quick updates. Without this, attorneys communicate via personal WhatsApp with no audit trail, creating compliance and data protection risks. | Medium-Large — WhatsApp Business API, message routing, audit logging |
| 3 | **Email SMTP integration** | Integrate with an email service (Resend, SendGrid, or Nodemailer with SMTP): (a) Send invoices/fee notes via email, (b) Send deadline reminders, (c) Send welcome emails to new clients, (d) Send password reset emails (currently planned but needs SMTP). Use existing email templates with placeholder replacement. Track delivery status. | Every major legal system sends email. Currently email templates exist in the DB but there's no sending capability. Password reset flow requires email. Invoice delivery requires email. Without SMTP integration, all communication is manual — attorneys must copy invoice PDFs and email them from personal accounts. | Medium — SMTP/API integration, template rendering, delivery tracking |
| 4 | **Push notifications** | Implement browser push notifications using the Web Push API: (a) Notification permission request on first login, (b) Push for: new messages, deadline approaching, court date reminders, payment received, (c) Service worker for background notifications. Alternatively, implement Server-Sent Events (SSE) for real-time in-app notifications without page refresh. | Clio and MyCase offer push notifications. Without push, users must refresh the page to see new notifications. Critical alerts (court date in 1 hour, deadline today) need immediate delivery. The current notification system is poll-based — notifications only appear when the page loads. | Medium — service worker, push subscription, notification service |

---

## 12. REPORTING & ANALYTICS — Currently 56%

### What's Implemented
Admin dashboard with case status chart and recent cases, revenue metrics and billing statistics, time tracking statistics with billable/non-billable breakdown, attorney performance page at `/attorneys/performance`, reports module framework.

### To Reach 100% — 4 Items

| # | Gap | What to Build | Why It Matters | Effort |
|---|-----|---------------|----------------|--------|
| 1 | **Profitability analysis** | Build per-case and per-client profitability reports: Revenue (billed + collected) minus Cost (attorney time at cost rate + expenses + disbursements) = Profit. Add `costRate` field to attorneys (distinct from billing rate). Show profitability by: case, client, practice area, attorney, branch. Highlight unprofitable cases/clients. | Centerbase specifically lists "Profitability Reporting" as a feature category. CosmoLex and Clio offer profitability dashboards. Without profitability analysis, the firm cannot identify which practice areas, clients, or case types are actually profitable vs. subsidized. This is critical for strategic decision-making. | Medium — cost rate field, profitability calculation query, report UI |
| 2 | **Custom report builder** | Build a drag-and-drop report builder: (a) Select entity type (cases, clients, invoices, time entries), (b) Choose columns to display, (c) Add filters (date range, status, attorney, practice area), (d) Choose grouping/aggregation, (e) Save report as template for reuse. Display results as table with chart option. | Filevine and Clio offer custom reports. Every firm has unique reporting needs. Without a custom builder, every new report request requires developer time. The existing reports cover standard needs but miss firm-specific KPIs. | Large — query builder, dynamic column selection, saved templates |
| 3 | **Report export (PDF/CSV)** | Implement CSV export for all report pages (add "Export CSV" button that serializes table data). Implement PDF export using jsPDF or @react-pdf/renderer (as listed in the tech stack plan). Add firm branding (logo, name) to PDF reports. Support date range in filename. | Every system offers export. The original plan lists "CSV + PDF export for all reports" in Phase 8. Currently the audit log tracks "export" actions but no export functionality exists. Without export, attorneys cannot share reports with partners, clients, or the LSK. | Medium — CSV serialization, PDF generation, download handlers |
| 4 | **Scheduled/automated reports** | Allow admins to schedule reports: (a) Select report type, (b) Set frequency (daily, weekly, monthly), (c) Set recipients (email addresses), (d) Auto-generate and email on schedule. Use a cron job (Next.js API route + Vercel Cron or node-cron for on-prem). Pre-built schedules: weekly billing summary, monthly revenue report, daily overdue invoice list. | Clio offers scheduled reports. Partners need weekly/monthly summaries without logging in. Without automation, someone must manually generate and distribute reports — a task easily forgotten. | Medium — cron scheduling, email integration (depends on SMTP), report generation |

---

## 13. SECURITY & DATA PROTECTION — Currently 79%

### What's Implemented
NextAuth v5 JWT + Credentials auth, 3-role RBAC (admin, attorney, client) with route-level middleware enforcement, 5-attempt lockout with atomic SQL increment (15-minute cooldown), SHA-256 hashed password reset tokens (crypto.randomBytes(32)), complete security headers (CSP, HSTS with preload, X-Frame-Options DENY, X-Content-Type-Options nosniff, Referrer-Policy, Permissions-Policy), full audit trail with 7 action types and IP/user agent tracking, Drizzle ORM parameterized queries + LIKE escaping, Zod validation on all server actions, TOCTOU protection for trust withdrawals, JWT session with middleware user ID check.

### To Reach 100% — 3 Items

| # | Gap | What to Build | Why It Matters | Effort |
|---|-----|---------------|----------------|--------|
| 1 | **Two-factor authentication (2FA)** | Implement TOTP-based 2FA: (a) Add `totpSecret` and `twoFactorEnabled` fields to users table, (b) Settings page to enable 2FA with QR code (using `otpauth` or `speakeasy` library), (c) 2FA verification step after password login, (d) Recovery codes (10 single-use codes stored hashed), (e) Admin can require 2FA for all users via firm settings. | The Kenya Data Protection Act 2019 requires "appropriate technical measures" to protect personal data. 2FA is increasingly considered a minimum standard for systems handling legal/financial data. The ABA recommends 2FA for all legal software. Clio, PracticePanther, and Centerbase all offer 2FA. Without it, a single compromised password exposes all client data — a catastrophic breach. | Medium — TOTP library, QR generation, verification middleware, recovery codes |
| 2 | **Data Protection Act compliance** | (Covered in detail under Kenya Regulatory Compliance, item 5 — consent management, data subject rights, breach notification, privacy impact assessment.) | See Section 3, item 5 above. | See above |
| 3 | **Session security enhancements** | (a) Add session activity log (login time, IP, device fingerprint), (b) Add "Active Sessions" page showing all logged-in sessions with ability to revoke remotely, (c) Add configurable session timeout in firm settings (currently relies on JWT expiry), (d) Add IP-based suspicious login detection (alert on login from new IP/location). | Best practice per OWASP Session Management Cheat Sheet. The LSK AML/CFT Guidelines require firms to maintain access logs. Without session management, a compromised account cannot be remotely terminated. Multiple active sessions from different locations should trigger alerts. | Medium — session tracking table, management UI, alert logic |

---

## 14. WORKFLOW AUTOMATION — Currently 50%

### What's Implemented
Workflow template schema with 7 trigger types (case_status_change, deadline_approaching, document_uploaded, invoice_created, payment_received, task_completed, manual), 6 action types (send_email, send_sms, create_task, update_status, send_notification, assign_attorney), workflow execution logging table with status tracking. Full CRUD actions exist for templates and rules.

### To Reach 100% — 3 Items

| # | Gap | What to Build | Why It Matters | Effort |
|---|-----|---------------|----------------|--------|
| 1 | **Active runtime workflow engine** | Build an execution engine that: (a) Listens for trigger events (case status change, deadline approaching, document uploaded, payment received, etc.), (b) Evaluates conditions from workflow rules, (c) Executes actions (send notification, create task, update status, etc.), (d) Logs execution results to `workflowExecutionLog`. Implement as a utility function called from relevant server actions (e.g., after `updateCase()`, check for workflows triggered by `case_status_change`). | Clio reports that automated workflows reduce manual follow-up by 40%+. The entire schema and CRUD are built — the runtime engine is the missing piece that activates everything. Without execution, the workflow system is a data entry form with no output. Smokeball specifically markets "automated workflows" as their #2 feature after document automation. | Medium-Large — event dispatcher, condition evaluator, action executor, hooks into all relevant server actions |
| 2 | **Email/SMS action execution** | Wire workflow `send_email` actions to SMTP integration (depends on SMTP setup from Communication section). Wire `send_sms` actions to Africa's Talking API. Implement template variable replacement at runtime (e.g., `{{client_name}}` replaced with actual client name from the triggering entity). | Without email/SMS execution, workflow actions can only create tasks and in-app notifications — limiting automation to in-app-only actions. The most valuable automations (court date reminders, overdue invoice alerts, payment confirmations) require external communication channels. | Medium — depends on SMTP and SMS integration being completed first |
| 3 | **Deadline-approaching scheduled trigger** | Implement a scheduled job (cron) that runs daily and: (a) Checks all deadlines approaching within configured windows (7 days, 3 days, 1 day, overdue), (b) Checks practising certificate expiry dates, (c) Checks KYC document expiry dates, (d) Checks LSK membership due dates, (e) Triggers matching workflows for each approaching deadline. This is the event source for all time-based workflow triggers. | Without a scheduled trigger, the workflow engine can only react to user-initiated actions (status changes, uploads). Time-based triggers (deadline approaching, certificate expiring, invoice overdue) are the most critical for compliance. The Advocates (CPD) Rules require timely renewal — the system should proactively alert. A cron running at midnight each day solves this. | Medium — cron job (Vercel Cron or node-cron), date comparison queries, trigger dispatch |

---

## 15. FINANCIAL MANAGEMENT — Currently 63%

### What's Implemented
Petty cash CRUD with deposit/withdrawal types and categories, bank account registry with account number/bank/branch/SWIFT/currency/balance, bank reconciliation schema with status tracking (pending, in_progress, completed, discrepancy) and statement vs system balance comparison, full supplier/vendor management with contact/KRA PIN/banking details, requisition approval workflow with 5 statuses.

### To Reach 100% — 3 Items

| # | Gap | What to Build | Why It Matters | Effort |
|---|-----|---------------|----------------|--------|
| 1 | **General ledger / chart of accounts** | Add `chart_of_accounts` table: `accountCode`, `accountName`, `accountType` (asset, liability, equity, revenue, expense), `parentAccountId`, `balance`. Add `journal_entries` table for double-entry bookkeeping. Pre-populate with standard law firm chart of accounts (professional fees income, disbursements, operating expenses, trust liabilities, etc.). Generate trial balance and income statement. | WakiliCMS (enterprise) offers full financial statements. AJS Legal Software (South Africa, 45+ years) is built around legal accounting. Without a general ledger, the system cannot produce financial statements (P&L, balance sheet) — firms need a separate accounting system (QuickBooks, Sage). Full accounting is a major differentiator for enterprise firms but may be excessive for smaller firms. **Consider: integration with an accounting system may be more practical than building a full GL.** | Large — double-entry bookkeeping engine, chart of accounts, financial statements |
| 2 | **Multi-currency exchange rates** | Add `exchange_rates` table: `fromCurrency`, `toCurrency`, `rate`, `effectiveDate`. Support manual rate entry or integration with an exchange rate API (e.g., Open Exchange Rates, ExchangeRate-API). Convert foreign currency transactions to KES for reporting. Show amounts in both original currency and KES equivalent on reports. | Kenya firms handling international matters need to bill in USD/GBP/EUR and report in KES. Without exchange rate tracking, currency conversion is manual and inconsistent. The `bankAccounts` and `trustAccounts` tables already support currency fields — this completes the multi-currency story. | Small-Medium — exchange rate table, conversion utility, report formatting |
| 3 | **Payroll basics** | Add `payroll` and `payroll_items` tables: employee (link to user), basic salary, allowances, deductions (NSSF, NHIF, PAYE, pension), net pay, pay period. Calculate Kenya statutory deductions: PAYE (progressive rates per KRA), NSSF (Tier I: 6% up to KES 7,000; Tier II: 6% of KES 7,001-36,000), NHIF (graduated scale), Housing Levy (1.5% of gross). Generate payslips. **Consider: integration with a payroll service (WagePoint Kenya, Pesapal Payroll) may be more practical than building from scratch.** | WakiliCMS is the only Kenya system offering HR/payroll. Most small firms use 3-15 employees — basic payroll saves them from buying a separate HR system. Kenya's Employment Act requires payslips. NSSF, NHIF, and Housing Levy deductions are mandatory. However, this is a large module with complex Kenya tax rules that change annually. | Large — Kenya tax calculation engine, payslip generation, statutory returns |

---

## 16. SYSTEM ADMINISTRATION — Currently 70%

### What's Implemented
User management with roles (admin, attorney, client) and active/inactive status, multi-branch with primary designation and user assignment, practice area CRUD with activate/deactivate, key-value firm settings table, custom fields with type/options/required flag/display order, billing rate configuration with currency and default flag, both email and SMS templates with variable placeholders.

### To Reach 100% — 3 Items

| # | Gap | What to Build | Why It Matters | Effort |
|---|-----|---------------|----------------|--------|
| 1 | **Data import tool** | Build CSV import for: clients (bulk import existing client list), cases (migrate from spreadsheets), attorneys (onboard firm roster), time entries (historical data). Add column mapping UI (map CSV headers to system fields), validation preview (show what will be imported with errors highlighted), duplicate detection (match on name/email/ID number), and error reporting. Support encoding for Kenya-specific characters. | Every system offers data import. CosmoLex, Clio, and PracticePanther provide migration tools. Without import, firms must manually re-enter all existing data — a dealbreaker for adoption. EliteLaw markets "1-day setup" which is only possible with import capability. This is the #1 barrier to new firm onboarding. | Medium — CSV parser, column mapper, validation UI, batch insert |
| 2 | **Data export / backup** | Add "Export Data" page (admin only): export all entity types to CSV/JSON. Include a "Full Backup" option that creates a ZIP of all data. Add automated weekly backup to a configured location (critical for on-prem deployment). Comply with Data Protection Act right to data portability. Add "Download My Data" button in client portal (DPA requirement). | Required by Kenya Data Protection Act 2019 (data portability right). Essential for the production target (on-prem Windows server with local PostgreSQL). Without export/backup, data loss from hardware failure could be catastrophic. Neon handles backups for the demo environment — but production needs explicit backup procedures. | Medium — data serialization, ZIP generation, scheduled backup job |
| 3 | **Firm branding / white-label** | Add firm logo upload in settings (stored in Vercel Blob / local filesystem). Display logo on: login page, sidebar header, invoice/fee note PDF, receipt PDF, portal landing page, email templates. Add firm color scheme configuration (primary color, secondary color) applied via CSS custom properties. | MyCase, Clio, and PracticePanther all support firm branding. The original plan mentions "firm logo upload" in Settings and "firm branding" on invoice PDFs. Without branding, generated documents look generic and unprofessional. This is especially important for client-facing outputs (invoices sent to corporate clients, the client portal). | Small — file upload, logo display in layout components and PDFs, color CSS variables |

---

## 17. CLIENT PORTAL — Currently 60%

### What's Implemented
Portal dashboard with summary, case status viewing (client-scoped queries), document access/download, invoice viewing with payment history, secure messaging with read status tracking, profile management.

### To Reach 100% — 4 Items

| # | Gap | What to Build | Why It Matters | Effort |
|---|-----|---------------|----------------|--------|
| 1 | **Client document upload** | Add "Upload Document" button on portal documents page. Allow clients to upload: evidence, signed documents, ID copies, KYC documents. Uploaded documents go to attorney review queue (status: `pending_review`). Notify assigned attorney of new upload. Apply file type whitelist and size restrictions (25MB max). Virus scan consideration for production. | Wakili CRM advertises "upload evidence" as a portal feature. Clio and MyCase both allow client uploads. Without this, clients must email documents to their attorney — creating version control issues and no audit trail. KYC document collection specifically requires client uploads (national ID, KRA PIN certificate, proof of address). This directly enables the KYC compliance workflow. | Small — upload form on portal, review queue status, notification trigger |
| 2 | **Online payment from portal** | Add "Pay Now" button on invoice detail page in portal. Integrate with payment gateway (Pesapal for Kenya — supports M-Pesa, Airtel Money, cards, bank transfers). Show payment confirmation with receipt. Auto-update invoice status on successful payment callback. Display payment receipt in portal. | Depends on payment gateway integration from Billing section. Clio, MyCase, and PracticePanther all offer portal payments. 70% of legal consumers expect electronic payment (NYSBA survey). Without this, clients view invoices but must pay through external channels — then the firm must manually record the payment. | Medium — depends on payment gateway integration |
| 3 | **Appointment scheduling** | Add "Request Consultation" button on portal dashboard. Show attorney availability (derived from calendar events — find open slots). Client selects preferred date/time and reason. Creates a pending calendar event. Attorney approves/reschedules via notification. Confirmation sent to client (email/SMS/in-app). | Clio, RunSensible, and Lawcus offer client scheduling. Reduces phone calls for appointment booking. Without this, scheduling is a back-and-forth email/call process. The calendar and event system already exists — this adds a client-facing booking interface on top of it. | Medium — availability calculation from existing calendar, booking form, approval workflow |
| 4 | **E-signature from portal** | Allow clients to digitally sign documents shared by their attorney. Add "Sign" button on shared documents in portal. Canvas-based signature pad or typed signature option. Signed document stored as new version with `signed` status. Timestamp and IP recorded. Notification sent to attorney when signed. | Depends on e-signature implementation from Document Management section. Wakili CRM lists "sign documents electronically" in portal features. The Kenya Electronic Transactions Act 2008 validates electronic signatures. Without this, the signing workflow requires physical meetings or the print-sign-scan cycle — adding days to conveyancing, corporate, and family law matters. | Medium — depends on e-signature implementation |

---

## 18. PUBLIC INTAKE & ONBOARDING — Currently 50%

### What's Implemented
Public intake form at `/intake` with Zod validation, success confirmation page at `/intake/success`, intake submission creates a prospective client record.

### To Reach 100% — 3 Items

| # | Gap | What to Build | Why It Matters | Effort |
|---|-----|---------------|----------------|--------|
| 1 | **Auto conflict check on intake submission** | Modify `submitIntake()` in `src/lib/actions/intake.ts` to call `searchConflicts()` with the submitted client name, company name, and opposing party (if provided on the form). Store auto-check results linked to the intake record. If potential or found conflict detected, flag the intake for manual review instead of auto-creating the client. Notify admin of flagged intakes. Add `conflictCheckResult` field to the intake processing flow. | The LSK Code of Conduct (Gazette Notice 5212, 2017) requires advocates to check for conflicts before accepting new instructions. Automating this on intake ensures no client is onboarded without a check. Currently, an attorney must remember to manually run a conflict check after seeing a new intake — this is easily forgotten under workload pressure. Clio, MyCase, and Intapp all auto-check on intake. | Small — wire the existing `searchConflicts()` function into the intake action |
| 2 | **Custom intake forms per practice area** | Add `intake_form_templates` table: `practiceAreaId`, `formFields` (JSON array of field definitions — label, type, required, options), `isActive`, `description`. Build a form builder in admin settings that defines fields per practice area. Render the correct form based on a query parameter (`/intake?area=conveyancing`) or dropdown selection on the intake page. Pre-build templates for: Personal Injury (accident date, injuries, insurance details), Conveyancing (property description, title reference, seller/buyer), Family (marriage date, children, custody), Employment (employer, position, dates of employment, grievance), Corporate (company name, directors, registration number). | Clio Grow and Lawmatics offer customizable intake forms. A personal injury intake needs different fields than a conveyancing intake. Without custom forms, the generic form misses practice-specific information, requiring follow-up calls that delay engagement. Wakili CRM offers "custom forms" as a headline feature. This also enables practice-area-specific analytics (which practice areas get the most intakes). | Medium — form builder, dynamic form renderer, template storage |
| 3 | **Intake analytics / conversion funnel** | Track intake-to-client conversion: (a) Total intakes received per period, (b) Conflict check results breakdown, (c) Converted to active client count, (d) Converted to case count, (e) Lost/declined count with reason tracking. Add `intakeStatus` field (received, reviewing, converted, declined) and `declineReason` to intake records. Dashboard widget showing conversion funnel chart. Filter by practice area, source, date range. Track average time from intake to engagement letter. | Lawmatics (2026 best CRM for law firms) centers entirely on intake analytics. Without conversion tracking, the firm cannot measure which marketing channels generate paying clients, where prospects drop off in the funnel, or how long onboarding takes. This data drives marketing spend decisions and process improvement. | Small-Medium — status tracking fields on intake records, analytics query, funnel chart widget |

---

## 19. ADVANCED / EMERGING FEATURES — Currently 0%

These are forward-looking features that differentiate leading systems in 2025-2026. None are currently implemented.

| # | Feature | What to Build | Why It Matters | Effort | Priority |
|---|---------|---------------|----------------|--------|----------|
| 1 | **AI-powered legal research** | Integrate with an LLM API (Claude/GPT) for: case law search against Kenya Law Reports, statute lookup, legal memo drafting assistance. Add "Research Assistant" panel on case detail page. | Clio acquired vLex for AI legal research. Wakili CRM offers "Ask WakiliCRM AI." This is the 2026 competitive frontier — 87% of litigation professionals say AI is a competitive advantage (Ari Kaplan study). | Large | Future Phase |
| 2 | **AI document drafting** | Use LLM to draft documents from templates + case context. Auto-fill templates beyond simple placeholder replacement — generate clauses based on case type and jurisdiction. | Smokeball and Clio offer AI drafting. Reduces document preparation time by 60%+ (Clio reports). AttorneyAtWork 2026 survey shows firms using AI draft tools bill 15% more hours. | Large | Future Phase |
| 3 | **Mobile app / PWA** | Convert to Progressive Web App: add `manifest.json`, service worker, offline caching of critical pages. Allow installation on mobile home screens. Prioritize: time entry, calendar, notifications, messages for mobile experience. | PracticePanther and MyCase offer native apps. EliteLaw markets "Works on 3G." Kenya attorneys are mobile-first — most court work happens outside the office. Responsive design exists but PWA adds installability, push notifications, and offline basics. | Medium | Next Phase |
| 4 | **Offline access** | Service worker caching for read operations (case details, calendar, client info). Queue write operations (time entries, notes) for sync when connectivity returns. Priority: view case details, view calendar, create time entries offline. | Critical for Kenya where internet is intermittent outside Nairobi CBD. EliteLaw specifically markets 3G compatibility. Without offline capability, the system is unusable during connectivity drops — which happen daily in many county courts. | Large | Future Phase |
| 5 | **REST API** | Build API routes (`/api/v1/`) for core entities: cases, clients, invoices, time entries, calendar events. JWT authentication for API access. OpenAPI/Swagger documentation. Rate limiting. Enable third-party integrations and serve as mobile app backend. | Clio has 1500+ integrations powered by their API. Without an API, the system is a closed silo that cannot integrate with email clients, accounting software (QuickBooks), or other business tools. An API also enables a future native mobile app. | Medium-Large | Next Phase |
| 6 | **Webhook support** | Add webhook configuration in settings: target URL, events to subscribe to (case_created, invoice_paid, document_uploaded, deadline_approaching), shared secret for HMAC signature verification. Fire HTTP POST to configured URLs on matching events. | Enables integration with Slack (case updates in channels), Zapier (connect to 5000+ apps), and custom internal systems. The workflow framework already defines triggers — webhooks extend them to external consumers. | Medium | Next Phase |
| 7 | **Multi-language UI (English/Swahili)** | Implement i18n using `next-intl` or `react-i18next`. Extract all UI strings to locale JSON files. Translate to Swahili. Add language switcher in user settings/header. Persist preference. Support right-to-left if needed for future languages. | Kenya's Constitution (Article 7) recognizes English and Swahili as official national languages. Client portal in Swahili serves clients more comfortably — especially in rural areas and lower courts. Wakili CRM mentions bilingual support. | Medium-Large | Future Phase |
| 8 | **Dark mode** | Add theme toggle using Tailwind CSS dark mode classes (already supported by shadcn/ui via CSS variables). Store preference in `localStorage` and optionally in user settings table. Respect `prefers-color-scheme` system preference as default. | Standard UX expectation in 2026. Reduces eye strain for attorneys working late hours (common in legal). shadcn/ui components already have dark mode variants — this is primarily a configuration task. | Small | Next Phase |
| 9 | **SSO (SAML/OIDC)** | Integrate with enterprise identity providers (Azure AD, Google Workspace, Okta) via NextAuth.js OIDC/SAML provider configuration. Allow firms to use their existing corporate single sign-on. Map external roles to internal roles. | Enterprise firms with IT departments require SSO for security policy compliance. NextAuth.js already supports OIDC providers — this is primarily configuration. Medium-to-large Kenya firms (especially those serving multinational clients) increasingly require SSO. | Medium | Future Phase |
| 10 | **AI contract review** | Integrate LLM for clause extraction, risk identification, and comparison against standard terms. Add "Review Contract" action on uploaded contract documents. Highlight non-standard, missing, or risky clauses. Compare against firm's standard template. | StrongSuit and Clio offer AI contract analysis. High value for corporate/commercial practice areas. Kenya's growing private equity and M&A market creates demand for rapid contract review. | Large | Future Phase |

---

## Priority Implementation Roadmap

### Tier 1: Immediate Priority (Compliance & Legal Risk)
These gaps expose the firm to regulatory penalties, malpractice liability, or criminal sanctions:

1. **STR filing** (Section 3, #2) — criminal penalties under POCAMLA s.44
2. **Professional indemnity tracking** (Section 3, #1) — PC cannot be issued without it
3. **Data Protection Act compliance** (Section 3, #5) — KES 5M fines from ODPC
4. **Auto conflict check on intake/case creation** (Section 4, #1 & Section 18, #1) — LSK Code of Conduct mandate
5. **PEP screening** (Section 3, #6) — FATF grey list pressure, LSK AML Guidelines
6. **AML compliance officer designation** (Section 3, #3) — LSK AML Guidelines 2025

### Tier 2: High Priority (Core Functionality Gaps)
These gaps significantly limit daily usability and block adoption:

7. **Email SMTP integration** (Section 11, #3) — blocks password reset, invoice delivery, all email workflows
8. **SMS API integration** (Section 11, #1) — existing SMS infrastructure unused without this
9. **Report export PDF/CSV** (Section 12, #3) — basic functionality all users expect
10. **Active workflow engine** (Section 14, #1) — unlocks all automation; schema is built but idle
11. **Invoice aging report** (Section 6, #5) — critical for financial management
12. **Three-way trust reconciliation UI** (Section 7, #1) — LSK audit requirement; schema exists
13. **Data import tool** (Section 16, #1) — #1 barrier to new firm onboarding
14. **Trust account reporting** (Section 7, #2) — annual LSK submission requirement

### Tier 3: Medium Priority (Competitive Differentiation)
These features differentiate from Kenya and global competitors:

15. **M-Pesa API integration** (Section 6, #1) — #1 Kenya competitive feature
16. **Document automation/merge** (Section 5, #2) — highest productivity gain per effort
17. **Calendar sync (iCal)** (Section 9, #1) — attorney daily convenience
18. **Court rules-based deadline calculator** (Section 9, #2) — unique Kenya advantage, no competitor offers this
19. **Client portal document upload** (Section 17, #1) — enables KYC collection flow
20. **Lead/prospect CRM pipeline** (Section 2, #1) — business development capability
21. **Batch time entry** (Section 8, #1) — attorney productivity at month-end
22. **Firm branding** (Section 16, #3) — professional appearance on all outputs
23. **Full-text document search** (Section 5, #1) — Wakili CRM headline feature
24. **LSK membership fees tracking** (Section 3, #4) — compliance convenience
25. **Cause list tracking** (Section 10, #2) — daily Kenya court workflow

### Tier 4: Lower Priority (Advanced / Future)
These are valuable but require significant investment or depend on Tier 2/3 completions:

26. **Online payment portal** (Section 6, #2) — depends on payment gateway
27. **E-signature** (Section 5, #3) — requires third-party API
28. **WhatsApp integration** (Section 11, #2) — requires Business API approval from Meta
29. **2FA** (Section 13, #1) — security enhancement
30. **KRA e-TIMS** (Section 6, #3) — timeline depends on KRA rollout schedule
31. **Profitability analysis** (Section 12, #1) — requires cost rate data
32. **Court bundle generation** (Section 5, #4) — litigation-specific
33. **E-filing readiness** (Section 10, #1) — Kenya Judiciary API not yet public
34. **Ethical walls** (Section 4, #3) — larger firm need
35. **Data export / backup** (Section 16, #2) — critical for production but not demo
36. **Appointment scheduling** (Section 17, #3) — portal enhancement
37. **Custom intake forms** (Section 18, #2) — intake enhancement
38. **Multi-currency** (Section 1, #2) — international matters only
39. **Case budgeting** (Section 1, #1) — corporate client expectation
40. **Relationship mapping** (Section 2, #3) — conflict check enhancement

### Tier 5: Future Phase (Strategic)
These position the system for long-term competitiveness:

41-49. All items from Section 19 (AI features, PWA, offline, API, webhooks, i18n, dark mode, SSO, AI contract review)
50. **General ledger** (Section 15, #1) — consider accounting software integration instead
51. **Payroll** (Section 15, #3) — consider payroll service integration instead
52. **Custom report builder** (Section 12, #2) — large engineering effort
53. **Scheduled reports** (Section 12, #4) — depends on SMTP + report export
54. **Lateral hire conflicts** (Section 4, #2) — larger firm need
55. **OCR** (Section 5, #5) — document scanning enhancement
56. **Client satisfaction** (Section 2, #2) — service quality measurement
57. **Marketing automation** (Section 2, bonus) — campaign engine
