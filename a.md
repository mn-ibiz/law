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
