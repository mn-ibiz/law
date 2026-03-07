"use client";

import { ColumnDef } from "@tanstack/react-table";
import { SortableHeader } from "@/components/shared/enhanced-data-table";
import { RequisitionStatusBadge } from "@/components/shared/status-badges";
import { formatKES } from "@/lib/utils/format";

export interface RequisitionRow {
  id: string;
  requisitionNumber: string;
  description: string;
  amount: string;
  status: string;
  caseId: string | null;
  caseNumber: string | null;
  notes: string | null;
  requestedByName: string | null;
  createdAt: Date;
}

export const requisitionColumns: ColumnDef<RequisitionRow>[] = [
  {
    accessorKey: "requisitionNumber",
    header: ({ column }) => <SortableHeader column={column}>Number</SortableHeader>,
    cell: ({ row }) => (
      <span className="font-mono font-medium">{row.getValue("requisitionNumber")}</span>
    ),
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => (
      <span className="text-sm max-w-[250px] truncate block">
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
    accessorKey: "requestedByName",
    header: "Requested By",
    cell: ({ row }) => (
      <span className="text-sm">{row.getValue("requestedByName") ?? "\u2014"}</span>
    ),
  },
  {
    accessorKey: "amount",
    header: ({ column }) => <SortableHeader column={column}>Amount</SortableHeader>,
    cell: ({ row }) => (
      <span className="font-medium">{formatKES(Number(row.getValue("amount")))}</span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <RequisitionStatusBadge status={row.getValue("status") as string} />,
    filterFn: (row, id, filterValue) => {
      return String(row.getValue(id)) === filterValue;
    },
  },
];
