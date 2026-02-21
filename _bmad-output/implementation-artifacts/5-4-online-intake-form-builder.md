# Story 5.4: Online Client Intake Form & Custom Form Builder

Status: ready-for-dev

## Story

As an Admin,
I want shareable intake forms and a form builder for different practice areas,
so that clients can self-register 24/7.

## Acceptance Criteria (ACs)

1. **Public intake page at /intake** — accessible without authentication; professional, branded page with firm logo and name.
2. **Shareable URL** — each form template has a unique URL (e.g., /intake?template=personal-injury) that can be shared via email, WhatsApp, or embedded on a website.
3. **Default form fields** — name (first, last), email, phone (+254 validated), case type (dropdown), description of legal matter (textarea), referral source (dropdown: website, referral, advertising, walk-in, WhatsApp, other).
4. **Data Protection Act 2019 consent checkbox** — required checkbox with text explaining data collection and processing; form cannot submit without consent.
5. **Terms of engagement checkbox** — required checkbox acknowledging the firm's terms; text configurable by admin.
6. **File upload** — max 3 files, 10MB each; accepted types: PDF, JPG, PNG, DOCX; upload progress indicator.
7. **CAPTCHA / rate limiting** — bot protection on form submission; implement rate limiting (max 5 submissions per IP per hour).
8. **Auto-processing on submit** — creates client record with status 'pending', triggers conflict check against submitted name, sends notification to assigned attorney or admin.
9. **Custom form builder (Admin)** — drag-and-drop field configuration per practice area; field types: text, textarea, select, checkbox, date, phone, email, file upload; field properties: label, placeholder, required, help text.
10. **Pre-built form templates** — seeded templates for: Personal Injury, Conveyancing, Corporate, Family, Criminal, Employment; each with practice-area-specific fields.
11. **Form template selection on intake page** — intake page shows available templates as cards or dropdown; selecting a template loads practice-area-specific fields.

## Tasks / Subtasks

- [ ] **Create Zod schemas for intake form** (AC 3, 4, 5, 6)
  - [ ] `src/lib/validators/intake.ts` — publicIntakeSchema with +254 phone, email, required consent fields
  - [ ] Dynamic schema generation based on form template configuration
- [ ] **Build public intake page** (AC 1, 2, 3, 11)
  - [ ] `src/app/intake/page.tsx` — public page (outside auth route groups)
  - [ ] `src/app/intake/layout.tsx` — minimal layout with firm logo, no sidebar/nav
  - [ ] Template selector: read `template` query param or show template cards
  - [ ] Load form fields dynamically based on selected template
  - [ ] Responsive design for mobile (single-column form)
- [ ] **Build intake form component** (AC 3, 4, 5, 6)
  - [ ] `src/components/forms/public-intake-form.tsx` — react-hook-form based form
  - [ ] Standard fields: name, email, phone (+254 mask), case type, description, referral source
  - [ ] Dynamic fields rendered from template configuration
  - [ ] Data Protection Act 2019 consent checkbox with legal text
  - [ ] Terms of engagement checkbox
  - [ ] File upload component (max 3 files, 10MB each, with progress)
  - [ ] Success page/message after submission
- [ ] **Build intake form submission API route** (AC 7, 8)
  - [ ] `src/app/api/intake/route.ts` — POST handler
  - [ ] Rate limiting middleware (5 submissions per IP per hour via in-memory store or Redis)
  - [ ] Validate form data with Zod
  - [ ] Create client record with status 'pending'
  - [ ] Store uploaded files via storage abstraction
  - [ ] Trigger conflict check (async) using searchConflicts from Story 5.3
  - [ ] Create notification for admin/attorney
  - [ ] Return success response
- [ ] **Build custom form builder page (Admin)** (AC 9)
  - [ ] `src/app/(dashboard)/settings/intake-forms/page.tsx` — list of form templates
  - [ ] `src/app/(dashboard)/settings/intake-forms/[id]/page.tsx` — form builder interface
  - [ ] `src/components/forms/form-builder.tsx` — drag-and-drop field configuration
  - [ ] Field palette: text, textarea, select (with options editor), checkbox, date, phone, email, file upload
  - [ ] Field properties panel: label, placeholder, required toggle, help text, validation rules
  - [ ] Drag to reorder fields
  - [ ] Preview mode to test form layout
  - [ ] Save template configuration as JSON in database
- [ ] **Create form template schema and storage** (AC 9, 10)
  - [ ] Form template DB table or use existing structure: name, practice_area_id, fields (JSONB), is_active, shareable_slug
  - [ ] `src/lib/actions/intake-forms.ts` — createTemplate, updateTemplate, deleteTemplate, toggleActive
  - [ ] `src/lib/queries/intake-forms.ts` — getTemplates, getTemplateBySlug, getActiveTemplates
- [ ] **Seed pre-built templates** (AC 10)
  - [ ] Add to seed script: Personal Injury (injury type, injury date, medical treatment, insurance info), Conveyancing (property type, property location, seller/buyer info, title number), Corporate (company name, registration number, service type), Family (matter type, children involved, spousal details), Criminal (charge type, arrest date, bail status, police station), Employment (employer, position, termination date, claim type)
- [ ] **Implement CAPTCHA** (AC 7)
  - [ ] Integrate simple CAPTCHA solution (e.g., hCaptcha or custom math challenge)
  - [ ] Verify CAPTCHA token on server before processing submission
- [ ] **Build intake submissions management** (AC 8)
  - [ ] `src/app/(dashboard)/clients/intake-submissions/page.tsx` — list of pending intake submissions
  - [ ] Actions: approve (converts to full client), reject (with reason), view details
  - [ ] Conflict check results displayed alongside submission

## Dev Notes

### Architecture Patterns
- The intake page must be completely public (no auth required) — it lives outside the (auth), (dashboard), and (portal) route groups
- Form builder stores field configurations as JSONB in the database; the public intake form dynamically renders fields from this JSON
- Rate limiting: for demo, use in-memory Map with IP + timestamp; for production, consider Redis or a rate-limiting library
- File uploads on the public form go through the API route which validates and stores them; files are associated with the intake submission record
- The form builder should use a state management approach (useState or useReducer) for the drag-and-drop field list; consider `@dnd-kit/core` for drag-and-drop

### Libraries
- `react-hook-form` + Zod for form validation
- `@dnd-kit/core` + `@dnd-kit/sortable` for drag-and-drop in form builder
- shadcn/ui components: Card, Form, Input, Select, Textarea, Checkbox, Button, Dialog, Tabs
- Consider `hcaptcha` or `@hcaptcha/react-hcaptcha` for bot protection
- File upload: custom component with progress using XMLHttpRequest or fetch with ReadableStream

### Form Template JSON Structure
```typescript
interface FormTemplate {
  id: string;
  name: string;
  practiceAreaId: string;
  slug: string;
  fields: FormField[];
  isActive: boolean;
}

interface FormField {
  id: string;
  type: 'text' | 'textarea' | 'select' | 'checkbox' | 'date' | 'phone' | 'email' | 'file';
  label: string;
  placeholder?: string;
  required: boolean;
  helpText?: string;
  options?: { label: string; value: string }[]; // for select fields
  validation?: { maxLength?: number; pattern?: string };
}
```

### Project Structure Notes

Files to create:
- `src/app/intake/page.tsx` — public intake page
- `src/app/intake/layout.tsx` — minimal public layout
- `src/app/api/intake/route.ts` — intake submission API
- `src/components/forms/public-intake-form.tsx` — public intake form
- `src/components/forms/form-builder.tsx` — admin form builder
- `src/components/forms/dynamic-field-renderer.tsx` — renders fields from JSON config
- `src/app/(dashboard)/settings/intake-forms/page.tsx` — template list (admin)
- `src/app/(dashboard)/settings/intake-forms/[id]/page.tsx` — template editor (admin)
- `src/app/(dashboard)/clients/intake-submissions/page.tsx` — submissions review
- `src/lib/validators/intake.ts` — Zod schemas
- `src/lib/actions/intake-forms.ts` — server actions for templates
- `src/lib/queries/intake-forms.ts` — queries for templates
- `src/types/intake.ts` — FormTemplate and FormField type definitions

Files to modify:
- `src/lib/db/schema/` — add form_templates table if not present
- Seed script — add pre-built form templates
- `src/components/layout/sidebar.tsx` — add Intake Forms under Settings nav group (admin only)

### References

- [Source: a.md - Module 19: Client Intake - Kenya Enhanced] — online intake forms, custom form builder, pre-built templates, consent checkboxes
- [Source: epics.md - Epic 5, Story 5.4] — acceptance criteria
- [Source: a.md - Kenya Legal Requirements] — Data Protection Act 2019 consent requirement
- [Source: a.md - Feature Gap Analysis #17] — Online Client Intake Forms as MUST-HAVE (from Clio, MyCase)
