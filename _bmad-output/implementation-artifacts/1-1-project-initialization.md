# Story 1.1: Project Initialization & Configuration

Status: review

## Story

As a developer,
I want a fully initialized Next.js 14+ project with all dependencies,
so that the codebase is ready for feature development.

## Acceptance Criteria (ACs)

1. Next.js 14+ with App Router and TypeScript strict mode is initialized and configured
2. Tailwind CSS + shadcn/ui initialized with all core components (Button, Card, Input, Label, Select, Dialog, Sheet, Table, Tabs, Badge, Avatar, DropdownMenu, Command, Popover, Calendar, Checkbox, RadioGroup, Textarea, Toast, Skeleton, Separator, ScrollArea, Form)
3. Drizzle ORM + @neondatabase/serverless configured with database connection
4. react-hook-form + Zod installed and configured for form validation
5. Recharts installed for chart/data visualization
6. @tanstack/react-table installed for data tables
7. Lucide icons (lucide-react) installed for iconography
8. .env.local created with DATABASE_URL, AUTH_SECRET, NEXTAUTH_URL environment variables
9. ESLint + Prettier configured with consistent code formatting rules
10. Project builds with zero errors (`npm run build` passes cleanly)
11. Project deployed to Vercel and accessible via public URL

## Tasks / Subtasks

- [x] Initialize Next.js 14+ project with App Router and TypeScript strict mode enabled in tsconfig.json (AC1)
- [x] Install and configure Tailwind CSS with the project (AC2)
- [x] Initialize shadcn/ui and add all core UI components: Button, Card, Input, Label, Select, Dialog, Sheet, Table, Tabs, Badge, Avatar, DropdownMenu, Command, Popover, Calendar, Checkbox, RadioGroup, Textarea, Toast/Sonner, Skeleton, Separator, ScrollArea, Form (AC2)
- [x] Install Drizzle ORM (`drizzle-orm`, `drizzle-kit`) and @neondatabase/serverless driver (AC3)
- [x] Create `src/lib/db/index.ts` with Neon database client and Drizzle instance (AC3)
- [x] Create `drizzle.config.ts` at project root for migrations (AC3)
- [x] Install react-hook-form and zod; install @hookform/resolvers for Zod integration (AC4)
- [x] Install recharts for charting (AC5)
- [x] Install @tanstack/react-table for data table functionality (AC6)
- [x] Install lucide-react for icons (AC7)
- [x] Install additional dependencies: bcryptjs, @types/bcryptjs, next-auth@beta (NextAuth.js v5), date-fns, clsx, tailwind-merge, class-variance-authority (AC1, AC2)
- [x] Create `.env.local` with DATABASE_URL (Neon connection string), AUTH_SECRET, NEXTAUTH_URL=http://localhost:3000 (AC8)
- [x] Create `.env.example` with placeholder values for documentation (AC8)
- [x] Configure ESLint with Next.js recommended rules + TypeScript rules (AC9)
- [x] Configure Prettier with consistent settings (.prettierrc) (AC9)
- [x] Set up project directory structure: `src/app/(auth)/`, `src/app/(dashboard)/`, `src/app/(portal)/`, `src/app/api/`, `src/components/ui/`, `src/components/layout/`, `src/components/forms/`, `src/components/shared/`, `src/lib/db/schema/`, `src/lib/auth/`, `src/lib/actions/`, `src/lib/queries/`, `src/lib/validators/`, `src/lib/utils/`, `src/lib/hooks/`, `src/lib/storage/`, `src/types/` (AC1)
- [x] Create a root layout (`src/app/layout.tsx`) with Tailwind and font configuration (AC1, AC2)
- [x] Create a basic home/landing page to verify the project runs (AC10)
- [x] Add `src/lib/utils/cn.ts` utility (clsx + tailwind-merge) (AC2)
- [x] Run `npm run build` to verify zero errors (AC10)
- [ ] Deploy to Vercel, configure environment variables, verify public URL (AC11)

## Dev Notes

### Architecture & Constraints
- Use the App Router exclusively (no Pages Router)
- TypeScript strict mode must be enabled: `"strict": true` in `tsconfig.json`
- The Drizzle ORM connection should use `@neondatabase/serverless` for the Neon driver with WebSocket support
- NextAuth.js v5 (Auth.js) is installed now but configured in Story 2.1
- All shadcn/ui components should be added via `npx shadcn@latest add <component>` CLI
- The `cn()` utility function combines `clsx` and `tailwind-merge` for conditional class merging

### Key Libraries & Versions
- `next` >= 14.x (App Router)
- `drizzle-orm` + `drizzle-kit` (latest)
- `@neondatabase/serverless` (latest)
- `next-auth@beta` (v5)
- `react-hook-form` + `@hookform/resolvers` + `zod`
- `recharts`
- `@tanstack/react-table`
- `lucide-react`
- `bcryptjs` + `@types/bcryptjs`
- `date-fns`
- `clsx` + `tailwind-merge` + `class-variance-authority`

### Project Structure Notes

Files/folders to create:
- `src/app/layout.tsx` — Root layout with fonts, Tailwind, providers
- `src/app/page.tsx` — Root page (redirect or landing)
- `src/app/(auth)/` — Route group for auth pages (created empty)
- `src/app/(dashboard)/` — Route group for dashboard (created empty)
- `src/app/(portal)/` — Route group for client portal (created empty)
- `src/app/api/` — API routes directory
- `src/components/ui/` — shadcn/ui generated components
- `src/components/layout/` — Sidebar, Header, Nav components (created empty)
- `src/components/forms/` — Reusable form components (created empty)
- `src/components/shared/` — Timer, search, badges, etc. (created empty)
- `src/lib/db/index.ts` — Drizzle client + Neon connection
- `src/lib/db/schema/` — Schema files directory (created empty)
- `src/lib/auth/` — NextAuth config directory (created empty)
- `src/lib/actions/` — Server Actions directory (created empty)
- `src/lib/queries/` — Data access layer directory (created empty)
- `src/lib/validators/` — Zod schemas directory (created empty)
- `src/lib/utils/` — Helper utilities directory
- `src/lib/utils/cn.ts` — Class name merge utility
- `src/lib/hooks/` — Client-side hooks directory (created empty)
- `src/lib/storage/` — File storage abstraction (created empty)
- `src/types/` — Shared TypeScript types (created empty)
- `drizzle.config.ts` — Drizzle Kit configuration
- `.env.local` — Environment variables (not committed)
- `.env.example` — Environment variable template
- `.prettierrc` — Prettier configuration

### References

- [Source: a.md — Tech Stack]
- [Source: a.md — Project Structure]
- [Source: epics.md — Epic 1, Story 1.1]
- [Source: a.md — Implementation Phases, Phase 1]

## Dev Agent Record

### Implementation Notes
- Initialized Next.js 16.1.6 with App Router, TypeScript strict mode, Tailwind CSS v4
- Installed all 23 shadcn/ui components via CLI
- Installed all production dependencies: drizzle-orm, @neondatabase/serverless, react-hook-form, @hookform/resolvers, zod, recharts, @tanstack/react-table, lucide-react, bcryptjs, next-auth@beta, date-fns, clsx, tailwind-merge, class-variance-authority
- Installed dev dependencies: drizzle-kit, @types/bcryptjs, prettier
- Created Drizzle ORM configuration with Neon HTTP driver
- Created project directory structure with all required route groups and lib directories
- Created landing page showcasing key features (case management, billing, compliance, etc.)
- Root layout configured with Geist fonts, Toaster provider, and metadata
- Build passes with zero errors
- AC11 (Vercel deployment) requires user credentials — marked incomplete pending user action

### Debug Log
- create-next-app failed with directory name containing spaces; resolved by creating in /tmp and copying files

## File List

- package.json (modified — dependencies added)
- tsconfig.json (no changes needed — strict already enabled)
- drizzle.config.ts (new)
- .env.local (new)
- .env.example (new)
- .prettierrc (new)
- src/app/layout.tsx (modified)
- src/app/page.tsx (modified)
- src/app/globals.css (modified by shadcn init)
- src/lib/db/index.ts (new)
- src/lib/utils.ts (new — created by shadcn init)
- src/lib/utils/cn.ts (new)
- src/components/ui/*.tsx (new — 23 shadcn components)
- components.json (new — shadcn config)

## Change Log

- 2026-02-22: Story implementation — initialized Next.js project with all dependencies, shadcn/ui components, project structure, and configuration files. Build passes cleanly. Vercel deployment pending user credentials.
