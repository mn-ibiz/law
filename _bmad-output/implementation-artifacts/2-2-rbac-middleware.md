# Story 2.2: RBAC Middleware & Route Protection

Status: ready-for-dev

## Story

As an admin,
I want role-based access control at every route and action,
so that users only access features for their role.

## Acceptance Criteria (ACs)

1. Middleware protects all routes except auth pages (/login, /register, /forgot-password) and public pages (/intake)
2. Role-based route groups enforced: `/(dashboard)/*` accessible only by Admin and Attorney roles, `/(portal)/*` accessible only by Client role
3. Admin-only routes protected: `/settings/users`, `/settings/audit-log`
4. `checkPermission(session, resource, action)` utility function implemented for granular permission checks within server actions and components
5. Full RBAC matrix implemented per the permissions specification (Admin: full access, Attorney: own/assigned data, Client: own data via portal)
6. 403 Forbidden error page displayed for unauthorized access attempts
7. `auth()` available for server-side auth checks and `useSession()` available for client-side session access in all contexts

## Tasks / Subtasks

- [ ] Create `src/middleware.ts` — Next.js middleware that intercepts all requests, checks for valid session token, redirects unauthenticated users to /login, allows public routes (/login, /register, /forgot-password, /intake, /api/auth/*) (AC1)
- [ ] Implement route group protection in middleware: check user role from JWT, enforce /(dashboard)/* requires role admin or attorney, /(portal)/* requires role client (AC2)
- [ ] Add admin-only route protection in middleware for /settings/users and /settings/audit-log paths (AC3)
- [ ] Implement role-based redirect logic: if client tries to access /dashboard, redirect to /portal; if admin/attorney tries to access /portal, redirect to /dashboard (AC2)
- [ ] Create `src/lib/auth/permissions.ts` — Define resource types (attorneys, clients, cases, documents, calendar, time-tracking, expenses, billing, trust-accounts, messages, reports, settings, audit-log, users) and action types (create, read, update, delete, export, download) (AC4, AC5)
- [ ] Implement `checkPermission(session, resource, action): boolean` function that evaluates the RBAC matrix: Admin has full access to all resources; Attorney has CRUD on own/assigned data for cases, documents, calendar, time, expenses, view on billing; Client has read-only on own cases, documents, invoices (AC4, AC5)
- [ ] Create RBAC permission matrix as a typed configuration object mapping role -> resource -> allowed actions (AC5)
- [ ] Create `src/app/forbidden/page.tsx` — 403 error page with "Access Denied" message, explanation, and navigation back to appropriate dashboard (AC6)
- [ ] Create `src/app/not-found.tsx` — Custom 404 page (AC6)
- [ ] Ensure `auth()` works in Server Components, Server Actions, Route Handlers, and Middleware by exporting from `src/lib/auth/auth.ts` (AC7)
- [ ] Ensure `useSession()` works in Client Components by verifying SessionProvider wraps the app (AC7)
- [ ] Create `src/lib/auth/get-session.ts` — Helper to get typed session in server contexts with role checking convenience methods (AC7)
- [ ] Add middleware matcher config to exclude static assets, images, and _next paths (AC1)
- [ ] Test: unauthenticated user accessing /dashboard is redirected to /login (AC1)
- [ ] Test: client user accessing /dashboard is redirected to /portal (AC2)
- [ ] Test: attorney user accessing /portal is redirected to /dashboard (AC2)
- [ ] Test: attorney user accessing /settings/users sees 403 page (AC3)
- [ ] Test: admin user can access all routes (AC5)

## Dev Notes

### Architecture & Constraints
- Next.js middleware runs on the Edge Runtime; only lightweight checks (JWT decode, role check) should be done here
- The middleware should NOT make database calls; rely on the JWT token contents (role, id) set in Story 2.1
- For more granular permission checks (e.g., "can this attorney edit THIS case?"), use `checkPermission()` in server actions, not middleware
- Middleware is the first line of defense; server actions must also verify permissions

### RBAC Matrix Implementation
```typescript
// src/lib/auth/permissions.ts
type Role = 'admin' | 'attorney' | 'client';
type Resource = 'attorneys' | 'clients' | 'cases' | 'documents' | 'calendar' |
  'time-tracking' | 'expenses' | 'billing' | 'trust-accounts' | 'messages' |
  'reports' | 'settings' | 'audit-log' | 'users';
type Action = 'create' | 'read' | 'update' | 'delete' | 'export';

const permissions: Record<Role, Record<Resource, Action[]>> = {
  admin: {
    attorneys: ['create', 'read', 'update', 'delete'],
    clients: ['create', 'read', 'update', 'delete'],
    cases: ['create', 'read', 'update', 'delete'],
    // ... full access to all
  },
  attorney: {
    attorneys: ['read'],
    clients: ['create', 'read', 'update'],
    cases: ['create', 'read', 'update'],
    // ... limited per matrix
  },
  client: {
    cases: ['read'],       // own cases only
    documents: ['read'],   // shared docs only
    billing: ['read'],     // own invoices only
    messages: ['create', 'read'],
    // ... portal access only
  },
};
```

### Middleware Pattern
```typescript
// src/middleware.ts
import { auth } from '@/lib/auth/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  // Public routes
  if (publicRoutes.includes(pathname)) return NextResponse.next();

  // Unauthenticated
  if (!session) return NextResponse.redirect(new URL('/login', req.url));

  // Route group enforcement
  if (pathname.startsWith('/dashboard') && session.user.role === 'client') {
    return NextResponse.redirect(new URL('/portal', req.url));
  }
  // ... etc
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
```

### Project Structure Notes

Files to create:
- `src/middleware.ts` — Next.js middleware for route protection
- `src/lib/auth/permissions.ts` — RBAC matrix and checkPermission utility
- `src/lib/auth/get-session.ts` — Server-side session helper
- `src/app/forbidden/page.tsx` — 403 error page
- `src/app/not-found.tsx` — 404 error page

Files to modify:
- None (builds on Story 2.1 auth config)

### References

- [Source: a.md — Module 1: Authentication & Authorization]
- [Source: a.md — RBAC Permissions Matrix (full table)]
- [Source: epics.md — Epic 2, Story 2.2]
- [Source: a.md — Architecture Patterns: RBAC middleware at route level + permission checks in actions]
