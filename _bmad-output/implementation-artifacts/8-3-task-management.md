# Story 8.3: Task Management

Status: ready-for-dev

## Story

As an Admin/Attorney,
I want to create, assign, and track tasks,
so that work items are organized.

## Acceptance Criteria (ACs)

1. **Tasks page with List view (DataTable)** — searchable, sortable table with columns: title, case (linked), status badge, priority badge, due date, assigned to (avatar + name), created date; supports pagination.
2. **Tasks page with Board view (Kanban)** — kanban board with columns: Pending, In Progress, Completed, Cancelled; cards show title, case reference, priority badge, assigned to avatar, due date.
3. **Task form** — captures: title (required), description (textarea), case (optional, searchable dropdown), status (Pending / In Progress / Completed / Cancelled), priority (Low / Medium / High / Urgent), due date (date picker), assigned to (user dropdown).
4. **Drag-and-drop between kanban columns** — tasks can be dragged from one status column to another; drop triggers a status update action.
5. **Filter by user, case, priority, status, due date** — filter bar applies to both List and Board views; "My Tasks" quick filter button to show only tasks assigned to the current user.
6. **Overdue highlighting** — tasks past their due date with status Pending or In Progress are highlighted visually (red border on kanban card, red text/background on table row).
7. **Tasks on case detail page** — tasks associated with a case are displayed on the case detail Tasks tab (from Story 6.2); includes quick-add form.
8. **Task completion creates case timeline event** — when a task linked to a case is marked as Completed, a timeline event is auto-created on the case: "Task '[title]' completed by [user]".
9. **Notification on assignment** — when a task is assigned to a user, an in-app notification is created for the assignee with a link to the task.

## Tasks / Subtasks

- [ ] **Create Zod schemas for tasks** (AC 3)
  - [ ] `src/lib/validators/task.ts` — createTaskSchema, updateTaskSchema
  - [ ] Title required, status enum, priority enum, due date optional, assigned to optional
- [ ] **Build task CRUD server actions** (AC 3, 4, 8, 9)
  - [ ] `src/lib/actions/tasks.ts` — createTask, updateTask, updateTaskStatus, deleteTask
  - [ ] createTask: validate, create record, create notification if assigned to someone
  - [ ] updateTaskStatus: validate transition, update status
  - [ ] On completion (status -> Completed): if task has caseId, call createTimelineEvent() with type 'task_completed'
  - [ ] On assignment: call createNotification() for assignee with link to task
  - [ ] Audit log on all operations
- [ ] **Build task queries** (AC 1, 2, 5, 6, 7)
  - [ ] `src/lib/queries/tasks.ts` — getTasks(filters), getTasksByCase, getTasksByUser, getMyTasks, getTaskById
  - [ ] Filters: userId, caseId, priority, status, dueDateRange, search (title)
  - [ ] Include isOverdue computed field (due_date < now AND status in ['pending', 'in_progress'])
  - [ ] Group by status for kanban view
- [ ] **Build tasks page with view toggle** (AC 1, 2, 5)
  - [ ] `src/app/(dashboard)/tasks/page.tsx` — page with List/Board toggle
  - [ ] View preference stored in localStorage
  - [ ] Both views share the same filter state
  - [ ] "My Tasks" quick filter button
- [ ] **Build task list view (DataTable)** (AC 1, 5, 6)
  - [ ] `src/components/tasks/task-list-view.tsx` — @tanstack/react-table DataTable
  - [ ] Columns: checkbox (for bulk), title, case (linked), status badge, priority badge, due date, assigned to, created date
  - [ ] Sortable columns: title, due date, priority, status, created date
  - [ ] Overdue rows: red background tint or red left border
  - [ ] Row click opens task detail or inline editing
- [ ] **Build task kanban board view** (AC 2, 4, 6)
  - [ ] `src/components/tasks/task-board-view.tsx` — kanban with 4 columns
  - [ ] `src/components/tasks/task-kanban-card.tsx` — card component
  - [ ] Columns: Pending, In Progress, Completed, Cancelled
  - [ ] Card shows: title, case reference (if any), priority badge (colored), assigned to avatar, due date
  - [ ] Overdue cards: red border
  - [ ] Drag-and-drop using @dnd-kit/core
  - [ ] On drop: call updateTaskStatus action
  - [ ] Column headers show count of tasks
- [ ] **Build task form component** (AC 3)
  - [ ] `src/components/forms/task-form.tsx` — react-hook-form
  - [ ] Title input (required)
  - [ ] Description textarea
  - [ ] Case searchable dropdown (optional)
  - [ ] Status selector (Pending/In Progress/Completed/Cancelled)
  - [ ] Priority selector (Low/Medium/High/Urgent)
  - [ ] Due date picker
  - [ ] Assigned to user dropdown (searchable)
  - [ ] Used in dialog from both list page and case detail
- [ ] **Build filter bar** (AC 5)
  - [ ] `src/components/tasks/task-filters.tsx`
  - [ ] User/attorney dropdown
  - [ ] Case dropdown
  - [ ] Priority multi-select
  - [ ] Status multi-select
  - [ ] Due date range picker
  - [ ] "My Tasks" toggle button (quick filter to current user)
  - [ ] "Clear Filters" button
- [ ] **Integrate tasks into case detail** (AC 7)
  - [ ] Update `src/components/cases/tasks-tab.tsx` from Story 6.2
  - [ ] Show tasks filtered by the current case
  - [ ] Quick-add task form (simplified: title, priority, due date, assigned to; case pre-filled)
  - [ ] Status update actions inline
  - [ ] Link to full tasks page filtered by this case
- [ ] **Implement task completion timeline event** (AC 8)
  - [ ] In updateTaskStatus action: when new status is 'completed' and task.caseId exists
  - [ ] Call createTimelineEvent(caseId, 'task_completed', `Task '${task.title}' completed by ${user.name}`, userId)
- [ ] **Implement assignment notification** (AC 9)
  - [ ] In createTask and updateTask actions: when assignedTo is set or changed
  - [ ] Call createNotification() with type 'task_assigned', title 'New Task Assigned', link to task
- [ ] **Add loading skeletons and empty states** (AC 1, 2)
  - [ ] Skeleton for task list DataTable
  - [ ] Skeleton for kanban columns
  - [ ] Empty state for list: "No tasks yet -- create your first task"
  - [ ] Empty state for kanban columns: "No tasks in this status"

## Dev Notes

### Architecture Patterns
- Tasks page follows the same List/Board toggle pattern as the cases page (Story 6.4); reuse the toggle component pattern
- Task status updates from kanban drag-and-drop should be optimistic for responsive UX
- The "My Tasks" filter is a convenience shortcut that filters the assignedTo field to the current session user; it should be prominently placed
- Tasks are independent entities that optionally link to cases; they can exist without a case (e.g., administrative tasks)
- Task completion notification and timeline event creation are side effects of the status update action

### Task Status Colors
```typescript
const TASK_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  in_progress: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-gray-100 text-gray-800',
};
```

### Priority Colors
```typescript
const PRIORITY_COLORS: Record<string, string> = {
  low: 'bg-gray-100 text-gray-700',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700',
};
```

### Libraries
- `@dnd-kit/core` + `@dnd-kit/sortable` for kanban drag-and-drop
- `@tanstack/react-table` for list view DataTable
- `react-hook-form` + Zod for task form
- shadcn/ui: Card, Badge, Avatar, Table, Dialog, ToggleGroup, Select, DatePicker, Button, Checkbox
- `date-fns` — isBefore, isToday, formatDistanceToNow for overdue detection and due date display
- Lucide icons: CheckSquare (task), ListTodo (list view), LayoutGrid (board view), Plus (add)

### Project Structure Notes

Files to create:
- `src/app/(dashboard)/tasks/page.tsx` — tasks page with view toggle
- `src/components/tasks/task-list-view.tsx` — DataTable list view
- `src/components/tasks/task-board-view.tsx` — kanban board view
- `src/components/tasks/task-kanban-card.tsx` — kanban card
- `src/components/tasks/task-filters.tsx` — filter bar
- `src/components/forms/task-form.tsx` — task form
- `src/lib/validators/task.ts` — Zod schemas
- `src/lib/actions/tasks.ts` — server actions
- `src/lib/queries/tasks.ts` — data queries

Files to modify:
- `src/components/cases/tasks-tab.tsx` — integrate task list and quick-add form for case context
- `src/components/layout/sidebar.tsx` — add Tasks nav item under Work group
- `src/lib/utils/timeline.ts` — ensure 'task_completed' is in TimelineEventType enum

### References

- [Source: a.md - Module 7: Calendar & Deadlines] — task form fields, task status workflow (Pending -> In Progress -> Completed -> Cancelled)
- [Source: epics.md - Epic 8, Story 8.3] — acceptance criteria
- [Source: a.md - Architecture Patterns] — Server Actions pattern for mutations

## Dev Agent Record

### Agent Model Used


### Debug Log References


### Completion Notes List


### Change Log
| Change | Details |
|--------|---------|
| | |

### File List
