# Story 2.1: Authentication System — NextAuth.js v5

Status: ready-for-dev

## Story

As a user,
I want to securely log in, register, and manage my session,
so that I can access the system with appropriate permissions.

## Acceptance Criteria (ACs)

1. NextAuth.js v5 configured with Credentials provider and JWT strategy
2. Login page with email, password, and "remember me" checkbox
3. Client registration page (admin approves new client accounts)
4. Forgot password flow with placeholder email sending
5. Password validation: minimum 8 characters, must contain uppercase + lowercase + number
6. Passwords hashed with bcryptjs before storage
7. JWT enriched with user id, role, email, and name fields
8. Session timeout with auto-logout functionality
9. Role-based redirect after login: Admin/Attorney redirected to /dashboard, Client redirected to /portal
10. All forms use react-hook-form + Zod validation
11. Error toast displayed on invalid credentials or form errors

## Tasks / Subtasks

- [ ] Create `src/lib/auth/auth.config.ts` — NextAuth.js v5 configuration with Credentials provider, JWT strategy, custom session/jwt callbacks to enrich token with id, role, email, name (AC1, AC7)
- [ ] Create `src/lib/auth/auth.ts` — Export `auth()`, `signIn()`, `signOut()`, `handlers` from NextAuth config (AC1)
- [ ] Create `src/app/api/auth/[...nextauth]/route.ts` — NextAuth API route handler (AC1)
- [ ] Create `src/types/next-auth.d.ts` — Extend NextAuth Session and JWT types to include id, role, email, name (AC7)
- [ ] Create `src/lib/validators/auth.ts` — Zod schemas: loginSchema (email + password), registerSchema (name, email, password, confirmPassword, phone), forgotPasswordSchema (email) with password rules (min 8, uppercase, lowercase, number) (AC5, AC10)
- [ ] Create `src/app/(auth)/layout.tsx` — Auth layout (centered card, firm logo, no sidebar) (AC2)
- [ ] Create `src/app/(auth)/login/page.tsx` — Login page with email, password, remember me checkbox, "Forgot password?" link, "Register" link (AC2)
- [ ] Create `src/components/forms/login-form.tsx` — Login form component using react-hook-form + Zod resolver, with form field validation, submit handler calling signIn(), error display (AC2, AC10, AC11)
- [ ] Create `src/app/(auth)/register/page.tsx` — Client registration page with name, email, password, confirm password, phone (AC3)
- [ ] Create `src/components/forms/register-form.tsx` — Registration form component using react-hook-form + Zod, creates user with role=client and isActive=false (pending admin approval) (AC3, AC10)
- [ ] Create `src/lib/actions/auth.ts` — Server actions: `loginAction` (validate credentials, compare bcrypt hash), `registerAction` (hash password, insert user with isActive=false), `forgotPasswordAction` (placeholder: log email, return success message) (AC1, AC3, AC4, AC6)
- [ ] Create `src/app/(auth)/forgot-password/page.tsx` — Forgot password page with email input (AC4)
- [ ] Create `src/components/forms/forgot-password-form.tsx` — Forgot password form with email field and success/error messaging (AC4, AC10)
- [ ] Implement JWT callback to add user.id, user.role, user.email, user.name to the JWT token (AC7)
- [ ] Implement session callback to expose id, role, email, name from token to session (AC7)
- [ ] Implement role-based redirect in the authorize callback or signIn callback: admin/attorney -> /dashboard, client -> /portal (AC9)
- [ ] Configure session maxAge and implement auto-logout on session expiry using client-side session polling or middleware (AC8)
- [ ] Add toast notifications (using shadcn/ui Toast or Sonner) for login errors, registration success/failure, and form validation errors (AC11)
- [ ] Create `src/components/shared/providers.tsx` — SessionProvider wrapper for client components needing `useSession()` (AC1)
- [ ] Update `src/app/layout.tsx` to wrap with SessionProvider (AC1)
- [ ] Verify login flow end-to-end: email/password -> bcrypt compare -> JWT -> session -> redirect (AC1, AC6, AC7, AC9)

## Dev Notes

### Architecture & Constraints
- NextAuth.js v5 (Auth.js) uses the new configuration pattern: `NextAuth({ providers, callbacks, pages, session })`
- Use JWT strategy exclusively (no database sessions) for stateless auth
- The Credentials provider performs a custom authorize function that queries the users table and compares bcrypt hashes
- All auth pages are in the `(auth)` route group which has its own layout (no sidebar/header)
- The "remember me" checkbox extends session maxAge (e.g., 30 days vs 24 hours)
- Client registration creates a user with `isActive: false`; admin must activate in Story 18.2

### NextAuth v5 Pattern
```typescript
// src/lib/auth/auth.config.ts
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

export const { auth, signIn, signOut, handlers } = NextAuth({
  providers: [
    Credentials({
      async authorize(credentials) {
        // Validate, query DB, compare bcrypt, return user or null
      },
    }),
  ],
  session: { strategy: 'jwt', maxAge: 24 * 60 * 60 },
  callbacks: {
    async jwt({ token, user }) { /* enrich token */ },
    async session({ session, token }) { /* expose token fields */ },
  },
  pages: {
    signIn: '/login',
  },
});
```

### Password Validation (Zod)
```typescript
const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Must contain uppercase letter')
  .regex(/[a-z]/, 'Must contain lowercase letter')
  .regex(/[0-9]/, 'Must contain a number');
```

### Project Structure Notes

Files to create:
- `src/lib/auth/auth.config.ts` — NextAuth configuration
- `src/lib/auth/auth.ts` — Auth exports (auth, signIn, signOut, handlers)
- `src/app/api/auth/[...nextauth]/route.ts` — API route
- `src/types/next-auth.d.ts` — Type extensions
- `src/lib/validators/auth.ts` — Zod schemas for auth forms
- `src/app/(auth)/layout.tsx` — Auth pages layout
- `src/app/(auth)/login/page.tsx` — Login page
- `src/app/(auth)/register/page.tsx` — Registration page
- `src/app/(auth)/forgot-password/page.tsx` — Forgot password page
- `src/components/forms/login-form.tsx` — Login form component
- `src/components/forms/register-form.tsx` — Registration form component
- `src/components/forms/forgot-password-form.tsx` — Forgot password form
- `src/lib/actions/auth.ts` — Server actions for auth
- `src/components/shared/providers.tsx` — Session provider wrapper

Files to modify:
- `src/app/layout.tsx` — Add SessionProvider

### References

- [Source: a.md — Module 1: Authentication & Authorization]
- [Source: a.md — RBAC Permissions Matrix]
- [Source: a.md — Form Fields: Login, Registration (Client)]
- [Source: epics.md — Epic 2, Story 2.1]
