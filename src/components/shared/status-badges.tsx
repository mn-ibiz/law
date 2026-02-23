import { cn } from "@/lib/utils";
import { formatEnum } from "@/lib/utils/format-enum";

/* ──────────────────────────────────────────────
 * Shared capsule base class
 * ────────────────────────────────────────────── */
const capsule =
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold leading-none whitespace-nowrap";

/* ──────────────────────────────────────────────
 * Case Status
 * ────────────────────────────────────────────── */
const caseStatusStyles: Record<string, string> = {
  open: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20",
  in_progress: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20",
  hearing: "bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-600/20",
  on_hold: "bg-slate-50 text-slate-700 ring-1 ring-inset ring-slate-600/20",
  resolved: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20",
  closed: "bg-gray-50 text-gray-600 ring-1 ring-inset ring-gray-500/20",
  archived: "bg-gray-50 text-gray-500 ring-1 ring-inset ring-gray-500/20",
  appeal: "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20",
};

export function CaseStatusBadge({ status }: { status: string }) {
  return (
    <span className={cn(capsule, caseStatusStyles[status] ?? caseStatusStyles.open)}>
      {formatEnum(status)}
    </span>
  );
}

/* ──────────────────────────────────────────────
 * Invoice Status
 * ────────────────────────────────────────────── */
const invoiceStatusStyles: Record<string, string> = {
  draft: "bg-slate-50 text-slate-600 ring-1 ring-inset ring-slate-500/20",
  sent: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20",
  viewed: "bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-600/20",
  partially_paid: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20",
  paid: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20",
  overdue: "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20",
  cancelled: "bg-gray-50 text-gray-500 ring-1 ring-inset ring-gray-500/20",
  written_off: "bg-gray-50 text-gray-500 ring-1 ring-inset ring-gray-500/20",
};

export function InvoiceStatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(capsule, invoiceStatusStyles[status] ?? invoiceStatusStyles.draft)}
    >
      {formatEnum(status)}
    </span>
  );
}

/* ──────────────────────────────────────────────
 * Quote Status
 * ────────────────────────────────────────────── */
const quoteStatusStyles: Record<string, string> = {
  draft: "bg-slate-50 text-slate-600 ring-1 ring-inset ring-slate-500/20",
  sent: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20",
  accepted: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20",
  rejected: "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20",
  expired: "bg-gray-50 text-gray-500 ring-1 ring-inset ring-gray-500/20",
};

export function QuoteStatusBadge({ status }: { status: string }) {
  return (
    <span className={cn(capsule, quoteStatusStyles[status] ?? quoteStatusStyles.draft)}>
      {formatEnum(status)}
    </span>
  );
}

/* ──────────────────────────────────────────────
 * Filing Status
 * ────────────────────────────────────────────── */
const filingStatusStyles: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20",
  filed: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20",
  accepted: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20",
  rejected: "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20",
  served: "bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-600/20",
};

export function FilingStatusBadge({ status }: { status: string }) {
  return (
    <span className={cn(capsule, filingStatusStyles[status] ?? filingStatusStyles.pending)}>
      {formatEnum(status)}
    </span>
  );
}

/* ──────────────────────────────────────────────
 * Priority
 * ────────────────────────────────────────────── */
const priorityStyles: Record<string, string> = {
  low: "bg-slate-50 text-slate-600 ring-1 ring-inset ring-slate-500/20",
  medium: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20",
  high: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20",
  urgent: "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20",
  critical: "bg-red-100 text-red-800 ring-1 ring-inset ring-red-600/25",
};

export function PriorityBadge({ priority }: { priority: string }) {
  return (
    <span className={cn(capsule, priorityStyles[priority] ?? priorityStyles.medium)}>
      {formatEnum(priority)}
    </span>
  );
}

/* ──────────────────────────────────────────────
 * Task / Deadline Status
 * ────────────────────────────────────────────── */
const taskStatusStyles: Record<string, string> = {
  pending: "bg-slate-50 text-slate-600 ring-1 ring-inset ring-slate-500/20",
  in_progress: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20",
  completed: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20",
  cancelled: "bg-gray-50 text-gray-500 ring-1 ring-inset ring-gray-500/20",
  overdue: "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20",
};

export function TaskStatusBadge({ status }: { status: string }) {
  return (
    <span className={cn(capsule, taskStatusStyles[status] ?? taskStatusStyles.pending)}>
      {formatEnum(status)}
    </span>
  );
}

/* ──────────────────────────────────────────────
 * Requisition Status
 * ────────────────────────────────────────────── */
const requisitionStatusStyles: Record<string, string> = {
  draft: "bg-slate-50 text-slate-600 ring-1 ring-inset ring-slate-500/20",
  pending_approval: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20",
  approved: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20",
  rejected: "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20",
  completed: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20",
};

export function RequisitionStatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        capsule,
        requisitionStatusStyles[status] ?? requisitionStatusStyles.draft
      )}
    >
      {formatEnum(status)}
    </span>
  );
}

/* ──────────────────────────────────────────────
 * Bring-Up Status
 * ────────────────────────────────────────────── */
const bringUpStatusStyles: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20",
  completed: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20",
  dismissed: "bg-gray-50 text-gray-500 ring-1 ring-inset ring-gray-500/20",
  overdue: "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20",
};

export function BringUpStatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        capsule,
        bringUpStatusStyles[status] ?? bringUpStatusStyles.pending
      )}
    >
      {formatEnum(status)}
    </span>
  );
}

/* ──────────────────────────────────────────────
 * Notification Type
 * ────────────────────────────────────────────── */
const notificationTypeStyles: Record<string, string> = {
  info: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20",
  warning: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20",
  assignment: "bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-600/20",
  deadline: "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20",
  billing: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20",
  system: "bg-slate-50 text-slate-600 ring-1 ring-inset ring-slate-500/20",
};

export function NotificationTypeBadge({ type }: { type: string }) {
  return (
    <span
      className={cn(
        capsule,
        notificationTypeStyles[type] ?? notificationTypeStyles.info
      )}
    >
      {formatEnum(type)}
    </span>
  );
}

/* ──────────────────────────────────────────────
 * Billable Badge
 * ────────────────────────────────────────────── */
export function BillableBadge({ billable }: { billable: boolean }) {
  return (
    <span
      className={cn(
        capsule,
        billable
          ? "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20"
          : "bg-slate-50 text-slate-500 ring-1 ring-inset ring-slate-500/20"
      )}
    >
      {billable ? "Billable" : "Non-Billable"}
    </span>
  );
}

/* ──────────────────────────────────────────────
 * User Role Badge
 * ────────────────────────────────────────────── */
const roleStyles: Record<string, string> = {
  admin: "bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-600/20",
  attorney: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20",
  clerk: "bg-cyan-50 text-cyan-700 ring-1 ring-inset ring-cyan-600/20",
  client: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20",
};

export function RoleBadge({ role }: { role: string }) {
  return (
    <span className={cn(capsule, roleStyles[role] ?? roleStyles.clerk)}>
      {formatEnum(role)}
    </span>
  );
}

/* ──────────────────────────────────────────────
 * Active / Inactive Status
 * ────────────────────────────────────────────── */
export function ActiveBadge({ active }: { active: boolean }) {
  return (
    <span
      className={cn(
        capsule,
        active
          ? "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20"
          : "bg-rose-50 text-rose-600 ring-1 ring-inset ring-rose-600/20"
      )}
    >
      {active ? "Active" : "Inactive"}
    </span>
  );
}

/* ──────────────────────────────────────────────
 * Petty Cash Transaction Type
 * ────────────────────────────────────────────── */
export function TransactionTypeBadge({ type }: { type: string }) {
  return (
    <span
      className={cn(
        capsule,
        type === "deposit"
          ? "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20"
          : "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20"
      )}
    >
      {formatEnum(type)}
    </span>
  );
}
