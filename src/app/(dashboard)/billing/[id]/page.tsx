import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { requireAdminOrAttorney } from "@/lib/auth/get-session";
import {
  getInvoiceById,
  getInvoiceLineItems,
  getInvoicePayments,
  getInvoiceHistory,
} from "@/lib/queries/billing";
import { getFirmBranding } from "@/lib/queries/settings";
import { Badge } from "@/components/ui/badge";
import { formatKES } from "@/lib/utils/format";
import { formatEnum } from "@/lib/utils/format-enum";
import { APP_LOCALE } from "@/lib/constants/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { InvoiceActions } from "@/components/billing/invoice-actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  FileText,
  Receipt,
} from "lucide-react";

const statusColorMap: Record<string, string> = {
  draft: "bg-slate-100 text-slate-700 border-slate-300",
  sent: "bg-blue-100 text-blue-700 border-blue-300",
  viewed: "bg-cyan-100 text-cyan-700 border-cyan-300",
  partially_paid: "bg-amber-100 text-amber-700 border-amber-300",
  paid: "bg-green-100 text-green-700 border-green-300",
  overdue: "bg-red-100 text-red-700 border-red-300",
  cancelled: "bg-gray-100 text-gray-500 border-gray-300",
  written_off: "bg-rose-100 text-rose-700 border-rose-300",
};

function fmtDate(d: Date | string | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString(APP_LOCALE, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function fmtDateTime(d: Date | string | null | undefined) {
  if (!d) return "—";
  const date = new Date(d);
  return `${date.toLocaleDateString(APP_LOCALE, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })} at ${date.toLocaleTimeString(APP_LOCALE, {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })}`;
}

function getInitials(name: string | null | undefined) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatAuditDetails(action: string, details: string | null) {
  if (!details) return formatEnum(action);
  // If details is already a readable sentence, use it directly
  if (!details.startsWith("{") && !details.startsWith("[")) return details;
  // Try to parse JSON and create a readable summary
  try {
    const parsed = JSON.parse(details);
    const keys = Object.keys(parsed);
    if (keys.length === 0) return formatEnum(action);
    const fieldNames = keys
      .map((k) => k.replace(/([A-Z])/g, " $1").toLowerCase().trim())
      .join(", ");
    return `${formatEnum(action)} — ${fieldNames}`;
  } catch {
    return formatEnum(action);
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const invoice = await getInvoiceById(id);
  return {
    title: invoice ? `Invoice ${invoice.invoiceNumber}` : "Invoice Details",
    description: invoice
      ? `Invoice ${invoice.invoiceNumber} details`
      : "Invoice details",
  };
}

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminOrAttorney();
  const { id } = await params;
  const invoice = await getInvoiceById(id);
  if (!invoice) notFound();

  const [lineItems, paymentList, history, branding] = await Promise.all([
    getInvoiceLineItems(id),
    getInvoicePayments(id),
    getInvoiceHistory(id),
    getFirmBranding(),
  ]);

  const balanceDue =
    Number(invoice.totalAmount) - Number(invoice.paidAmount);
  const statusClass =
    statusColorMap[invoice.status] ?? statusColorMap.draft;

  // Build client address block
  const clientAddressParts = [
    invoice.clientAddress,
    invoice.clientCity,
    invoice.clientCounty,
    invoice.clientPoBox
      ? invoice.clientPoBox.toLowerCase().startsWith("p.o.")
        ? invoice.clientPoBox
        : `P.O. Box ${invoice.clientPoBox}`
      : null,
  ].filter(Boolean) as string[];

  const firmName = branding.firmName || "Law Firm";
  const firmEmail = branding.email ?? null;
  const firmPhone = branding.phone ?? null;
  const firmWebsite = branding.website ?? null;
  const firmAddress = branding.address ?? null;

  // Build PDF data for client-side generation
  const pdfData = {
    invoiceNumber: invoice.invoiceNumber,
    status: invoice.status,
    issueDate: fmtDate(invoice.createdAt),
    dueDate: fmtDate(invoice.dueDate),
    caseNumber: invoice.caseNumber ?? undefined,
    caseTitle: invoice.caseTitle ?? undefined,
    createdBy: invoice.createdByName,
    firmName,
    firmEmail: firmEmail ?? undefined,
    firmPhone: firmPhone ?? undefined,
    firmAddress: firmAddress ?? undefined,
    firmWebsite: firmWebsite ?? undefined,
    firmTagline: branding.tagline ?? undefined,
    firmLogoUrl: branding.logoUrl ?? undefined,
    invoiceFooter: branding.invoiceFooter ?? undefined,
    clientName: invoice.clientName,
    clientEmail: invoice.clientEmail ?? undefined,
    clientPhone: invoice.clientPhone ?? undefined,
    clientAddress: clientAddressParts.length > 0 ? clientAddressParts : undefined,
    lineItems: lineItems.map((item) => ({
      description: item.description,
      quantity: String(item.quantity),
      unitPrice: String(item.unitPrice),
      amount: String(item.amount),
    })),
    subtotal: String(invoice.subtotal),
    vatRate: String(invoice.vatRate),
    vatAmount: String(invoice.vatAmount),
    totalAmount: String(invoice.totalAmount),
    paidAmount: String(invoice.paidAmount),
    balanceDue: String(balanceDue),
    notes: invoice.notes ?? undefined,
  };

  return (
    <div className="mx-auto max-w-[820px] space-y-6 pb-12">
      <PageBreadcrumb
        items={[
          { label: "Billing", href: "/billing" },
          { label: invoice.invoiceNumber },
        ]}
      />

      {/* Page Header — title, client, actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2.5">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">
              {invoice.caseTitle || invoice.invoiceNumber}
            </h1>
            <Badge
              variant="outline"
              className={`${statusClass} border font-medium`}
            >
              {formatEnum(invoice.status)}
            </Badge>
          </div>
          <div className="flex items-center gap-2.5">
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarFallback className="text-[11px] font-semibold bg-primary/10 text-primary">
                {getInitials(invoice.clientName)}
              </AvatarFallback>
            </Avatar>
            <div className="leading-tight">
              <p className="text-sm font-medium">{invoice.clientName}</p>
              {invoice.clientEmail && (
                <p className="text-xs text-muted-foreground">{invoice.clientEmail}</p>
              )}
            </div>
          </div>
        </div>
        <InvoiceActions
          invoiceId={id}
          status={invoice.status}
          invoiceNumber={invoice.invoiceNumber}
          clientName={invoice.clientName}
          clientEmail={invoice.clientEmail ?? ""}
          totalAmount={formatKES(Number(invoice.totalAmount))}
          firmName={firmName}
          pdfData={pdfData}
        />
      </div>

      {/* ─── Invoice Document ─── */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">

        {/* Top accent bar */}
        <div className="h-1.5 bg-primary" />

        <div className="px-10 py-10 md:px-14 md:py-12">

          {/* Document header — logo/firm on left, INVOICE title on right */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              {branding.logoUrl && (
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md">
                  <Image
                    src={branding.logoUrl}
                    alt="Firm logo"
                    fill
                    sizes="48px"
                    className="object-contain"
                    unoptimized
                  />
                </div>
              )}
              <div>
                <p className="text-lg font-bold tracking-tight text-slate-900">
                  {firmName}
                </p>
                {branding.tagline && (
                  <p className="text-xs text-slate-500">{branding.tagline}</p>
                )}
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-800">
                INVOICE
              </h2>
              <p className="mt-0.5 text-sm font-semibold text-primary">
                {invoice.invoiceNumber}
              </p>
            </div>
          </div>

          {/* Draft watermark */}
          {invoice.status === "draft" && (
            <div className="flex justify-center -mb-4 mt-2">
              <span className="rounded border-[3px] border-dashed border-slate-300 px-8 py-1.5 text-lg font-extrabold uppercase tracking-[0.25em] text-slate-300 rotate-[-4deg]">
                Draft
              </span>
            </div>
          )}

          {/* Divider */}
          <div className="my-8 border-t border-slate-200" />

          {/* FROM / TO */}
          <div className="grid grid-cols-1 gap-y-6 md:grid-cols-[1fr_auto] md:gap-x-16">
            {/* FROM */}
            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                From
              </p>
              <p className="text-[15px] font-semibold text-slate-900">{firmName}</p>
              {firmEmail && (
                <p className="mt-0.5 text-sm text-slate-500">{firmEmail}</p>
              )}
              {firmPhone && (
                <p className="text-sm text-slate-500">{firmPhone}</p>
              )}
              {firmAddress && (
                <p className="text-sm text-slate-500 whitespace-pre-line">{firmAddress}</p>
              )}
              {firmWebsite && (
                <p className="text-sm text-slate-500">{firmWebsite}</p>
              )}
            </div>
            {/* TO */}
            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                Bill To
              </p>
              <p className="text-[15px] font-semibold text-slate-900">{invoice.clientName}</p>
              {invoice.clientEmail && (
                <p className="mt-0.5 text-sm text-slate-500">{invoice.clientEmail}</p>
              )}
              {invoice.clientPhone && (
                <p className="text-sm text-slate-500">{invoice.clientPhone}</p>
              )}
              {clientAddressParts.map((line, i) => (
                <p key={i} className="text-sm text-slate-500">{line}</p>
              ))}
            </div>
          </div>

          {/* Invoice meta fields */}
          <div className="mt-8 rounded-lg bg-slate-50 px-6 py-4">
            <div className="grid grid-cols-2 gap-y-3 md:grid-cols-4 md:gap-x-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                  Issue Date
                </p>
                <p className="mt-0.5 text-sm font-medium text-slate-800">
                  {fmtDate(invoice.createdAt)}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                  Due Date
                </p>
                <p className="mt-0.5 text-sm font-medium text-slate-800">
                  {fmtDate(invoice.dueDate)}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                  Created By
                </p>
                <p className="mt-0.5 text-sm font-medium text-slate-800">
                  {invoice.createdByName}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                  Status
                </p>
                <Badge
                  variant="outline"
                  className={`${statusClass} mt-0.5 border text-xs font-medium`}
                >
                  {formatEnum(invoice.status)}
                </Badge>
              </div>
              {invoice.caseNumber && (
                <div className="col-span-2 md:col-span-4 border-t border-slate-200 pt-3 mt-1">
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                    Matter / Case
                  </p>
                  <p className="mt-0.5 text-sm font-medium text-slate-800">
                    {invoice.caseNumber}
                    {invoice.caseTitle ? ` — ${invoice.caseTitle}` : ""}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Line Items */}
          <div className="mt-10">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-slate-900">
                  <th className="pb-2.5 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
                    Description
                  </th>
                  <th className="pb-2.5 text-right text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
                    Qty
                  </th>
                  <th className="pb-2.5 text-right text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
                    Unit Price
                  </th>
                  <th className="pb-2.5 text-right text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {lineItems.map((item) => (
                  <tr key={item.id}>
                    <td className="py-3.5 pr-4 font-medium text-slate-800">
                      {item.description}
                    </td>
                    <td className="py-3.5 text-right tabular-nums text-slate-600">
                      {Number(item.quantity).toFixed(2)}
                    </td>
                    <td className="py-3.5 text-right tabular-nums text-slate-600">
                      {formatKES(Number(item.unitPrice))}
                    </td>
                    <td className="py-3.5 text-right tabular-nums font-semibold text-slate-800">
                      {formatKES(Number(item.amount))}
                    </td>
                  </tr>
                ))}
                {lineItems.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-10 text-center text-slate-400">
                      No line items
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="mt-2 flex justify-end">
            <div className="w-full max-w-[280px]">
              <div className="border-t-2 border-slate-900 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Subtotal</span>
                  <span className="tabular-nums font-medium text-slate-700">
                    {formatKES(Number(invoice.subtotal))}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">
                    VAT ({invoice.vatRate}%)
                  </span>
                  <span className="tabular-nums font-medium text-slate-700">
                    {formatKES(Number(invoice.vatAmount))}
                  </span>
                </div>
                <div className="border-t border-slate-200 pt-2 flex justify-between">
                  <span className="text-sm font-semibold text-slate-700">Total</span>
                  <span className="tabular-nums text-base font-bold text-slate-900">
                    {formatKES(Number(invoice.totalAmount))}
                  </span>
                </div>
                {Number(invoice.paidAmount) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-emerald-600 font-medium">Paid</span>
                    <span className="tabular-nums font-medium text-emerald-600">
                      -{formatKES(Number(invoice.paidAmount))}
                    </span>
                  </div>
                )}
                <div className="border-t-2 border-slate-900 pt-3 flex justify-between items-baseline">
                  <span className="text-xs font-bold uppercase tracking-[0.1em] text-slate-600">
                    Amount Due
                  </span>
                  <span className="tabular-nums text-xl font-extrabold text-slate-900">
                    {formatKES(balanceDue)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="mt-10 border-t border-slate-200 pt-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 mb-1.5">
                Notes
              </p>
              <p className="text-sm leading-relaxed text-slate-600 whitespace-pre-wrap">
                {invoice.notes}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ─── History & Payments ─── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Invoice History */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-4">
            <h2 className="text-sm font-semibold text-slate-800">Activity</h2>
          </div>
          <div className="px-6 py-2">
            {history.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                <FileText className="h-8 w-8 mb-2 opacity-40" />
                <p className="text-sm">No activity yet</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {history.map((entry) => (
                  <div key={entry.id} className="flex items-start gap-3 py-3.5">
                    <Avatar className="h-7 w-7 shrink-0 mt-0.5">
                      <AvatarImage src={entry.userAvatar ?? undefined} />
                      <AvatarFallback className="text-[10px] font-semibold">
                        {getInitials(entry.userName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-700 truncate">
                        {formatAuditDetails(entry.action, entry.details)}
                      </p>
                      <p className="text-xs text-slate-400">
                        {entry.userName} &middot; {fmtDateTime(entry.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Payment History */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-4">
            <h2 className="text-sm font-semibold text-slate-800">Payments</h2>
          </div>
          <div className="px-6 py-2">
            {paymentList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                <Receipt className="h-8 w-8 mb-2 opacity-40" />
                <p className="text-sm">No payments yet</p>
              </div>
            ) : (
              <>
                <div className="divide-y divide-slate-100">
                  {paymentList.map((p) => (
                    <div key={p.id} className="flex items-center justify-between py-3.5">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-700">
                          {formatEnum(p.method)}
                        </p>
                        <p className="text-xs text-slate-400">
                          {fmtDate(p.paymentDate)}
                          {p.reference || p.mpesaTransactionId
                            ? ` · ${p.reference ?? p.mpesaTransactionId}`
                            : ""}
                        </p>
                      </div>
                      <span className="text-sm tabular-nums font-semibold text-emerald-600 shrink-0 ml-4">
                        +{formatKES(Number(p.amount))}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-slate-200 mt-1 pt-3 pb-2 flex justify-between items-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Balance Due
                  </span>
                  <span className="text-base tabular-nums font-bold text-slate-900">
                    {formatKES(balanceDue)}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
