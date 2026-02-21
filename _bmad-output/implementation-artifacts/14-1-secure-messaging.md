# Story 14.1: Secure Messaging System

Status: ready-for-dev

## Story

As a user,
I want to send and receive messages within the system,
so that communication is tracked, auditable, and linked to cases.

## Acceptance Criteria (ACs)

1. Messages page (dashboard) displays an Inbox/Sent toggle to switch between received and sent messages.
2. Message list shows: sender/recipient name, subject, associated case (if any), date, and read/unread status (bold for unread, normal for read).
3. Message list supports search by subject, sender, or recipient name.
4. Messages page (portal) is filtered to show only the client's messages; clients can only send messages to attorneys assigned to their cases.
5. New message form includes: recipient (searchable dropdown, filtered by role — clients see only their assigned attorneys, attorneys/admins see all internal users and their clients), subject, case (optional, searchable dropdown), message body (textarea), and attach document option.
6. Message threads are supported: replying to a message creates a thread linked via `parent_message_id`; thread view displays messages in chronological order with the original message at top; a reply form is displayed at the bottom of the thread.
7. Message detail view shows: full message content, sender name and role, recipient name and role, date/time, associated case (clickable link), attachments (downloadable), and a reply button.
8. Users can mark messages as read or unread from the message list.
9. Internal attorney-to-attorney messaging is supported (both sender and recipient can be Admin or Attorney role).
10. Case-linked messages are visible on the case detail page under a Messages tab or section, showing all messages associated with that case.
11. Sending a message creates a notification for the recipient (in-app notification).

## Tasks / Subtasks

- [ ] **Task 1: Create Messages Database Queries** (AC 1, AC 2, AC 3, AC 4)
  - [ ] Create `src/lib/queries/messages.ts` with:
    - `getInboxMessages(userId, filters?)` — messages where `recipientId = userId`, with search, pagination
    - `getSentMessages(userId, filters?)` — messages where `senderId = userId`, with search, pagination
    - `getPortalMessages(clientUserId)` — messages filtered to the client's conversations only
    - `getMessageThread(messageId)` — original message plus all replies (where `parentMessageId = messageId`), ordered chronologically
    - `getCaseMessages(caseId)` — all messages linked to a specific case
  - [ ] Include joins to `users` table for sender/recipient names and roles
  - [ ] Include join to `cases` table for case number/title when linked
  - [ ] Support search filtering on subject, sender name, recipient name using ILIKE

- [ ] **Task 2: Build Dashboard Messages Page** (AC 1, AC 2, AC 3, AC 8)
  - [ ] Create `src/app/(dashboard)/messages/page.tsx`
  - [ ] Implement Inbox/Sent toggle using shadcn Tabs component
  - [ ] Display message list with columns: sender/recipient, subject (truncated), case reference, date (relative time), read/unread indicator (bold text or dot)
  - [ ] Add search input for filtering by subject/sender/recipient
  - [ ] Add pagination controls
  - [ ] Implement mark read/unread action: clicking a toggle or button updates the `isRead` field
  - [ ] Create `src/lib/actions/messages.ts` with `markMessageRead(messageId, isRead)` server action

- [ ] **Task 3: Build Portal Messages Page** (AC 4)
  - [ ] Create `src/app/(portal)/portal/messages/page.tsx`
  - [ ] Use the same message list component but filtered to the client's messages only
  - [ ] Restrict new message recipients to attorneys assigned to the client's cases
  - [ ] Query `case_assignments` to determine which attorneys the client can message

- [ ] **Task 4: Build New Message Form** (AC 5, AC 9, AC 11)
  - [ ] Create `src/components/forms/new-message-form.tsx` as a Client Component with react-hook-form + Zod
  - [ ] Create `src/lib/validators/message.ts` with Zod schema: recipient (required), subject (required), body (required), caseId (optional), attachmentId (optional)
  - [ ] Implement recipient searchable dropdown:
    - For Admin/Attorney: list all users (internal staff + clients)
    - For Client: list only attorneys assigned to their cases
  - [ ] Implement case searchable dropdown (optional): for Admin/Attorney show cases they have access to; for Client show their own cases
  - [ ] Add document attachment option: select from existing documents or upload new (reuse document upload component)
  - [ ] Create `src/lib/actions/messages.ts` `sendMessage(formData)` server action that:
    - Validates input with Zod
    - Checks authorization (client can only message their assigned attorneys)
    - Inserts into `messages` table
    - Creates a notification for the recipient (insert into `notifications` table)
    - Revalidates the messages page path
  - [ ] Show success toast on send, error toast on failure

- [ ] **Task 5: Build Message Detail & Thread View** (AC 6, AC 7, AC 8)
  - [ ] Create `src/app/(dashboard)/messages/[id]/page.tsx` for dashboard message detail
  - [ ] Create `src/app/(portal)/portal/messages/[id]/page.tsx` for portal message detail
  - [ ] Display original message: sender (name, role badge), recipient (name, role badge), subject, date/time, case link (if any), full body text, attachments (with download links)
  - [ ] If message has replies (thread), display all thread messages chronologically below the original
  - [ ] Each thread message shows: sender, date, body, attachments
  - [ ] Display reply form at the bottom of the thread:
    - Reply body (textarea, required)
    - Optional attachment
    - Send reply button
  - [ ] Create `src/lib/actions/messages.ts` `replyToMessage(parentMessageId, formData)` server action that inserts with `parentMessageId` set
  - [ ] Auto-mark message as read when opened (call `markMessageRead` on page load)
  - [ ] Add "Mark unread" button to return to unread state

- [ ] **Task 6: Case Detail Messages Integration** (AC 10)
  - [ ] Add a Messages section/tab to the case detail page at `src/app/(dashboard)/cases/[id]/page.tsx`
  - [ ] Display messages linked to this case using `getCaseMessages(caseId)`
  - [ ] Each message shows: sender, recipient, subject, date, link to full thread
  - [ ] Add "New Message" button pre-filled with the case

## Dev Notes

- **Architecture:** Messages page uses Server Components for initial data fetch. The new message form and reply form are Client Components using react-hook-form. Server Actions handle all mutations.
- **Database:** The `messages` table schema includes: `id`, `senderId`, `recipientId`, `subject`, `body`, `caseId` (nullable FK to cases), `parentMessageId` (nullable self-referencing FK for threads), `attachmentId` (nullable FK to documents), `isRead` (boolean, default false), `createdAt`, `updatedAt`.
- **Thread Model:** A thread is defined by `parentMessageId`. The original message has `parentMessageId = null`. All replies reference the original message's ID. To fetch a thread: query where `id = messageId OR parentMessageId = messageId` ordered by `createdAt ASC`.
- **Authorization:** Clients can only message attorneys assigned to their cases. This is enforced both in the UI (recipient dropdown filtering) and server-side (the `sendMessage` action must verify the recipient is an assigned attorney for the client's cases). Admins and Attorneys can message anyone.
- **Notifications Integration:** When a message is sent, create a notification record in the `notifications` table with type "new_message", linking to the message. This will be displayed by the notification bell (Story 14.2).
- **Real-time (Future):** For this story, messages are fetched on page load. Real-time updates (WebSocket/SSE) are out of scope but the architecture should not preclude adding them later.
- **Attachments:** For the initial implementation, allow selecting an existing document from the system. Full inline file upload during message composition can be a follow-up enhancement.

### Project Structure Notes

**Files to Create:**
- `src/app/(dashboard)/messages/page.tsx` — Dashboard messages page (Inbox/Sent)
- `src/app/(dashboard)/messages/[id]/page.tsx` — Message detail/thread view
- `src/app/(portal)/portal/messages/page.tsx` — Portal messages page
- `src/app/(portal)/portal/messages/[id]/page.tsx` — Portal message detail/thread view
- `src/components/forms/new-message-form.tsx` — Shared new message form
- `src/lib/queries/messages.ts` — Message query functions
- `src/lib/actions/messages.ts` — Server Actions: sendMessage, replyToMessage, markMessageRead
- `src/lib/validators/message.ts` — Zod schemas for message and reply

**Files to Modify:**
- `src/app/(dashboard)/cases/[id]/page.tsx` — Add Messages tab/section with case-linked messages

### References

- [Source: epics.md — Epic 14, Story 14.1: Secure Messaging System]
- [Source: a.md — Module 12: Messaging & Notifications — Internal messaging, threads, case-linked messages]
- [Source: a.md — Module 11: Client Portal — Secure messaging between client and attorney]
- [Source: a.md — Database — messages table in Messaging domain]
- [Source: a.md — Module 1: Authentication & Authorization — RBAC Permissions Matrix (Messages row)]

## Dev Agent Record

### Agent Model Used


### Debug Log References


### Completion Notes List


### Change Log
| Change | Details |
|--------|---------|
| | |

### File List
