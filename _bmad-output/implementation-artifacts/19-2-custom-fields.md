# Story 19.2: Custom Fields on All Entities

Status: ready-for-dev

## Story

As an Admin,
I want to define custom fields on clients, cases, attorneys, and invoices,
so that the system adapts to our firm's specific data needs without schema changes.

## Acceptance Criteria (ACs)

1. **Custom Fields Management Page:** A page at `/(dashboard)/settings/custom-fields` where Admin can view, create, edit, and delete custom field definitions.
2. **Field Definition:** Each custom field has: name (required, unique per entity type), field type (required), options (for Dropdown type), required flag (boolean), entity type (required).
3. **Supported Field Types:** Text (single line), Number (integer or decimal), Date (date picker), Dropdown (single select from predefined options list), Checkbox (boolean), Textarea (multi-line text).
4. **Entity Type Selection:** Custom fields can be defined for: Client, Case, Attorney, Invoice. Each field is scoped to exactly one entity type.
5. **Custom Fields on Entity Forms:** When creating or editing a Client, Case, Attorney, or Invoice, the form dynamically renders all active custom fields for that entity type below the standard fields.
6. **Custom Fields on Detail Pages:** Custom field values are displayed on entity detail pages in a "Custom Fields" section or tab, showing field name and value.
7. **JSONB Value Storage:** Custom field values are stored in the `custom_fields` table with columns: `entity_type, entity_id, field_id, value (JSONB)`. This avoids schema changes for each new field.
8. **Search/Filter by Custom Fields:** List pages for entities support filtering by custom field values (at minimum for Text and Dropdown types).
9. **Validation:** Required custom fields are enforced during form submission. Number fields validate numeric input. Date fields validate date format. Dropdown fields validate against defined options.
10. **Audit Logging:** Creation, modification, and deletion of custom field definitions are recorded in the audit log.

## Tasks / Subtasks

- [ ] **Task 1: Create custom fields management page** (AC 1, 2, 3, 4, 10)
  - Create `src/app/(dashboard)/settings/custom-fields/page.tsx` with DataTable
  - Columns: name, field type badge, entity type badge, required (yes/no), options (for Dropdown)
  - Filter by entity type
  - Add/Edit via shadcn Dialog

- [ ] **Task 2: Build custom field definition form** (AC 2, 3, 4)
  - Create `src/components/settings/custom-field-form.tsx`
  - Form fields:
    - Name (text input, required)
    - Entity Type (select: Client, Case, Attorney, Invoice)
    - Field Type (select: Text, Number, Date, Dropdown, Checkbox, Textarea)
    - Required (checkbox)
    - Options (dynamic list input, visible only when type is Dropdown - add/remove option values)
  - react-hook-form + Zod validation

- [ ] **Task 3: Create custom field validators and actions** (AC 2, 9, 10)
  - Create `src/lib/validators/custom-field.ts` with Zod schemas:
    - `customFieldDefinitionSchema`: name, entityType (enum), fieldType (enum), required (boolean), options (array, required if Dropdown)
    - `customFieldValueSchema`: fieldId, value (validated based on field type)
  - Create `src/lib/actions/custom-fields.ts` with:
    - `createCustomField(data)` - insert definition, unique name per entity type
    - `updateCustomField(id, data)` - update definition (caution: changing type may invalidate existing values)
    - `deleteCustomField(id)` - delete definition and all associated values (with confirmation)
    - `saveCustomFieldValues(entityType, entityId, values)` - upsert values for an entity
  - Audit log on all definition mutations

- [ ] **Task 4: Create custom field queries** (AC 1, 5, 6, 8)
  - Create `src/lib/queries/custom-fields.ts` with:
    - `getCustomFieldDefinitions(entityType?)` - all definitions, optionally filtered by entity type
    - `getCustomFieldValues(entityType, entityId)` - all values for a specific entity instance
    - `getCustomFieldValuesForEntities(entityType, entityIds)` - batch fetch for list pages
    - `searchByCustomField(entityType, fieldId, value)` - find entities matching a custom field value

- [ ] **Task 5: Build dynamic custom fields renderer** (AC 5, 9)
  - Create `src/components/custom-fields/custom-fields-renderer.tsx` - a client component that:
    - Accepts an array of custom field definitions and optional current values
    - Renders appropriate form controls for each field type:
      - Text: `<Input type="text" />`
      - Number: `<Input type="number" />`
      - Date: shadcn `<DatePicker />`
      - Dropdown: shadcn `<Select>` with options from definition
      - Checkbox: shadcn `<Checkbox />`
      - Textarea: `<Textarea />`
    - Integrates with parent react-hook-form via `useFormContext()` or accepts register/control props
    - Enforces required validation on required fields
    - Returns values as `Record<fieldId, value>`

- [ ] **Task 6: Build custom fields display component** (AC 6)
  - Create `src/components/custom-fields/custom-fields-display.tsx` - read-only display of custom field values
  - Renders as label-value pairs or a mini table
  - Handles empty/null values gracefully ("Not set")
  - Format values based on type (dates formatted, checkboxes as Yes/No, etc.)

- [ ] **Task 7: Integrate custom fields into entity forms** (AC 5)
  - Modify client creation/edit form to include `<CustomFieldsRenderer entityType="Client" />`
  - Modify case creation/edit form to include `<CustomFieldsRenderer entityType="Case" />`
  - Modify attorney creation/edit form to include `<CustomFieldsRenderer entityType="Attorney" />`
  - Modify invoice/fee note creation form to include `<CustomFieldsRenderer entityType="Invoice" />`
  - On form submit, call `saveCustomFieldValues()` alongside the main entity save

- [ ] **Task 8: Integrate custom fields into detail pages** (AC 6)
  - Add `<CustomFieldsDisplay>` to client detail page
  - Add `<CustomFieldsDisplay>` to case detail page
  - Add `<CustomFieldsDisplay>` to attorney detail page
  - Add `<CustomFieldsDisplay>` to invoice detail page
  - Fetch custom field values as part of the detail page data loading

- [ ] **Task 9: Implement custom field filtering on list pages** (AC 8)
  - Add custom field filter options to entity list pages
  - For Text fields: text search input
  - For Dropdown fields: select from defined options
  - Filtering queries use JSONB operators to search custom_fields table
  - This may be implemented as an "Advanced Filters" section

- [ ] **Task 10: Add custom fields to settings navigation** (AC 1)
  - Update settings layout to include "Custom Fields" link

## Dev Notes

- **JSONB Storage Pattern:** The `custom_fields` value table stores values as JSONB: `{ entity_type: 'client', entity_id: uuid, field_id: uuid, value: jsonb }`. The JSONB value allows storing any type without schema changes. For example: `"John Doe"` for text, `42` for number, `"2025-06-15"` for date, `true` for checkbox.
- **Dynamic Form Rendering:** The `CustomFieldsRenderer` component must be flexible enough to work with any entity form. The recommended approach is:
  1. Fetch custom field definitions for the entity type
  2. Pass definitions to the renderer
  3. Renderer creates form fields dynamically
  4. On submit, extract custom field values from form state and save separately
- **Type Safety:** Create a TypeScript type for custom field values that accounts for the dynamic nature:
  ```typescript
  type CustomFieldValue = string | number | boolean | Date | null;
  type CustomFieldValues = Record<string, CustomFieldValue>;
  ```
- **Dropdown Options:** Stored as a JSON array in the field definition: `["Option A", "Option B", "Option C"]`. When editing a dropdown definition, warn if removing an option that has existing values.
- **Performance:** For list pages, batch-fetch custom field values for all visible entities in a single query rather than N+1 queries. Use `getCustomFieldValuesForEntities(entityType, entityIds)`.
- **JSONB Querying:** PostgreSQL JSONB operators (`->`, `->>`, `@>`) enable filtering by custom field values. For text search: `WHERE value::text ILIKE '%search%'`. For dropdown: `WHERE value = '"OptionA"'::jsonb`.
- **Migration Caution:** Changing a custom field's type after values exist may cause data inconsistencies. The UI should warn the admin and optionally offer to clear existing values.

### Project Structure Notes

**New files to create:**
- `src/app/(dashboard)/settings/custom-fields/page.tsx`
- `src/components/settings/custom-field-form.tsx`
- `src/components/custom-fields/custom-fields-renderer.tsx`
- `src/components/custom-fields/custom-fields-display.tsx`
- `src/lib/validators/custom-field.ts`
- `src/lib/actions/custom-fields.ts`
- `src/lib/queries/custom-fields.ts`

**Files to modify:**
- `src/app/(dashboard)/settings/layout.tsx` (add Custom Fields nav)
- Client creation/edit form (integrate custom fields renderer)
- Case creation/edit form (integrate custom fields renderer)
- Attorney creation/edit form (integrate custom fields renderer)
- Invoice/fee note creation form (integrate custom fields renderer)
- Client detail page (add custom fields display)
- Case detail page (add custom fields display)
- Attorney detail page (add custom fields display)
- Invoice detail page (add custom fields display)
- Entity list pages (add custom field filters)

### References

- [Source: a.md -- Law Firm Registry Implementation Plan]
- [Source: epics.md -- Epic 19: Multi-Branch & Customization, Story 19.2]
- [Source: epics.md -- Epic 1: Project Foundation, Story 1.2] (custom_fields table in schema)
- PostgreSQL JSONB documentation for querying
- react-hook-form dynamic fields documentation

## Dev Agent Record

### Agent Model Used


### Debug Log References


### Completion Notes List


### Change Log
| Change | Details |
|--------|---------|
| | |

### File List
