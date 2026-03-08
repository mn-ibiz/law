"use client";

import { ColumnDef } from "@tanstack/react-table";
import { SortableHeader } from "@/components/shared/enhanced-data-table";
import { BillableBadge } from "@/components/shared/status-badges";
import { PersonAvatar } from "@/components/shared/person-avatar";
import { formatCurrency } from "@/lib/utils/format";
import { formatEnum } from "@/lib/utils/format-enum";

export interface ExpenseRow {
  id: string;
  caseId: string | null;
  category: string;
  description: string;
  amount: string;
  date: Date;
  receiptUrl: string | null;
  isBillable: boolean;
  isBilled: boolean;
  caseNumber: string | null;
  userName: string | null;
  userAvatar: string | null;
}

export function getExpenseColumns(currency: string, locale: string): ColumnDef<ExpenseRow>[] {
  return [
  {
    accessorKey: "date",
    header: ({ column }) => <SortableHeader column={column}>Date</SortableHeader>,
    cell: ({ row }) => (
      <span className="text-sm">
        {new Date(row.getValue("date") as Date).toLocaleDateString(locale)}
      </span>
    ),
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => (
      <span className="text-sm">{row.getValue("description")}</span>
    ),
  },
  {
    accessorKey: "category",
    header: ({ column }) => <SortableHeader column={column}>Category</SortableHeader>,
    cell: ({ row }) => (
      <span className="text-sm">{formatEnum(row.getValue("category"))}</span>
    ),
    filterFn: (row, id, filterValue) => {
      return String(row.getValue(id)) === filterValue;
    },
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
    accessorKey: "amount",
    header: ({ column }) => <SortableHeader column={column}>Amount</SortableHeader>,
    cell: ({ row }) => (
      <span className="font-medium">{formatCurrency(Number(row.getValue("amount")), currency, locale)}</span>
    ),
  },
  {
    accessorKey: "isBillable",
    header: "Billable",
    cell: ({ row }) => <BillableBadge billable={row.getValue("isBillable")} />,
    filterFn: (row, id, filterValue) => {
      return String(row.getValue(id)) === filterValue;
    },
  },
];
}
