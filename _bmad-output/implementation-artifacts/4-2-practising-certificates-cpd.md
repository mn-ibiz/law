# Story 4.2: Practising Certificates & CPD Tracking

Status: ready-for-dev

## Story

As an Admin,
I want to track practising certificates and CPD compliance,
so that the firm meets Kenya Advocates Act and LSK requirements.

## Acceptance Criteria (ACs)

1. Practising certificate section on attorney detail page: certificate number, year, issue date, expiry date, status (Valid/Expired/Pending Renewal), upload scanned copy, history table showing all certificates
2. Auto-renewal reminders generated at 60 days, 30 days, and 7 days before December 31 (end of practising year)
3. CPD tracking: 5 CPD units per year required, minimum 2 units from LSK-accredited programs
4. CPD events log: event name, date, provider, units earned, certificate upload; displayed as a table on attorney detail
5. CPD progress bar showing units earned vs. required (5), with visual indicator for LSK program units
6. Compliance dashboard widget: list of attorneys with expiring certificates (within 60 days), list of non-compliant CPD attorneys

## Tasks / Subtasks

- [ ] Create `src/lib/validators/compliance.ts` — Zod schemas: `createCertificateSchema` (certificateNumber, year, issueDate, expiryDate, status), `updateCertificateSchema`, `createCpdRecordSchema` (eventName, date, provider, unitsEarned, isLskProgram, certificateFile) (AC1, AC4)
- [ ] Create `src/lib/actions/compliance.ts` — Server actions: `addPractisingCertificate(attorneyId, data)`, `updateCertificateStatus(certId, status)`, `uploadCertificateCopy(certId, file)`, `addCpdRecord(attorneyId, data)`, `deleteCpdRecord(recordId)` — each with auth checks, validation, and audit logging (AC1, AC4)
- [ ] Create `src/lib/queries/compliance.ts` — Query functions: `getAttorneyCertificates(attorneyId)`, `getAttorneyCpdRecords(attorneyId, year?)`, `getCpdSummary(attorneyId, year)` returning { total: number, lskUnits: number, required: 5, lskRequired: 2 }, `getExpiringCertificates(daysAhead)`, `getNonCompliantCpdAttorneys(year)` (AC1, AC4, AC5, AC6)
- [ ] Create `src/components/attorneys/certificates-tab.tsx` — Certificate section on attorney detail: "Add Certificate" button at top, history table with columns (year, certificate number, issue date, expiry date, status badge, scanned copy download link, actions), status badges color-coded (Valid=green, Expired=red, Pending Renewal=amber) (AC1)
- [ ] Create `src/components/forms/certificate-form.tsx` — Certificate form using react-hook-form + Zod: certificate number (text), year (number/dropdown), issue date (date picker), expiry date (date picker, default Dec 31 of selected year), status dropdown, file upload for scanned copy (AC1)
- [ ] Create `src/components/attorneys/cpd-tab.tsx` — CPD tracking section on attorney detail: progress bar at top, year selector dropdown, CPD events table below with columns (event name, date, provider, units, LSK program badge, certificate download, actions), "Add CPD Record" button (AC4, AC5)
- [ ] Create `src/components/forms/cpd-form.tsx` — CPD record form: event name (text), date (date picker), provider (text), units earned (number, min 0.5, max 5), is LSK program (checkbox), certificate file upload (AC4)
- [ ] Create `src/components/attorneys/cpd-progress-bar.tsx` — Visual progress bar component: total bar showing X/5 units, segmented section showing LSK units (e.g., 2/2 from LSK programs), color coding (green if met, amber if partial, red if below), text labels (AC5)
- [ ] Implement auto-renewal reminder logic: create a query `getUpcomingCertificateExpirations()` that returns attorneys whose latest certificate expires within 60/30/7 days of Dec 31; this data feeds into notifications (AC2)
- [ ] Create `src/components/dashboard/widgets/compliance-widget.tsx` — Admin dashboard widget with two sections: "Expiring Certificates" (attorneys whose certificates expire within 60 days, with name, expiry date, days remaining) and "CPD Non-Compliant" (attorneys who have not met 5 units or 2 LSK units for current year) (AC6)
- [ ] Update `src/components/attorneys/attorney-detail-tabs.tsx` — Add "Certificates" and "CPD" tabs (or a combined "Compliance" tab) to the attorney detail page tab layout (AC1, AC4)
- [ ] Update `src/components/dashboard/admin-dashboard.tsx` — Add compliance widget to admin dashboard (AC6)
- [ ] Implement certificate status auto-calculation: if current date > expiry date and status is "Valid", display as "Expired" (computed, not stored) (AC1)
- [ ] Add file upload handling for certificate scans and CPD certificates — integrate with storage abstraction (Vercel Blob or local filesystem) (AC1, AC4)

## Dev Notes

### Architecture & Constraints
- Kenya practising year runs January 1 to December 31; certificates expire on Dec 31 each year
- The LSK (Law Society of Kenya) requires 5 CPD units annually, with at least 2 from LSK-accredited programs
- Certificate statuses: "Valid" (current year, not expired), "Expired" (past expiry date), "Pending Renewal" (within renewal window)
- CPD records track individual events/programs attended; units are summed per year
- File uploads (certificate scans, CPD certificates) use the storage abstraction defined in Story 1.1
- Reminder notifications (60/30/7 days) will be created as notification records; the actual notification delivery mechanism is built in later epics (14.2)
- For now, the reminder data is exposed via queries that dashboard widgets and compliance reports consume

### CPD Progress Calculation
```typescript
interface CpdSummary {
  year: number;
  totalUnits: number;       // Sum of all CPD units for the year
  lskProgramUnits: number;  // Sum of units where isLskProgram = true
  requiredTotal: 5;         // Kenya requirement
  requiredLsk: 2;           // Minimum from LSK programs
  isCompliant: boolean;     // totalUnits >= 5 && lskProgramUnits >= 2
}
```

### Certificate Expiry Warning Levels
- 60+ days before expiry: No warning
- 30-60 days: Info (blue) — "Certificate expires in X days"
- 7-30 days: Warning (amber) — "Certificate expiring soon"
- 0-7 days: Critical (red) — "Certificate expires in X days!"
- Expired: Error (red) — "Certificate EXPIRED"

### File Upload Pattern
```typescript
// Certificate scan upload
const formData = new FormData();
formData.append('file', file);
formData.append('type', 'practising-certificate');
formData.append('attorneyId', attorneyId);
// Upload to /api/upload or use server action with FormData
```

### Project Structure Notes

Files to create:
- `src/lib/validators/compliance.ts` — Zod schemas for certificates and CPD
- `src/lib/actions/compliance.ts` — Server actions for certificates and CPD
- `src/lib/queries/compliance.ts` — Query functions for compliance data
- `src/components/attorneys/certificates-tab.tsx` — Certificates section
- `src/components/attorneys/cpd-tab.tsx` — CPD tracking section
- `src/components/attorneys/cpd-progress-bar.tsx` — CPD progress bar
- `src/components/forms/certificate-form.tsx` — Certificate form
- `src/components/forms/cpd-form.tsx` — CPD record form
- `src/components/dashboard/widgets/compliance-widget.tsx` — Compliance dashboard widget

Files to modify:
- `src/components/attorneys/attorney-detail-tabs.tsx` — Add Certificates and CPD tabs
- `src/components/dashboard/admin-dashboard.tsx` — Add compliance widget

### References

- [Source: a.md — Module 15: Kenya Compliance & Practising Certificate Management]
- [Source: a.md — LSK & CPD Compliance section]
- [Source: a.md — Kenya Legal Requirements: Annual Practising Certificate, CPD Requirements]
- [Source: epics.md — Epic 4, Story 4.2]
