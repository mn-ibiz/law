# Law Firm Registry — Epics & Stories (Revised)

> **Project:** Law Firm Registry System
> **Tech Stack:** Next.js 14+ (App Router), TypeScript, Neon PostgreSQL 17, Drizzle ORM, NextAuth.js v5, Tailwind CSS + shadcn/ui, Recharts, @tanstack/react-table, react-hook-form + Zod
> **Roles:** Admin, Attorney, Client (Portal)
> **Total:** 20 Epics, 65 Stories + 1 Future Placeholder Epic
> **Source:** [Source: a.md — Law Firm Registry Implementation Plan]

---

## Epic 1: Project Foundation (3 stories)

**Objective:** Fully initialized Next.js project with complete 40+ table database schema, seed data, and Vercel deployment.
**Dependencies:** None — root epic.

### Story 1.1: Project Initialization & Configuration
**As a** developer, **I want** a fully initialized Next.js 14+ project with all dependencies, **so that** the codebase is ready for feature development.
**ACs:** Next.js 14+ with App Router + TypeScript strict mode; Tailwind CSS + shadcn/ui initialized (all core components); Drizzle ORM + @neondatabase/serverless configured; react-hook-form + Zod, Recharts, @tanstack/react-table, Lucide icons installed; .env.local with DATABASE_URL, AUTH_SECRET, NEXTAUTH_URL; ESLint + Prettier; builds with zero errors; deployed to Vercel.

### Story 1.2: Database Schema — All 40+ Tables
**As a** developer, **I want** the complete database schema in Drizzle ORM across all 15 domains, **so that** the entire data model exists from day one.
**ACs:** All tables defined per [Source: a.md#Database]: Auth (users), Attorneys (attorneys, attorney_practice_areas, attorney_licenses, practising_certificates, cpd_records), Clients (clients, client_contacts, conflict_checks, kyc_documents, client_risk_assessments), Cases (cases, case_assignments, case_notes, case_timeline, case_parties, pipeline_stages), Documents (documents, document_versions, document_templates), Calendar (calendar_events, event_attendees, deadlines, tasks, bring_ups), Time/Expense (time_entries, expenses, requisitions), Billing (invoices, invoice_line_items, payments, trust_accounts, trust_transactions, quotes, receipts, credit_notes), Financial (petty_cash_transactions, bank_accounts, bank_transactions, bank_reconciliations), Courts (courts, court_stations, court_filings, service_of_documents), Suppliers (suppliers, supplier_invoices), Messaging (messages, notifications, sms_log), Branches (branches, branch_users), Workflows (workflow_templates, workflow_rules, workflow_execution_log), Settings (firm_settings, practice_areas, billing_rates, email_templates, sms_templates, audit_log, custom_fields, tags). All pgEnums defined. All FKs with onDelete. Indexes on status/email/number fields. Migration runs on Neon.

### Story 1.3: Seed Data — Kenya Courts, Practice Areas & Sample Data
**As a** developer, **I want** seed data for Kenya reference tables and sample data, **so that** the app is immediately usable for dev/demo.
**ACs:** Kenya court hierarchy seeded (Supreme, Appeal, High, ELC, ELRC, Magistrate, Kadhi's, Tribunals); Court stations for all 47 counties; 15 practice areas; Sample users (1 Admin, 3 Attorneys, 2 Clients); Sample cases, attorneys with LSK numbers, practising certs, CPD records; bcrypt-hashed passwords; idempotent seed script via `npm run seed`.

---

## Epic 2: Authentication & Authorization (3 stories)

**Objective:** Secure auth with login, registration, RBAC, and session management.
**Dependencies:** Epic 1.

### Story 2.1: Authentication System — NextAuth.js v5
**As a** user, **I want** to securely log in, register, and manage my session, **so that** I can access the system with appropriate permissions.
**ACs:** NextAuth.js v5 with Credentials provider + JWT strategy; Login page (email, password, remember me); Client registration (admin approves); Forgot password flow (placeholder email); Password: min 8 chars, uppercase+lowercase+number; bcryptjs hashing; JWT enriched with user id, role, email, name; Session timeout with auto-logout; Redirect: Admin/Attorney→/dashboard, Client→/portal; react-hook-form + Zod validation; Error toast on invalid credentials.

### Story 2.2: RBAC Middleware & Route Protection
**As an** admin, **I want** role-based access control at every route and action, **so that** users only access features for their role.
**ACs:** Middleware protecting all routes except auth pages; Role-based route groups: /(dashboard)/* for Admin+Attorney, /(portal)/* for Client; Admin-only routes: /settings/users, /settings/audit-log; checkPermission(session, resource, action) utility; Full RBAC matrix per [Source: a.md#RBAC Permissions Matrix]; 403 error page for unauthorized; auth() and useSession() available in all contexts.

### Story 2.3: Dashboard Shell & Navigation Layout
**As a** user, **I want** a professional layout with sidebar, header, and responsive nav, **so that** I can navigate efficiently.
**ACs:** Dashboard layout with collapsible sidebar; Nav groups: Main, Management, Work, Finance, Communication, Analytics, System; Each nav item: Lucide icon, label, active state, badge count; Header: firm logo, search trigger (Cmd+K), notification bell, user avatar dropdown; Mobile: hamburger menu with Sheet; Portal layout with simplified nav; Breadcrumbs; Sidebar state in localStorage; Branch selector for admins; Loading skeletons.

---

## Epic 3: Dashboards & Global Search (3 stories)

**Objective:** Role-specific dashboards with KPIs, charts, and global search.
**Dependencies:** Epic 2.

### Story 3.1: Role-Based Dashboards with KPI Stat Cards
**As an** Admin/Attorney/Client, **I want** role-specific dashboards with key metrics, **so that** I can understand my workload at a glance.
**ACs:** Admin cards: active cases, total clients, revenue this month (KES), outstanding invoices, active attorneys, overdue deadlines; Attorney cards: my active cases, hours this week, billable hours this month, upcoming deadlines, unread messages; Client cards: open cases, pending documents, outstanding balance; shadcn Card with icon+label+value; KES formatting with commas; Responsive grid (3/2/1 columns); Loading skeletons.

### Story 3.2: Dashboard Charts & Data Widgets
**As an** Admin/Attorney, **I want** charts and data tables on my dashboard, **so that** I can identify trends and issues.
**ACs:** Admin: Revenue line chart (12 months), Case status donut chart, Recent cases table (10), Upcoming deadlines list (10), Overdue invoices table; Attorney: My cases table, My deadlines list (7), Recent time entries (5), My tasks list; Recharts responsive charts; Empty states; Click-to-navigate to detail pages.

### Story 3.3: Global Search Command Palette
**As a** user, **I want** Cmd+K search to find any entity instantly, **so that** I navigate efficiently.
**ACs:** shadcn Command component triggered by Cmd+K/Ctrl+K; Search across: cases, clients, attorneys, documents, invoices; Results grouped by entity type with icons; Click→navigate to detail; Recent searches in localStorage; Keyboard navigation; Search button in header.

---

## Epic 4: Attorney Management (3 stories)

**Objective:** Attorney profiles with Kenya Bar compliance, CPD tracking, and performance metrics.
**Dependencies:** Epic 2.

### Story 4.1: Attorney CRUD & Professional Profile
**As an** Admin, **I want** to manage attorney profiles with professional details, **so that** qualifications and billing rates are tracked.
**ACs:** Attorney list with DataTable (search, filter by status/department/title/practice area, pagination); Add attorney form: user link, bar number, jurisdiction, license status, title (Partner/Senior Associate/Associate/Of Counsel/Paralegal), department, hourly rate (KES), date admitted, bio, LSK number, Commissioner for Oaths, Notary Public, Senior Counsel; Detail page with tabs: Profile, Licenses, Practice Areas, Cases, Time & Billing; Additional license form; Edit profile; Deactivate (soft delete); Audit log on mutations.

### Story 4.2: Practising Certificates & CPD Tracking
**As an** Admin, **I want** to track practising certificates and CPD compliance, **so that** the firm meets Kenya Advocates Act and LSK requirements.
**ACs:** Certificate section: number, year, issue/expiry date, status (Valid/Expired/Pending Renewal), upload copy, history table; Auto-renewal reminders at 60/30/7 days before Dec 31; CPD tracking: 5 units/year required, 2 from LSK programs; CPD events log with provider, units, certificate upload; Progress bar; Compliance dashboard widget: expiring certificates, non-compliant CPD.

### Story 4.3: Attorney Performance Metrics & Disciplinary Tracking
**As an** Admin, **I want** performance metrics and disciplinary proceeding tracking per attorney, **so that** I can evaluate performance and track regulatory issues.
**ACs:** Performance tab on attorney detail: cases won/settled, average case duration, billing efficiency, utilization rate; Revenue generated per attorney; Cases by status breakdown; **Disciplinary Tribunal tracking:** log any proceedings before the Advocates Disciplinary Tribunal (date, case reference, status: pending/resolved/dismissed, outcome, notes); Alert on active disciplinary proceedings; Performance insights for firm-wide comparison.

---

## Epic 5: Client Management & KYC (4 stories)

**Objective:** Client intake with Kenya ID/KRA fields, KYC/AML compliance, conflict checking, and online intake forms.
**Dependencies:** Epic 2.

### Story 5.1: Client Intake & CRM with Kenya-Specific Fields
**As an** Admin/Attorney, **I want** to register and manage clients with Kenya-specific fields, **so that** proper records are maintained.
**ACs:** Client list with DataTable (search, filter by status/type/risk/referral); Multi-step intake: Individual (name, email, phone +254 validated, DOB, national ID encrypted, passport encrypted, KRA PIN, county from 47, P.O. Box, physical address, next of kin, employer details) and Organization (company name, contact, KRA PIN, address, industry); Portal account creation option; Detail page with tabs: Profile, Cases, Documents, Contact History, Billing, KYC, Conflicts; Contact log entries; Deactivate (soft delete); Audit log.

### Story 5.2: KYC/AML Document Collection & Verification
**As an** Admin/Attorney, **I want** KYC document collection and verification per LSK AML/CFT Guidelines 2025, **so that** the firm complies with POCAMLA.
**ACs:** KYC tab on client detail with status badge (Pending/Verified/Expired/Rejected); Document checklist: Individual (National ID/Passport, KRA PIN, proof of address, photo), Organization (Certificate of Incorporation, CR12, KRA PIN, directors' IDs, beneficial ownership); Upload with validation; Verification workflow: Pending→Verified/Rejected; Expiry tracking with 30-day warnings; Risk assessment (Low/Medium/High), PEP flag; **Suspicious transaction flagging** on both clients AND individual transactions with reporting workflow; Enhanced Due Diligence for high-risk clients; AML compliance summary widget on admin dashboard.

### Story 5.3: Conflict of Interest Checker
**As an** Admin/Attorney, **I want** conflict checks before taking clients/cases, **so that** ethical violations are avoided.
**ACs:** Accessible from: client intake, client detail, case creation, standalone page; Search across: client names, opposing parties, opposing counsel, case parties, companies; Results: entity, match type, case reference, severity; Actions: Clear, Potential Conflict (partner review), Conflict Found (block); Resolution form with notes; Conflict history log; Fuzzy matching (ILIKE, pg_trgm); Audit log.

### Story 5.4: Online Client Intake Form & Custom Form Builder
**As an** Admin, **I want** shareable intake forms and a form builder for different practice areas, **so that** clients can self-register 24/7.
**ACs:** Public page at /intake (no auth); Shareable URL; Form fields: name, email, phone (+254), case type, description, referral source; Data Protection Act 2019 consent checkbox (required); Terms of engagement checkbox; File upload (max 3 files, 10MB each); CAPTCHA/rate limiting; Auto-creates client record (pending), triggers conflict check, notifies attorney; **Custom form builder** (Admin): drag-and-drop field configuration per practice area; **Pre-built templates:** Personal Injury, Conveyancing, Corporate, Family, Criminal, Employment; Form template selection on intake page.

---

## Epic 6: Case Management (4 stories)

**Objective:** Full case lifecycle with status workflow, assignments, timeline, and kanban pipeline.
**Dependencies:** Epic 5 (Clients), Epic 4 (Attorneys).

### Story 6.1: Case CRUD with Status Workflow
**As an** Admin/Attorney, **I want** to create and manage cases with defined status transitions, **so that** cases progress systematically.
**ACs:** Case list with DataTable (search, filter by status/type/practice area/attorney/priority/billing type/branch, pagination); New case form: title, client (searchable), case type, practice area, lead attorney, additional attorneys, billing type (Hourly/Flat Fee/Contingency/Retainer/Pro Bono) with conditional fields, court, opposing counsel/party, SoL date, priority, estimated value, branch; Auto-generated case number YYYY-NNNN; Status transitions enforced: Open→In Progress→Hearing↔In Progress→Resolved→Closed→Archived; Status change creates timeline event; Conflict check on client selection; **Case cloning:** duplicate button creates new case with same settings, new number, blank timeline/notes.

### Story 6.2: Case Detail Page with Tabbed Layout
**As an** Admin/Attorney, **I want** a comprehensive case detail page, **so that** all case aspects are accessible in one place.
**ACs:** Header: case number, title, status badge (with transition buttons), priority badge, client link, lead attorney link; Tabs: Overview (details, attorneys, court info, key dates, SoL countdown with color-coded warnings: green >90d, yellow 60-90, orange 30-60, red <30, flashing <7), Timeline, Documents (linked, upload, filter), Billing (unbilled time/expenses, invoices, "Create Invoice" button), Notes (add, private/shared toggle), Tasks, Parties (client, opposing, witnesses, experts).

### Story 6.3: Case Assignments, Notes & Auto-Generated Timeline
**As an** Admin/Attorney, **I want** attorney assignments with roles and automatic activity tracking, **so that** responsibilities are clear and all activity is logged.
**ACs:** Assign attorneys with role (Lead/Assigned/Supervising/Of Counsel); Only one Lead; Assignment creates timeline event + notification; Auto-timeline events: case created, status changed, attorney assigned/unassigned, document uploaded, invoice created, payment received, deadline added/completed, court date scheduled; Manual timeline entry form; Case notes: private (attorney-only) vs shared (client portal visible); Edit/delete own notes; createTimelineEvent() utility function.

### Story 6.4: Matter Pipeline / Kanban Board & Analytics
**As an** Admin/Attorney, **I want** a visual kanban board for case progression with analytics, **so that** I can see bottlenecks and optimize workflow.
**ACs:** Toggle between Table and Kanban view on cases page; Configurable pipeline stages per practice area: Conveyancing (Instruction→Due Diligence→Drafting→Signing→Registration→Completion), Litigation (Intake→Pre-litigation→Filing→Discovery→Trial→Settlement→Enforcement), Corporate (Instruction→Research→Drafting→Review→Execution→Filing→Completion); Drag-and-drop between stages; Cards show: case number, title, client, attorney avatar, priority, days in stage; **Pipeline analytics:** stage duration tracking, bottleneck identification (cases stuck >X days highlighted), conversion rates per stage, average duration per stage chart; **Automated actions on stage change** (trigger workflow rules).

---

## Epic 7: Kenya Courts & Bring-Ups (3 stories)

**Objective:** Kenya court hierarchy integration, court filing tracking, and the file bring-up system (most-used feature in Kenyan law firms).
**Dependencies:** Epic 6.

### Story 7.1: Kenya Court Hierarchy & Court Station Selection
**As an** Admin/Attorney, **I want** to select from the Kenya court hierarchy, **so that** cases are linked to correct courts.
**ACs:** Cascading dropdowns: Court type (Supreme, Appeal, High, ELC, ELRC, Magistrate, Kadhi's, Tribunal) → Court station (filtered by county); Court registry/division selection; Pre-populated 47-county court stations; Court file number (separate from firm case number); Virtual court link field; Judge assignment tracking with history; Cause list tracking; Court management page (Admin) for adding/editing stations.

### Story 7.2: Court Filing Tracking & Service of Documents
**As an** Attorney, **I want** to track filings and service of documents, **so that** court interactions are documented.
**ACs:** Court filings section on case detail: document, filing date, status (Filed→Accepted/Rejected→Served), court fee (KES); Filing checklist per case type; Service of documents log: served to, served by, method (Personal/Substituted/Email/Registered Post/Process Server/Affidavit of Service), date, proof upload; Document bundle preparation: select, order, generate index; Court fee tracking summary per case.

### Story 7.3: File Bring-Up System
**As an** Attorney/Admin, **I want** bring-up reminders to revisit files on specific dates, **so that** follow-ups are never missed.
**ACs:** Create from case detail, bring-ups page, or case list quick action; Form: case (required), date, assigned to, reason/notes, priority, recurring (Daily/Weekly/Monthly), notification method (Email/SMS/In-App); Status workflow: Pending→Reviewed→Deferred (new date)→Completed; Bring-ups list page with tabs: Today's, Upcoming, Overdue, All; Filter by attorney/priority/status/date; Overdue highlighted red; Bulk actions; Dashboard widget "Today's Bring-Ups" with count badge; Recurring: auto-create next on completion; Notifications per configured method.

---

## Epic 8: Calendar & Scheduling (3 stories)

**Objective:** Calendar views with court calendar, deadline tracking with SoL warnings, and task management.
**Dependencies:** Epic 6.

### Story 8.1: Calendar Views with Court Calendar
**As an** Admin/Attorney, **I want** calendar views with a separate court calendar, **so that** I see my schedule and never miss court dates.
**ACs:** Month/Week/Day views; **Separate Court Calendar toggle** (court events only); Color coding: Court=Red, Meeting=Blue, Deadline=Orange, Deposition=Purple, Other=Gray; Click date to create event; Event popup: title, type, time, case link, attendees; Filter by attorney, case, event type, branch; Mini calendar for navigation; Attorney sees own + assigned case events; Admin sees all with filter.

### Story 8.2: Calendar Events CRUD & Deadline Tracker
**As an** Admin/Attorney, **I want** to manage events and track deadlines with SoL warnings, **so that** critical dates are captured.
**ACs:** Event form: title, type (Court Date/Hearing/Mention/Ruling/Judgment/Deposition/Meeting/Deadline/Filing/SoL/Conference/Other), case, start/end datetime or All Day, location/virtual link, description, attendees (multi-select), recurring (RRULE), reminder (None/15min/30min/1hr/1day/1week), is_court_date auto-set; Drag-and-drop rescheduling; Deadline tracker page with table (filter by priority/attorney/case/status/date); Deadline form: title, case (required), due date, priority, assigned to; **SoL warnings:** 90d info, 60d warning, 30d urgent+dashboard highlight, 7d critical+email, overdue red banner on case; **Court Rules Engine:** auto-calculate deadlines from court dates (e.g., file response within 14 days of hearing).

### Story 8.3: Task Management
**As an** Admin/Attorney, **I want** to create, assign, and track tasks, **so that** work items are organized.
**ACs:** Tasks page with List view (DataTable) and Board view (Kanban: Pending/In Progress/Completed/Cancelled); Task form: title, description, case (optional), status, priority, due date, assigned to; Drag-and-drop between kanban columns; Filter by user/case/priority/status/due date; "My Tasks" quick filter; Overdue highlighting; Tasks on case detail page; Task completion creates case timeline event; Notification on assignment.

---

## Epic 9: Document Management (3 stories)

**Objective:** File management with versioning, templates, and eSignature capability.
**Dependencies:** Epic 6.

### Story 9.1: Document Upload & Management
**As an** Admin/Attorney, **I want** to upload, organize, and manage documents, **so that** legal documents are centrally stored.
**ACs:** Documents page with DataTable (search, filter by category/status/case/client/date); Drag-and-drop + file picker (single and batch up to 10); Title (auto from filename), description, category (Pleading/Correspondence/Contract/Evidence/Court Order/Internal Memo/Template/KYC/Other), case, client, status (Draft/Review/Approved/Final/Archived), "Share with client" checkbox; File types: PDF, DOCX, XLSX, JPG, PNG, TXT, CSV; 25MB limit; Upload progress; **Storage abstraction:** Vercel Blob (demo) / Local filesystem (prod) configurable via env; Document detail: preview (PDF/image), metadata, download; Delete (admin only); Edit metadata; Audit log.

### Story 9.2: Document Versioning & Templates
**As an** Attorney, **I want** version control and reusable templates, **so that** revisions are tracked and documents generated quickly.
**ACs:** Upload new version button; Version history table (number, uploader, date, notes, download); Download any version; Template management page; Create template: name, description, category, file upload; Placeholders: {{client_name}}, {{client_address}}, {{case_number}}, {{case_title}}, {{attorney_name}}, {{firm_name}}, {{firm_address}}, {{date}}, {{court_name}}, {{judge_name}}; "Use Template" action: select template→select case/client→replace placeholders→download; Document status workflow: Draft→Review→Approved→Final→Archived.

### Story 9.3: eSignature Integration
**As an** Attorney, **I want** electronic signatures on documents, **so that** agreements can be executed digitally.
**ACs:** eSignature request on document detail page; Signature fields placement on document; Send for signature to client (email link) or internal (attorney); Signature status tracking: Pending→Viewed→Signed→Declined; Multi-signer support (sequential or parallel); Signed document stored as new version with signature certificate; Audit trail of signature events (sent, viewed, signed, IP, timestamp); Integration abstraction layer (for future providers like DocuSign, SignNow, or custom implementation); Basic implementation: draw/type signature capture + embed in PDF.

---

## Epic 10: Time & Expense Tracking (3 stories)

**Objective:** Billable hours tracking with live timer, expense logging, and requisition approval workflow.
**Dependencies:** Epic 6.

### Story 10.1: Time Entry CRUD & Live Timer Widget
**As an** Attorney, **I want** to log time manually and with a live timer, **so that** billable work is accurately captured.
**ACs:** Time tracking page with DataTable (filter by date/attorney/case/type/invoiced); Manual entry form: case (required), date, duration (HH:MM or decimal), description (required), billable/non-billable radio, hourly rate (auto from attorney/case), total auto-calculated; **Live Timer Widget:** floating bottom-right, always visible; Expand: timer display, case dropdown, description; Controls: Start/Pause/Resume/Stop/Discard; HH:MM:SS display; Color: Green=running, Yellow=paused, Gray=stopped; State in localStorage (persists refresh); On Stop→auto-create time entry; Rounding: nearest 6 min (0.1 hour); Edit/delete own entries (not invoiced); Bulk entry form.

### Story 10.2: Weekly Timesheet & Expense Logging
**As an** Attorney, **I want** a weekly timesheet and expense logging with receipts, **so that** hours and costs are tracked for billing.
**ACs:** Weekly timesheet: grid (rows=cases, columns=Mon-Sun), cell click to add/edit, week navigation, row/column/grand totals, billable vs non-billable breakdown; Expense list with DataTable (filter by date/case/category/attorney/billable); Expense form: case (required), date, category (Filing Fee/Court Cost/Travel/Copy/Postage/Expert Witness/Process Server/Commissioner for Oaths Fee/Search Fee/Stamp Duty/Other), description, amount (KES), vendor, receipt upload, billable checkbox; Edit/delete own; Expenses marked "Invoiced" when included in fee note.

### Story 10.3: Requisition System, Purchase Orders & Supplier Management
**As an** Attorney/Admin, **I want** to submit requisitions for approval and manage suppliers, **so that** spending is controlled.
**ACs:** Requisition list (filter by status/requester/case/date); Requisition form: case, description, amount (KES), supplier (searchable or new), urgency, supporting docs; Approval workflow: Pending→Approved→Paid/Rejected; Notifications on submit/approve/reject; **Purchase order generation** from approved requisition (PO number, items, supplier, authorized by); Supplier management: CRUD with name, contact, phone, email, KRA PIN, bank details, category; Supplier invoice tracking: number, date, amount, due date, status (Pending/Paid).

---

## Epic 11: Billing & Fee Notes (4 stories)

**Objective:** Kenya-enhanced billing with quotes, fee notes, VAT, PDF generation, approval workflow, and credit notes.
**Dependencies:** Epic 10.

### Story 11.1: Quotes & Fee Note Generation
**As an** Admin/Attorney, **I want** to create quotes and fee notes with auto-populated items, **so that** billing follows the Kenya Quote→Fee Note→Receipt workflow.
**ACs:** Quotes page: list, create (client, case, itemized lines, subtotal, tax, total, validity, notes), status (Draft/Sent/Accepted/Rejected/Converted), PDF, "Convert to Fee Note" button; Fee Notes page: list with number (FN-YYYY-NNNN), client, case, date, due date, amount, status, amount paid; New fee note form: client, case, date, due date (default +30), billing type auto-filled; **"Pull Unbilled Items" button** auto-populates from time entries + expenses; Line items: description, qty, unit price, total, linked source; Kenya line item types: Professional Fees, Disbursements, Instruction Fees, Filing Fees, Commissioner for Oaths Fees, Search Fees, Stamp Duty; Status workflow: Draft→Sent→Paid/Partial/Overdue→Void; Time entries/expenses marked "Invoiced."

### Story 11.2: Kenya VAT Handling & Fee Note PDF
**As an** Admin/Attorney, **I want** correct Kenya VAT and professional PDFs, **so that** billing complies with KRA.
**ACs:** VAT at 16% standard rate; Per-line item tax: Standard (16%), Exempt, Zero-rated; Professional fees: VAT-applicable; Disbursements: may be exempt; Separate subtotals: taxable, exempt, VAT; Firm KRA PIN on fee note; **Fee Note PDF:** firm logo+name+address+KRA PIN, number/date/due date, client+address+KRA PIN, case reference, line items table, subtotal/VAT/total, paid/balance due, payment terms, bank details, M-Pesa Paybill/Till number, notes, footer; PDF actions: download, preview, email (placeholder); Receipt PDF: RC-YYYY-NNNN; KES formatting throughout.

### Story 11.3: Fee Note Approval Workflow & Credit Notes
**As a** Partner/Admin, **I want** fee notes to go through approval, **so that** billing accuracy is ensured.
**ACs:** Approval workflow: Draft→Pending Approval→Approved (→Sent) / Rejected (→Draft with notes); Approve/Reject buttons for partners/admins; Rejection requires notes; Notifications on approve/reject; **Credit Notes:** linked to original fee note, CN-YYYY-NNNN, reason (Billing Error/Discount/Partial Write-off/Full Write-off/Other), amount, reduces outstanding; Credit note PDF; **Invoice aging report:** Current/30/60/90+ days, outstanding by client, collection rate, avg days to payment, write-off summary.

### Story 11.4: Payment Recording & M-Pesa Integration
**As an** Admin/Attorney, **I want** to record payments including M-Pesa, **so that** revenue is tracked and reconcilable.
**ACs:** Record payment from fee note: amount (KES, default balance), date, method (M-Pesa/Bank Transfer-RTGS-EFT/Cheque/Cash/Pesalink/Credit Card/Trust Account Drawdown), reference; **M-Pesa fields** (when selected): transaction code (required, ~10 char alphanumeric), phone (+254); Partial payments with running balance; Status auto-update: Partial/Paid; Payment list page; M-Pesa config in firm settings: Paybill/Till number (displayed on PDFs); Receipt auto-generation: RC-YYYY-NNNN; Payment reversal (admin only) with reason; Trust drawdown: deducts from client trust balance.

---

## Epic 12: Trust Accounts & Financial Operations (3 stories)

**Objective:** Trust/client account management with compliance safeguards, petty cash, and bank reconciliation.
**Dependencies:** Epic 11.

### Story 12.1: Trust / Client Account Management
**As an** Admin, **I want** trust accounts with per-client tracking and safeguards, **so that** client funds are properly separated per the Advocates Act.
**ACs:** Trust accounts page: list (name, bank, number, type: IOLTA/Client Trust/Operating, balance); Create account form; Detail page: account info, **per-client balance table**, transaction ledger (date, client, case, type: Deposit/Withdrawal/Transfer/Interest/Fee, amount, running balance, description, reference); Trust transaction form: account, client (required), case, type, amount, description, reference, date, related fee note; **Compliance safeguards (CRITICAL):** cannot withdraw more than client balance (server-side hard block), per-client sub-ledger, running balance auto-calculated, cannot mix client funds; **Three-way reconciliation:** bank balance (manual entry), book balance, client balances sum, discrepancy highlighting.

### Story 12.2: Petty Cash Management
**As an** Admin, **I want** to manage petty cash with approval workflow, **so that** cash expenses are tracked.
**ACs:** Petty cash page per branch; Float configuration per branch; Transaction list: date, description, amount (in/out), balance, receipt, recorded by; Add transaction: type (Replenishment/Expense), amount, description, receipt upload, category; Request and approval workflow: request→admin approves→disbursed; Running balance (float - expenses + replenishments); Reconciliation: compare physical count to system; Monthly report.

### Story 12.3: Bank Reconciliation
**As an** Admin, **I want** to reconcile bank transactions, **so that** finances are accurate.
**ACs:** Select bank account; Record bank transactions: manual entry or CSV import (date, description, reference, debit, credit, balance); Match bank transactions to system transactions (payments, trust deposits, expenses); Auto-match by reference+amount; Manual match for unmatched; Unmatched items highlighted; Reconciliation statement: bank balance, system balance, matched, unmatched, adjustments; Save record with date and reconciled_by; Bank accounts management: add account (name, bank, number, type: Client Account/Office Account/Petty Cash).

---

## Epic 13: Client Portal (3 stories)

**Objective:** Client-facing portal with case visibility, document access, and invoice viewing.
**Dependencies:** Epic 11, Epic 9, Epic 6.

### Story 13.1: Client Portal Layout & Dashboard
**As a** Client, **I want** a dedicated portal with overview dashboard, **so that** I can access my information easily.
**ACs:** Portal layout at /(portal) with simplified sidebar: Dashboard, My Cases, My Documents, My Invoices, Messages, My Profile; Header: firm logo, client name, notification bell, logout; Professional design distinct from internal dashboard; Portal dashboard: stat cards (open cases, pending docs, outstanding balance), case list, recent documents (5), outstanding invoices, recent messages (3); Route protection: client-only; Role-based redirects.

### Story 13.2: Portal Case & Document Access
**As a** Client, **I want** to view my cases and download shared documents, **so that** I stay informed.
**ACs:** My Cases page: case list with number, title, status, type, attorney, last update; Case detail (read-only): overview, status, court info, attorney contact, key dates, shared notes only (NO private notes), documents tab (shared only); My Documents page: documents shared across all cases, download, preview (PDF/image); No upload capability from portal; Server-side enforcement: client can only see own cases/documents.

### Story 13.3: Portal Invoice Viewing & Profile
**As a** Client, **I want** to view invoices and manage my profile, **so that** I track finances and keep info updated.
**ACs:** My Invoices page: fee notes list (number, date, due date, amount, status, balance); Filter by status/date; Invoice detail: header, line items, subtotal/VAT/total, payment history, balance due, download PDF, payment instructions (bank details, M-Pesa); No edit capability; Overdue highlighted; **Profile management:** update contact info, change password, view KYC status (read-only).

---

## Epic 14: Messaging & Communication (3 stories)

**Objective:** Internal and client messaging with threads and notification system.
**Dependencies:** Epic 13, Epic 6.

### Story 14.1: Secure Messaging System
**As a** user, **I want** to send and receive messages, **so that** communication is tracked and auditable.
**ACs:** Messages page (dashboard): Inbox/Sent toggle, message list (sender/recipient, subject, case, date, read/unread), search; Messages page (portal): filtered to client's messages, client can only message assigned attorneys; New message form: recipient (searchable, role-filtered), subject, case (optional), body, attach document; **Message threads:** reply creates thread (parent_message_id), thread view chronological, reply form at bottom; Message detail: content, sender, recipient, date, case, attachments, reply button, mark read/unread; Internal attorney-to-attorney messaging; Case-linked messages visible on case detail.

### Story 14.2: In-App Notification System
**As a** user, **I want** in-app notifications for important events, **so that** I never miss critical information.
**ACs:** Notification bell in header with unread count badge (red circle); Click→dropdown (last 20); Each: icon, title, preview, time ago, read/unread dot; Click→navigate to related entity; "Mark all as read" button; Full notifications page with filters (type/read/date); Notification types: deadline reminder, case status change, new message, invoice status, document shared, bring-up due, task assigned, requisition approved/rejected, workflow triggered; Notifications created as side effects in server actions.

### Story 14.3: SMS & WhatsApp Integration
**As an** Admin, **I want** SMS and WhatsApp notifications for key events, **so that** alerts reach users through multiple channels.
**ACs:** **SMS (Africa's Talking API):** send for court dates, bring-ups, appointments, invoice sent, payment confirmation, deadline alerts; +254 format; SMS template management page; Placeholders: {{client_name}}, {{case_number}}, {{date}}, {{amount}}; Delivery status tracking (sent/delivered/failed) in sms_log; Cost tracking per message; **WhatsApp (future-ready abstraction):** WhatsApp number field on client record; Send case updates via WhatsApp Business API (placeholder/abstraction layer); Receive documents via WhatsApp (placeholder); Per-client WhatsApp preference; **Provider abstraction:** src/lib/notifications/sms.ts and whatsapp.ts.

---

## Epic 15: Email Integration & Templates (2 stories)

**Objective:** Email notifications and template management for automated communications.
**Dependencies:** Epic 14.

### Story 15.1: Email Notification System
**As an** Admin/Attorney, **I want** email notifications for key events, **so that** important information is delivered by email.
**ACs:** Email sending via provider (Resend/SendGrid/nodemailer, configurable); Send email for: fee notes/invoices, deadline reminders, welcome emails, case updates, practising cert expiry; Track delivery status (sent/delivered/failed); Attach documents (e.g., invoice PDF); Provider abstraction: src/lib/notifications/email.ts with sendEmail(to, subject, body, attachments); Queue/retry logic for failed sends.

### Story 15.2: Email & SMS Template Management
**As an** Admin, **I want** to manage email and SMS templates, **so that** automated communications are customizable.
**ACs:** Email templates page: CRUD templates with name, subject, body (rich text), type (Invoice/Deadline Reminder/Welcome/Case Update/Payment Confirmation); Placeholders: {{client_name}}, {{case_number}}, {{attorney_name}}, {{amount}}, {{date}}, {{firm_name}}, {{portal_link}}; Preview with sample data; SMS templates page: CRUD with name, body (160 char limit indicator), type; Default templates seeded for common scenarios; Templates selectable in notification sending workflows.

---

## Epic 16: Automated Workflows (2 stories)

**Objective:** Rule-based automation engine with pre-built templates and court rules engine.
**Dependencies:** Epic 8, Epic 14.

### Story 16.1: Workflow Engine & Rule Builder
**As an** Admin, **I want** automated workflow rules, **so that** routine follow-ups happen automatically.
**ACs:** Workflow management page (Admin): list of rules (name, trigger, action, active/inactive, last triggered); Create/edit/delete; Enable/disable toggle; Rule form: name, trigger type (Case Status Change/Deadline Approaching/Document Uploaded/Payment Received/New Client/Bring-Up Due/Certificate Expiring/Invoice Overdue/Pipeline Stage Change), trigger condition, action type (Send Notification/Create Task/Send Email/Send SMS/Update Field/Create Calendar Event), action config; Execution: rules evaluated in server actions when trigger events occur; Execution log: table showing rule, trigger, action, timestamp, success/failure.

### Story 16.2: Pre-Built Templates & Court Rules Engine
**As an** Admin, **I want** pre-built workflow templates and auto-deadline calculation from court dates, **so that** common scenarios are automated out of the box.
**ACs:** Pre-built templates (seeded): New case→create welcome tasks→notify admin; Court date in 7 days→notify attorney→create prep task; Invoice overdue 30 days→send reminder→notify admin; Certificate expiring 30 days→alert attorney+admin; Bring-up due→send notification; New intake submitted→notify attorney→trigger conflict check; **Court Rules Engine:** auto-calculate deadlines from court dates (e.g., "File response within 14 days of mention," "Submit documents 3 days before hearing"); Court rule templates per court type; Auto-create deadline events when court date is scheduled.

---

## Epic 17: Reports & Analytics (4 stories)

**Objective:** Comprehensive reporting suite with charts, filters, and export.
**Dependencies:** All previous data epics.

### Story 17.1: Caseload & Revenue Reports
**As an** Admin, **I want** caseload and revenue reports, **so that** I can analyze firm performance.
**ACs:** Reports page with report type selection; Caseload: cases by status (bar chart), by practice area (pie), by attorney (table), opened vs closed by month (line), average case duration; Revenue: by month (line), by attorney (bar), by practice area (pie), by billing type (table), year-over-year comparison; Filters: date range (presets: This Month/Quarter/Year/Last Year/Custom), attorney, practice area, branch; KES formatting; CSV export button on every report.

### Story 17.2: Billing & Productivity Reports
**As an** Admin, **I want** billing aging and productivity reports, **so that** I manage cash flow and attorney utilization.
**ACs:** Billing & AR: aging summary (Current/30/60/90+), outstanding by client, collection rate (%), avg days to payment, write-off summary; Productivity: hours by attorney (bar), billable vs non-billable ratio (stacked bar), utilization rate (billable hours / available hours per attorney), hours by practice area, hours by case; Filters: date range, attorney, case, client; CSV export; Print-friendly CSS.

### Story 17.3: Trust Account & Financial Reports
**As an** Admin, **I want** trust and financial reports, **so that** compliance and finances are monitored.
**ACs:** Trust: balance by client (table), transaction history (filterable ledger), three-way reconciliation summary; Petty cash: transactions per branch, reconciliation status; Bank reconciliation: matched vs unmatched summary; Branch-specific financial reports; Consolidated firm-wide totals; CSV export.

### Story 17.4: Compliance Reports (AML, CPD, Certificates)
**As an** Admin, **I want** compliance reports for regulatory submission, **so that** the firm demonstrates adherence to Kenya legal requirements.
**ACs:** AML Report: clients by risk level, incomplete KYC, expired KYC docs, suspicious activity flags, PEP clients, high-risk without EDD; CPD Report: attorney CPD status table (units earned vs required 5, LSK program units vs minimum 2, compliance badge), non-compliant highlighted, year filter; Practising Certificate Report: status per attorney (Valid/Expired/Pending), expiring within 60 days; **Branch-specific reports** (revenue/caseload/productivity per branch); PDF export for compliance reports (for LSK/auditor submission); CSV export.

---

## Epic 18: Settings & Configuration (3 stories)

**Objective:** Firm-wide settings, user management, and reference data management.
**Dependencies:** Epic 2.

### Story 18.1: Firm Settings & Branding
**As an** Admin, **I want** to configure firm-wide settings, **so that** the system reflects our firm's identity and defaults.
**ACs:** Firm settings page: name, address (physical+postal), phone, email, website; Logo upload (used on PDFs, portal, login); KRA PIN; Default tax rate (16%); Default billing increment (6/15/30 min); Default payment terms (text); Fiscal year start month; Date format (DD/MM/YYYY); Currency: KES default; Default county; M-Pesa Paybill/Till number; Bank details (name, account name, number, branch, Swift) for fee note PDFs; Settings stored as key-value pairs in firm_settings.

### Story 18.2: User Management
**As an** Admin, **I want** to manage user accounts, **so that** staff access is controlled.
**ACs:** User list: name, email, role badge, status (active/inactive), last login; Create user: name, email, password, role (Admin/Attorney/Client), phone, branch; Edit: change role, reset password, update details; Activate/deactivate (soft delete); Cannot deactivate self; Cannot change own role; Deactivation preserves audit trail.

### Story 18.3: Practice Areas, Billing Rates & Reference Data
**As an** Admin, **I want** to manage practice areas and billing rates, **so that** firm operations are configurable.
**ACs:** Practice area CRUD: name, description, active/inactive; Billing rate management: default firm-wide rate, attorney-specific overrides, practice area-specific rates, rate effective dates (historical tracking); Court station management: add/edit/deactivate (supplements seeded data).

---

## Epic 19: Multi-Branch & Customization (4 stories)

**Objective:** Multi-branch office management, custom fields, tags, and audit log.
**Dependencies:** Epic 18.

### Story 19.1: Multi-Branch Office Management
**As an** Admin, **I want** to manage multiple branches, **so that** the firm operates across locations.
**ACs:** Branch management page: list (name, address, phone, email, is_main, user count, case count); Add/edit branch form; Branch assignments: users to primary branch, cases to branch, petty cash float, bank accounts per branch; Branch-aware data: admin has branch selector in header, attorney sees own branch default, partners cross-branch visibility; Branch-specific settings (bank accounts, petty cash float, default county); Inter-branch file transfer log (case, from, to, reason, date); Consolidated firm-wide reports aggregate all branches.

### Story 19.2: Custom Fields on All Entities
**As an** Admin, **I want** custom fields on entities, **so that** the system adapts to our specific needs.
**ACs:** Custom fields management page: define fields on Client, Case, Attorney, Invoice; Field types: Text, Number, Date, Dropdown (with options), Checkbox, Textarea; Field config: name, type, options, required flag, entity type; Custom fields displayed dynamically on entity forms and detail pages; Values stored in custom_fields table (entity_type, entity_id, field_id, value as JSONB); Search/filter by custom field values.

### Story 19.3: Tags / Labels System
**As an** Admin, **I want** a tagging system, **so that** entities can be categorized flexibly.
**ACs:** Tag management at settings: name, color (hex), entity types (Case/Client/Document/Invoice); Apply tags to entities from detail pages; Tags shown as colored badges on list pages and detail pages; Filter by tag on all list pages; Bulk tag application (select multiple, apply tag); Remove tags; Tag usage statistics (count per tag).

### Story 19.4: Audit Log
**As an** Admin, **I want** a comprehensive audit log, **so that** all system actions are traceable.
**ACs:** Audit log page (Admin only); Searchable, filterable log; Columns: timestamp, user, action (Create/Update/Delete/Login/Export/Download), entity type, entity ID, details; Detail view: click→old values vs new values (JSON diff); Filters: date range, user, action type, entity type; Pagination (50/page); **Non-deletable** (append-only, no delete/edit on audit records); CSV export (date-range filtered); IP address captured from request headers; createAuditLog() utility used in all server actions.

---

## Epic 20: Data Management, Compliance & Polish (5 stories)

**Objective:** Data import/export, Data Protection Act compliance, responsive design, and final deployment.
**Dependencies:** All previous epics.

### Story 20.1: Data Import (CSV)
**As an** Admin, **I want** to import data via CSV, **so that** existing records can be migrated.
**ACs:** Import page at /(dashboard)/settings/import; CSV upload for: clients (column mapping UI), cases, time entries; Validation: preview data before confirming, show errors per row; Duplicate detection: flag by name/email; Import log: number imported, skipped, errors; Rollback option (delete imported batch); File size limit: 10MB.

### Story 20.2: Data Export & Backup
**As an** Admin, **I want** to export data and maintain backups, **so that** data is portable and safe.
**ACs:** Export buttons: clients CSV, cases CSV, time entries CSV (date range filter), invoices CSV, trust transactions CSV; All exports respect current filters; Database backup guide documented in README (connection to Neon, pg_dump commands); Backup verification steps documented.

### Story 20.3: Data Protection Act 2019 Compliance
**As an** Admin, **I want** the system to comply with Kenya's Data Protection Act 2019, **so that** we meet GDPR-equivalent requirements.
**ACs:** **Consent management:** track consent per client (consent date, consent type, consent text accepted); Consent audit trail; **Data minimization:** documentation of what data is collected and why; **Right to access:** client can request data export from portal (download all personal data as CSV/PDF); **Right to deletion:** admin can process deletion request — anonymize personal data while preserving case history for legal retention; Deletion request log; **Data breach notification:** breach incident form (date, description, data affected, clients affected), breach notification template, breach log.

### Story 20.4: Responsive Design Polish & UX
**As a** user, **I want** a polished, responsive interface, **so that** the system works well on any device.
**ACs:** DataTables responsive: horizontal scroll on mobile or card layout; Mobile sidebar: hamburger menu with Sheet overlay; Touch-friendly: min 44px tap targets; Forms: single column mobile, multi-column desktop; Dashboard cards: responsive grid; Calendar: simplified on mobile; **Loading states:** skeleton components on all data pages; **Error boundaries:** per route group with user-friendly messages; **Empty states** on all lists ("No cases yet — create your first case"); **Toast notifications** for all server action results; Form submission states (disabled button + spinner).

### Story 20.5: Final Deployment & Verification
**As an** Admin, **I want** the system deployed and verified on Vercel, **so that** it's ready for demo and production.
**ACs:** All env vars configured in Vercel; Build passes with zero errors; All pages accessible and functional; Seed data loaded in Neon database; Demo credentials documented; README with: setup instructions, demo URL, credentials, production deployment guide (Windows Server + PM2/IIS + local PostgreSQL); Verification checklist: RBAC tested per role, all CRUD flows, billing cycle, trust accounting, portal access, mobile responsiveness.

---

## Future Epic: Advanced Features (Placeholder — Not In Scope)

These features are identified for future implementation:

- **Bilingual Support (English/Swahili):** i18n framework, translation files, language selector
- **HR & Basic Payroll:** employee records, leave management, salary processing
- **Online Document Sales:** storefront for legal templates, payment processing, download delivery
- **AI Legal Research:** AI-powered case law search, document analysis, legal brief generation
- **Mobile App:** React Native or PWA for iOS/Android
- **WhatsApp Full Integration:** WhatsApp Business API (beyond placeholder in Epic 14)

---

## Summary

| Epic | Stories | Theme |
|------|---------|-------|
| 1: Project Foundation | 3 | Init, schema, seed |
| 2: Authentication & Authorization | 3 | Auth, RBAC, nav shell |
| 3: Dashboards & Global Search | 3 | KPIs, charts, Cmd+K |
| 4: Attorney Management | 3 | CRUD, compliance, performance |
| 5: Client Management & KYC | 4 | Intake, KYC/AML, conflicts, online form |
| 6: Case Management | 4 | CRUD, detail, timeline, kanban |
| 7: Kenya Courts & Bring-Ups | 3 | Courts, filings, bring-ups |
| 8: Calendar & Scheduling | 3 | Calendar, deadlines/SoL, tasks |
| 9: Document Management | 3 | Upload, versioning, eSignature |
| 10: Time & Expense Tracking | 3 | Timer, timesheet/expenses, requisitions |
| 11: Billing & Fee Notes | 4 | Quotes, VAT/PDF, approval, payments |
| 12: Trust & Financial Ops | 3 | Trust accounts, petty cash, bank recon |
| 13: Client Portal | 3 | Layout, case/doc access, invoices |
| 14: Messaging & Communication | 3 | Messaging, notifications, SMS/WhatsApp |
| 15: Email Integration & Templates | 2 | Email system, template management |
| 16: Automated Workflows | 2 | Engine, templates/court rules |
| 17: Reports & Analytics | 4 | Caseload, billing, financial, compliance |
| 18: Settings & Configuration | 3 | Firm settings, users, practice areas |
| 19: Multi-Branch & Customization | 4 | Branches, custom fields, tags, audit |
| 20: Data Management & Polish | 5 | Import, export, DPA compliance, UX, deploy |
| **Total** | **65** | |
| Future (placeholder) | 6 | Bilingual, HR, doc sales, AI, mobile, WhatsApp |

---

*Generated by BMAD Scrum Master Agent — 2026-02-22 (Revised)*
*Source: Law Firm Registry Implementation Plan (a.md)*
*Gap analysis performed against all 23 modules + 27 feature additions*
