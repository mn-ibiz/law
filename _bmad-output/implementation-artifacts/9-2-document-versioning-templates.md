# Story 9.2: Document Versioning & Templates

Status: ready-for-dev

## Story

As an Attorney,
I want version control and reusable templates,
so that revisions are tracked and documents generated quickly.

## Acceptance Criteria (ACs)

1. "Upload New Version" button on document detail page that creates a new version entry while preserving all previous versions
2. Version history table displaying: version number, uploader name, upload date, change notes, and individual download link for each version
3. Download any historical version from the version history table
4. Template management page for creating and managing document templates
5. Create template form with fields: name, description, category, file upload
6. Template placeholder system supporting: {{client_name}}, {{client_address}}, {{case_number}}, {{case_title}}, {{attorney_name}}, {{firm_name}}, {{firm_address}}, {{date}}, {{court_name}}, {{judge_name}}
7. "Use Template" action: select template, select case/client, system replaces all placeholders with actual data, generates downloadable document
8. Document status workflow enforced: Draft -> Review -> Approved -> Final -> Archived

## Tasks / Subtasks

- [ ] **Task 1: Zod schemas for versioning and templates** (AC 1, 5, 6)
  - [ ] Add `documentVersionSchema` to `src/lib/validators/documents.ts` — version notes, file validation
  - [ ] Add `documentTemplateSchema` — name, description, category, file, placeholders
  - [ ] Add `useTemplateSchema` — template ID, case ID, client ID

- [ ] **Task 2: Server actions for document versioning** (AC 1, 2, 3)
  - [ ] Add to `src/lib/actions/documents.ts`:
  - [ ] `uploadNewVersion(documentId, formData)` — increment version number, store file with versioned key, insert `document_versions` record, update main document record with latest file URL, audit log
  - [ ] `downloadVersion(documentId, versionId)` — fetch version file URL, audit log

- [ ] **Task 3: Server actions for template management** (AC 4, 5, 6, 7)
  - [ ] Create `src/lib/actions/document-templates.ts`
  - [ ] `createTemplate(data)` — validate, store template file, insert `document_templates` record
  - [ ] `updateTemplate(id, data)` — update metadata, optionally replace file
  - [ ] `deleteTemplate(id)` — soft-delete template
  - [ ] `useTemplate(templateId, caseId, clientId)` — fetch template file, resolve all placeholders from case/client/attorney/firm data, generate output document for download

- [ ] **Task 4: Placeholder resolution engine** (AC 6, 7)
  - [ ] Create `src/lib/utils/template-placeholders.ts`
  - [ ] Define `AVAILABLE_PLACEHOLDERS` constant array
  - [ ] `resolvePlaceholders(templateContent, context)` function
  - [ ] Context builder: fetch client, case, attorney, firm settings to populate all placeholder values
  - [ ] Handle DOCX files using `docx-templates` or string replacement on XML content
  - [ ] Handle TXT/plain text with simple string replacement

- [ ] **Task 5: Data queries for versions and templates** (AC 2, 4)
  - [ ] Add to `src/lib/queries/documents.ts`:
  - [ ] `getDocumentVersions(documentId)` — ordered by version number descending
  - [ ] Add to `src/lib/queries/document-templates.ts`:
  - [ ] `getTemplates(filters)` — paginated, filterable by category
  - [ ] `getTemplateById(id)` — full template details

- [ ] **Task 6: Version history UI on document detail page** (AC 1, 2, 3)
  - [ ] Add version history section to `src/app/(dashboard)/documents/[id]/page.tsx`
  - [ ] Table columns: version number, uploaded by, date, notes, download button
  - [ ] "Upload New Version" button opening a Sheet/Dialog with file input and notes field
  - [ ] Create `src/components/forms/document-version-form.tsx`

- [ ] **Task 7: Template management page** (AC 4, 5, 6)
  - [ ] Create `src/app/(dashboard)/documents/templates/page.tsx`
  - [ ] DataTable listing templates: name, category, placeholder count, created date, actions
  - [ ] Create `src/components/forms/document-template-form.tsx` — name, description, category, file upload
  - [ ] Placeholder reference card showing available placeholders

- [ ] **Task 8: "Use Template" flow** (AC 7)
  - [ ] Create `src/components/forms/use-template-form.tsx`
  - [ ] Step 1: Select template from list
  - [ ] Step 2: Select case and/or client (searchable dropdowns)
  - [ ] Step 3: Preview resolved placeholders
  - [ ] Step 4: Generate and download document
  - [ ] Accessible from template list page and case detail documents tab

- [ ] **Task 9: Document status workflow enforcement** (AC 8)
  - [ ] Add status transition validation to `updateDocumentMetadata` action
  - [ ] Enforce: Draft -> Review -> Approved -> Final -> Archived
  - [ ] Show allowed next statuses on document detail page as action buttons
  - [ ] Status change creates audit log entry

## Dev Notes

- For DOCX placeholder replacement, consider `docx-templates` (npm) which supports `{placeholder}` syntax natively; alternatively, manipulate the DOCX XML directly using `JSZip` to unzip, replace strings in `word/document.xml`, and re-zip
- For simpler text-based templates (TXT), use straightforward `String.replace()` with regex
- PDF template replacement is significantly harder; recommend keeping templates as DOCX and offering PDF conversion as a separate concern
- Version numbering should be auto-incremented integers starting at 1; the main `documents` table should track `current_version` number
- Storage keys for versions: `documents/{documentId}/v{versionNumber}/{filename}`
- The template "Use" flow should generate a new file (not modify the template itself); output goes to the user's browser as a download
- Firm settings (name, address) should be fetched from the `firm_settings` table for placeholder resolution
- Ensure templates page is accessible from the documents section navigation (sub-nav or tab)

### Project Structure Notes

Files to create:
- `src/lib/actions/document-templates.ts` — template CRUD server actions
- `src/lib/queries/document-templates.ts` — template data queries
- `src/lib/utils/template-placeholders.ts` — placeholder resolution engine
- `src/app/(dashboard)/documents/templates/page.tsx` — template management page
- `src/components/forms/document-template-form.tsx` — template create/edit form
- `src/components/forms/document-version-form.tsx` — version upload form
- `src/components/forms/use-template-form.tsx` — template usage wizard

Files to modify:
- `src/lib/validators/documents.ts` — add version and template schemas
- `src/lib/actions/documents.ts` — add versioning actions
- `src/lib/queries/documents.ts` — add version queries
- `src/app/(dashboard)/documents/[id]/page.tsx` — add version history section
- `src/app/(dashboard)/documents/page.tsx` — add link to templates page

### References

- [Source: a.md - Module 6: Document Management — Version control, templates]
- [Source: epics.md - Epic 9, Story 9.2]
- [Source: a.md - Database: documents, document_versions, document_templates tables]

## Dev Agent Record

### Agent Model Used


### Debug Log References


### Completion Notes List


### Change Log
| Change | Details |
|--------|---------|
| | |

### File List
