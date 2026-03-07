"use client";

import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { SortableHeader } from "@/components/shared/enhanced-data-table";
import { formatKES } from "@/lib/utils/format";
import { formatEnum } from "@/lib/utils/format-enum";
import { PersonAvatar } from "@/components/shared/person-avatar";
import { cn } from "@/lib/utils";

export interface TrustAccountRow {
  id: string;
  accountName: string;
  accountNumber: string;
  type: string;
  balance: string;
  bankName: string | null;
  currency: string;
  clientName: string;
  clientPhotoUrl: string | null;
}

const capsule =
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold leading-none whitespace-nowrap";

const accountTypeStyles: Record<string, string> = {
  client: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20",
  general: "bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-600/20",
  office: "bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-600/20",
  escrow: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20",
};

export const trustAccountColumns: ColumnDef<TrustAccountRow>[] = [
  {
    accessorKey: "accountName",
    header: ({ column }) => <SortableHeader column={column}>Account Name</SortableHeader>,
    cell: ({ row }) => (
      <Link
        href={`/trust-accounts/${row.original.id}`}
        className="font-medium text-foreground hover:text-primary hover:underline"
      >
        {row.getValue("accountName")}
      </Link>
    ),
  },
  {
    accessorKey: "accountNumber",
    header: "Account Number",
    cell: ({ row }) => (
      <Link
        href={`/trust-accounts/${row.original.id}`}
        className="font-mono text-sm hover:underline"
      >
        {row.getValue("accountNumber")}
      </Link>
    ),
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const type = row.getValue("type") as string;
      return (
        <span className={cn(capsule, accountTypeStyles[type] ?? accountTypeStyles.client)}>
          {formatEnum(type)}
        </span>
      );
    },
    filterFn: (row, id, filterValue) => {
      return String(row.getValue(id)) === filterValue;
    },
  },
  {
    accessorKey: "clientName",
    header: ({ column }) => <SortableHeader column={column}>Client</SortableHeader>,
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <PersonAvatar name={row.getValue("clientName")} imageUrl={row.original.clientPhotoUrl} size="sm" />
        <span className="text-sm">{row.getValue("clientName")}</span>
      </div>
    ),
  },
  {
    accessorKey: "bankName",
    header: "Bank",
    cell: ({ row }) => (
      <span className="text-sm">{row.getValue("bankName") ?? "\u2014"}</span>
    ),
  },
  {
    accessorKey: "balance",
    header: ({ column }) => <SortableHeader column={column}>Balance</SortableHeader>,
    cell: ({ row }) => (
      <span className="font-medium text-right block">
        {formatKES(Number(row.getValue("balance")))}
      </span>
    ),
  },
];
