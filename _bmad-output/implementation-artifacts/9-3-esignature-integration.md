# Story 9.3: eSignature Integration

Status: ready-for-dev

## Story

As an Attorney,
I want electronic signatures on documents,
so that agreements can be executed digitally.

## Acceptance Criteria (ACs)

1. eSignature request initiation from the document detail page via a "Request Signature" action button
2. Signature field placement interface allowing the requester to define where on the document signatures should be placed
3. Send for signature to client (via email link to a signing page) or internal (to another attorney)
4. Signature status tracking with workflow: Pending -> Viewed -> Signed -> Declined
5. Multi-signer support with both sequential (signer 1 must complete before signer 2) and parallel (all signers notified simultaneously) signing orders
6. Signed document automatically stored as a new version of the original document with an embedded signature certificate
7. Complete audit trail of all signature events: sent, viewed, signed, declined — each with IP address and timestamp
8. Integration abstraction layer designed to accommodate future providers (DocuSign, SignNow) while shipping with a basic built-in implementation
9. Basic built-in implementation: draw signature (canvas) or type signature (font rendering) capture, embedded into PDF

## Tasks / Subtasks

- [ ] **Task 1: eSignature provider abstraction layer** (AC 8)
  - [ ] Create `src/lib/esignature/index.ts` — define `ESignatureProvider` interface
  - [ ] Interface methods: `createSignatureRequest()`, `getSignatureStatus()`, `cancelRequest()`, `getSignedDocument()`
  - [ ] Create `src/lib/esignature/built-in.ts` — basic built-in provider implementation
  - [ ] Factory function selecting provider via `ESIGNATURE_PROVIDER` env var (default: "built-in")

- [ ] **Task 2: Zod schemas for eSignature** (AC 1, 2, 3, 5)
  - [ ] Add `signatureRequestSchema` to `src/lib/validators/esignature.ts`
  - [ ] Fields: document ID, signers array (name, email, role, order), signing mode (sequential/parallel), message, signature field positions (page, x, y, width, height per signer)
  - [ ] Add `signatureSubmissionSchema` — signature data (base64 image or typed text), signer token

- [ ] **Task 3: Database considerations for signature tracking** (AC 4, 5, 7)
  - [ ] Verify `documents` table supports signature-related fields or create a separate signature tracking approach using existing tables
  - [ ] Track signature requests: document_id, status, signing_mode, created_by, created_at
  - [ ] Track individual signers: request_id, name, email, role, order, status, token, signed_at, ip_address
  - [ ] Track signature events: request_id, signer_id, event_type, ip_address, timestamp, user_agent

- [ ] **Task 4: Server actions for eSignature** (AC 1, 3, 4, 5, 6, 7)
  - [ ] Create `src/lib/actions/esignature.ts`
  - [ ] `createSignatureRequest(data)` — validate, create request record, generate unique tokens per signer, send notification emails, audit log
  - [ ] `viewSignatureRequest(token)` — mark as Viewed, log event with IP
  - [ ] `submitSignature(token, signatureData)` — validate token, save signature, update signer status, check if all signers complete, if so generate signed document as new version, audit log
  - [ ] `declineSignature(token, reason)` — mark as Declined, notify requester, audit log
  - [ ] `cancelSignatureRequest(requestId)` — cancel pending request, notify signers

- [ ] **Task 5: Signature capture component** (AC 9)
  - [ ] Create `src/components/shared/signature-pad.tsx`
  - [ ] Draw mode: HTML5 Canvas for freehand signature drawing with clear/redo controls
  - [ ] Type mode: text input with signature-style font rendering (e.g., "Dancing Script" or "Great Vibes" web font)
  - [ ] Output: base64 PNG image of the signature
  - [ ] Mobile-friendly touch support

- [ ] **Task 6: PDF signature embedding** (AC 6, 9)
  - [ ] Create `src/lib/utils/pdf-signature.ts`
  - [ ] Use `pdf-lib` to embed signature images at specified positions on PDF pages
  - [ ] Add signature metadata (signer name, date, certificate info) as text annotations
  - [ ] Generate signature certificate text block (signer name, date signed, IP, document hash)
  - [ ] Save signed PDF as new document version via Story 9.2 versioning system

- [ ] **Task 7: Signature request form UI** (AC 1, 2, 3, 5)
  - [ ] Create `src/components/forms/signature-request-form.tsx`
  - [ ] Signer management: add/remove signers with name, email, role
  - [ ] Signing mode toggle: sequential vs parallel
  - [ ] Message field for signer notification
  - [ ] Integrate into document detail page as a dialog/sheet

- [ ] **Task 8: Signature field placement UI** (AC 2)
  - [ ] Create `src/components/shared/signature-field-placer.tsx`
  - [ ] Display PDF pages as images
  - [ ] Drag-and-drop positioning of signature fields per signer (colored per signer)
  - [ ] Store field positions: page number, x, y, width, height
  - [ ] Minimum viable: allow specifying page number and position without full visual editor (fallback)

- [ ] **Task 9: Public signing page** (AC 3, 4, 9)
  - [ ] Create `src/app/sign/[token]/page.tsx` — public route (no auth required)
  - [ ] Display document preview (PDF viewer)
  - [ ] Show signature fields requiring this signer's signature
  - [ ] Embed `SignaturePad` component at each field
  - [ ] Submit button to capture and submit all signatures
  - [ ] Decline button with reason dialog
  - [ ] Record IP address from request headers on view and sign events

- [ ] **Task 10: Signature status tracking on document detail** (AC 4, 7)
  - [ ] Add signature status section to `src/app/(dashboard)/documents/[id]/page.tsx`
  - [ ] Show: current status, signer list with individual statuses, event audit trail
  - [ ] Status badges: Pending (yellow), Viewed (blue), Signed (green), Declined (red)
  - [ ] Link to signed version when complete

- [ ] **Task 11: Notification integration** (AC 3)
  - [ ] Send email with signing link when request is created
  - [ ] Send reminder for pending signatures
  - [ ] Notify requester when all signatures are complete or when someone declines
  - [ ] Create in-app notifications for signature events

## Dev Notes

- Use `pdf-lib` (npm) for PDF manipulation — it supports embedding images at specific coordinates and adding text annotations, runs server-side
- For the signing page canvas, use the HTML5 Canvas API directly or a library like `signature_pad` (npm) for a polished drawing experience
- Signature tokens should be cryptographically random (use `crypto.randomUUID()`) and single-use
- The signing page is a public route (no auth) — authentication is token-based only; tokens should expire after a configurable period (default 7 days)
- For sequential signing, only send the notification to the next signer after the previous one completes
- The abstraction layer should be thin enough to swap in DocuSign or SignNow SDKs later without changing the UI
- IP address capture: use `headers().get('x-forwarded-for')` in Next.js server actions/route handlers
- Consider rate limiting on the public signing page to prevent abuse
- The signature field placer is the most complex UI piece; a simplified version that uses predefined positions (bottom of last page) is acceptable for the initial implementation

### Project Structure Notes

Files to create:
- `src/lib/esignature/index.ts` — provider interface and factory
- `src/lib/esignature/built-in.ts` — built-in implementation
- `src/lib/validators/esignature.ts` — Zod schemas
- `src/lib/actions/esignature.ts` — server actions
- `src/lib/utils/pdf-signature.ts` — PDF signature embedding utility
- `src/components/shared/signature-pad.tsx` — signature capture widget
- `src/components/shared/signature-field-placer.tsx` — field placement UI
- `src/components/forms/signature-request-form.tsx` — request form
- `src/app/sign/[token]/page.tsx` — public signing page

Files to modify:
- `src/app/(dashboard)/documents/[id]/page.tsx` — add signature section and request button
- `.env.local` — add `ESIGNATURE_PROVIDER`

### References

- [Source: a.md - Module 6: Document Management — eSignature mention]
- [Source: epics.md - Epic 9, Story 9.3]
- [Source: a.md - Feature Gap Analysis: #18 eSignature — from Clio, MyCase]

## Dev Agent Record

### Agent Model Used


### Debug Log References


### Completion Notes List


### Change Log
| Change | Details |
|--------|---------|
| | |

### File List
