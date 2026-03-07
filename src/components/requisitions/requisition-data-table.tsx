"use client";

import { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import {
  EnhancedDataTable,
  type DataTableFilterConfig,
  type ExportColumn,
} from "@/components/shared/enhanced-data-table";
import { requisitionColumns, type RequisitionRow } from "./requisition-columns";
import { RequisitionRowActions } from "./requisition-row-actions";
import { ClipboardList } from "lucide-react";

const filters: DataTableFilterConfig[] = [
  {
    id: "status",
    label: "All Statuses",
    options: [
      { value: "pending_approval", label: "Pending Approval" },
      { value: "approved", label: "Approved" },
      { value: "rejected", label: "Rejected" },
      { value: "paid", label: "Paid" },
    ],
  },
];

const exportColumns: ExportColumn[] = [
  { key: "requisitionNumber", label: "Number" },
  { key: "description", label: "Description" },
  { key: "caseNumber", label: "Case" },
  { key: "requestedByName", label: "Requested By" },
  { key: "amount", label: "Amount" },
  { key: "status", label: "Status" },
];

interface RequisitionDataTableProps {
  data: RequisitionRow[];
  userRole: string;
  cases?: { id: string; caseNumber: string; title: string }[];
}

export function RequisitionDataTable({ data, userRole, cases = [] }: RequisitionDataTableProps) {
  const columns = useMemo(() => {
    const actionsColumn: ColumnDef<RequisitionRow> = {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => (
        <RequisitionRowActions
          requisitionId={row.original.id}
          status={row.original.status}
          userRole={userRole}
          requisition={
            row.original.status === "draft"
              ? {
                  id: row.original.id,
                  description: row.original.description,
                  amount: row.original.amount,
                  caseId: row.original.caseId,
                  notes: row.original.notes,
                }
              : undefined
          }
          cases={cases}
        />
      ),
    };
    return [...requisitionColumns, actionsColumn];
  }, [userRole, cases]);

  return (
    <EnhancedDataTable
      data={data}
      columns={columns}
      searchPlaceholder="Search by number, description..."
      filters={filters}
      exportFilename="requisitions.csv"
      exportColumns={exportColumns}
      emptyIcon={ClipboardList}
      emptyTitle="No requisitions yet"
      emptyDescription="Submit your first expense requisition to get started."
      emptyActionLabel="New Requisition"
      emptyActionHref="/requisitions/new"
      enableSelection
    />
  );
}
