# Story 4.1: Attorney CRUD & Professional Profile

Status: ready-for-dev

## Story

As an Admin,
I want to manage attorney profiles with professional details,
so that qualifications and billing rates are tracked.

## Acceptance Criteria (ACs)

1. Attorney list page with DataTable: search by name/bar number/LSK number, filter by status, department, title, practice area, with pagination
2. Add attorney form with fields: user link (select existing user), bar number, jurisdiction, license status (active/inactive/suspended/retired), title (Partner/Senior Associate/Associate/Of Counsel/Paralegal), department, hourly rate (KES), date admitted to bar, bio, LSK number, Commissioner for Oaths (boolean), Notary Public (boolean), Senior Counsel (boolean)
3. Attorney detail page with tabs: Profile, Licenses, Practice Areas, Cases, Time & Billing
4. Additional license form: jurisdiction, license number, status, issue date, expiry date
5. Edit attorney profile functionality with pre-populated form
6. Deactivate attorney with soft delete (set isActive to false, preserves all historical data)
7. Audit log entry created on all create, update, and deactivate mutations

## Tasks / Subtasks

- [ ] Create `src/lib/validators/attorney.ts` — Zod schemas: `createAttorneySchema`, `updateAttorneySchema`, `createLicenseSchema` with validation rules: barNumber required, jurisdiction required, hourlyRate as positive number, LSK number format validation (AC2, AC4)
- [ ] Create `src/lib/actions/attorneys.ts` — Server actions: `createAttorney(data)`, `updateAttorney(id, data)`, `deactivateAttorney(id)`, `addAttorneyLicense(attorneyId, data)`, `linkPracticeAreas(attorneyId, practiceAreaIds)` — each validates input with Zod, checks auth/permissions, executes mutation, creates audit log entry (AC2, AC4, AC5, AC6, AC7)
- [ ] Create `src/lib/queries/attorneys.ts` — Query functions: `getAttorneys(filters)` with search/filter/pagination, `getAttorneyById(id)` with all relations loaded (licenses, practice areas, user), `getAttorneyWithCases(id)`, `getAttorneyTimeEntries(id)` (AC1, AC3)
- [ ] Create `src/app/(dashboard)/attorneys/page.tsx` — Attorney list page (Server Component) fetching attorneys with URL search params for filters and pagination (AC1)
- [ ] Create `src/components/attorneys/attorney-data-table.tsx` — DataTable component using @tanstack/react-table: columns for name, title, department, bar number, LSK number, status badge, hourly rate (KES), actions dropdown; client-side search input, filter dropdowns (status, department, title, practice area), pagination controls (AC1)
- [ ] Create `src/components/attorneys/attorney-columns.tsx` — Column definitions for the attorney DataTable with sortable headers, status badges, KES formatting for hourly rate (AC1)
- [ ] Create `src/app/(dashboard)/attorneys/new/page.tsx` — Add attorney page with the attorney form (AC2)
- [ ] Create `src/components/forms/attorney-form.tsx` — Attorney form component using react-hook-form + Zod: user selector (searchable dropdown of users with attorney role), bar number, jurisdiction, license status dropdown, title dropdown, department dropdown, hourly rate (KES input), date admitted (date picker), bio (textarea), LSK number, Commissioner for Oaths checkbox, Notary Public checkbox, Senior Counsel checkbox (AC2)
- [ ] Create `src/app/(dashboard)/attorneys/[id]/page.tsx` — Attorney detail page (Server Component) with header showing name, title, department, status; tabbed layout below (AC3)
- [ ] Create `src/components/attorneys/attorney-detail-tabs.tsx` — Tabbed interface using shadcn Tabs: Profile (overview with all fields displayed), Licenses (table of all licenses with "Add License" button), Practice Areas (tags/badges with edit capability), Cases (DataTable of assigned cases), Time & Billing (hours summary, revenue, utilization rate) (AC3)
- [ ] Create `src/components/forms/license-form.tsx` — Additional license form: jurisdiction, license number, status dropdown, issue date picker, expiry date picker (AC4)
- [ ] Create `src/app/(dashboard)/attorneys/[id]/edit/page.tsx` — Edit attorney page with pre-populated form (AC5)
- [ ] Implement deactivate attorney: confirmation dialog, soft delete (set isActive=false on attorneys table and optionally on linked user), preserve all historical records (AC6)
- [ ] Implement audit logging: call `createAuditLog()` in each server action with action type, entity type ("attorney"), entity ID, old/new values as JSON (AC7)
- [ ] Create `src/lib/utils/audit.ts` — `createAuditLog(userId, action, entityType, entityId, details)` utility that inserts into the audit_log table (AC7)
- [ ] Add practice area management on attorney detail: multi-select practice areas from available list, save to attorney_practice_areas junction table (AC3)
- [ ] Implement filter URL state: filters encoded in URL search params (?status=active&department=litigation) for shareable/bookmarkable filtered views (AC1)

## Dev Notes

### Architecture & Constraints
- Attorney list page is a Server Component that reads URL search params and fetches data
- DataTable component is a Client Component (`"use client"`) that handles sorting, filtering, and pagination on the client side
- The DataTable should support both client-side filtering (for small datasets) and server-side pagination (pass page/limit to query)
- Only Admin role can create, edit, or deactivate attorneys; Attorneys can view all
- The "user link" in the form connects an attorney profile to an existing user account — this enables the attorney user to log in and have their attorney profile associated

### @tanstack/react-table Pattern
```typescript
"use client";
import { useReactTable, getCoreRowModel, getPaginationRowModel,
  getSortedRowModel, getFilteredRowModel, flexRender } from '@tanstack/react-table';

// Column definitions
const columns: ColumnDef<Attorney>[] = [
  { accessorKey: 'name', header: 'Name', cell: ({ row }) => <Link href={`/attorneys/${row.original.id}`}>{row.getValue('name')}</Link> },
  { accessorKey: 'title', header: 'Title' },
  { accessorKey: 'department', header: 'Department' },
  { accessorKey: 'barNumber', header: 'Bar Number' },
  { accessorKey: 'lskNumber', header: 'LSK Number' },
  { accessorKey: 'status', header: 'Status', cell: ({ row }) => <Badge>{row.getValue('status')}</Badge> },
  { accessorKey: 'hourlyRate', header: 'Rate', cell: ({ row }) => formatKES(row.getValue('hourlyRate')) },
  // Actions column with DropdownMenu: View, Edit, Deactivate
];
```

### Server Action Pattern
```typescript
"use server";
export async function createAttorney(data: CreateAttorneyInput) {
  const session = await auth();
  if (!session || session.user.role !== 'admin') throw new Error('Unauthorized');

  const validated = createAttorneySchema.parse(data);
  const attorney = await db.insert(attorneys).values(validated).returning();

  await createAuditLog(session.user.id, 'create', 'attorney', attorney[0].id, { new: validated });
  revalidatePath('/attorneys');
  return attorney[0];
}
```

### Project Structure Notes

Files to create:
- `src/lib/validators/attorney.ts` — Zod schemas
- `src/lib/actions/attorneys.ts` — Server actions
- `src/lib/queries/attorneys.ts` — Query functions
- `src/lib/utils/audit.ts` — Audit log utility
- `src/app/(dashboard)/attorneys/page.tsx` — Attorney list page
- `src/app/(dashboard)/attorneys/new/page.tsx` — Add attorney page
- `src/app/(dashboard)/attorneys/[id]/page.tsx` — Attorney detail page
- `src/app/(dashboard)/attorneys/[id]/edit/page.tsx` — Edit attorney page
- `src/components/attorneys/attorney-data-table.tsx` — DataTable component
- `src/components/attorneys/attorney-columns.tsx` — Column definitions
- `src/components/attorneys/attorney-detail-tabs.tsx` — Tabbed detail view
- `src/components/forms/attorney-form.tsx` — Attorney form
- `src/components/forms/license-form.tsx` — License form

Files to modify:
- `src/components/layout/sidebar-nav.ts` — Ensure attorneys nav item is present

### References

- [Source: a.md — Module 3: Attorney Management (full feature spec)]
- [Source: a.md — Form Fields: Attorney Profile, Additional License]
- [Source: a.md — Attorney Detail Page Sections]
- [Source: a.md — Architecture Patterns: Server Actions for all mutations]
- [Source: epics.md — Epic 4, Story 4.1]
