# Story 5.1: Client Intake & CRM with Kenya-Specific Fields

Status: ready-for-dev

## Story

As an Admin/Attorney,
I want to register and manage clients with Kenya-specific fields,
so that proper records are maintained.

## Acceptance Criteria (ACs)

1. **Client list with DataTable** — searchable, filterable by status, type (Individual/Organization), risk level, and referral source; supports pagination via @tanstack/react-table.
2. **Multi-step intake form for Individual clients** — captures: first name, last name, email, phone (+254 validated), date of birth, national ID (encrypted at rest), passport number (encrypted at rest), KRA PIN, county (select from 47 Kenya counties), P.O. Box, physical address, next of kin (name, relationship, phone), employer details (name, position, address).
3. **Multi-step intake form for Organization clients** — captures: company name, primary contact name, email, phone (+254 validated), KRA PIN, registered address, industry, P.O. Box.
4. **Portal account creation option** — checkbox on intake form triggers user creation with Client role; sets status to pending until admin approves.
5. **Client detail page with tabbed layout** — tabs: Profile, Cases, Documents, Contact History, Billing, KYC, Conflicts.
6. **Contact log entries** — CRUD for contact history: type (phone call, email, in-person meeting, letter, video call), subject, notes, contact date, contacted by (auto-filled current user).
7. **Deactivate client (soft delete)** — marks client as inactive, preserves all historical data and audit trail.
8. **Audit log on all mutations** — every create, update, and deactivate operation writes to the audit_log table with old/new values and user context.

## Tasks / Subtasks

- [ ] **Create Zod validation schemas for client intake** (AC 2, 3, 4)
  - [ ] `src/lib/validators/client.ts` — individualClientSchema, organizationClientSchema with +254 phone regex, email validation, KRA PIN pattern
  - [ ] Conditional validation for Individual vs Organization fields
  - [ ] Portal account creation validation (email uniqueness check)
- [ ] **Build multi-step intake form component** (AC 2, 3, 4)
  - [ ] `src/components/forms/client-intake-form.tsx` — multi-step wizard using react-hook-form with step state management
  - [ ] Step 1: Client type selection (Individual / Organization)
  - [ ] Step 2: Basic info (name, email, phone with +254 mask)
  - [ ] Step 3: Kenya-specific fields (National ID, KRA PIN, county dropdown, addresses)
  - [ ] Step 4: Additional info (next of kin, employer for Individual; industry for Organization)
  - [ ] Step 5: Portal account option + review and submit
  - [ ] County selector component with all 47 Kenya counties
- [ ] **Create server actions for client CRUD** (AC 2, 3, 4, 7, 8)
  - [ ] `src/lib/actions/clients.ts` — createClient, updateClient, deactivateClient
  - [ ] Encrypt national ID and passport fields before DB write
  - [ ] Auto-create user record if portal account checkbox is selected
  - [ ] Audit log entry on every mutation via createAuditLog()
- [ ] **Build client queries** (AC 1, 5)
  - [ ] `src/lib/queries/clients.ts` — getClients (with filters, pagination, search), getClientById (with relations), getClientContacts
- [ ] **Build client list page with DataTable** (AC 1)
  - [ ] `src/app/(dashboard)/clients/page.tsx` — server component with DataTable
  - [ ] Column definitions: name, email, phone, type, status, risk level, referral source, created date
  - [ ] Filter bar: status dropdown, type dropdown, risk dropdown, referral source dropdown
  - [ ] Search across name and email
  - [ ] "New Client" button linking to intake form
- [ ] **Build new client page** (AC 2, 3, 4)
  - [ ] `src/app/(dashboard)/clients/new/page.tsx` — renders ClientIntakeForm
- [ ] **Build client detail page with tabs** (AC 5, 6)
  - [ ] `src/app/(dashboard)/clients/[id]/page.tsx` — server component loading client data
  - [ ] Tab components: ProfileTab, CasesTab, DocumentsTab, ContactHistoryTab, BillingTab, KYCTab, ConflictsTab
  - [ ] Profile tab: displays all client fields with edit button
  - [ ] Contact History tab: DataTable of contact log entries with "Add Entry" dialog
- [ ] **Build contact log form and actions** (AC 6)
  - [ ] `src/components/forms/contact-log-form.tsx` — form with type, subject, notes, date fields
  - [ ] Server action: createContactLogEntry in `src/lib/actions/clients.ts`
- [ ] **Build client edit page** (AC 2, 3, 8)
  - [ ] `src/app/(dashboard)/clients/[id]/edit/page.tsx` — pre-populated form with current client data
- [ ] **Implement soft delete** (AC 7, 8)
  - [ ] Deactivate button on client detail page with confirmation dialog
  - [ ] Server action sets status to 'inactive' and logs to audit_log
- [ ] **Add loading skeletons and empty states** (AC 1, 5)
  - [ ] Skeleton for client list table
  - [ ] Empty state for each tab when no data exists

## Dev Notes

### Architecture Patterns
- All mutations via Server Actions following pattern: validate (Zod) -> auth (session check) -> authorize (role check) -> execute (Drizzle) -> audit (createAuditLog) -> revalidate (revalidatePath)
- Client list page is a Server Component; DataTable is a Client Component receiving serialized data
- Phone validation regex for Kenya: `/^\+254[17]\d{8}$/` or more permissive `/^\+254\d{9}$/`
- National ID and Passport encryption: use Node.js crypto.createCipheriv with AES-256-GCM; store IV alongside ciphertext; encryption key from env var `ENCRYPTION_KEY`
- KRA PIN format validation: typically `A\d{9}[A-Z]` (letter, 9 digits, letter)
- County list should be a constant array in `src/lib/utils/kenya-counties.ts` used across intake form and filters

### Libraries
- `react-hook-form` + `@hookform/resolvers/zod` for form state and validation
- `@tanstack/react-table` for DataTable with column sorting, filtering, pagination
- shadcn/ui components: Card, Tabs, Dialog, Form, Input, Select, Button, Badge, Table, Skeleton, AlertDialog
- `bcryptjs` if creating portal user account
- Node.js `crypto` module for field encryption

### Project Structure Notes

Files to create:
- `src/app/(dashboard)/clients/page.tsx` — client list page
- `src/app/(dashboard)/clients/new/page.tsx` — new client intake page
- `src/app/(dashboard)/clients/[id]/page.tsx` — client detail page
- `src/app/(dashboard)/clients/[id]/edit/page.tsx` — edit client page
- `src/components/forms/client-intake-form.tsx` — multi-step intake form
- `src/components/forms/contact-log-form.tsx` — contact log entry form
- `src/lib/validators/client.ts` — Zod schemas
- `src/lib/actions/clients.ts` — server actions
- `src/lib/queries/clients.ts` — data access queries
- `src/lib/utils/kenya-counties.ts` — 47 counties constant
- `src/lib/utils/encryption.ts` — AES encryption helpers (if not already created)

Files to modify:
- `src/components/layout/sidebar.tsx` — add Clients nav item (if not already present)
- `src/lib/db/schema/clients.ts` — verify schema includes all Kenya-specific fields

### References

- [Source: a.md - Module 4: Client Management (CRM)] — form fields, detail page sections, conflict check
- [Source: a.md - Module 19: Client Intake - Kenya Enhanced] — Kenya-specific fields (National ID, KRA PIN, county, +254 phone, P.O. Box, next of kin, employer)
- [Source: epics.md - Epic 5, Story 5.1] — acceptance criteria
- [Source: a.md - RBAC Permissions Matrix] — Admin: CRUD all clients, Attorney: CRUD own clients, Client: view own profile
- [Source: a.md - Architecture Patterns] — Server Actions mutation pattern
