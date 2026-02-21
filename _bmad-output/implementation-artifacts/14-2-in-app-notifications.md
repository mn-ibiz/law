# Story 14.2: In-App Notification System

Status: ready-for-dev

## Story

As a user,
I want in-app notifications for important events,
so that I never miss critical information about my cases, deadlines, or messages.

## Acceptance Criteria (ACs)

1. Notification bell icon is displayed in the header (both dashboard and portal layouts) with an unread count badge (red circle with white number); badge is hidden when count is zero.
2. Clicking the notification bell opens a dropdown panel showing the last 20 notifications, ordered by most recent first.
3. Each notification in the dropdown displays: an icon representing the notification type, a title, a short preview/description, relative time (e.g., "5 minutes ago", "2 hours ago"), and a read/unread indicator (dot or background color).
4. Clicking a notification navigates the user to the related entity (e.g., clicking a "new message" notification navigates to the message detail; clicking a "deadline reminder" navigates to the deadline).
5. A "Mark all as read" button is available in the dropdown header; clicking it marks all unread notifications as read.
6. A full notifications page is accessible (e.g., via "View all" link in dropdown) with support for filtering by: notification type, read/unread status, and date range.
7. The system generates notifications for the following event types:
   - Deadline reminder (approaching or overdue)
   - Case status change
   - New message received
   - Invoice/fee note status change (sent, paid, overdue)
   - Document shared with client
   - Bring-up due
   - Task assigned
   - Requisition approved or rejected
   - Workflow rule triggered
   - Certificate expiring
8. Notifications are created as side effects within server actions when the corresponding trigger events occur.
9. Each notification record stores: recipient user ID, type, title, message/preview, link (URL to related entity), read status, related entity type and ID, and timestamp.

## Tasks / Subtasks

- [ ] **Task 1: Build Notification Bell Component** (AC 1, AC 2, AC 3, AC 4, AC 5)
  - [ ] Create `src/components/shared/notification-bell.tsx` as a Client Component
  - [ ] Display bell icon (Lucide `Bell`) in the header with unread count badge:
    - Badge is a red circle with white text positioned top-right of the bell icon
    - Badge shows count (e.g., "5", "20+") or is hidden when count is 0
  - [ ] On click, toggle a dropdown panel (use shadcn Popover or DropdownMenu)
  - [ ] Dropdown header: "Notifications" title on left, "Mark all as read" button on right
  - [ ] Dropdown body: scrollable list of last 20 notifications
  - [ ] Each notification item renders:
    - Type icon (Lucide icons mapped per type: `Clock` for deadline, `MessageSquare` for message, `FileText` for invoice, `File` for document, `CheckSquare` for task, `AlertTriangle` for bring-up, `Zap` for workflow, `Shield` for certificate, `ArrowRightLeft` for case status, `Receipt` for requisition)
    - Title (bold if unread)
    - Preview text (truncated to ~60 chars)
    - Relative time using a utility like `formatDistanceToNow` from date-fns
    - Unread indicator: blue dot or highlighted background
  - [ ] Clicking a notification: marks it as read, navigates to the `link` URL
  - [ ] Dropdown footer: "View all notifications" link to the full notifications page
  - [ ] Fetch unread count on component mount and poll every 30 seconds (or use `router.refresh()` pattern)

- [ ] **Task 2: Create Notification API/Queries** (AC 1, AC 2, AC 6, AC 9)
  - [ ] Create `src/lib/queries/notifications.ts` with:
    - `getUnreadNotificationCount(userId)` — count of unread notifications
    - `getRecentNotifications(userId, limit: 20)` — last 20 notifications for the dropdown
    - `getAllNotifications(userId, filters?)` — paginated, filterable list for the full page
  - [ ] Create `src/app/api/notifications/route.ts` GET endpoint for client-side polling of unread count and recent notifications
  - [ ] Create `src/lib/actions/notifications.ts` with:
    - `markNotificationRead(notificationId)` — mark single notification as read
    - `markAllNotificationsRead(userId)` — mark all as read
    - `createNotification(data)` — utility to insert a notification record (used by other server actions)

- [ ] **Task 3: Build Full Notifications Page** (AC 6)
  - [ ] Create `src/app/(dashboard)/notifications/page.tsx` for Admin/Attorney
  - [ ] Create `src/app/(portal)/portal/notifications/page.tsx` for Client (or use a shared page component)
  - [ ] Display all notifications in a list with full details
  - [ ] Add filter controls:
    - Type filter: dropdown with all notification types
    - Read/Unread toggle: All / Unread / Read
    - Date range: date picker for start and end dates
  - [ ] Pagination (20 per page)
  - [ ] Click notification to navigate to related entity
  - [ ] Bulk "Mark selected as read" action

- [ ] **Task 4: Integrate Notification Bell into Layouts** (AC 1)
  - [ ] Add `<NotificationBell />` component to `src/components/layout/dashboard-header.tsx` (or equivalent)
  - [ ] Add `<NotificationBell />` component to `src/components/layout/portal-header.tsx`
  - [ ] Ensure the component reads the current user ID from session context

- [ ] **Task 5: Create Notification Utility for Server Actions** (AC 7, AC 8)
  - [ ] Create `src/lib/utils/create-notification.ts` with a `createNotification()` helper function:
    ```
    createNotification({
      recipientId: string,
      type: NotificationType,
      title: string,
      message: string,
      link: string,
      entityType?: string,
      entityId?: string,
    })
    ```
  - [ ] Define `NotificationType` enum/union in `src/types/notifications.ts`: `deadline_reminder`, `case_status_change`, `new_message`, `invoice_status_change`, `document_shared`, `bring_up_due`, `task_assigned`, `requisition_status`, `workflow_triggered`, `certificate_expiring`
  - [ ] Add notification creation calls to existing server actions (this will be done incrementally as each feature area is completed):
    - Message sending (Story 14.1) -> `new_message` notification
    - Case status change (Epic 6) -> `case_status_change` notification
    - Task assignment (Epic 8) -> `task_assigned` notification
    - Document sharing (Epic 9) -> `document_shared` notification
    - Invoice status (Epic 11) -> `invoice_status_change` notification
    - Deadline approaching (Epic 8) -> `deadline_reminder` notification
    - Bring-up due (Epic 7) -> `bring_up_due` notification
    - Requisition approve/reject (Epic 10) -> `requisition_status` notification
    - Workflow triggers (Epic 16) -> `workflow_triggered` notification
    - Certificate expiry (Epic 4) -> `certificate_expiring` notification

- [ ] **Task 6: Notification Type Icon Mapping** (AC 3)
  - [ ] Create `src/lib/utils/notification-icons.ts` mapping each `NotificationType` to a Lucide icon component and a color:
    - `deadline_reminder` -> Clock (orange)
    - `case_status_change` -> ArrowRightLeft (blue)
    - `new_message` -> MessageSquare (blue)
    - `invoice_status_change` -> FileText (green)
    - `document_shared` -> File (purple)
    - `bring_up_due` -> AlertTriangle (red)
    - `task_assigned` -> CheckSquare (teal)
    - `requisition_status` -> Receipt (amber)
    - `workflow_triggered` -> Zap (yellow)
    - `certificate_expiring` -> Shield (red)

## Dev Notes

- **Architecture:** The notification bell is a Client Component since it needs interactivity (click to open dropdown, polling for updates). It fetches data from an API route (`/api/notifications`) for client-side updates. The full notifications page is a Server Component.
- **Database:** The `notifications` table schema: `id`, `recipientId` (FK to users), `type` (enum), `title`, `message`, `link` (URL string), `entityType` (nullable string), `entityId` (nullable string), `isRead` (boolean, default false), `createdAt`. Index on `(recipientId, isRead, createdAt)` for fast unread count and recent queries.
- **Polling vs. Real-time:** This implementation uses polling (every 30 seconds) for unread count updates. The API endpoint should be lightweight (just a count query). Real-time via WebSocket or SSE can be added later without changing the component API.
- **Side Effect Pattern:** Notifications are created inside server actions as a side effect. Example: in the `updateCaseStatus` action, after updating the case, call `createNotification()` for all assigned attorneys. This keeps notification creation close to the business logic.
- **Link Generation:** Each notification's `link` field should be a relative URL (e.g., `/messages/abc123`, `/cases/def456`). The notification click handler uses `router.push(link)`. Portal notifications should use portal-prefixed links (e.g., `/portal/messages/abc123`).
- **Performance:** The unread count query should be a simple `SELECT COUNT(*) WHERE recipientId = ? AND isRead = false`. Keep the dropdown fetch to 20 items maximum. The full notifications page uses cursor-based or offset pagination.

### Project Structure Notes

**Files to Create:**
- `src/components/shared/notification-bell.tsx` — Bell icon with dropdown
- `src/app/api/notifications/route.ts` — API endpoint for polling (GET unread count + recent)
- `src/app/(dashboard)/notifications/page.tsx` — Full notifications page (dashboard)
- `src/app/(portal)/portal/notifications/page.tsx` — Full notifications page (portal)
- `src/lib/queries/notifications.ts` — Notification query functions
- `src/lib/actions/notifications.ts` — Server Actions: markRead, markAllRead
- `src/lib/utils/create-notification.ts` — Utility to create notification records
- `src/lib/utils/notification-icons.ts` — Type-to-icon mapping
- `src/types/notifications.ts` — NotificationType enum and related types

**Files to Modify:**
- `src/components/layout/dashboard-header.tsx` — Add NotificationBell component
- `src/components/layout/portal-header.tsx` — Add NotificationBell component
- Various server actions (incrementally) — Add `createNotification()` calls

### References

- [Source: epics.md — Epic 14, Story 14.2: In-App Notification System]
- [Source: a.md — Module 12: Messaging & Notifications — In-app notification system, bell icon, notification types]
- [Source: a.md — Database — notifications table in Messaging domain]
- [Source: epics.md — Story 2.3: Dashboard Shell & Navigation Layout — Header: notification bell]

## Dev Agent Record

### Agent Model Used


### Debug Log References


### Completion Notes List


### Change Log
| Change | Details |
|--------|---------|
| | |

### File List
