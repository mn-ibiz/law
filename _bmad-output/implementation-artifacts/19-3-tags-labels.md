# Story 19.3: Tags / Labels System

Status: ready-for-dev

## Story

As an Admin,
I want a flexible tagging system for cases, clients, documents, and invoices,
so that entities can be categorized, found, and organized beyond fixed fields.

## Acceptance Criteria (ACs)

1. **Tag Management Page:** A settings page at `/(dashboard)/settings/tags` where Admin can view, create, edit, and delete tags.
2. **Tag Definition:** Each tag has: name (required, unique), color (hex color code, displayed as badge background), and applicable entity types (multi-select: Case, Client, Document, Invoice).
3. **Apply Tags from Detail Pages:** On entity detail pages (case, client, document, invoice), a "Tags" section allows adding and removing tags via a searchable multi-select dropdown showing only tags applicable to that entity type.
4. **Tags Displayed as Colored Badges:** Tags are shown as small colored badges (tag name with colored background) on both list pages and detail pages. Badge color uses the tag's hex color with appropriate text contrast.
5. **Filter by Tag on List Pages:** All entity list pages (cases, clients, documents, invoices) support filtering by one or more tags. Tag filter appears alongside existing filters.
6. **Bulk Tag Application:** On list pages, users can select multiple entities (checkbox column) and apply or remove a tag in bulk via a bulk action toolbar.
7. **Remove Tags:** Individual tags can be removed from an entity on its detail page with a single click (X button on badge).
8. **Tag Usage Statistics:** On the tag management page, each tag shows a usage count (how many entities currently have that tag applied).
9. **Audit Logging:** Tag creation, editing, deletion, and application/removal are recorded in the audit log.

## Tasks / Subtasks

- [ ] **Task 1: Create tag management page** (AC 1, 2, 8)
  - Create `src/app/(dashboard)/settings/tags/page.tsx` with DataTable
  - Columns: name, color (rendered as colored circle/badge preview), entity types (comma-separated badges), usage count
  - Add/Edit tag via shadcn Dialog
  - Delete tag with confirmation (also removes all tag applications)

- [ ] **Task 2: Build tag definition form** (AC 2)
  - Create `src/components/settings/tag-form.tsx`
  - Fields:
    - Name (text input, required, unique)
    - Color (hex color picker, can use a preset palette of 12-16 colors plus custom hex input)
    - Entity Types (multi-checkbox: Case, Client, Document, Invoice)
  - react-hook-form + Zod validation

- [ ] **Task 3: Create tag validators and server actions** (AC 2, 9)
  - Create `src/lib/validators/tag.ts` with Zod schemas:
    - `tagSchema`: name (required, min 2), color (hex format validation), entityTypes (array of enum, min 1)
    - `tagApplicationSchema`: tagId, entityType, entityId
  - Create `src/lib/actions/tags.ts` with:
    - `createTag(data)` - insert with unique name check
    - `updateTag(id, data)` - update name, color, entity types
    - `deleteTag(id)` - delete tag definition and all applications
    - `applyTag(tagId, entityType, entityId)` - add tag to entity (upsert to prevent duplicates)
    - `removeTag(tagId, entityType, entityId)` - remove tag from entity
    - `bulkApplyTag(tagId, entityType, entityIds)` - apply tag to multiple entities
    - `bulkRemoveTag(tagId, entityType, entityIds)` - remove tag from multiple entities
  - All actions call `createAuditLog()`

- [ ] **Task 4: Create tag queries** (AC 1, 3, 5, 8)
  - Create `src/lib/queries/tags.ts` with:
    - `getTags()` - all tags with usage counts (COUNT of applications per tag)
    - `getTagsForEntityType(entityType)` - tags applicable to a specific entity type (for dropdowns)
    - `getEntityTags(entityType, entityId)` - tags applied to a specific entity
    - `getEntityTagsBatch(entityType, entityIds)` - batch fetch tags for list page rendering
    - `getEntitiesByTag(tagId, entityType)` - entity IDs that have a specific tag (for filtering)

- [ ] **Task 5: Build tag badge component** (AC 4, 7)
  - Create `src/components/tags/tag-badge.tsx` - renders a colored badge with tag name
    - Props: name, color, onRemove? (optional, shows X button when provided)
    - Compute text color (white or black) based on background color luminance for contrast
    - Use shadcn Badge with custom background-color style

- [ ] **Task 6: Build tag selector component** (AC 3)
  - Create `src/components/tags/tag-selector.tsx` - searchable multi-select for applying tags
    - Props: entityType, entityId, currentTags
    - Shows available tags for the entity type as colored options
    - Selected tags shown as badges below the selector
    - On select: calls `applyTag()` server action
    - On remove (X click): calls `removeTag()` server action
    - Optimistic UI updates

- [ ] **Task 7: Integrate tags into entity detail pages** (AC 3, 4, 7)
  - Add `<TagSelector>` and `<TagBadge>` components to:
    - Case detail page (header or sidebar section)
    - Client detail page
    - Document detail page
    - Invoice/fee note detail page
  - Display current tags as badges, with tag selector for adding new ones

- [ ] **Task 8: Integrate tags into entity list pages** (AC 4, 5)
  - Add tag badges column to DataTable on cases, clients, documents, invoices list pages
  - Add tag filter dropdown to list page filters (multi-select from available tags)
  - Filter queries join through tag applications to filter entities by selected tag(s)
  - Use `getEntityTagsBatch()` for efficient tag loading on list pages

- [ ] **Task 9: Implement bulk tag operations** (AC 6)
  - Add checkbox column to entity DataTables (if not already present)
  - Create `src/components/tags/bulk-tag-toolbar.tsx` - toolbar shown when entities are selected
    - "Apply Tag" button with tag dropdown
    - "Remove Tag" button with tag dropdown
    - Shows count of selected entities
  - Calls `bulkApplyTag()` or `bulkRemoveTag()` server actions
  - Success toast with count of affected entities

- [ ] **Task 10: Add tags to settings navigation** (AC 1)
  - Update settings layout to include "Tags" link

## Dev Notes

- **Data Model:** Tags use a polymorphic many-to-many pattern:
  - `tags` table: `id, name, color (varchar hex), entity_types (text[] or JSONB array), created_at, updated_at`
  - `tag_applications` (or `entity_tags`) table: `id, tag_id (FK), entity_type (varchar), entity_id (uuid), created_at`
  - Unique constraint on `(tag_id, entity_type, entity_id)` to prevent duplicate applications
- **Color Contrast:** To determine text color for tag badges, calculate relative luminance: `L = 0.299*R + 0.587*G + 0.114*B`. If L > 186, use black text; otherwise, use white text. Implement in `src/lib/utils/color.ts`.
- **Preset Color Palette:** Offer a grid of preset colors (e.g., red, orange, yellow, green, teal, blue, indigo, purple, pink, gray) plus a custom hex input. This ensures tags are visually distinct.
- **Polymorphic Association:** The `entity_type` + `entity_id` pattern is used because tags apply to multiple table types. This avoids needing separate junction tables for each entity. The trade-off is no foreign key constraint on `entity_id`, so the application layer must ensure referential integrity.
- **Performance:** Add indexes on `tag_applications(tag_id)`, `tag_applications(entity_type, entity_id)` for efficient lookups. For list pages, batch-fetch tags for all visible entities rather than N+1 queries.
- **Bulk Operations:** Bulk tag application should use a single database transaction inserting multiple rows. Drizzle's `insert().values([...])` supports batch inserts.
- **Tag Deletion Cascade:** Deleting a tag definition should also delete all its applications (cascade or explicit delete). Warn the admin with the usage count before deletion.

### Project Structure Notes

**New files to create:**
- `src/app/(dashboard)/settings/tags/page.tsx`
- `src/components/settings/tag-form.tsx`
- `src/components/tags/tag-badge.tsx`
- `src/components/tags/tag-selector.tsx`
- `src/components/tags/bulk-tag-toolbar.tsx`
- `src/lib/validators/tag.ts`
- `src/lib/actions/tags.ts`
- `src/lib/queries/tags.ts`
- `src/lib/utils/color.ts` (color contrast utility)

**Files to modify:**
- `src/app/(dashboard)/settings/layout.tsx` (add Tags nav item)
- Case detail page (add tag section)
- Client detail page (add tag section)
- Document detail page (add tag section)
- Invoice detail page (add tag section)
- Cases list page (add tag badges column and tag filter)
- Clients list page (add tag badges column and tag filter)
- Documents list page (add tag badges column and tag filter)
- Invoices list page (add tag badges column and tag filter)

### References

- [Source: a.md -- Law Firm Registry Implementation Plan]
- [Source: epics.md -- Epic 19: Multi-Branch & Customization, Story 19.3]
- [Source: epics.md -- Epic 1: Project Foundation, Story 1.2] (tags table in schema)
- shadcn/ui Badge component documentation
- W3C color contrast guidelines (WCAG 2.0)

## Dev Agent Record

### Agent Model Used


### Debug Log References


### Completion Notes List


### Change Log
| Change | Details |
|--------|---------|
| | |

### File List
