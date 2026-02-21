# Story 6.3: Case Assignments, Notes & Auto-Generated Timeline

Status: ready-for-dev

## Story

As an Admin/Attorney,
I want attorney assignments with roles and automatic activity tracking,
so that responsibilities are clear and all activity is logged.

## Acceptance Criteria (ACs)

1. **Assign attorneys with roles** — each case assignment specifies a role: Lead, Assigned, Supervising, or Of Counsel; multiple attorneys can be assigned to a single case.
2. **Only one Lead attorney** — enforced at the database and application level; reassigning Lead removes Lead role from the previous holder (with confirmation).
3. **Assignment creates timeline event and notification** — when an attorney is assigned to a case, an auto-generated timeline entry is created ("Attorney [Name] assigned as [Role]") and the attorney receives an in-app notification.
4. **Auto-generated timeline events** — the following events automatically create timeline entries: case created, status changed (from -> to), attorney assigned/unassigned, document uploaded, invoice created, payment received, deadline added/completed, court date scheduled.
5. **Manual timeline entry form** — attorneys and admins can add manual timeline entries with: description (required), optional event type tag, optional attachments reference.
6. **Case notes: private vs shared** — notes can be marked as private (visible only to attorneys/admin in the dashboard) or shared (also visible to the client in the portal).
7. **Edit/delete own notes** — users can edit and delete only their own notes; admin can delete any note.
8. **createTimelineEvent() utility function** — a reusable utility function called from all server actions that should create timeline entries; accepts: caseId, eventType, description, userId, metadata (optional JSON).

## Tasks / Subtasks

- [ ] **Build createTimelineEvent() utility** (AC 4, 8)
  - [ ] `src/lib/utils/timeline.ts` — createTimelineEvent(params: TimelineEventParams)
  - [ ] Parameters: caseId, eventType (enum), description, userId, metadata (optional JSONB)
  - [ ] Event types enum: 'case_created', 'status_changed', 'attorney_assigned', 'attorney_unassigned', 'document_uploaded', 'invoice_created', 'payment_received', 'deadline_added', 'deadline_completed', 'court_date_scheduled', 'note_added', 'manual_entry'
  - [ ] Inserts into case_timeline table
  - [ ] Returns the created timeline entry
- [ ] **Build case assignment server actions** (AC 1, 2, 3)
  - [ ] `src/lib/actions/case-assignments.ts` — assignAttorney, unassignAttorney, changeAssignmentRole
  - [ ] assignAttorney: validate role, check for existing Lead if assigning Lead role
  - [ ] If assigning new Lead: prompt confirmation, reassign previous Lead to 'Assigned' role
  - [ ] Call createTimelineEvent() on assign/unassign
  - [ ] Create notification for the assigned attorney
  - [ ] Audit log entry
- [ ] **Build assignment management UI** (AC 1, 2)
  - [ ] `src/components/cases/case-assignments.tsx` — displays current assignments with role badges
  - [ ] "Assign Attorney" dialog: attorney searchable dropdown, role selector
  - [ ] "Change Role" action per assignment
  - [ ] "Unassign" action with confirmation
  - [ ] Lead attorney highlighted with distinct badge/icon
- [ ] **Integrate auto-timeline creation into existing actions** (AC 4)
  - [ ] Modify `src/lib/actions/cases.ts` — createCase: add "Case created" timeline event
  - [ ] Modify `src/lib/actions/cases.ts` — transitionCaseStatus: add "Status changed from X to Y" timeline event
  - [ ] Prepare integration points for future stories:
    - Document upload (Story 9.1) should call createTimelineEvent()
    - Invoice creation (Story 11.1) should call createTimelineEvent()
    - Payment recording (Story 11.4) should call createTimelineEvent()
    - Deadline operations (Story 8.2) should call createTimelineEvent()
    - Court date scheduling (Story 8.1) should call createTimelineEvent()
- [ ] **Build manual timeline entry form** (AC 5)
  - [ ] `src/components/cases/manual-timeline-form.tsx` — dialog form
  - [ ] Fields: description (required textarea), event type (optional select), notes
  - [ ] Server action: createManualTimelineEntry in `src/lib/actions/cases.ts`
  - [ ] Calls createTimelineEvent() with type 'manual_entry'
- [ ] **Build case notes server actions** (AC 6, 7)
  - [ ] `src/lib/actions/case-notes.ts` — createNote, updateNote, deleteNote
  - [ ] createNote: accepts caseId, content, isPrivate (boolean)
  - [ ] updateNote: only own notes (or admin for any)
  - [ ] deleteNote: only own notes (or admin for any)
  - [ ] All operations create audit log entries
  - [ ] Note creation calls createTimelineEvent() with type 'note_added'
- [ ] **Build notes UI components** (AC 6, 7)
  - [ ] `src/components/cases/case-notes-list.tsx` — list of notes with private/shared badges
  - [ ] `src/components/cases/note-form.tsx` — form with content textarea, private/shared toggle (shadcn Switch)
  - [ ] Edit mode: inline editing or dialog
  - [ ] Delete confirmation dialog
  - [ ] Private notes: show lock icon + "Private" badge; shared notes: show globe icon + "Shared" badge
- [ ] **Build notification creation utility** (AC 3)
  - [ ] `src/lib/utils/notifications.ts` — createNotification(params) utility (if not already created)
  - [ ] Called when attorney is assigned to create in-app notification
  - [ ] Notification type: 'attorney_assigned'
  - [ ] Links to case detail page
- [ ] **Build timeline display enhancements** (AC 4, 5)
  - [ ] Update `src/components/cases/timeline-tab.tsx` from Story 6.2
  - [ ] Icon mapping per event type (Lucide icons)
  - [ ] Color-coded event type indicators
  - [ ] Metadata display for relevant events (e.g., "Status: Open -> In Progress")
  - [ ] Manual entry indicator (different style from auto entries)

## Dev Notes

### Architecture Patterns
- createTimelineEvent() is a shared utility used by multiple server actions across different epics; it must be importable from anywhere in the codebase
- The function should be synchronous with the parent action (not fire-and-forget) to ensure timeline consistency
- Assignment role enforcement (only one Lead) must be enforced server-side; client-side is a convenience
- Notes privacy: the `is_private` flag determines visibility; the client portal query must always filter `WHERE is_private = false`
- Notifications are created as side effects of server actions; they do not need to block the response

### Timeline Event Types
```typescript
type TimelineEventType =
  | 'case_created'
  | 'status_changed'
  | 'attorney_assigned'
  | 'attorney_unassigned'
  | 'document_uploaded'
  | 'invoice_created'
  | 'payment_received'
  | 'deadline_added'
  | 'deadline_completed'
  | 'court_date_scheduled'
  | 'note_added'
  | 'manual_entry';
```

### Libraries
- shadcn/ui: Dialog, Select, Switch, Textarea, Badge, Avatar, Button, AlertDialog
- Lucide icons: UserPlus (assigned), UserMinus (unassigned), FileText (document), Receipt (invoice), CreditCard (payment), Calendar (court date), Clock (deadline), Pencil (note), Plus (manual)

### Project Structure Notes

Files to create:
- `src/lib/utils/timeline.ts` — createTimelineEvent() utility
- `src/lib/utils/notifications.ts` — createNotification() utility (if not exists)
- `src/lib/actions/case-assignments.ts` — assignment server actions
- `src/lib/actions/case-notes.ts` — note server actions
- `src/components/cases/case-assignments.tsx` — assignment management UI
- `src/components/cases/manual-timeline-form.tsx` — manual timeline entry form
- `src/components/cases/case-notes-list.tsx` — notes list component
- `src/components/cases/note-form.tsx` — note form component

Files to modify:
- `src/lib/actions/cases.ts` — integrate createTimelineEvent() calls into createCase, transitionCaseStatus
- `src/components/cases/timeline-tab.tsx` — enhance with icons, colors, metadata display
- `src/components/cases/overview-tab.tsx` — display assignments with management controls
- `src/types/` — add TimelineEventType and related types

### References

- [Source: a.md - Module 5: Case/Matter Management] — auto-generated timeline events list, case assignments, case notes
- [Source: epics.md - Epic 6, Story 6.3] — acceptance criteria
- [Source: a.md - Architecture Patterns] — Server Actions mutation pattern with audit logging

## Dev Agent Record

### Agent Model Used


### Debug Log References


### Completion Notes List


### Change Log
| Change | Details |
|--------|---------|
| | |

### File List
