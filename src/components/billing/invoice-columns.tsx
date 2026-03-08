"use client";

import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { SortableHeader } from "@/components/shared/enhanced-data-table";
import { InvoiceStatusBadge } from "@/components/shared/status-badges";
import { PersonAvatar } from "@/components/shared/person-avatar";
import { formatCurrency } from "@/lib/utils/format";

export interface InvoiceRow {
  id: string;
  invoiceNumber: string;
  status: string;
  totalAmount: string;
  paidAmount: string;
  dueDate: Date | null;
  createdAt: Date;
  clientName: string;
  clientPhotoUrl: string | null;
  caseNumber: string | null;
}

export function getInvoiceColumns(currency: string, locale: string): ColumnDef<InvoiceRow>[] {
  return [
  {
    accessorKey: "invoiceNumber",
    header: ({ column }) => <SortableHeader column={column}>Invoice #</SortableHeader>,
    cell: ({ row }) => (
      <Link
        href={`/billing/${row.original.id}`}
        className="font-mono font-medium text-primary hover:underline"
      >
        {row.getValue("invoiceNumber")}
      </Link>
    ),
  },
  {
    accessorKey: "clientName",
    header: ({ column }) => <SortableHeader column={column}>Client</SortableHeader>,
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <PersonAvatar name={row.getValue("clientName")} imageUrl={row.original.clientPhotoUrl} size="sm" />
        <span className="text-sm font-medium">{row.getValue("clientName")}</span>
      </div>
    ),
  },
  {
    accessorKey: "caseNumber",
    header: "Case",
    cell: ({ row }) => (
      <span className="font-mono text-xs">
        {row.getValue("caseNumber") ?? "\u2014"}
      </span>
    ),
  },
  {
    accessorKey: "totalAmount",
    header: ({ column }) => <SortableHeader column={column}>Total</SortableHeader>,
    cell: ({ row }) => (
      <span className="font-medium">
        {formatCurrency(Number(row.getValue("totalAmount")), currency, locale)}
      </span>
    ),
  },
  {
    accessorKey: "paidAmount",
    header: ({ column }) => <SortableHeader column={column}>Paid</SortableHeader>,
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {formatCurrency(Number(row.getValue("paidAmount")), currency, locale)}
      </span>
    ),
  },
  {
    accessorKey: "dueDate",
    header: ({ column }) => <SortableHeader column={column}>Due Date</SortableHeader>,
    cell: ({ row }) => {
      const dueDate = row.original.dueDate;
      return dueDate ? (
        <span className="text-sm">
          {new Date(dueDate).toLocaleDateString(locale, {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </span>
      ) : (
        <span className="text-muted-foreground">{"\u2014"}</span>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <InvoiceStatusBadge status={row.getValue("status") as string} />,
    filterFn: (row, id, filterValue) => {
      return String(row.getValue(id)) === filterValue;
    },
  },
];
}
