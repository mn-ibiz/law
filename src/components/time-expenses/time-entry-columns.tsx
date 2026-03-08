"use client";

import { ColumnDef } from "@tanstack/react-table";
import { SortableHeader } from "@/components/shared/enhanced-data-table";
import { BillableBadge } from "@/components/shared/status-badges";
import { PersonAvatar } from "@/components/shared/person-avatar";
import { formatCurrency } from "@/lib/utils/format";

export interface TimeEntryRow {
  id: string;
  caseId: string | null;
  description: string;
  date: Date;
  hours: string;
  rate: string | null;
  amount: string | null;
  isBillable: boolean;
  isBilled: boolean;
  caseNumber: string | null;
  caseTitle: string | null;
  userName: string | null;
  userAvatar: string | null;
}

export function getTimeEntryColumns(currency: string, locale: string): ColumnDef<TimeEntryRow>[] {
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
      <span className="text-sm max-w-[200px] truncate block">
        {row.getValue("description")}
      </span>
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
    accessorKey: "userName",
    header: ({ column }) => <SortableHeader column={column}>Attorney</SortableHeader>,
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <PersonAvatar name={row.getValue("userName")} imageUrl={row.original.userAvatar} size="sm" />
        <span className="text-sm">{row.getValue("userName")}</span>
      </div>
    ),
  },
  {
    accessorKey: "hours",
    header: ({ column }) => <SortableHeader column={column}>Hours</SortableHeader>,
    cell: ({ row }) => (
      <span className="font-medium">{row.getValue("hours")}</span>
    ),
  },
  {
    accessorKey: "amount",
    header: ({ column }) => <SortableHeader column={column}>Amount</SortableHeader>,
    cell: ({ row }) => {
      const amount = row.getValue("amount") as string | null;
      return amount ? (
        <span className="text-sm">{formatCurrency(Number(amount), currency, locale)}</span>
      ) : (
        <span className="text-muted-foreground">{"\u2014"}</span>
      );
    },
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
