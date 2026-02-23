# Law Firm Registry System — Implementation Plan

## Context

A single law firm needs an internal management system to handle attorneys, clients, cases, billing, documents, and more. The system will be built with **Next.js 14+ (App Router)**, **Neon PostgreSQL 17** (dev/demo), and deploy to **Vercel** for demo. Production will run on an on-premise Windows server with local PostgreSQL. Three user roles: **Admin**, **Attorney**, **Client** (with portal).

---

## Research: Industry Analysis & Competitive Landscape

### Kenya-Specific Systems Analyzed

| System | Provider | Key Strength | Users |
|---|---|---|---|
| **WakiliCMS** | Enfinite Solutions (15+ yrs) | Enterprise multi-branch, trust accounting, HR/payroll, financial statements | 100+ firms, 1000+ users |
| **Wakili CRM** | Wakili CRM Team | M-Pesa integration, AI legal assistant, LSK directory, client portal | Growing |
| **Wakili Digital** | Wakili Digital | AWS S3 storage, online document sales, timekeeping | Growing |
| **Sisu by Lenhac** | Lenhac Limited | Milestone-based workflows, 47 counties, KRA compliant | Growing |
| **Smart Legal Africa** | SmartLegal | Client/case management, customizable billing | Growing |

### Global Best-in-Class Systems Analyzed

| System | Key Strength | Scale |
|---|---|---|
| **Clio** (#1 worldwide) | End-to-end platform, AI legal research (vLex), 1500+ integrations | 150,000+ users, 130+ countries |
| **PracticePanther** | Billing-focused, detailed time tracking, CRM intake | Mid-market leader |
| **Smokeball** | Auto time tracking, deep document automation | Small-mid firms |
| **Filevine** | Custom fields everywhere, visual workflows, PI-focused | Enterprise litigation |
| **MyCase** | Client portal excellence, eSignature, lead management | Small firms |

### African Systems Analyzed

| System | Country | Key Strength |
|---|---|---|
| **AJS Legal Software** | South Africa | Full legal accounting, trust (Section 86), 45+ yrs |
| **LexPro** | South Africa | Trust account compliance, POPIA-ready, Legal Practice Act |
| **DigitsLaw** | Nigeria | Modern UI, all-in-one, growing across Africa |

### Kenya Regulatory Systems (Government)

| System | Operator | Function |
|---|---|---|
| **JAMS** (Judiciary Advocates Management System) | Kenya Judiciary | Roll of Advocates, e-Practising Certificates, admission processing |
| **e-Filing System** | Kenya Judiciary | Electronic case filing, cause list portal, virtual courts |
| **Case Tracking System** | Kenya Judiciary | Track case progress through courts |
| **LSK Online Portal** | Law Society of Kenya | Advocate search, CPD tracking, membership, compliance |
| **Advocates Complaints Commission** | Government | Disciplinary complaints against advocates |

---

## Kenya Legal Requirements (Advocates Act, Cap. 16)

### Mandatory Compliance Features Our System MUST Support

1. **Roll of Advocates** — Every advocate must be on the Roll maintained by the Chief Registrar
2. **Annual Practising Certificate** — Practising year: Jan 1 to Dec 31; certificate must be renewed annually
3. **Practising Statuses** — Active, Inactive, Struck Off, Suspended, Deceased (per LSK portal)
4. **Client Account Rules** (Advocates (Accounts) Rules, L.N. 137/1966):
   - Client money accounts MUST be separate from advocate's own money
   - Detailed record-keeping of all client funds
   - Prescribed rules for payments into and out of client accounts
   - Preservation of accounting records
   - Cannot mix client funds between different clients
5. **LSK Membership** — Mandatory for all practising advocates (23,000+ members)
6. **CPD Requirements** — Continuing Professional Development units tracking
7. **AML/CFT Compliance** — Kenya is on the FATF grey list; LSK issued AML/CFT guidelines Oct 2025
   - KYC (Know Your Client) for every client
   - Suspicious transaction identification and reporting
   - Client due diligence records
   - Risk assessment per client/matter
8. **Data Protection Act 2019** — Modeled after EU GDPR; requires:
   - Consent management
   - Data minimization
   - Right to access/deletion
   - Data breach notification
9. **KRA Compliance** — Tax compliance for billing (VAT at 16%)
10. **Advocates Disciplinary Tribunal** — Track any disciplinary proceedings

---

## Feature Gap Analysis: What Kenya Systems Have That Our Plan Was Missing

Based on research of WakiliCMS, Wakili CRM, Sisu by Lenhac, and global leaders, these features were **missing from our original plan** and are now added:

### Critical Kenya-Specific Additions

| # | Feature | Found In | Priority |
|---|---|---|---|
| 1 | **M-Pesa Payment Integration** | Wakili CRM, Sisu | MUST-HAVE |
| 2 | **KES Currency + VAT 16%** | All Kenya systems | MUST-HAVE |
| 3 | **File Bring-Up System** (reminder to revisit a file) | WakiliCMS | MUST-HAVE |
| 4 | **Kenya Court Hierarchy** (Supreme, Appeal, High, ELC, ELRC, Magistrate) | Sisu, WakiliCMS | MUST-HAVE |
| 5 | **Practising Certificate Tracking** (annual renewal, expiry alerts) | JAMS, LSK Portal | MUST-HAVE |
| 6 | **LSK Membership & CPD Tracking** | LSK Portal | MUST-HAVE |
| 7 | **KYC/AML Compliance Module** | LSK Guidelines 2025 | MUST-HAVE |
| 8 | **Fee Notes** (Kenya term for invoices) + Quotes | WakiliCMS, Wakili Digital | MUST-HAVE |
| 9 | **Client KRA PIN & ID/Passport Tracking** | All Kenya systems | MUST-HAVE |
| 10 | **Court Calendar Separate from General Calendar** | WakiliCMS | MUST-HAVE |
| 11 | **Multi-Branch Office Management** | WakiliCMS | IMPORTANT |
| 12 | **Requisition System** (approve expenses before incurring) | WakiliCMS | IMPORTANT |
| 13 | **SMS Notifications** (+254 format) | Wakili CRM | IMPORTANT |
| 14 | **WhatsApp Integration** | Wakili CRM | NICE-TO-HAVE |
| 15 | **Bilingual Support** (English/Swahili) | Wakili CRM | NICE-TO-HAVE |

### Critical Global Best-Practice Additions

| # | Feature | Found In | Priority |
|---|---|---|---|
| 16 | **Matter Pipeline / Kanban Board** | Clio, Filevine | MUST-HAVE |
| 17 | **Online Client Intake Forms** (shareable link) | Clio, MyCase | MUST-HAVE |
| 18 | **eSignature** | Clio, MyCase | IMPORTANT |
| 19 | **Automated Workflows** (if X then Y triggers) | Clio, Smokeball | IMPORTANT |
| 20 | **Custom Fields on All Entities** | Filevine, Clio | IMPORTANT |
| 21 | **Tags/Labels System** | All global systems | IMPORTANT |
| 22 | **Supplier/Vendor Management** | WakiliCMS | IMPORTANT |
| 23 | **Petty Cash Management** | WakiliCMS | IMPORTANT |
| 24 | **Bank Reconciliation** | WakiliCMS, AJS, LexPro | IMPORTANT |
| 25 | **HR & Basic Payroll** | WakiliCMS | NICE-TO-HAVE |
| 26 | **Data Import/Export + Backup** | All global systems | IMPORTANT |
| 27 | **Online Document Sales** | Wakili Digital | NICE-TO-HAVE |

---

## Comprehensive Feature Comparison Matrix

Features compared across our system vs. top competitors:

| Feature | Our System | WakiliCMS | Wakili CRM | Clio | PracticePanther |
|---|---|---|---|---|---|
| Client Management / CRM | ✅ | ✅ | ✅ | ✅ | ✅ |
| Case/Matter Management | ✅ | ✅ | ✅ | ✅ | ✅ |
| Document Management | ✅ | ✅ | ✅ | ✅ | ✅ |
| Time & Expense Tracking | ✅ | ✅ | ✅ | ✅ | ✅ |
| Billing & Invoicing | ✅ | ✅ | ✅ | ✅ | ✅ |
| Trust/Client Account Mgmt | ✅ | ✅ | ✅ | ✅ | ✅ |
| Client Portal | ✅ | ✅ | ✅ | ✅ | ✅ |
| Calendar & Deadlines | ✅ | ✅ | ✅ | ✅ | ✅ |
| Reports & Analytics | ✅ | ✅ | ✅ | ✅ | ✅ |
| Conflict of Interest Check | ✅ | ✅ | ✅ | ✅ | ✅ |
| M-Pesa Integration | ✅ NEW | ✅ | ✅ | ❌ | ❌ |
| KES + VAT 16% | ✅ NEW | ✅ | ✅ | ❌ | ❌ |
| File Bring-Up System | ✅ NEW | ✅ | ❌ | ❌ | ❌ |
| Kenya Court Hierarchy | ✅ NEW | ✅ | ❌ | ❌ | ❌ |
| Practising Certificate Tracking | ✅ NEW | ❌ | ✅ | ❌ | ❌ |
| KYC/AML Compliance | ✅ NEW | ❌ | ❌ | ❌ | ❌ |
| Fee Notes + Quotes | ✅ NEW | ✅ | ✅ | ❌ | ❌ |
| Matter Pipeline / Kanban | ✅ NEW | ❌ | ❌ | ✅ | ✅ |
| Online Intake Forms | ✅ NEW | ❌ | ✅ | ✅ | ✅ |
| eSignature | ✅ NEW | ❌ | ❌ | ✅ | ✅ |
| Multi-Branch Management | ✅ NEW | ✅ | ❌ | ✅ | ❌ |
| HR & Payroll | ❌ Future | ✅ | ❌ | ❌ | ❌ |
| Requisition System | ✅ NEW | ✅ | ❌ | ❌ | ❌ |
| SMS Notifications | ✅ NEW | ✅ | ✅ | ❌ | ❌ |
| Custom Fields | ✅ NEW | ❌ | ❌ | ✅ | ✅ |
| Automated Workflows | ✅ NEW | ❌ | ❌ | ✅ | ✅ |
| Bank Reconciliation | ✅ NEW | ✅ | ❌ | ❌ | ❌ |
| Petty Cash | ✅ NEW | ✅ | ❌ | ❌ | ❌ |
| AI Features | ❌ Future | ❌ | ✅ | ✅ | ❌ |
| Mobile App | ❌ Responsive | ❌ | ✅ | ✅ | ✅ |

**Our system targets 35+ features — surpassing any single Kenya system and matching global leaders on core functionality, while being the only system purpose-built for Kenya compliance (AML/CFT, KRA, LSK, Advocates Act).**

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14+ (App Router, Server Components, Server Actions) |
| Language | TypeScript |
| Database | Neon PostgreSQL 17 (dev/demo) → On-prem PostgreSQL (prod) |
| ORM | Drizzle ORM + drizzle-kit migrations |
| Auth | NextAuth.js v5 (Auth.js) — Credentials provider, JWT sessions |
| UI | Tailwind CSS + shadcn/ui + Radix UI + Lucide icons |
| Charts | Recharts |
| Tables | @tanstack/react-table |
| Forms | react-hook-form + Zod validation |
| File Storage | Vercel Blob (demo) / Local filesystem (prod) |
| PDF Generation | jsPDF or @react-pdf/renderer |
| Deployment | Vercel (demo) → Windows Server + PM2/IIS (prod) |

---

## Database: 40+ Tables across 15 Domains

| Domain | Tables |
|---|---|
| Auth | `users` |
| Attorneys | `attorneys`, `attorney_practice_areas`, `attorney_licenses`, `practising_certificates`, `cpd_records` |
| Clients | `clients`, `client_contacts`, `conflict_checks`, `kyc_documents`, `client_risk_assessments` |
| Cases | `cases`, `case_assignments`, `case_notes`, `case_timeline`, `case_parties`, `pipeline_stages` |
| Documents | `documents`, `document_versions`, `document_templates` |
| Calendar | `calendar_events`, `event_attendees`, `deadlines`, `tasks`, `bring_ups` |
| Time/Expense | `time_entries`, `expenses`, `requisitions` |
| Billing | `invoices`, `invoice_line_items`, `payments`, `trust_accounts`, `trust_transactions`, `quotes`, `receipts`, `credit_notes` |
| Financial | `petty_cash_transactions`, `bank_accounts`, `bank_transactions`, `bank_reconciliations` |
| Courts | `courts`, `court_stations`, `court_filings`, `service_of_documents` |
| Suppliers | `suppliers`, `supplier_invoices` |
| Messaging | `messages`, `notifications`, `sms_log` |
| Branches | `branches`, `branch_users` |
| Workflows | `workflow_templates`, `workflow_rules`, `workflow_execution_log` |
| Settings | `firm_settings`, `practice_areas`, `billing_rates`, `email_templates`, `sms_templates`, `audit_log`, `custom_fields`, `tags` |

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/          # Login, Register, Forgot Password
│   ├── (dashboard)/     # Main app (Admin + Attorney)
│   │   ├── dashboard/
│   │   ├── attorneys/
│   │   ├── clients/
│   │   ├── cases/
│   │   ├── documents/
│   │   ├── calendar/
│   │   ├── deadlines/
│   │   ├── tasks/
│   │   ├── time-tracking/
│   │   ├── expenses/
│   │   ├── billing/
│   │   ├── messages/
│   │   ├── reports/
│   │   └── settings/
│   ├── (portal)/        # Client Portal (limited access)
│   │   └── portal/
│   │       ├── cases/
│   │       ├── documents/
│   │       ├── invoices/
│   │       ├── messages/
│   │       └── profile/
│   └── api/             # Auth, uploads, PDF, cron
├── components/
│   ├── ui/              # shadcn/ui components
│   ├── layout/          # Sidebar, header, nav
│   ├── forms/           # All entity forms
│   └── shared/          # Timer, search, badges, etc.
├── lib/
│   ├── db/              # Drizzle client, schema/, seed, migrate
│   ├── auth/            # NextAuth config
│   ├── storage/         # File storage abstraction
│   ├── validators/      # Zod schemas per entity
│   ├── actions/         # Server Actions (mutations)
│   ├── queries/         # Data access (reads)
│   ├── utils/           # Helpers (format, permissions, pdf, csv)
│   └── hooks/           # Client hooks (timer, debounce)
└── types/               # NextAuth extensions, shared types
```

---

## Module Details

---

### Module 1: Authentication & Authorization

**Features:**
- Email/password login with bcrypt hashing
- Client self-registration (admin approves)
- Forgot password flow (email reset link)
- JWT session strategy (stateless, no DB sessions)
- Role-based access: Admin (full access), Attorney (case/billing/documents), Client (portal only)
- Session timeout with auto-logout
- "Remember me" option

**RBAC Permissions Matrix:**

| Feature | Admin | Attorney | Client |
|---|---|---|---|
| Dashboard | Full KPIs | Own KPIs | Portal dashboard |
| Attorneys | CRUD all | View all | — |
| Clients | CRUD all | CRUD own | View own profile |
| Cases | CRUD all | CRUD assigned | View own (read-only) |
| Documents | CRUD all | CRUD on assigned cases | View shared docs |
| Calendar | CRUD all | CRUD own events | — |
| Time Tracking | View all, edit all | CRUD own entries | — |
| Expenses | View all, edit all | CRUD own expenses | — |
| Billing | CRUD all invoices | View assigned case invoices | View own invoices |
| Trust Accounts | Full management | View only | — |
| Messages | View all | Send/receive | Send/receive to attorney |
| Reports | All reports | Own reports | — |
| Settings | Full access | Profile only | Profile only |
| Audit Log | Full access | — | — |
| User Management | CRUD all users | — | — |

**Form Fields — Login:**
- Email (required, email format)
- Password (required, min 8 chars)
- Remember me (checkbox)

**Form Fields — Registration (Client):**
- First name, Last name (required)
- Email (required, unique)
- Password + Confirm password (min 8 chars, must match)
- Phone (optional)

---

### Module 2: Dashboard

**Admin Dashboard Widgets:**
1. **Stat Cards:** Total active cases, Total clients, Revenue this month, Outstanding invoices amount, Active attorneys, Overdue deadlines count
2. **Revenue Chart:** Line chart — monthly revenue over last 12 months (Recharts)
3. **Case Status Distribution:** Donut chart — cases by status (open/in-progress/hearing/resolved/closed)
4. **Recent Cases:** Table — last 10 cases with status, client, lead attorney, date
5. **Upcoming Deadlines:** List — next 10 deadlines with case, due date, priority, assigned to
6. **Overdue Invoices:** Table — invoices past due date with client, amount, days overdue

**Attorney Dashboard Widgets:**
1. **Stat Cards:** My active cases, Hours logged this week, Billable hours this month, My upcoming deadlines, Unread messages
2. **My Cases:** Table — attorney's assigned cases with status, client, next deadline
3. **My Upcoming Deadlines:** List — next 7 deadlines on assigned cases
4. **Recent Time Entries:** Table — last 5 time entries with case, hours, date
5. **My Tasks:** List — open tasks assigned to this attorney

**Client Dashboard Widgets:**
1. **Stat Cards:** My open cases, Pending documents, Outstanding balance
2. **My Cases:** List — client's cases with status and last update date
3. **Recent Documents:** List — last 5 documents shared with client
4. **Outstanding Invoices:** List — unpaid invoices with amount and due date
5. **Recent Messages:** List — last 3 messages from attorney

---

### Module 3: Attorney Management

**Features:**
- Attorney profile with professional details
- Multiple bar admissions / jurisdictions
- Practice area tagging (many-to-many)
- License status tracking with expiry alerts
- Department/title management (Partner, Associate, Of Counsel, Paralegal)
- Hourly rate configuration per attorney
- Performance metrics (cases handled, hours billed, revenue generated)
- Attorney list with search, filter by status/department/practice area
- Deactivate attorney (soft delete, preserves history)

**Form Fields — Attorney Profile:**
- User account link (select existing user or create new)
- Bar number (required)
- Bar state/jurisdiction (required)
- License status (active, inactive, suspended, retired — dropdown)
- License expiry date
- Title (Partner, Senior Associate, Associate, Of Counsel, Paralegal — dropdown)
- Department (Litigation, Corporate, Family, Criminal, etc. — dropdown)
- Hourly rate (currency input)
- Date admitted to bar
- Bio / professional summary (textarea)

**Form Fields — Additional License:**
- Jurisdiction (required)
- License number (required)
- Status (active/inactive)
- Issue date
- Expiry date

**Attorney Detail Page Sections:**
1. **Profile Overview:** Photo, name, title, department, contact info, bar details
2. **Licenses Tab:** All bar admissions with status and expiry
3. **Practice Areas Tab:** Tagged practice areas
4. **Cases Tab:** DataTable of assigned cases (link to case detail)
5. **Time & Billing Tab:** Hours logged, revenue generated, utilization rate
6. **Performance Tab:** Cases won/settled, average case duration, billing efficiency

---

### Module 4: Client Management (CRM)

**Features:**
- Individual and organization client types
- Multi-step intake form with validation
- Client contact history log (calls, emails, meetings, letters)
- Conflict of interest checker (search across all cases, parties, opposing counsel)
- Portal account creation (optional — not all clients need portal access)
- Client deactivation (soft delete)
- Referral source tracking
- Related cases list on client profile
- Client documents list
- Outstanding balance summary

**Form Fields — Client Intake (Individual):**
- First name (required)
- Last name (required)
- Email (required)
- Phone (required)
- Date of birth
- Address, City, State, Zip code
- SSN last 4 digits (encrypted, for conflict checks)
- Referral source (dropdown: website, referral, advertising, walk-in, other)
- Initial notes (textarea)
- Create portal account? (checkbox — triggers user creation)

**Form Fields — Client Intake (Organization):**
- Company name (required)
- Primary contact first name (required)
- Primary contact last name (required)
- Email (required)
- Phone (required)
- Address, City, State, Zip code
- Tax ID / EIN
- Industry
- Referral source
- Notes

**Form Fields — Contact Log Entry:**
- Contact type (phone call, email, in-person meeting, letter, video call — dropdown)
- Subject (text)
- Notes (textarea)
- Contact date (date picker, defaults to now)
- Contacted by (auto-filled with current user)

**Conflict of Interest Check:**
- Search input: name, company, or keyword
- System searches across: client names, opposing parties, opposing counsel, case parties, company names
- Results show: matching entity, case number, relationship type, potential conflict severity
- Actions: mark as "clear", "potential conflict" (needs review), or "conflict found" (block)
- Resolution notes field
- Conflict check history log

**Client Detail Page Sections:**
1. **Profile Overview:** Name, contact info, type, status, intake date, referral source
2. **Cases Tab:** All cases for this client with status
3. **Documents Tab:** Documents associated with this client
4. **Contact History Tab:** Chronological log of all interactions
5. **Billing Tab:** Outstanding balance, payment history, trust balance
6. **Conflict Checks Tab:** History of conflict checks involving this client

---

### Module 5: Case/Matter Management

**Features:**
- Full case lifecycle: Open → In Progress → Hearing → Resolved → Closed → Archived
- Auto-generated case numbers (format: YYYY-NNNN, e.g., 2026-0001)
- Multiple attorney assignments with roles (Lead, Assigned, Supervising, Of Counsel)
- Case type categorization (Civil, Criminal, Family, Corporate, IP, Real Estate, etc.)
- Practice area linking
- Court information tracking (court name, court case number, judge)
- Opposing counsel and opposing party tracking
- Statute of limitations tracking with countdown and warnings (90, 60, 30, 7 days)
- Case timeline (auto-generated events + manual entries)
- Case notes (private notes visible only to attorneys, vs shared notes)
- Case priority levels (Low, Medium, High, Urgent)
- Estimated case value for contingency/financial planning
- Case cloning (duplicate a case as template for similar matters)

**Status Transition Rules:**
```
Open → In Progress (when first attorney assigned and work begins)
In Progress → Hearing (when court date is set)
Hearing → In Progress (if hearing postponed or additional work needed)
In Progress → Resolved (when settlement/verdict reached)
Hearing → Resolved (direct resolution from hearing)
Resolved → Closed (when all billing finalized and documents archived)
Closed → Archived (after retention period, admin only)
Any status → Closed (admin override for special circumstances)
```

**Form Fields — New Case:**
- Case title (required)
- Client (required, searchable dropdown)
- Case type (required, dropdown)
- Practice area (dropdown)
- Lead attorney (required, searchable dropdown)
- Additional attorneys (multi-select)
- Billing type (Hourly, Flat Fee, Contingency, Retainer, Pro Bono — dropdown)
- If Hourly: hourly rate auto-populated from attorney default
- If Flat Fee: flat fee amount (currency input)
- If Contingency: contingency percentage (number input)
- Court name (text)
- Court case number (text)
- Judge (text)
- Opposing counsel (text)
- Opposing party (text)
- Statute of limitations date (date picker)
- Date filed (date picker)
- Priority (Low/Medium/High/Urgent — dropdown)
- Estimated value (currency input)
- Description (textarea)
- Notes (textarea)

**Case Detail Page — Tabbed Layout:**
1. **Overview Tab:** All case details, status badge, assigned attorneys, court info, key dates
2. **Timeline Tab:** Chronological event list (auto events: status changes, assignments, document uploads + manual events)
3. **Documents Tab:** Documents linked to this case, upload button, category filter
4. **Billing Tab:** Time entries, expenses, invoices for this case, unbilled totals
5. **Notes Tab:** Case notes list with add button, private/shared toggle
6. **Tasks Tab:** Tasks assigned for this case
7. **Parties Tab:** Client, opposing party, opposing counsel, witnesses, experts

**Auto-Generated Timeline Events:**
- Case created
- Status changed (from → to)
- Attorney assigned/unassigned
- Document uploaded
- Invoice created
- Payment received
- Deadline added/completed
- Court date scheduled

---

### Module 6: Document Management

**Features:**
- Drag-and-drop file upload (single + batch)
- Document categorization (Pleading, Correspondence, Contract, Evidence, Court Order, Internal Memo, Template)
- Matter-based organization (documents linked to cases)
- Client-based organization (documents linked to clients)
- Version control (upload new version, view version history, download any version)
- Document templates (reusable templates with placeholder fields)
- Full-text search across document titles and metadata
- Document status workflow (Draft → Review → Approved → Final → Archived)
- Share documents with clients (visible in client portal)
- File type support: PDF, DOCX, XLSX, JPG, PNG, TXT, and more
- File size limit: 25MB per file
- Storage provider abstraction (Vercel Blob for demo, local filesystem for production)

**Form Fields — Document Upload:**
- File (drag-and-drop or file picker, required)
- Title (required, auto-filled from filename)
- Description (textarea)
- Category (dropdown: Pleading, Correspondence, Contract, Evidence, Court Order, Internal Memo, Other)
- Associated case (searchable dropdown, optional)
- Associated client (searchable dropdown, optional)
- Status (Draft/Review/Approved/Final — dropdown)
- Share with client? (checkbox — makes visible in portal)

**Form Fields — Document Template:**
- Template name (required)
- Description (textarea)
- Category (dropdown)
- Template file upload or rich text body with placeholders
- Available placeholders: {{client_name}}, {{case_number}}, {{case_title}}, {{attorney_name}}, {{date}}, {{court_name}}, etc.

**Document Detail Page:**
- File preview (PDF viewer, image viewer)
- Metadata: title, category, status, uploaded by, dates, associated case/client
- Version history table (version number, uploaded by, date, change notes, download link)
- Upload new version button
- Edit metadata button
- Delete button (admin only, with confirmation)

---

### Module 7: Calendar & Deadlines

**Features:**
- Calendar view with month, week, and day views
- Event types: Court Date, Hearing, Deposition, Meeting, Deadline, Statute of Limitations, Filing, Other
- Events linked to cases
- Event attendees (attorneys)
- Recurring events (weekly, monthly, custom via iCal RRULE)
- Reminder notifications (configurable: 1 day, 1 week, custom minutes before)
- Color coding by event type
- Deadline tracker with priority and assignment
- Statute of limitations countdown with escalating warnings
- Task management with status tracking (Pending → In Progress → Completed → Cancelled)
- Drag-and-drop event rescheduling (on calendar)
- Filter calendar by attorney, case, event type

**Form Fields — Calendar Event:**
- Title (required)
- Event type (required, dropdown)
- Associated case (searchable dropdown)
- Start date/time (required)
- End date/time (required, or "All day" checkbox)
- Location (text)
- Description (textarea)
- Attendees (multi-select attorneys)
- Recurring? (checkbox → recurrence pattern selector)
- Reminder (dropdown: None, 15 min, 30 min, 1 hour, 1 day, 1 week)

**Form Fields — Deadline:**
- Title (required)
- Associated case (required, searchable dropdown)
- Due date (required)
- Priority (Low/Medium/High/Urgent)
- Assigned to (attorney dropdown)
- Description (textarea)

**Form Fields — Task:**
- Title (required)
- Associated case (searchable dropdown, optional)
- Status (Pending/In Progress/Completed/Cancelled)
- Priority (Low/Medium/High/Urgent)
- Due date (optional)
- Assigned to (user dropdown)
- Description (textarea)

**Statute of Limitations Warnings:**
- 90 days before: info notification
- 60 days before: warning notification
- 30 days before: urgent notification + dashboard highlight
- 7 days before: critical alert + email notification
- Overdue: red banner on case detail page

---

### Module 8: Time & Expense Tracking

**Features:**
- Manual time entry (date, duration, description, case, billing type)
- Live timer widget (floating in app corner, persistent across page navigation)
- Timer controls: start, pause, resume, stop, discard
- Billable vs non-billable classification
- Hourly rate auto-populated from attorney profile or case-specific rate
- Total amount auto-calculated (duration × rate)
- Time entry list with filters (date range, attorney, case, billing type)
- Weekly timesheet view (grid: days × cases)
- Expense logging with category, amount, vendor, receipt upload
- Expense categories: Filing Fee, Court Cost, Travel, Copy/Print, Postage, Expert Witness, Other
- Billable expense tracking
- Mark time/expenses as invoiced (linked to invoice)
- Bulk time entry (enter multiple entries at once)
- Time entry rounding rules (nearest 6 minutes / 0.1 hour)

**Form Fields — Time Entry (Manual):**
- Case (required, searchable dropdown)
- Date (required, defaults to today)
- Duration (required — hours:minutes input OR decimal hours)
- Description of work performed (required, textarea)
- Entry type (Billable / Non-billable — radio)
- Hourly rate (auto-filled, editable)
- Total amount (auto-calculated, read-only)

**Form Fields — Expense:**
- Case (required, searchable dropdown)
- Expense date (required, defaults to today)
- Category (required, dropdown)
- Description (required, textarea)
- Amount (required, currency input)
- Vendor name (text)
- Receipt (file upload, optional)
- Billable? (checkbox, default: yes)

**Timer Widget Behavior:**
- Floating button in bottom-right corner, always visible
- Click to expand: shows running timer, case selection, description field
- Persists timer state in localStorage (survives page refresh)
- On stop: auto-creates time entry with calculated duration
- Shows elapsed time in HH:MM:SS format
- Color indicator: green = running, yellow = paused, gray = stopped

---

### Module 9: Billing & Invoicing

**Features:**
- Invoice generation from unbilled time entries + expenses
- Auto-pull all unbilled items for a case into a new invoice
- Manual line item addition/editing on invoices
- Invoice number auto-generation (format: INV-YYYY-NNNN)
- Support for billing types:
  - **Hourly:** Sum of time entries × hourly rates
  - **Flat Fee:** Single line item with agreed amount
  - **Contingency:** Percentage of settlement/award amount
  - **Retainer:** Draw down from trust account
  - **Pro Bono:** $0 invoices with tracked hours for reporting
- Tax calculation (configurable tax rate per invoice)
- Invoice status workflow: Draft → Sent → Paid / Partial / Overdue → Void
- Overdue detection (auto-flag invoices past due date)
- Payment recording (multiple payments per invoice, partial payments)
- Payment methods: Check, Wire Transfer, Credit Card, Trust Account, Cash
- Invoice PDF generation with firm branding (logo, address, terms)
- Invoice email sending (future enhancement)
- Invoice aging report (current, 30 days, 60 days, 90+ days)
- Credit notes / write-offs

**Form Fields — New Invoice:**
- Client (required, auto-filled if created from case)
- Case (required, searchable dropdown)
- Invoice date (required, defaults to today)
- Due date (required, defaults to today + 30 days)
- Billing type (auto-filled from case)
- Line items:
  - Description (text)
  - Quantity (number)
  - Unit price (currency)
  - Total (auto-calculated)
  - Link to time entry or expense (auto-populated or manual)
- Subtotal (auto-calculated)
- Tax rate (percentage input, default from firm settings)
- Tax amount (auto-calculated)
- Total amount (auto-calculated)
- Notes to client (textarea)
- Payment terms (textarea, default from firm settings)
- "Pull unbilled items" button (auto-populates line items from unbilled time + expenses)

**Form Fields — Record Payment:**
- Invoice (auto-selected)
- Amount (required, currency input, defaults to amount due)
- Payment date (required, defaults to today)
- Payment method (dropdown)
- Reference number (text — check number, wire reference, etc.)
- Notes (textarea)

**Invoice PDF Layout:**
- Firm logo + name + address (from firm settings)
- Invoice number, date, due date
- Client name + address
- Case reference (case number + title)
- Line items table (description, quantity, rate, amount)
- Subtotal, tax, total
- Amount paid, amount due
- Payment terms
- Notes
- "Thank you for your business" footer

---

### Module 10: Trust / IOLTA Accounting

**Features:**
- Trust account creation and management (IOLTA, Client Trust, Operating)
- Per-client trust balance tracking
- Trust transaction ledger (deposits, withdrawals, transfers, interest, fees)
- Running balance calculation per transaction
- Trust-to-operating fund transfer (when invoice paid from trust)
- Three-way reconciliation view (bank balance, book balance, client balances)
- Compliance safeguards:
  - Cannot withdraw more than client's trust balance
  - Cannot mix client funds (per-client sub-ledger)
  - Automatic running balance on every transaction
- Trust account reports

**Form Fields — Trust Account:**
- Account name (required)
- Account number
- Bank name
- Account type (IOLTA, Client Trust, Operating — dropdown)

**Form Fields — Trust Transaction:**
- Trust account (required, dropdown)
- Client (required, searchable dropdown)
- Case (optional, searchable dropdown)
- Transaction type (Deposit, Withdrawal, Transfer, Interest, Fee — dropdown)
- Amount (required, currency input)
- Description (required, textarea)
- Reference number (text)
- Transaction date (required, defaults to today)
- Related invoice (optional, dropdown — for trust payments against invoices)

---

### Module 11: Client Portal

**Features:**
- Separate login page (same auth system, role-restricted routing)
- Simplified navigation (no access to internal features)
- Case status view: see own cases with status, last update, next deadline
- Case detail: read-only view of case overview (no private notes, no billing details beyond invoices)
- Document access: download documents shared by attorney (only docs marked "share with client")
- Invoice viewing: see invoices with status, amounts, due dates
- Invoice detail: view line items and payment history
- Secure messaging: send/receive messages to/from assigned attorney
- Profile management: update contact info, change password
- Notification badges for unread messages and new documents

**Portal Navigation:**
- Dashboard (overview of cases, invoices, messages)
- My Cases
- My Documents
- My Invoices
- Messages
- My Profile

---

### Module 12: Messaging & Notifications

**Features:**
- Internal messaging between attorneys
- Attorney-to-client messaging (visible in client portal)
- Message threads (reply to message creates thread)
- Case-linked messages (associate message with a case)
- Unread message counter in header
- Mark as read/unread
- In-app notification system (bell icon in header)
- Notification types: deadline reminder, case update, new message, invoice status change, document shared
- Notification preferences (future: per-type enable/disable)
- Notification badge count

**Form Fields — New Message:**
- Recipient (required, searchable dropdown — filtered by role)
- Subject (text)
- Associated case (optional, searchable dropdown)
- Message body (required, textarea)
- Attach document (optional)

---

### Module 13: Reports & Analytics

**Available Reports:**

1. **Caseload Report:**
   - Cases by status (bar chart)
   - Cases by practice area (pie chart)
   - Cases by attorney (table)
   - Cases opened vs closed by month (line chart)
   - Average case duration
   - Filters: date range, attorney, practice area, status

2. **Revenue Report:**
   - Revenue by month (line chart)
   - Revenue by attorney (bar chart)
   - Revenue by practice area (pie chart)
   - Revenue by billing type (table)
   - Year-over-year comparison
   - Filters: date range, attorney, practice area

3. **Billing & Accounts Receivable Report:**
   - Invoice aging summary (current, 30, 60, 90+ days)
   - Outstanding balance by client (table)
   - Collection rate (% of invoiced amount collected)
   - Average days to payment
   - Write-off summary
   - Filters: date range, client, status

4. **Productivity Report:**
   - Hours logged by attorney (bar chart)
   - Billable vs non-billable hours ratio
   - Utilization rate (billable hours / available hours)
   - Hours by practice area
   - Hours by case
   - Filters: date range, attorney, case

5. **Trust Account Report:**
   - Trust balance by client (table)
   - Transaction history (filterable ledger)
   - Three-way reconciliation (bank vs book vs client balances)
   - Filters: date range, client, account

**Export:** All reports exportable as CSV

---

### Module 14: Settings & Configuration

**Firm Settings:**
- Firm name, address, phone, email, website
- Firm logo upload (used on invoices, portal, login page)
- Default invoice payment terms (text)
- Default tax rate (VAT 16% for Kenya)
- Default billing increment (6 min / 15 min / custom)
- Fiscal year start month
- Date format preference
- Currency: KES (Kenya Shillings) as default, support multi-currency
- Default county/jurisdiction

**User Management (Admin only):**
- User list with role, status, last login
- Create user (assign role: admin, attorney, client)
- Edit user (change role, reset password, activate/deactivate)
- Deactivate user (soft delete, preserves audit trail)

**Practice Area Management:**
- CRUD practice areas (name, description, active/inactive)
- Used in: cases, attorney profiles, billing rates, reports

**Billing Rate Management:**
- Default firm-wide rates
- Attorney-specific rate overrides
- Practice area-specific rates
- Rate effective dates (historical rate tracking)

**Email Templates (Future):**
- Invoice email template
- Deadline reminder template
- Welcome email template
- Case update notification template
- Placeholder variables support

**Audit Log:**
- Searchable log of all system actions
- Columns: timestamp, user, action (create/update/delete/login/export), entity type, entity ID
- Detail view: old values vs new values (JSON diff)
- Filters: date range, user, action type, entity type
- Admin-only access
- Non-deletable (append-only)

---

### Module 15: Kenya Compliance & Practising Certificate Management (NEW — Kenya-Specific)

**Practising Certificate Tracking:**
- Annual practising certificate number and year
- Certificate issue date and expiry date (practising year: Jan 1 - Dec 31)
- Certificate status: Valid, Expired, Pending Renewal
- Auto-renewal reminders (60 days, 30 days, 7 days before Dec 31)
- Upload scanned copy of practising certificate
- Link to LSK membership number
- Commissioner for Oaths status tracking
- Notary Public status tracking (if applicable)
- Senior Counsel designation tracking

**LSK & CPD Compliance:**
- LSK membership number per attorney
- CPD units tracking (earned vs required per year)
- CPD event logging (event name, date, provider, units earned, certificate upload)
- CPD compliance status dashboard (compliant / non-compliant / pending)
- Annual compliance checklist (fees paid, CPD met, certificate renewed)

**KYC/AML Compliance (per LSK Guidelines 2025 / POCAMLA):**
- Client risk assessment (Low / Medium / High) at intake
- KYC document collection checklist:
  - Individual: National ID/Passport, KRA PIN, proof of address, photo
  - Organization: Certificate of Incorporation, CR12, KRA PIN, directors' IDs, beneficial ownership
- KYC verification status per client (Pending → Verified → Expired → Rejected)
- KYC document expiry tracking and renewal reminders
- Suspicious activity flag on client or transaction
- AML compliance report generation
- Enhanced due diligence workflow for high-risk clients
- Politically Exposed Persons (PEP) flag

**Form Fields — KYC Record:**
- Client (auto-linked)
- Document type (National ID, Passport, KRA PIN Certificate, Certificate of Incorporation, CR12, Utility Bill, etc.)
- Document number
- Issue date / Expiry date
- Upload scanned document
- Verification status (Pending/Verified/Rejected)
- Verified by (user)
- Verification date
- Notes

---

### Module 16: Kenya Court & E-Filing Integration (NEW — Kenya-Specific)

**Kenya Court System Hierarchy:**
- Supreme Court
- Court of Appeal
- High Court (+ Constitutional & Human Rights Division)
- Environment & Land Court (ELC)
- Employment & Labour Relations Court (ELRC)
- Magistrate Courts (Chief Magistrate, Senior Principal, Principal, Senior Resident, Resident)
- Kadhi's Courts
- Courts Martial
- Tribunals (listed by type)

**Court Management Features:**
- Pre-populated Kenya court stations list (all 47 counties)
- Court registry selection per case
- Separate court calendar (distinct from general calendar, color-coded)
- Court date types: Mention, Hearing, Ruling, Judgment, Directions, Conference, Plea
- Cause list tracking (case position in court schedule)
- Judge/Magistrate assignment tracking per case
- Court file number tracking (separate from firm file number)
- Virtual court link field (for remote hearings)

**E-Filing Readiness:**
- Court fee tracking per filing
- Filing checklist per case type
- Document bundle preparation (organize documents for court filing)
- Filed document status tracking (Filed, Accepted, Rejected, Served)
- Service of documents log (who was served, when, method)

---

### Module 17: File Bring-Up System (NEW — from WakiliCMS Best Practice)

**Concept:** A "bring-up" is a reminder to physically or digitally revisit a case file on a specific date. This is a core workflow in Kenyan law firms that no global system offers.

**Features:**
- Create bring-up reminder on any case/file
- Bring-up date + time
- Assigned to (which attorney or paralegal should review)
- Bring-up reason/note (e.g., "Follow up on court order", "Check if opposing counsel responded")
- Recurring bring-ups (daily, weekly, monthly)
- Status: Pending → Reviewed → Deferred (with new date) → Completed
- Email/SMS notification when bring-up is due
- Dashboard widget: "Today's Bring-Ups" showing all files due for review
- Overdue bring-ups highlighted in red
- Bulk bring-up creation (set bring-ups across multiple files)

**Form Fields — Bring-Up:**
- Case/File (required, searchable dropdown)
- Bring-up date (required)
- Assigned to (attorney/staff dropdown)
- Reason/Notes (textarea)
- Priority (Low/Medium/High/Urgent)
- Recurring? (checkbox → frequency selector)
- Notification method: Email, SMS, In-App (multi-select)

---

### Module 18: Financial Management — Kenya Enhanced (NEW — from WakiliCMS/Sisu)

**Fee Notes (Kenya Invoice Equivalent):**
- Quotes/Estimates → Fee Notes → Receipts workflow
- Quote creation with itemized professional fees
- Convert quote to fee note with one click
- Fee note numbering (FN-YYYY-NNNN)
- Kenya-specific fee items: professional fees, disbursements, VAT, instruction fees, filing fees, Commissioner for Oaths fees
- Kenya VAT handling (16% standard rate, exempt items, zero-rated items)
- Fee note approval workflow (draft → partner approval → sent to client)
- Credit notes for fee note adjustments
- Pro-forma invoices
- Receipts with official receipt numbers

**M-Pesa Payment Integration:**
- M-Pesa Paybill/Till number configuration in firm settings
- Record M-Pesa payments with transaction code
- M-Pesa transaction reference tracking
- Future: M-Pesa STK push for payment requests
- Payment reconciliation with M-Pesa statements

**Additional Payment Methods (Kenya):**
- Bank Transfer / RTGS / EFT
- M-Pesa
- Cheque (with cheque number tracking)
- Cash (with receipt generation)
- Credit Card
- Pesalink
- Trust account drawdown

**Petty Cash Management:**
- Petty cash float per office/branch
- Petty cash request and approval workflow
- Petty cash expense logging with receipt
- Petty cash reconciliation
- Petty cash report per period

**Requisition System:**
- Expense requisition before incurring cost
- Requisition approval workflow (staff → supervisor → partner)
- Approved requisition linked to case
- Track requisition status (Pending → Approved → Paid → Rejected)
- Supplier/vendor management (name, contact, bank details, KRA PIN)
- Supplier invoice tracking
- Purchase order generation

**Bank Reconciliation:**
- Record bank transactions (manual or import CSV)
- Match bank transactions to system transactions
- Identify unmatched items
- Reconciliation statement generation
- Support multiple bank accounts (client account, office account, petty cash)

---

### Module 19: Client Intake — Kenya Enhanced (NEW)

**Online Intake Forms:**
- Shareable intake form link (embed on firm website or share via WhatsApp/email)
- Custom form builder (drag-and-drop fields per practice area)
- Pre-built templates: Personal Injury, Conveyancing, Corporate, Family, Criminal, Employment
- Form submissions create client record + trigger conflict check + notify assigned attorney
- CAPTCHA / bot protection
- File upload on intake form (supporting documents)
- Terms of engagement acceptance checkbox
- Data Protection Act 2019 consent checkbox

**Enhanced Client Fields (Kenya):**
- National ID Number / Passport Number (encrypted)
- KRA PIN (required for corporate clients)
- County of residence
- Nationality
- Phone (+254 format with validation)
- Alternative phone
- WhatsApp number
- P.O. Box address (still common in Kenya)
- Physical address (separate from postal)
- Next of kin (name, relationship, phone — important for litigation)
- Employer details (for employment cases)

---

### Module 20: Multi-Branch Office Management (NEW — from WakiliCMS)

**Features:**
- Multiple office/branch profiles (name, address, phone, email)
- Branch-specific settings (bank accounts, petty cash floats)
- Users assigned to primary branch
- Cases assigned to branch
- Cross-branch case visibility (partners can see all branches)
- Branch-specific reports (revenue, caseload, productivity per branch)
- Consolidated firm-wide reports
- Branch-specific court station preferences
- Inter-branch file transfer tracking

---

### Module 21: Matter Pipeline / Kanban Board (NEW — from Clio Best Practice)

**Features:**
- Visual kanban board for case/matter progression
- Configurable pipeline stages per practice area:
  - **Conveyancing:** Instruction → Due Diligence → Drafting → Signing → Registration → Completion
  - **Litigation:** Intake → Pre-litigation → Filing → Discovery → Trial → Settlement/Judgment → Enforcement
  - **Corporate:** Instruction → Research → Drafting → Review → Execution → Filing → Completion
- Drag-and-drop cases between stages
- Stage duration tracking (how long in each stage)
- Bottleneck identification (cases stuck too long in a stage)
- Pipeline analytics (conversion rates, average duration per stage)
- Automated actions on stage change (send notification, create task, update status)

---

### Module 22: Automated Workflows (NEW — from Clio/Smokeball Best Practice)

**Features:**
- Rule-based automation engine
- Trigger types: case status change, deadline approaching, document uploaded, payment received, new client created
- Action types: send notification, create task, send email, update field, create calendar event
- Pre-built workflow templates:
  - New case created → assign welcome tasks → send client welcome email → schedule initial consultation
  - Court date in 7 days → notify attorney → create preparation tasks
  - Invoice overdue 30 days → send reminder email → notify admin
  - Practising certificate expiring → alert attorney → alert admin
  - Bring-up due → send SMS + email + in-app notification
- Custom workflow builder (admin only)
- Workflow execution log (audit trail of automated actions)

---

### Module 23: SMS & Communication Integration (NEW — Kenya-Specific)

**SMS Notifications (Africa's Talking or similar):**
- Court date reminders to attorneys
- Bring-up reminders
- Client appointment reminders
- Invoice/fee note sent notification to client
- Payment received confirmation
- Deadline approaching alerts
- Phone number format: +254 XXXXXXXXX
- SMS template management
- SMS delivery status tracking
- SMS cost tracking per message

**WhatsApp Integration (Future Enhancement):**
- Send case updates to clients via WhatsApp Business API
- Receive documents from clients via WhatsApp
- WhatsApp notification preferences per client

**Email Integration:**
- Send fee notes/invoices via email
- Email templates with placeholders
- Track email delivery status
- Attach documents to emails

---

## Best Practices Applied from Research

### From WakiliCMS (15+ years in Kenya, 100+ firms)
1. **Separate court calendar from general calendar** — attorneys need to see court dates at a glance
2. **File bring-up system** — the single most used feature in Kenyan law firms
3. **Requisition approval workflow** — prevents unauthorized expenses
4. **Supplier management** — track court fees, expert witnesses, process servers
5. **Multi-branch with consolidated reporting** — essential for growing firms

### From Clio (#1 globally, 150,000+ users)
1. **Matter pipeline** — visual case progression reduces missed steps
2. **Automated workflows** — reduce manual follow-up by 40%+
3. **Court rules engine** — auto-calculate deadlines from court dates
4. **Online intake forms** — 24/7 client onboarding
5. **Performance insights dashboard** — data-driven firm management

### From Kenya Legal Framework
1. **Client accounts MUST be separate** — Advocates (Accounts) Rules mandate this
2. **AML/CFT compliance is now mandatory** — LSK guidelines issued Oct 2025
3. **Data protection consent required** — Data Protection Act 2019
4. **Practising certificate is annual** — system must track and remind
5. **VAT at 16%** — all fee notes must handle Kenya tax correctly

---

## Implementation Phases (Updated — 8 Phases)

### Phase 1: Foundation (Project Setup + Auth + DB Schema)
**Goal:** Bootable app with auth, full database, and navigation shell

1. Initialize Next.js project with TypeScript + Tailwind CSS
2. Install and configure shadcn/ui (core components)
3. Set up Drizzle ORM with Neon connection string
4. Create ALL 40+ database tables (complete schema from day 1)
5. Run initial migration against Neon
6. Seed Kenya court stations (47 counties), practice areas, sample data
7. Configure NextAuth.js v5 with credentials provider + JWT
8. Build RBAC middleware (route protection by role)
9. Create login + registration pages
10. Build dashboard shell: sidebar, header, user menu, mobile nav
11. Multi-branch awareness in layout (branch selector for admins)
12. Set up `.env.local` with Neon connection string
13. Deploy to Vercel

---

### Phase 2: Core Entities (Dashboard + Attorneys + Clients + KYC)
**Goal:** Working CRUD for attorneys and clients with Kenya compliance

1. Role-based dashboard with KPI stat cards
2. Dashboard charts via Recharts
3. Attorney CRUD with Kenya-specific fields (LSK number, practising certificate)
4. Practising certificate tracking + renewal reminders
5. CPD units tracking and compliance dashboard
6. Attorney license tracking + practice area management
7. Client intake form with Kenya fields (ID/Passport, KRA PIN, county, +254 phone)
8. KYC document collection and verification workflow
9. Client risk assessment (AML compliance)
10. Client CRUD: list, profile, edit, contact history
11. Conflict of interest checker
12. Global search command palette (Cmd+K)
13. Online client intake form (shareable link)

---

### Phase 3: Case Management + Kenya Courts + Bring-Ups
**Goal:** Full case lifecycle with Kenya court system and bring-up workflow

1. Case CRUD with status workflow and matter pipeline (kanban)
2. Kenya court hierarchy selection (pre-populated court stations)
3. Court file number tracking (separate from firm file number)
4. Case list with advanced filtering
5. Case detail page with tabs (Overview, Timeline, Documents, Billing, Notes, Parties)
6. Case assignments (multiple attorneys, lead attorney)
7. Case notes + auto-generated timeline events
8. Auto-generated case numbers (YYYY-NNNN)
9. **File bring-up system** — create, manage, track, recurring bring-ups
10. Dashboard widget: "Today's Bring-Ups"
11. Court filing tracking (filed, accepted, rejected, served)
12. Service of documents log

---

### Phase 4: Calendar + Deadlines + Tasks + Workflows
**Goal:** Full calendar with court dates, automated workflows

1. Calendar view (month/week/day) with **separate court calendar**
2. Calendar events CRUD tied to cases
3. Color coding by event type (court = red, meeting = blue, deadline = orange)
4. Deadline tracker with statute of limitations warnings
5. Task management (list/kanban view with assignment)
6. Automated workflow engine (triggers + actions)
7. Pre-built workflow templates (new case, court date reminder, overdue invoice, etc.)
8. SMS notification integration (Africa's Talking or similar)
9. Email notification integration
10. Notification preferences per user

---

### Phase 5: Documents + Time/Expense + Requisitions
**Goal:** File management, billable hours, and expense approval workflow

1. File upload with drag-and-drop (storage provider abstraction)
2. Document list with search and category filtering
3. Document versioning + templates
4. Court document bundle preparation
5. Time entry CRUD with manual entry + live floating timer
6. Billable vs non-billable + hourly rate auto-populate
7. Weekly timesheet view
8. Expense logging with receipt upload
9. **Requisition system** — request → approve → pay workflow
10. Supplier/vendor management (name, KRA PIN, bank details)
11. Supplier invoice tracking

---

### Phase 6: Billing (Kenya Enhanced) + Payments
**Goal:** Fee notes, quotes, M-Pesa, trust accounting, petty cash

1. **Quotes/Estimates** → **Fee Notes** → **Receipts** workflow
2. Fee note generation from unbilled time + expenses
3. Kenya VAT handling (16%, exempt, zero-rated)
4. Fee note PDF with firm branding
5. Fee note approval workflow (draft → partner approval → sent)
6. Payment recording: M-Pesa, Bank Transfer, Cheque, Cash, Pesalink, Trust drawdown
7. M-Pesa transaction code tracking and reconciliation
8. Trust/client account management (mandatory separation per Advocates Act)
9. Trust transaction ledger with per-client running balance
10. Three-way trust reconciliation
11. **Petty cash management** — float, requests, approvals, reconciliation
12. **Bank reconciliation** — match bank transactions to system transactions
13. Credit notes and write-offs
14. Invoice aging report (current, 30, 60, 90+ days)

---

### Phase 7: Client Portal + Messaging
**Goal:** Client-facing portal and secure communication

1. Client portal layout (separate route group, restricted nav)
2. Portal dashboard: cases, documents, invoices, messages
3. Case status view (read-only, no private notes)
4. Document access (download shared documents only)
5. Fee note/invoice viewing and payment history
6. Secure messaging between client and attorney
7. Internal messaging between attorneys
8. Message threads linked to cases
9. In-app notification system (bell icon)
10. SMS notifications for key events (court dates, new documents, payment confirmations)

---

### Phase 8: Reports + Settings + Multi-Branch + Polish
**Goal:** Analytics, configuration, multi-branch, and production readiness

1. Reports: caseload, revenue, billing aging, productivity, trust reconciliation
2. Branch-specific reports + consolidated firm-wide reports
3. AML compliance report
4. CPD compliance report
5. CSV + PDF export for all reports
6. Settings: firm profile, multi-branch management, user management
7. Practice area management, billing rates, court stations
8. Email/SMS template management
9. Custom fields configuration
10. Tags/labels system
11. Audit log viewer
12. Data import/export (CSV upload for bulk client/case import)
13. Responsive design polish (mobile sidebar, responsive tables)
14. Loading states, error boundaries, empty states throughout
15. Final Vercel deployment

---

## Architecture Patterns

- **Server Actions** for all mutations (validate → auth → authorize → execute → audit → revalidate)
- **Server Components** for all reads (direct DB queries, no API routes for data fetching)
- **Zod** validation on every form and action
- **RBAC middleware** at route level + permission checks in actions
- **Audit logging** for sensitive operations (case changes, billing, document access)
- **DB connection abstraction** — same codebase runs on Neon, Vercel, and on-prem Windows PostgreSQL by changing only `DATABASE_URL`

---

## Verification

After each phase:
1. Run `npm run build` — ensure no TypeScript errors
2. Run `npx drizzle-kit push` — verify schema syncs to Neon
3. Test all CRUD flows manually in the browser
4. Verify RBAC — login as each role and confirm correct access
5. Check Vercel deployment — push to main branch and verify live demo

### Research Methodology

This analysis was compiled from:
- **10 Exa web searches** covering global legal tech (CosmoLex, Clio, Centerbase, PracticePanther, RunSensible, Lawcus, StrongSuit, Intapp, CaseGen, LEAP, CARET Legal, LawVu, Crespect), Kenya-specific systems (Wakili CRM, WakiliCMS, EliteLaw, Wakili Digital, Sisu by Lenhac), and regulatory sources (LSK, Advocates Act, FATF, POCAMLA)
- **Full codebase audit** of all 55 pages, 50+ database tables, 98+ server actions, 18 validators, 73+ components
- **Kenya regulatory documents**: LSK CPD Accreditation Guidelines 2023, Advocates (CPD) Rules LN 43/2014, Advocates (Practising Certificate)(Fees) Rules LN 110/2024, LSK AML/CFT/CPF Guidelines Oct 2025, Advocates (Accounts) Rules, Kenya Data Protection Act 2019

**Current Overall Score: 123 of 194 features implemented (63%), 22 partial, 49 missing**

---

### 1. CASE & MATTER MANAGEMENT — Currently 90% (13/15 implemented)

**What's implemented:** Full CRUD, 6-status workflow, auto case numbering, 4 priority levels, pipeline/Kanban, multi-attorney assignments with roles, private/public notes, auto-generated timeline, 7 party roles, opposing party/counsel, statute of limitations field, estimated value, tags.

**To reach 100% — 2 items needed:**

| # | Gap | What to Build | Why It Matters | Effort |
|---|-----|---------------|----------------|--------|
| 1 | **Case budgeting** | Add `budget` (decimal) and `budgetNotes` (text) columns to `cases` table. Create a "Budget vs Actual" tab on case detail showing: budget amount, total billed time + expenses, remaining budget, burn rate percentage. Add budget exceeded alert (workflow trigger). | Clio, Filevine, and Crespect all offer per-matter budgets. Corporate clients in Kenya increasingly demand budget certainty. Without this, firms cannot track profitability per case or alert when costs exceed estimates. WakiliCMS enterprise clients cite this as a top request. | Small — 1 schema column, 1 query, 1 UI component |
| 2 | **Full multi-currency on invoices** | Currently trust accounts support currency but invoices are KES-only. Add `currency` column to `invoices` table (default KES). Add exchange rate field. Support USD, GBP, EUR for international matters. Display amounts in selected currency on invoice PDF. | Kenya law firms handling cross-border transactions (trade, IP, maritime) bill in USD/GBP. Crespect lists multi-currency as a top-5 feature. EliteLaw and WakiliCMS both support this. Without it, firms must create invoices outside the system for international clients. | Medium — schema change, form update, PDF formatting |

---

### 2. CLIENT / CRM — Currently 75% (9/12 implemented)

**What's implemented:** Full CRUD, individual + organization types, Kenya-specific fields (National ID, KRA PIN, county, PO Box), 3 client statuses, contact log with 5 types, referral source, client portal, prospective status.

**To reach 100% — 3 items needed:**

| # | Gap | What to Build | Why It Matters | Effort |
|---|-----|---------------|----------------|--------|
| 1 | **Lead/prospect CRM pipeline** | Currently only a `prospective` status exists but no visual pipeline. Build a dedicated CRM pipeline view: Lead → Contacted → Consultation Scheduled → Engaged → Retained (or Lost). Add `leadSource`, `leadScore`, `followUpDate`, `lostReason` fields. Create a Kanban board at `/clients/pipeline`. Add conversion analytics (lead-to-client rate). | Lawmatics (2026 best CRM for law firms), Clio Grow, and PracticePanther all provide intake-to-retention pipelines. Wakili CRM advertises "Simplified Client Intake" as a headline feature. Without a pipeline, the firm cannot track which prospects are converting, where leads drop off, or which marketing channels work. 53% of legal consumers now research firms online before engaging (NYSBA survey). | Medium — new fields, new page, Kanban component |
| 2 | **Client satisfaction tracking** | Add a `client_feedback` table: `clientId`, `caseId`, `rating` (1-5), `feedbackText`, `feedbackDate`, `surveyType` (post_case, periodic, nps). Build a simple survey form that can be sent via email/portal link after case closure. Display average satisfaction score on client profile and in firm-wide reports. Add Net Promoter Score (NPS) calculation. | MyCase and Clio both offer client satisfaction features. The Law Society UK recommends client feedback as best practice. Kenyan firms competing for corporate clients need measurable service quality. Without this, there's no data-driven way to improve client service or identify at-risk relationships. | Medium — new table, form, report widget |
| 3 | **Relationship mapping** | Add a `client_relationships` table: `clientId`, `relatedClientId`, `relationshipType` (spouse, parent_company, subsidiary, director, partner, guarantor, beneficiary). Display relationship graph on client detail page. Cross-reference during conflict checks (a conflict with Company X should flag Director Y). | Intapp and Clio list relationship intelligence as a premium feature. Kenyan law frequently involves family and corporate relationships where conflicts cascade (e.g., conveyancing between related parties, corporate groups). Without this, conflict checks miss indirect relationships. Crespect's 21-feature guide lists "opponents and third parties" tracking as feature #1. | Medium — new table, UI graph, conflict search enhancement |

**Bonus — Marketing automation (Advanced):** Email/SMS templates exist in the system but there's no campaign engine. This requires integration with an email service (SendGrid, Resend) and is better deferred to a future phase. Most Kenya-focused systems (EliteLaw, Wakili Digital) don't offer this either.

---

### 3. KENYA REGULATORY COMPLIANCE — Currently 63% (10/16 implemented)

**What's implemented:** Practising certificates, CPD tracking, bar number registry, disciplinary records, attorney licenses (6 statuses), KYC documents with verification workflow, client risk assessments (4 levels), trust accounts with overdraft prevention, Senior Counsel / Commissioner for Oaths / Notary Public flags.

**To reach 100% — 6 items needed:**

| # | Gap | What to Build | Why It Matters | Effort |
|---|-----|---------------|----------------|--------|
| 1 | **Professional indemnity insurance tracking** | Add `professional_indemnity` table: `attorneyId`, `insurerName`, `policyNumber`, `coverAmount`, `premiumAmount`, `startDate`, `expiryDate`, `status` (active, expired, pending_renewal), `certificateUrl`. Add expiry alerts (60, 30, 7 days). Display on attorney profile. Block practising certificate renewal warning if expired. | **Mandatory under the Advocates Act.** Section 26(2)(c) requires proof of professional indemnity insurance for practising certificate issuance. The LSK mandates minimum cover of KES 5 million. An attorney cannot legally practise without valid PI insurance. The LSK portal checks this during annual PC renewal. No Kenya system currently tracks this well — this is a competitive advantage. | Small — new table, form, alert logic |
| 2 | **STR (Suspicious Transaction Report) filing** | Add `suspicious_transaction_reports` table: `clientId`, `caseId`, `reportedBy`, `reportDate`, `transactionDetails`, `suspicionBasis`, `riskIndicators`, `status` (draft, filed_with_frc, acknowledged), `frcReferenceNumber`, `filingDate`. Build STR form matching FRC (Financial Reporting Centre) requirements. Add "Flag as Suspicious" button on trust transactions and client payments. Generate STR document in prescribed FRC format. | **Mandatory under POCAMLA 2009, Section 44.** Advocates are "reporting institutions" under the Proceeds of Crime and Anti-Money Laundering Act. Failure to file STRs carries criminal penalties including imprisonment. Kenya was placed on the FATF grey list in 2024, and the LSK AML/CFT Guidelines (Oct 2025) specifically require law firms to have STR procedures. This is the single most critical compliance gap in the system. | Medium — new table, form, document generation |
| 3 | **AML compliance officer designation** | Add `amlComplianceOfficer` field to `firmSettings` (reference to a user). Add AML compliance dashboard showing: pending KYC verifications, high-risk clients, overdue risk assessments, STR filing status, training compliance. Add annual AML compliance report generation. | **Required by LSK AML/CFT Guidelines 2025.** Every law firm must designate an AML Compliance Officer responsible for ensuring the firm's AML/CFT program. The LSK actively recruited for this role (per their Dec 2024 job posting). The compliance officer must oversee CDD, file STRs, conduct staff training, and submit periodic reports. Without this designation in the system, there's no accountability chain. | Small — settings field, dashboard page |
| 4 | **LSK membership fees tracking** | Add `lsk_membership` table: `attorneyId`, `year`, `membershipCategory` (Advocate, Senior Counsel), `annualFee`, `paymentDate`, `paymentReference`, `status` (paid, unpaid, overdue). Track annual fee of KES 15,000 (per Advocates (Practising Certificate)(Fees) Rules, LN 110/2024). Add payment reminders. Show compliance status on attorney profile. | Practising certificate issuance requires current LSK membership fees to be paid. Late application incurs a 25% penalty. WakiliCMS tracks this. Without tracking, the firm risks attorneys practising without valid membership — a disciplinary offence under the Advocates Act. | Small — new table, form, reminder |
| 5 | **Data Protection Act 2019 compliance** | Add `data_consents` table: `userId`/`clientId`, `consentType` (data_processing, marketing, third_party_sharing), `consentGiven` (boolean), `consentDate`, `withdrawalDate`, `ipAddress`. Add consent checkboxes to client intake and portal registration forms. Build "My Data" page in client portal with: download my data (JSON/CSV export), request deletion, view processing purposes. Add data breach notification template. Add privacy policy acceptance tracking. | **Mandatory under Kenya Data Protection Act 2019.** The Office of the Data Protection Commissioner (ODPC) actively enforces this. Fines up to KES 5 million or 1% of annual turnover. The Act requires: lawful basis for processing (consent), data subject rights (access, rectification, deletion, portability), data breach notification within 72 hours, and a Data Protection Impact Assessment for high-risk processing. Law firms process highly sensitive personal data. Wakili CRM advertises "end-to-end encryption" and the Data Protection Act as compliance features. | Medium — new table, consent UI, data export, portal page |
| 6 | **PEP (Politically Exposed Persons) screening** | Add `isPep` boolean and `pepDetails` text to `clients` table. Add PEP flag in client intake form with enhanced due diligence workflow. When PEP is flagged, require: senior partner approval, enhanced KYC documentation, ongoing monitoring schedule. Log all PEP-related decisions in audit trail. | **Required by LSK AML/CFT Guidelines 2025 and POCAMLA.** PEPs and their associates require Enhanced Customer Due Diligence (ECDD). The FATF grey list puts extra pressure on Kenya to demonstrate PEP screening. The LSK guidelines specifically mention PEPs as high-risk categories. Failure to screen is a compliance violation. | Small — schema fields, form checkbox, conditional workflow |

---

### 4. CONFLICT OF INTEREST — Currently 57% (4/7 implemented)

**What's implemented:** Cross-entity conflict search with LIKE escaping, 3 severity levels, resolution tracking with role check, conflict audit trail.

**To reach 100% — 3 items needed:**

| # | Gap | What to Build | Why It Matters | Effort |
|---|-----|---------------|----------------|--------|
| 1 | **Automated new-matter conflict check** | Modify `submitIntake()` in `src/lib/actions/intake.ts` and `createCase()` in `src/lib/actions/cases.ts` to automatically trigger `searchConflicts()` on submission. Store auto-check results. If potential/found conflict detected, block case creation and notify admin. Add conflict check to `createClient()` as well. | Centerbase, Intapp, and every major system auto-run conflicts on new matter opening. The LSK Code of Conduct (Gazette Notice 5212, 2017) requires advocates to check for conflicts before accepting instructions. Manual-only checks are easily forgotten — the system should enforce this. Intapp reports that auto-checks reduce conflict clearance time by 60%. | Small — wire existing function into intake/case/client actions |
| 2 | **Lateral hire conflict screening** | Add "Attorney Conflict Check" flow: when a new attorney is added via `createAttorney()`, auto-search the attorney's name, previous firms, and known clients against existing cases and parties. Display results before confirming the hire. Add `previousFirms` field to attorney profile. | Intapp Conflicts specifically markets this feature. When a new attorney joins, their prior client relationships may conflict with current firm matters. The LSK Code of Conduct requires this. Large Kenyan firms (e.g., those with 50+ advocates) regularly face this during lateral hires. Without this, the firm risks unknowing conflicts that could lead to disqualification motions. | Medium — new field, search flow, UI |
| 3 | **Ethical wall management** | Add `ethical_walls` table: `caseId`, `attorneyId`, `reason`, `createdBy`, `createdAt`, `active` (boolean). When an attorney has a conflict on a case, create an ethical wall that restricts that attorney's access to the case data. Modify case queries to filter out walled attorneys. Add wall status indicator on case detail page. Log all wall creation/removal in audit trail. | Intapp and Clio both offer ethical wall/screen features. The LSK Code of Conduct (Part IV — Conflict of Interest) allows firms to manage conflicts through Chinese walls/ethical screens in some circumstances. Without system-enforced walls, access restrictions rely on verbal agreements — which are indefensible in disciplinary proceedings. | Medium — new table, query modifications, access control logic |

---

### 5. DOCUMENT MANAGEMENT — Currently 45% (5/11 implemented)

**What's implemented:** Document upload/storage (URL-based), 8 categories, version control with change notes, 4 statuses, templates with placeholder support.

**To reach 100% — 6 items needed:**

| # | Gap | What to Build | Why It Matters | Effort |
|---|-----|---------------|----------------|--------|
| 1 | **Full-text search** | Integrate PostgreSQL full-text search (`tsvector`/`tsquery`) on document titles and descriptions. For document content search, extract text from uploaded PDFs/DOCX on upload (using a library like `pdf-parse` or `mammoth`) and store in a `searchContent` column. Add full-text search index. Update document list page with content search toggle. | Wakili CRM advertises "full-text search across Swahili or English docs" as a headline feature. LEAP Legal calls this "one-click search." Centerbase lists document search as a must-have. Without content search, attorneys must open individual documents to find relevant information — a massive time waste when a case has 100+ documents. | Medium — text extraction library, DB index, search query |
| 2 | **Document automation/merge engine** | Build a merge engine that replaces template placeholders (e.g., `{{client_name}}`, `{{case_number}}`, `{{date}}`, `{{court_name}}`) with actual data from case/client records. Add "Generate from Template" button on case detail and document list pages. Support output as DOCX (using `docx` npm package) or PDF. Pre-build Kenya-specific templates: demand letter, engagement letter, power of attorney, affidavit, statutory declaration. | Smokeball's #1 feature is document automation. Clio, Lawcus, and Filevine all offer template merge. WakiliCMS offers document templates. Kenya law firms generate repetitive documents daily (demand letters, affidavits, court pleadings). Manual copy-paste from templates is error-prone and slow. This is a high-value productivity feature. | Medium — merge engine, DOCX generation, template builder |
| 3 | **E-signature integration** | Integrate with a signature service. Options: (a) Simple in-app signature (canvas-based signature pad stored as image), (b) External integration with DocuSign/SignNow API. Add signature request workflow: attorney sends document for signature → client receives link → client signs → document status updates to "signed." Store signed copy as new version. | Clio, MyCase, and PracticePanther all offer e-signatures. The Kenya Electronic Transactions Act (2008) recognizes electronic signatures as legally valid. Wakili CRM advertises "sign documents electronically" in their portal. Without this, clients must print, sign, scan, and return documents — adding days to conveyancing and corporate transactions. | Medium-Large — third-party API or canvas implementation |
| 4 | **Court bundle generation** | Add "Create Court Bundle" action on case detail page. Allow selecting documents and ordering them. Generate a combined PDF with: cover page (case title, court, file number), table of contents with page numbers, sequential pagination across all documents, bundle index. Support Kenya court filing requirements (numbered pages, indexed). | Specific to litigation practice. Kenya courts require organized bundles for hearings. LEAP Legal offers this as "matter management" feature. OpusTwo specializes in this for litigation. Without this, paralegals spend hours manually assembling and paginating court bundles — a task that should be automated. | Medium — PDF merge library, cover page generation, pagination |
| 5 | **OCR / document scanning** | Add OCR capability for scanned documents using Tesseract.js (client-side) or a cloud OCR API. On upload of image/scanned PDF, extract text and store for full-text search. Add "Scan Document" option that processes uploaded images. | Many Kenya court documents are still physical. Firms receive hand-delivered documents, faxes, and scanned copies. Without OCR, scanned documents are unsearchable black boxes in the system. Clio and Smokeball both offer OCR. | Medium — OCR library integration, processing pipeline |
| 6 | **Bilingual document support (English/Swahili)** | Add `language` field to documents and templates. Support Swahili metadata and search terms. Create Swahili versions of standard templates (statutory declaration, affidavit). | Wakili CRM specifically lists Swahili document search. Kenya's Constitution recognizes both English and Swahili as official languages. Some court proceedings (especially in lower courts) use Swahili. | Small — metadata field, template translations |

---

### 6. BILLING & INVOICING — Currently 67% (10/15 implemented)

**What's implemented:** Full invoice CRUD, 5 billing types, 8-status workflow, server-side line item computation, 16% VAT, 6 payment methods (incl. M-Pesa transaction ID), receipts, credit notes, quotes with 5 statuses.

**To reach 100% — 5 items needed:**

| # | Gap | What to Build | Why It Matters | Effort |
|---|-----|---------------|----------------|--------|
| 1 | **M-Pesa API integration** | Integrate with Safaricom Daraja API for: (a) STK Push — send payment request to client's phone, (b) C2B — receive payments to firm's Paybill/Till, (c) Transaction status query, (d) Auto-reconciliation of M-Pesa statements. Configure Paybill/Till number in firm settings. Auto-match incoming M-Pesa payments to invoices by account reference. | **This is the #1 competitive feature for Kenya.** Wakili CRM and EliteLaw both offer M-Pesa integration. M-Pesa processes over KES 35 trillion annually in Kenya. Most client payments for small-to-mid firms come via M-Pesa. Currently our system only records M-Pesa transaction codes manually — there's no auto-reconciliation or payment request capability. Without API integration, payment recording is manual and error-prone. | Medium-Large — Daraja API integration, callback handling, reconciliation |
| 2 | **Online payment portal** | Add a payment page accessible from client portal invoice view. Support: M-Pesa (via STK Push), card payments (via a gateway like Pesapal, Flutterwave, or Stripe). Generate payment link that can be emailed/WhatsApped to clients. Update invoice status automatically on successful payment. | PracticePanther, MyCase, and Clio all offer online payments. 70% of legal consumers expect electronic payment options (NYSBA survey). Pesapal is Kenya's leading payment gateway supporting M-Pesa, Airtel Money, cards, and bank transfers. Without this, clients must make payments outside the system and the firm must manually reconcile. | Medium-Large — payment gateway integration, webhook handling |
| 3 | **KRA e-TIMS integration** | Integrate with KRA's Electronic Tax Invoice Management System (e-TIMS) for: (a) auto-submission of tax invoices to KRA, (b) retrieval of e-TIMS invoice number, (c) QR code on invoices for KRA verification. Store e-TIMS control unit number in firm settings. Add e-TIMS submission status to invoice records. | **Becoming mandatory for all VAT-registered businesses in Kenya.** KRA is phasing in e-TIMS requirements. Law firms billing above the VAT threshold (KES 5 million annually) must comply. Non-compliance carries penalties. No Kenya legal software currently offers this integration — it's a major competitive advantage. | Medium — KRA API integration, QR code generation |
| 4 | **Bulk invoicing** | Add "Generate Invoices" batch action: select multiple cases with unbilled time/expenses, preview all invoices, confirm and create in batch. Add batch send capability (email all generated invoices). Add batch PDF download (zip file of all invoice PDFs). | Clio and PracticePanther offer bulk invoicing. Firms with 50+ active cases need to generate monthly invoices efficiently. Without this, creating invoices one-by-one for each case takes hours at month-end. WakiliCMS users report this as a top time-saver. | Medium — batch action, multi-invoice generation, zip download |
| 5 | **Invoice aging report** | Build dedicated aging report page showing: Current (0-30 days), 31-60 days, 61-90 days, 90+ days buckets. Display by client with subtotals. Show total outstanding per bucket. Add aging chart (stacked bar). Export to CSV/PDF. Add aging badge on billing dashboard. | Every major legal billing system offers aging reports. The American Bar Association lists aging reports as essential for firm financial health. Without this, the firm cannot identify collection problems or prioritize follow-up on overdue accounts. This was listed in Phase 8 of the plan but not yet implemented. | Small-Medium — query grouping by date ranges, report UI |

---

### 7. TRUST / CLIENT MONEY ACCOUNTING — Currently 80% (8/10 implemented)

**What's implemented:** Client + general account types, atomic deposit/withdrawal with TOCTOU protection, balance tracking, full transaction log (5 types), overdraft prevention via conditional UPDATE, transfer type, interest tracking, case-associated transactions.

**To reach 100% — 2 items needed:**

| # | Gap | What to Build | Why It Matters | Effort |
|---|-----|---------------|----------------|--------|
| 1 | **Three-way reconciliation** | The schema has `bankReconciliations` table but needs a dedicated reconciliation page. Build: (a) Bank balance input (from bank statement), (b) System/book balance (sum of all trust transactions), (c) Client balances (sum of all per-client sub-ledgers). Display all three with a reconciliation status. Highlight discrepancies. Generate reconciliation statement PDF. Add reconciliation date tracking. | **Mandatory under Advocates (Accounts) Rules.** Three-way reconciliation is the gold standard for trust accounting compliance. AJS Legal Software (South Africa, 45+ years) lists this as their #1 feature. The LSK requires firms to maintain reconciled trust accounts and may audit at any time. Discrepancies can lead to suspension or striking off. The schema exists — it just needs the UI and reconciliation logic. | Medium — reconciliation logic, comparison UI, PDF generation |
| 2 | **Trust account reporting** | Build dedicated trust reports: (a) Client trust balance summary (all clients with trust balances), (b) Trust transaction report (filterable by date, client, type), (c) Trust reconciliation report (for LSK submission), (d) Dormant trust funds report (balances with no activity for 12+ months), (e) Annual trust account return (format prescribed by LSK). Export all to PDF/CSV. | **Required by the Advocates (Accounts) Rules.** Advocates must file annual returns to the LSK showing trust account status. The Advocates Complaints Commission can request trust reports at any time. LexPro (South Africa) specifically highlights "Legal Practice Act compliant trust reports" as a key feature. Without dedicated reports, generating LSK-required returns is a manual spreadsheet exercise. | Medium — queries, report pages, PDF generation |

---

### 8. TIME TRACKING & EXPENSES — Currently 70% (7/10 implemented)

**What's implemented:** Full time entry CRUD, billable/non-billable toggle, timer with start/end timestamps, 7 expense categories with receipt URLs, requisition approval workflow (5 statuses), invoice linkage, billing rates table.

**To reach 100% — 3 items needed:**

| # | Gap | What to Build | Why It Matters | Effort |
|---|-----|---------------|----------------|--------|
| 1 | **Batch time entry** | Add "Weekly Timesheet" view: grid with days as columns, cases as rows. Allow entering hours in each cell. Save all entries in one submit. Add "Copy from Previous Week" function for recurring work patterns. | Smokeball and Clio offer batch/weekly timesheet entry. Attorneys who forget to log time daily need to catch up weekly. Without batch entry, each entry requires opening a form, selecting a case, and submitting — tedious for 20+ entries. | Medium — grid UI component, batch insert action |
| 2 | **UTBMS activity codes** | Add `activityCode` field to `timeEntries` table. Pre-populate with UTBMS (Uniform Task-Based Management System) codes: L110 (Fact Investigation), L120 (Analysis/Strategy), L130 (Experts), L140 (Documents), L150 (Court Proceedings), etc. Allow custom codes. Use in reports for time analysis by activity type. | Filevine and Centerbase support UTBMS. Corporate clients in Kenya (especially multinational companies) increasingly require UTBMS-coded billing for audit purposes. The standard enables firms to analyze where time is spent across activity types. Without this, time analysis is limited to case-level granularity. | Small — enum/lookup table, field on time entry form |
| 3 | **Mileage/travel calculator** | Enhance the "travel" expense category with: `distanceKm` field, configurable per-km rate (currently KES 10-15/km in Kenya), auto-calculated amount from distance × rate, origin/destination fields. Optionally integrate with Google Maps API for distance calculation. | Travel is a significant expense for Kenya litigation firms (attending courts across 47 counties). Manual calculation is error-prone. WakiliCMS and Sisu by Lenhac both track travel expenses. Without auto-calculation, travel reimbursements are inconsistent and may be under/over-claimed. | Small — additional fields, calculation logic |

---

### 9. CALENDAR & SCHEDULING — Currently 82% (9/11 implemented)

**What's implemented:** Full event CRUD with 7 types, court hearing type + court date flag, deadline tracking with priority and statutory flag, recurring event support, reminder configuration, event attendees with response status, 4-status task workflow, bring-up system with 4 statuses.

**To reach 100% — 2 items needed:**

| # | Gap | What to Build | Why It Matters | Effort |
|---|-----|---------------|----------------|--------|
| 1 | **External calendar sync (Google/Outlook)** | Implement iCal (.ics) feed generation: create an API route (`/api/calendar/ical/[userId]`) that generates an iCal feed of the user's events. Users subscribe to this URL in Google Calendar or Outlook. For two-way sync (future), integrate with Google Calendar API or Microsoft Graph API. Add "Subscribe to Calendar" button in settings with the feed URL. | Clio, PracticePanther, and MyCase all offer calendar sync. Attorneys use personal calendars alongside firm calendars. Without sync, attorneys must manually cross-reference two calendars, leading to double-bookings and missed court dates. 87% of attorneys use smartphones for scheduling (ABA TechReport). The iCal feed is the simplest approach requiring no OAuth setup. | Medium — iCal generation library, API route, settings UI |
| 2 | **Court rules-based deadline auto-calculation** | Build a `court_rules` table: `courtType`, `eventType`, `deadlineName`, `daysFromEvent`, `direction` (before/after), `isBusinessDays`. Pre-populate with Kenya court rules (e.g., Civil Procedure Rules: response 15 days after service, appeal 30 days after judgment). When a court hearing date is added, auto-generate all rule-based deadlines. Allow custom rules per court type. | Clio and Smokeball offer rules-based deadline calculators. Kenya's Civil Procedure Rules, Appellate Jurisdiction Rules, and various tribunal rules prescribe specific timeframes. Missing a statutory deadline is malpractice. Currently, attorneys must manually calculate and create each deadline — this should be automated from court rules. No Kenya system offers this — major competitive advantage. | Medium — rules table, calculation engine, auto-deadline creation |

---

### 10. COURT & FILING MANAGEMENT — Currently 71% (5/7 implemented)

**What's implemented:** Court registry with level/jurisdiction, court stations by county, 5-status filing tracking, 6 service methods, proof of service URLs with served_to/served_by tracking.

**To reach 100% — 2 items needed:**

| # | Gap | What to Build | Why It Matters | Effort |
|---|-----|---------------|----------------|--------|
| 1 | **E-filing integration readiness** | Add `eFilingReference` and `eFilingStatus` fields to `courtFilings`. Build document preparation workflow matching Kenya Judiciary e-filing format requirements. Add e-filing checklist per case type. Store e-filing confirmation receipts. Add link/button to Kenya Judiciary e-filing portal (https://efiling.court.go.ke). Future phase: direct API integration when Kenya Judiciary opens their API. | The Kenya Judiciary has been rolling out electronic filing since 2020 (Practice Directions on Electronic Case Management). The Nairobi High Court and Court of Appeal already use e-filing. This is expanding to all courts. WakiliCMS and Sisu already prepare documents for e-filing. Without readiness, firms must prepare documents separately for the e-filing portal. | Small-Medium — fields, checklist UI, link integration |
| 2 | **Cause list tracking** | Add `cause_lists` table: `courtId`, `date`, `caseNumber`, `caseTitle`, `courtRoom`, `time`, `judge`, `status` (listed, heard, adjourned, struck_out). Build daily cause list view showing all firm cases appearing in court today. Add "Today's Court Appearances" dashboard widget. Allow manual entry or future scraping from Kenya Judiciary cause list portal. | WakiliCMS offers cause list tracking. Kenya courts publish daily cause lists showing which cases will be heard. Attorneys must check these daily to know when their cases are called. Without tracking, attorneys miss cause list entries and fail to appear — resulting in cases being struck out or adverse orders. | Small-Medium — new table, dashboard widget, list view |

---

### 11. COMMUNICATION & MESSAGING — Currently 43% (3/7 implemented)

**What's implemented:** Internal direct messaging with thread support, client messaging via portal with read status, 6 notification types with link URLs.

**To reach 100% — 4 items needed:**

| # | Gap | What to Build | Why It Matters | Effort |
|---|-----|---------------|----------------|--------|
| 1 | **SMS API integration** | Integrate with Africa's Talking API (Kenya's leading SMS gateway): (a) Send SMS from system (court reminders, payment confirmations, appointment reminders), (b) Delivery status tracking, (c) SMS cost per message tracking, (d) Bulk SMS capability. Configure API key and sender ID in firm settings. Use existing SMS templates. Phone format validation: +254XXXXXXXXX. | Wakili CRM and Sisu both offer SMS. Africa's Talking is the standard SMS API for Kenya (used by Safaricom, banks, and government). SMS reaches attorneys and clients who may not check email. Kenya has 60M+ mobile subscriptions. Without SMS integration, the SMS templates and smsLog table are unused infrastructure. | Medium — API integration, sending service, delivery tracking |
| 2 | **WhatsApp Business API integration** | Integrate with WhatsApp Business API (via Africa's Talking or Meta Cloud API): (a) Send case updates to clients, (b) Share documents via WhatsApp, (c) Receive messages from clients, (d) WhatsApp number field on client record (already in plan as `whatsappNumber`). Add notification preference per client (SMS, email, WhatsApp, in-app). | Wakili CRM lists WhatsApp integration as a feature. WhatsApp has 15M+ users in Kenya — it's the dominant messaging platform. Clients prefer WhatsApp over email for quick updates. Without this, attorneys communicate via personal WhatsApp with no audit trail, creating compliance and data protection risks. | Medium-Large — WhatsApp Business API, message routing, audit logging |
| 3 | **Email SMTP integration** | Integrate with an email service (Resend, SendGrid, or Nodemailer with SMTP): (a) Send invoices/fee notes via email, (b) Send deadline reminders, (c) Send welcome emails to new clients, (d) Send password reset emails (currently planned but needs SMTP). Use existing email templates with placeholder replacement. Track delivery status. | Every major legal system sends email. Currently email templates exist but there's no sending capability. Password reset flow requires email. Invoice delivery requires email. Without SMTP integration, all communication is manual — attorneys must copy invoice PDFs and email them from personal accounts. | Medium — SMTP/API integration, template rendering, delivery tracking |
| 4 | **Push notifications** | Implement browser push notifications using the Web Push API: (a) Notification permission request on first login, (b) Push for: new messages, deadline approaching, court date reminders, payment received, (c) Service worker for background notifications. Alternatively, implement Server-Sent Events (SSE) for real-time in-app notifications without page refresh. | Clio and MyCase offer push notifications. Without push, users must refresh the page to see new notifications. Critical alerts (court date in 1 hour, deadline today) need immediate delivery. The current notification system is poll-based — notifications only appear when the page loads. | Medium — service worker, push subscription, notification service |

---

### 12. REPORTING & ANALYTICS — Currently 56% (5/9 implemented)

**What's implemented:** Admin dashboard with charts, case status distribution, revenue metrics, time tracking statistics, attorney performance page.

**To reach 100% — 4 items needed:**

| # | Gap | What to Build | Why It Matters | Effort |
|---|-----|---------------|----------------|--------|
| 1 | **Profitability analysis** | Build per-case and per-client profitability reports: Revenue (billed + collected) minus Cost (attorney time at cost rate + expenses + disbursements) = Profit. Add cost rate field to attorneys (distinct from billing rate). Show profitability by: case, client, practice area, attorney, branch. Highlight unprofitable cases/clients. | Centerbase specifically lists "Profitability Reporting" as a feature category. CosmoLex and Clio offer profitability dashboards. Without profitability analysis, the firm cannot identify which practice areas, clients, or case types are actually profitable vs. subsidized. This is critical for strategic decision-making. | Medium — cost rate field, profitability calculation query, report UI |
| 2 | **Custom report builder** | Build a drag-and-drop report builder: (a) Select entity type (cases, clients, invoices, time entries), (b) Choose columns to display, (c) Add filters (date range, status, attorney, practice area), (d) Choose grouping/aggregation, (e) Save report as template for reuse. Display results as table with chart option. | Filevine and Clio offer custom reports. Every firm has unique reporting needs. Without a custom builder, every new report request requires developer time. The existing reports cover standard needs but miss firm-specific KPIs. | Large — query builder, dynamic column selection, saved templates |
| 3 | **Report export (PDF/CSV)** | Implement CSV export for all report pages (add "Export CSV" button that serializes table data). Implement PDF export using jsPDF or @react-pdf/renderer (as already in tech stack plan). Add firm branding (logo, name) to PDF reports. Support date range in filename. | Every system offers export. The plan lists "CSV + PDF export for all reports" in Phase 8. Currently the audit log tracks "export" actions but no export functionality exists. Without export, attorneys cannot share reports with partners, clients, or the LSK. | Medium — CSV serialization, PDF generation, download handlers |
| 4 | **Scheduled/automated reports** | Allow admins to schedule reports: (a) Select report type, (b) Set frequency (daily, weekly, monthly), (c) Set recipients (email addresses), (d) Auto-generate and email on schedule. Use a cron job (Next.js API route + Vercel Cron or node-cron for on-prem). Pre-built schedules: weekly billing summary, monthly revenue report, daily overdue invoice list. | Clio offers scheduled reports. Partners need weekly/monthly summaries without logging in. Without automation, someone must manually generate and distribute reports — a task easily forgotten. | Medium — cron scheduling, email integration (depends on SMTP), report generation |

---

### 13. SECURITY & DATA PROTECTION — Currently 79% (11/14 implemented)

**What's implemented:** NextAuth JWT auth, 3-role RBAC with route enforcement, 5-attempt lockout (atomic SQL), SHA-256 password reset tokens, full security headers (CSP, HSTS, X-Frame-Options, etc.), complete audit trail (7 actions), Drizzle ORM + LIKE escaping, Zod validation on all actions, TOCTOU protection, JWT session with middleware user ID check.

**To reach 100% — 3 items needed:**

| # | Gap | What to Build | Why It Matters | Effort |
|---|-----|---------------|----------------|--------|
| 1 | **Two-factor authentication (2FA)** | Implement TOTP-based 2FA: (a) Add `totpSecret` and `twoFactorEnabled` fields to users table, (b) Settings page to enable 2FA with QR code (using `otpauth` library), (c) 2FA verification step after password login, (d) Recovery codes (10 single-use codes stored hashed), (e) Admin can require 2FA for all users. | The Kenya Data Protection Act 2019 requires "appropriate technical measures" to protect personal data. 2FA is increasingly considered a minimum standard for systems handling legal/financial data. The ABA recommends 2FA for all legal software. Clio, PracticePanther, and Centerbase all offer 2FA. Without it, a single compromised password exposes all client data. | Medium — TOTP library, QR generation, verification middleware, recovery codes |
| 2 | **Kenya Data Protection Act compliance** | (Covered in detail under Kenya Regulatory Compliance, item 5 above — consent management, data subject rights, breach notification.) | See section 3.5 above. | See above |
| 3 | **Session security enhancements** | (a) Add session activity log (login time, IP, device), (b) Add "Active Sessions" page showing all logged-in sessions with ability to revoke, (c) Add configurable session timeout (currently relies on JWT expiry), (d) Add IP-based suspicious login detection (alert on login from new IP/location). | Best practice per OWASP. The LSK AML/CFT Guidelines require firms to maintain access logs. Without session management, a compromised account cannot be remotely terminated. Multiple active sessions from different locations should trigger alerts. | Medium — session tracking table, management UI, alert logic |

---

### 14. WORKFLOW AUTOMATION — Currently 50% (3/6 implemented)

**What's implemented:** Workflow template schema with 7 trigger types, 6 action types, execution logging table. All CRUD actions for templates and rules exist.

**To reach 100% — 3 items needed:**

| # | Gap | What to Build | Why It Matters | Effort |
|---|-----|---------------|----------------|--------|
| 1 | **Active runtime workflow engine** | Build an execution engine that: (a) Listens for trigger events (case status change, deadline approaching, document uploaded, payment received, etc.), (b) Evaluates conditions from workflow rules, (c) Executes actions (send notification, create task, update status, etc.), (d) Logs execution results. Implement as a utility function called from relevant server actions (e.g., after `updateCase()`, check for workflows triggered by case_status_change). | Clio reports that automated workflows reduce manual follow-up by 40%+. The schema and CRUD are built — the engine is the missing piece. Without execution, the workflow system is a data entry form with no output. Smokeball specifically markets "automated workflows" as their #2 feature. | Medium-Large — event dispatcher, condition evaluator, action executor, integration with all server actions |
| 2 | **Email/SMS action execution** | Wire workflow email actions to SMTP integration (depends on SMTP setup from Communication section). Wire SMS actions to Africa's Talking API. Template variable replacement at runtime (e.g., `{{client_name}}` → actual client name). | Without email/SMS execution, workflow actions can only create tasks and notifications — limiting automation to in-app actions. The most valuable automations (court date reminders, overdue invoice alerts) require external communication. | Medium — depends on SMTP and SMS integration |
| 3 | **Deadline-approaching trigger** | Implement a scheduled job (cron) that runs daily and: (a) Checks all deadlines approaching within configured windows (7 days, 3 days, 1 day, overdue), (b) Checks practising certificate expiry dates, (c) Checks KYC document expiry dates, (d) Triggers matching workflows. This is the event source for time-based workflow triggers. | Without a scheduled trigger, the workflow engine can only react to user actions (status changes, uploads). Time-based triggers (deadline approaching, certificate expiring) are critical for compliance. The Advocates (CPD) Rules require timely renewal — the system should proactively alert. | Medium — cron job, date comparison queries, trigger dispatch |

---

### 15. FINANCIAL MANAGEMENT — Currently 63% (5/8 implemented)

**What's implemented:** Petty cash CRUD with deposit/withdrawal and categories, bank account registry with SWIFT/currency, bank reconciliation schema with status tracking, full supplier/vendor management with KRA PIN, requisition approval workflow.

**To reach 100% — 3 items needed:**

| # | Gap | What to Build | Why It Matters | Effort |
|---|-----|---------------|----------------|--------|
| 1 | **General ledger / chart of accounts** | Add `chart_of_accounts` table: `accountCode`, `accountName`, `accountType` (asset, liability, equity, revenue, expense), `parentAccountId`, `balance`. Add `journal_entries` table for double-entry bookkeeping. Pre-populate with standard law firm chart of accounts (professional fees income, disbursements, operating expenses, trust liabilities, etc.). Generate trial balance and income statement. | WakiliCMS (enterprise) offers full financial statements. AJS Legal Software (South Africa, 45+ years) is built around legal accounting. Without a general ledger, the system cannot produce financial statements (P&L, balance sheet) — firms need a separate accounting system (QuickBooks, Sage). Full accounting is a major differentiator for enterprise firms but may be excessive for smaller firms. | Large — double-entry bookkeeping engine, chart of accounts, financial statements |
| 2 | **Multi-currency exchange rates** | Add `exchange_rates` table: `fromCurrency`, `toCurrency`, `rate`, `effectiveDate`. Support manual rate entry or integration with an exchange rate API (e.g., Open Exchange Rates). Convert foreign currency transactions to KES for reporting. Show amounts in both original and KES on reports. | Kenya firms handling international matters need to bill in USD/GBP/EUR and report in KES. Without exchange rate tracking, currency conversion is manual and inconsistent. The `bankAccounts` and `trustAccounts` tables already support currency fields — this completes the multi-currency story. | Small-Medium — exchange rate table, conversion utility, report formatting |
| 3 | **Payroll basics** | Add `payroll` and `payroll_items` tables: employee (link to user), basic salary, allowances, deductions (NSSF, NHIF, PAYE, pension), net pay, pay period. Calculate Kenya statutory deductions: PAYE (progressive rates), NSSF (Tier I/II), NHIF (graduated scale), Housing Levy (1.5%). Generate payslips. | WakiliCMS is the only Kenya system offering HR/payroll. Most firms use 3-5 employees — basic payroll saves them from buying a separate HR system. Kenya's Employment Act requires payslips. NSSF, NHIF, and Housing Levy deductions are mandatory. However, this is a large module and may be better served by integration with a payroll service (e.g., WagePoint Kenya, Pesapal Payroll). | Large — Kenya tax calculation engine, payslip generation, statutory returns |

---

### 16. SYSTEM ADMINISTRATION — Currently 70% (7/10 implemented)

**What's implemented:** User management with roles and status, multi-branch with primary designation and user assignment, practice area CRUD, key-value firm settings, custom fields with type/options/required/order, billing rate configuration, email/SMS templates.

**To reach 100% — 3 items needed:**

| # | Gap | What to Build | Why It Matters | Effort |
|---|-----|---------------|----------------|--------|
| 1 | **Data import tool** | Build CSV import for: clients (bulk import existing client list), cases (migrate from spreadsheets), attorneys (onboard firm roster), time entries (historical data). Add column mapping UI, validation preview, duplicate detection, and error reporting. Support encoding for Kenya characters. | Every system offers data import. CosmoLex, Clio, and PracticePanther provide migration tools. Without import, firms must manually re-enter all existing data — a dealbreaker for adoption. EliteLaw markets "1-day setup" which requires import capability. | Medium — CSV parser, column mapper, validation UI, batch insert |
| 2 | **Data export / backup** | Add "Export Data" page (admin only): export all entity types to CSV/JSON. Include a "Full Backup" option that creates a ZIP of all data. Add automated weekly backup to a configured location (for on-prem deployment). Comply with Data Protection Act right to data portability. | Required by Kenya Data Protection Act 2019 (data portability). Essential for on-prem deployment (the production target). Without export/backup, data loss from hardware failure could be catastrophic. Neon handles backups for demo — but production (on-prem Windows PostgreSQL) needs explicit backup. | Medium — data serialization, ZIP generation, scheduled backup job |
| 3 | **Firm branding / white-label** | Add firm logo upload in settings (stored in Vercel Blob / local filesystem). Display logo on: login page, sidebar header, invoice/fee note PDF, receipt PDF, portal landing page, email templates. Add firm color scheme configuration (primary, secondary colors). | MyCase, Clio, and PracticePanther all support firm branding. The plan already mentions "firm logo upload" in Settings and "firm branding" on invoice PDFs. Without branding, generated documents look generic and unprofessional. This is especially important for client-facing outputs (invoices, portal). | Small — file upload, logo display in layout/PDFs, color CSS variables |

---

### 17. CLIENT PORTAL — Currently 60% (6/10 implemented)

**What's implemented:** Portal dashboard, case status viewing (client-scoped), document access/download, invoice viewing with payment history, secure messaging with read status, profile management.

**To reach 100% — 4 items needed:**

| # | Gap | What to Build | Why It Matters | Effort |
|---|-----|---------------|----------------|--------|
| 1 | **Client document upload** | Add "Upload Document" button on portal documents page. Allow clients to upload: evidence, signed documents, ID copies, KYC documents. Uploaded documents go to attorney review queue (status: "pending_review"). Notify assigned attorney of new upload. File type and size restrictions. | Wakili CRM advertises "upload evidence" as a portal feature. Clio and MyCase both allow client uploads. Without this, clients must email documents to their attorney — creating version control issues and no audit trail. KYC document collection specifically requires client uploads (national ID, KRA PIN certificate). | Small — upload form, review queue, notification trigger |
| 2 | **Online payment from portal** | Add "Pay Now" button on invoice detail page in portal. Integrate with payment gateway (Pesapal/M-Pesa STK Push). Show payment confirmation. Auto-update invoice status on successful payment. Show payment receipt. | (Depends on payment gateway integration from Billing section.) Clio, MyCase, and PracticePanther all offer portal payments. 70% of legal consumers expect electronic payment (NYSBA). Without this, clients view invoices but must pay through external channels. | Medium — depends on payment gateway integration |
| 3 | **Appointment scheduling** | Add "Request Consultation" button on portal dashboard. Show attorney availability (based on calendar events). Client selects preferred date/time. Creates a pending calendar event. Attorney approves/reschedules. Confirmation notification to client. | Clio, RunSensible, and Lawcus offer client scheduling. Reduces phone calls for appointment booking. Without this, scheduling is a back-and-forth communication process. The calendar and event system already exists — this adds a client-facing booking interface. | Medium — availability calculation, booking form, approval workflow |
| 4 | **E-signature from portal** | Allow clients to digitally sign documents shared by their attorney. Add "Sign" button on shared documents. Canvas-based signature pad or typed signature. Signed document stored as new version. Notification to attorney when signed. | (Depends on e-signature implementation from Document Management section.) Wakili CRM lists "sign documents electronically" in portal features. The Kenya Electronic Transactions Act 2008 validates electronic signatures. Without this, the signing workflow requires physical meetings or print-sign-scan. | Medium — depends on e-signature implementation |

---

### 18. PUBLIC INTAKE & ONBOARDING — Currently 50% (3/6 implemented)

**What's implemented:** Public intake form at `/intake` with validation, success confirmation page, intake creates prospective client record.

**To reach 100% — 3 items needed:**

| # | Gap | What to Build | Why It Matters | Effort |
|---|-----|---------------|----------------|--------|
| 1 | **Auto conflict check on intake submission** | Modify `submitIntake()` to call `searchConflicts()` with the submitted client name, company name, and opposing party (if provided). Store conflict check results. If conflict found, flag the intake for manual review instead of auto-creating client. Notify admin of flagged intakes. | The LSK Code of Conduct requires conflict checking before accepting new instructions. Automating this on intake ensures no client is onboarded without a check. Currently, an attorney must remember to manually run a conflict check after seeing a new intake — this is easily forgotten. Clio and MyCase auto-check on intake. | Small — wire existing conflict search into intake action |
| 2 | **Custom intake forms per practice area** | Add `intake_form_templates` table: `practiceAreaId`, `formFields` (JSON array of field definitions), `isActive`. Build a form builder (admin) that defines fields per practice area. Render the correct form based on a query parameter or dropdown selection. Pre-build templates for: Personal Injury (accident details, injuries, insurance), Conveyancing (property details, title reference), Family (marriage details, children), Employment (employer, position, dates), Corporate (company details, directors). | Clio Grow and Lawmatics offer customizable intake forms. A personal injury intake needs different fields than a conveyancing intake. Without custom forms, the generic form misses practice-specific information, requiring follow-up calls. Wakili CRM offers "custom forms" as a headline feature. | Medium — form builder, dynamic form renderer, template storage |
| 3 | **Intake analytics/conversion funnel** | Track intake-to-client conversion: (a) Total intakes received, (b) Conflict check results, (c) Converted to client, (d) Converted to case, (e) Lost/declined (with reason). Dashboard widget showing conversion rate. Filter by practice area, source, date range. Track time from intake to engagement. | Lawmatics (best CRM for law firms 2026) centers on intake analytics. Without conversion tracking, the firm cannot measure marketing effectiveness or identify where prospects drop off. This data drives marketing spend decisions. | Small-Medium — status tracking on intake records, analytics query, dashboard widget |

---

### 19. ADVANCED / EMERGING FEATURES — Currently 0% (0/10 implemented)

These are forward-looking features that differentiate leading systems in 2025-2026:

| # | Gap | What to Build | Why It Matters | Effort | Priority |
|---|-----|---------------|----------------|--------|----------|
| 1 | **AI-powered legal research** | Integrate with an LLM API (Claude/GPT) for: case law search, statute lookup, legal memo drafting assistance. Add "Research Assistant" panel on case detail page. | Clio acquired vLex for AI legal research. Wakili CRM offers "Ask WakiliCRM AI." This is the 2026 competitive frontier. | Large | Future Phase |
| 2 | **AI document drafting** | Use LLM to draft documents from templates + case context. Auto-fill template beyond simple placeholders — generate clauses based on case type and jurisdiction. | Smokeball and Clio offer AI drafting. Reduces document preparation time by 60%+ (Clio reports). | Large | Future Phase |
| 3 | **Mobile app / PWA** | Convert to Progressive Web App: add manifest.json, service worker, offline caching. Allow installation on mobile devices. Prioritize: time entry, calendar, notifications, messages. | PracticePanther and MyCase offer native apps. EliteLaw markets "Works on 3G." Kenya attorneys are mobile-first. Responsive design exists but PWA adds installability and offline basics. | Medium | Next Phase |
| 4 | **Offline access** | Service worker caching for read operations. Queue writes for sync when online. Priority: view case details, view calendar, create time entries offline. | Critical for Kenya where internet is intermittent outside Nairobi. EliteLaw markets 3G compatibility. Without offline, the system is unusable during connectivity drops. | Large | Future Phase |
| 5 | **REST API** | Build API routes (`/api/v1/`) for: cases, clients, invoices, time entries, calendar. JWT authentication for API access. OpenAPI/Swagger documentation. Enable third-party integrations and mobile app backend. | Clio has 1500+ integrations via API. Without an API, the system is a closed silo that cannot integrate with email, accounting (QuickBooks), or other tools. | Medium-Large | Next Phase |
| 6 | **Webhook support** | Add webhook configuration: URL, events to subscribe to, secret for HMAC signing. Fire webhooks on: case created, invoice paid, document uploaded, deadline approaching. | Enables integration with Slack, Zapier, custom systems. The workflow framework already defines triggers — webhooks extend them externally. | Medium | Next Phase |
| 7 | **Multi-language UI (English/Swahili)** | Implement i18n using `next-intl` or `react-i18next`. Extract all UI strings to locale files. Translate to Swahili. Add language switcher in settings. | Kenya's Constitution recognizes English and Swahili as official languages. Client portal in Swahili serves clients more comfortably. Wakili CRM mentions bilingual support. | Medium-Large | Future Phase |
| 8 | **Dark mode** | Add theme toggle using Tailwind CSS dark mode classes. Store preference in localStorage and user settings. Respect system preference. | Standard UX expectation in 2026. Reduces eye strain for attorneys working late hours. shadcn/ui already supports dark mode via CSS variables. | Small | Next Phase |
| 9 | **SSO (SAML/OIDC)** | Integrate with enterprise identity providers (Azure AD, Google Workspace) via NextAuth.js OIDC provider. Allow firms to use their existing corporate login. | Enterprise firms with IT departments require SSO. NextAuth.js supports OIDC providers — configuration only. | Medium | Future Phase |
| 10 | **AI contract review** | Integrate LLM for clause extraction, risk identification, and comparison against standard terms. Add "Review Contract" action on uploaded documents. | StrongSuit and Clio offer AI contract analysis. High value for corporate/commercial practice areas. | Large | Future Phase |

---

## Priority Implementation Roadmap

Based on this gap analysis, here is the recommended implementation order:

### Immediate Priority (Compliance & Legal Risk)
These gaps expose the firm to regulatory penalties or malpractice risk:

1. **STR filing** (Section 3.2) — criminal penalties under POCAMLA
2. **Professional indemnity tracking** (Section 3.1) — PC cannot be issued without it
3. **Data Protection Act compliance** (Section 3.5) — KES 5M fines from ODPC
4. **Auto conflict check on intake/case creation** (Section 4.1 & 18.1) — LSK Code of Conduct mandate
5. **PEP screening** (Section 3.6) — FATF grey list pressure
6. **AML compliance officer designation** (Section 3.3) — LSK AML Guidelines requirement

### High Priority (Core Functionality Gaps)
These gaps significantly limit daily usability:

7. **Email SMTP integration** (Section 11.3) — required for password reset, invoice delivery
8. **SMS API integration** (Section 11.1) — required for court reminders in Kenya
9. **Report export PDF/CSV** (Section 12.3) — basic functionality expected by all users
10. **Active workflow engine** (Section 14.1) — unlocks automation for all trigger-based features
11. **Invoice aging report** (Section 6.5) — critical for financial management
12. **Three-way trust reconciliation** (Section 7.1) — LSK audit requirement
13. **Data import tool** (Section 16.1) — adoption blocker for new firms

### Medium Priority (Competitive Features)
These differentiate from competitors:

14. **M-Pesa API integration** (Section 6.1) — #1 Kenya competitive feature
15. **Document automation/merge** (Section 5.2) — major productivity gain
16. **Calendar sync** (Section 9.1) — attorney convenience
17. **Court rules-based deadline calculator** (Section 9.2) — unique Kenya advantage
18. **Client portal document upload** (Section 17.1) — enables KYC collection
19. **Lead/prospect CRM pipeline** (Section 2.1) — business development
20. **Batch time entry** (Section 8.1) — attorney productivity
21. **Firm branding** (Section 16.3) — professional appearance

### Lower Priority (Advanced/Future)
These are nice-to-haves or require significant investment:

22. **Online payment portal** — depends on payment gateway
23. **E-signature** — requires third-party integration
24. **WhatsApp integration** — requires Business API approval
25. **2FA** — security enhancement
26. **KRA e-TIMS** — timeline depends on KRA rollout
27. **AI features** — future phase
28. **PWA/offline** — future phase
29. **General ledger** — consider integration with existing accounting software instead
30. **Payroll** — consider integration with payroll service instead
