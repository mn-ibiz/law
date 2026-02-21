# Story 20.5: Final Deployment & Verification

Status: ready-for-dev

## Story

As an Admin,
I want the system fully deployed on Vercel with all features verified and documentation complete,
so that it is ready for demo and production use.

## Acceptance Criteria (ACs)

1. **Vercel Environment Variables:** All required environment variables are configured in Vercel project settings: DATABASE_URL (Neon connection string), AUTH_SECRET, NEXTAUTH_URL, STORAGE_PROVIDER, and any other env vars required by the application.
2. **Build Passes with Zero Errors:** `next build` completes successfully with zero TypeScript errors, zero ESLint errors, and no build warnings that indicate runtime issues.
3. **All Pages Accessible and Functional:** Every page in the application is accessible via navigation, loads correctly, and performs its intended function (CRUD operations, form submissions, report generation, etc.).
4. **Seed Data Loaded:** The Neon production/demo database has seed data loaded via `npm run seed`: Kenya courts (all 47 counties), practice areas, sample users (1 Admin, 3 Attorneys, 2 Clients), sample cases, attorney records with LSK numbers and practising certificates, CPD records.
5. **Demo Credentials Documented:** Demo login credentials for each role (Admin, Attorney, Client) are documented and easily accessible for testers/evaluators.
6. **README Documentation:** The project README includes:
   - Project overview and feature summary
   - Tech stack description
   - Local development setup instructions (clone, install, env vars, database setup, seed, run)
   - Demo URL (Vercel deployment)
   - Demo credentials
   - Production deployment guide for Windows Server (Node.js + PM2 or IIS iisnode, local PostgreSQL 17 setup)
   - Database backup procedures
   - Environment variable reference
7. **Production Deployment Guide (Windows Server):** Detailed documentation covering:
   - Windows Server prerequisites (Node.js LTS, PostgreSQL 17, PM2 or IIS with iisnode)
   - Application setup (git clone, npm install, npm run build, environment variables)
   - PM2 process management (start, restart, logs, startup script)
   - Alternative: IIS reverse proxy to Node.js with iisnode
   - Local PostgreSQL 17 setup (installation, database creation, user creation, connection string)
   - Running migrations against local PostgreSQL
   - SSL/TLS certificate setup
   - Backup procedures for local PostgreSQL
   - Windows Firewall configuration
   - Update/deployment procedure
8. **Verification Checklist - RBAC:** All three roles (Admin, Attorney, Client) tested with correct access to their respective features and proper denial of unauthorized routes/actions.
9. **Verification Checklist - CRUD Flows:** Complete CRUD lifecycle verified for: attorneys, clients, cases, documents, time entries, expenses, invoices, trust transactions, calendar events, tasks, messages.
10. **Verification Checklist - Billing Cycle:** Full billing workflow verified: time entry -> create fee note -> pull unbilled items -> add VAT -> approve -> send -> record payment (M-Pesa and bank transfer) -> receipt generation.
11. **Verification Checklist - Trust Accounting:** Trust account operations verified: deposit, withdrawal, per-client balance, three-way reconciliation, compliance safeguard (cannot overdraw client balance).
12. **Verification Checklist - Portal Access:** Client portal verified: login, dashboard, view cases, view documents, view invoices, profile management, messaging.
13. **Verification Checklist - Mobile Responsiveness:** Application tested on mobile viewport (Chrome DevTools device emulation at 375px and 768px) with all major pages verified for usability.

## Tasks / Subtasks

- [ ] **Task 1: Configure Vercel environment variables** (AC 1)
  - Set all required env vars in Vercel project settings:
    - `DATABASE_URL` - Neon PostgreSQL connection string (pooled)
    - `AUTH_SECRET` - NextAuth.js secret (generate with `openssl rand -base64 32`)
    - `NEXTAUTH_URL` - Vercel deployment URL
    - `STORAGE_PROVIDER` - 'vercel-blob' for demo deployment
    - `BLOB_READ_WRITE_TOKEN` - Vercel Blob token (if using Vercel Blob)
    - Any SMS/email provider keys if configured
  - Verify env vars are accessible in both server and client contexts as needed

- [ ] **Task 2: Fix build errors and warnings** (AC 2)
  - Run `next build` locally and fix all TypeScript errors
  - Fix all ESLint errors (run `npx eslint . --fix` for auto-fixable issues)
  - Address build warnings that indicate potential runtime issues
  - Ensure all dynamic imports and lazy loading work correctly
  - Verify no missing dependencies or unused imports
  - Confirm build output size is reasonable

- [ ] **Task 3: Load seed data on Neon database** (AC 4)
  - Run `npm run seed` against the Neon production/demo database
  - Verify seed data is loaded: courts, practice areas, sample users, sample cases
  - Confirm demo users can log in with seeded credentials
  - Verify sample data is representative enough for demo purposes

- [ ] **Task 4: Create demo credentials document** (AC 5)
  - Document demo credentials in README and/or a separate DEMO.md:
    - Admin: admin@lawfirm.co.ke / [password]
    - Attorney 1: attorney1@lawfirm.co.ke / [password]
    - Attorney 2: attorney2@lawfirm.co.ke / [password]
    - Attorney 3: attorney3@lawfirm.co.ke / [password]
    - Client 1: client1@lawfirm.co.ke / [password]
    - Client 2: client2@lawfirm.co.ke / [password]
  - Include role descriptions and what each role can access

- [ ] **Task 5: Write comprehensive README** (AC 6)
  - Write or update project README.md with sections:
    - **Overview:** Project description, purpose, target users
    - **Features:** High-level feature list organized by module
    - **Tech Stack:** Next.js 14+, TypeScript, Neon PostgreSQL 17, Drizzle ORM, NextAuth.js v5, Tailwind CSS, shadcn/ui, Recharts, @tanstack/react-table
    - **Getting Started:** Clone, install (`npm install`), configure `.env.local`, setup database, run migrations (`npm run migrate`), seed data (`npm run seed`), start dev server (`npm run dev`)
    - **Environment Variables:** Reference table with all env vars, descriptions, and example values
    - **Demo:** URL, credentials
    - **Deployment:** Links to deployment guides
    - **Database Backup:** Summary with link to detailed guide
    - **License / Credits**

- [ ] **Task 6: Write Windows Server production deployment guide** (AC 7)
  - Create detailed deployment documentation (in README or separate DEPLOYMENT.md):
    - **Prerequisites:**
      - Windows Server 2019+ or Windows 10/11
      - Node.js 20 LTS (download from nodejs.org)
      - PostgreSQL 17 (download from postgresql.org/download/windows/)
      - PM2 (`npm install -g pm2`) or IIS with iisnode
      - Git
    - **PostgreSQL Setup:**
      - Install PostgreSQL 17
      - Create database: `CREATE DATABASE lawfirm_registry;`
      - Create user: `CREATE USER lawfirm WITH PASSWORD 'secure_password';`
      - Grant privileges: `GRANT ALL PRIVILEGES ON DATABASE lawfirm_registry TO lawfirm;`
      - Connection string: `postgresql://lawfirm:secure_password@localhost:5432/lawfirm_registry`
    - **Application Setup:**
      - `git clone <repo>` to desired directory (e.g., `C:\apps\law-firm-registry`)
      - `npm install`
      - Configure `.env.local` with local PostgreSQL connection, AUTH_SECRET, etc.
      - `npm run migrate` (run Drizzle migrations)
      - `npm run seed` (load initial data)
      - `npm run build`
    - **PM2 Process Management:**
      - `pm2 start npm --name "law-firm" -- start`
      - `pm2 save`
      - `pm2 startup` (configure auto-start on boot)
      - `pm2 logs law-firm` (view logs)
      - `pm2 restart law-firm` (restart after updates)
    - **IIS Alternative:**
      - Install iisnode module
      - Configure IIS site with reverse proxy to localhost:3000
      - web.config example
    - **SSL/TLS:** Use Let's Encrypt with win-acme or import existing certificate
    - **Firewall:** Open port 443 (HTTPS) in Windows Firewall
    - **Updates:** Pull latest code, `npm install`, `npm run build`, `pm2 restart`
    - **Backup:** PostgreSQL backup with pg_dump, Windows Task Scheduler for automation

- [ ] **Task 7: Execute RBAC verification** (AC 8)
  - Test as Admin: access all routes, all CRUD operations, settings, reports, audit log, user management
  - Test as Attorney: access dashboard, cases, clients, documents, time entries, calendar; verify cannot access settings/users, audit log, reports (admin-only)
  - Test as Client: access portal only; verify cannot access dashboard routes; can view own cases, documents, invoices; cannot view other clients' data
  - Verify 403 page shown for unauthorized access attempts
  - Document any RBAC issues found and fix them

- [ ] **Task 8: Execute CRUD flow verification** (AC 9)
  - Test complete CRUD lifecycle for each entity:
    - Create attorney -> edit -> view detail -> deactivate
    - Create client -> edit -> view detail -> KYC tab
    - Create case -> edit -> change status -> view timeline -> add notes
    - Upload document -> view -> new version -> download
    - Create time entry (manual and timer) -> edit -> delete
    - Create expense -> edit -> mark as invoiced
    - Create fee note -> add line items -> approve -> send -> record payment
    - Create trust account -> deposit -> withdraw -> verify balance
    - Create calendar event -> edit -> delete
    - Create task -> assign -> complete
    - Send message -> view thread -> reply
  - Document any broken flows and fix them

- [ ] **Task 9: Execute billing cycle verification** (AC 10)
  - End-to-end billing test:
    1. Log time entries against a case (manual + timer)
    2. Log expenses against the same case
    3. Create a fee note for the case
    4. Click "Pull Unbilled Items" to auto-populate line items
    5. Verify VAT calculation (16% on professional fees, exempt on disbursements)
    6. Submit for approval
    7. Approve the fee note
    8. Record a partial payment (M-Pesa with transaction code)
    9. Verify partial payment status and balance
    10. Record remaining payment (bank transfer)
    11. Verify paid status
    12. Download receipt PDF
    13. Verify time entries marked as "Invoiced"
  - Test credit note creation against a paid invoice
  - Test trust account drawdown as payment method

- [ ] **Task 10: Execute trust accounting verification** (AC 11)
  - Test trust account operations:
    1. Create trust account
    2. Deposit funds for Client A (KES 100,000)
    3. Deposit funds for Client B (KES 50,000)
    4. Verify per-client balance: A=100K, B=50K, Total=150K
    5. Withdraw KES 30,000 from Client A's balance
    6. Verify A=70K, B=50K, Total=120K
    7. Attempt to withdraw KES 80,000 from Client A (should be blocked - only 70K available)
    8. Verify compliance safeguard: withdrawal blocked with clear error message
    9. Run three-way reconciliation: verify bank=book=client sum
    10. Create a fee note payment via trust drawdown: verify trust balance decreases

- [ ] **Task 11: Execute portal verification** (AC 12)
  - Log in as Client:
    1. Verify portal dashboard shows correct stats
    2. Navigate to My Cases - verify only own cases visible
    3. Open a case - verify read-only, no private notes visible
    4. Navigate to My Documents - verify only shared documents visible
    5. Download a document
    6. Navigate to My Invoices - verify own invoices, download PDF
    7. Update profile information
    8. Send a message to assigned attorney
    9. View notification when attorney replies
  - Verify client cannot access any dashboard routes via direct URL

- [ ] **Task 12: Execute mobile responsiveness verification** (AC 13)
  - Using Chrome DevTools device emulation:
    - iPhone SE (375px): test login, dashboard, case list, case detail, forms, sidebar
    - iPad (768px): test all major pages, verify tablet layout
    - Desktop (1440px): baseline verification
  - Check: sidebar collapses to hamburger, tables scroll horizontally, forms single-column, cards stack, no horizontal overflow
  - Verify touch targets are >= 44px on mobile
  - Take screenshots for documentation

## Dev Notes

- **Deployment Environments:**
  - **Demo (Vercel):** Serverless deployment, Neon PostgreSQL, Vercel Blob for file storage. This is the primary demo/evaluation environment.
  - **Production (Windows Server):** Traditional server deployment with PM2 or IIS, local PostgreSQL 17, local filesystem for file storage. This is the target production environment for Kenyan law firms.
- **PM2 vs IIS:** PM2 is simpler and recommended for Node.js applications. IIS with iisnode is an alternative if the firm's IT team prefers IIS. PM2 provides process management, auto-restart, log management, and cluster mode.
- **Database Migration on Production:** When deploying updates that include schema changes, the deployment procedure must include `npm run migrate` before `npm run build`. Drizzle migrations are idempotent and safe to re-run.
- **Environment Variable Security:** On Windows Server, use environment variables set at the system level or in a `.env.local` file with restricted file permissions. Never commit credentials to git.
- **Verification Methodology:** Each verification task should be executed manually and results documented (pass/fail per test case). Consider creating a spreadsheet or checklist that can be shared with stakeholders.
- **Known Limitations:** Document any known limitations, planned future features, or workarounds in the README. Examples: email is placeholder (no actual sending without provider setup), SMS requires Africa's Talking API key, eSignature is basic (draw/type only).
- **Monitoring:** For production, recommend setting up PM2 monitoring (`pm2 monit`) and log rotation (`pm2 install pm2-logrotate`). For Vercel, monitoring is built-in via the Vercel dashboard.

### Project Structure Notes

**New files to create:**
- README.md (comprehensive, or update existing)
- DEPLOYMENT.md (Windows Server guide, or section in README)
- DEMO.md (credentials and access instructions)
- Verification checklist document (optional, can be in README)

**Files to modify:**
- `.env.example` (update with all required env vars and descriptions)
- `package.json` (verify scripts: dev, build, start, seed, migrate)
- Vercel project settings (env vars)
- Any files with build errors or warnings

**No new source code files expected** -- this story is primarily about deployment configuration, verification, and documentation. Code changes are limited to bug fixes discovered during verification.

### References

- [Source: a.md -- Law Firm Registry Implementation Plan]
- [Source: epics.md -- Epic 20: Data Management, Compliance & Polish, Story 20.5]
- [Source: epics.md -- Epic 1: Project Foundation] (project setup, seed data)
- [Source: epics.md -- Epic 2: Authentication & Authorization] (RBAC verification)
- Vercel deployment documentation: https://vercel.com/docs
- PM2 documentation: https://pm2.keymetrics.io/docs
- Neon PostgreSQL documentation: https://neon.tech/docs
- Next.js deployment documentation: https://nextjs.org/docs/app/building-your-application/deploying

## Dev Agent Record

### Agent Model Used


### Debug Log References


### Completion Notes List


### Change Log
| Change | Details |
|--------|---------|
| | |

### File List
