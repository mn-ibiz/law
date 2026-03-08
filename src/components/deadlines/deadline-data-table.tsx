"use client";

import { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import {
  EnhancedDataTable,
  type DataTableFilterConfig,
  type ExportColumn,
} from "@/components/shared/enhanced-data-table";
import { getDeadlineColumns, type DeadlineRow } from "./deadline-columns";
import { useOrgConfig } from "@/components/providers/tenant-config-provider";
import { DeadlineRowActions } from "./deadline-row-actions";
import { AlertTriangle } from "lucide-react";

const filters: DataTableFilterConfig[] = [
  {
    id: "priority",
    label: "All Priorities",
    options: [
      { value: "low", label: "Low" },
      { value: "medium", label: "Medium" },
      { value: "high", label: "High" },
      { value: "urgent", label: "Urgent" },
    ],
  },
  {
    id: "completedAt",
    label: "All Statuses",
    options: [
      { value: "pending", label: "Pending" },
      { value: "overdue", label: "Overdue" },
      { value: "completed", label: "Completed" },
    ],
  },
];

const exportColumns: ExportColumn[] = [
  { key: "title", label: "Title" },
  { key: "caseNumber", label: "Case" },
  { key: "assignedToName", label: "Assigned To" },
  { key: "priority", label: "Priority" },
  { key: "dueDate", label: "Due Date" },
];

interface DeadlineDataTableProps {
  data: DeadlineRow[];
}

export function DeadlineDataTable({ data }: DeadlineDataTableProps) {
  const { locale } = useOrgConfig();
  const columns = useMemo(() => {
    const actionsColumn: ColumnDef<DeadlineRow> = {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => (
        <DeadlineRowActions
          deadlineId={row.original.id}
          deadlineTitle={row.original.title}
          isCompleted={!!row.original.completedAt}
          deadline={{
            id: row.original.id,
            title: row.original.title,
            description: row.original.description,
            priority: row.original.priority,
            dueDate: row.original.dueDate,
            isStatutory: row.original.isStatutory,
          }}
        />
      ),
    };
    return [...getDeadlineColumns(locale), actionsColumn];
  }, [locale]);

  return (
    <EnhancedDataTable
      data={data}
      columns={columns}
      searchPlaceholder="Search by title, case..."
      filters={filters}
      exportFilename="deadlines.csv"
      exportColumns={exportColumns}
      emptyIcon={AlertTriangle}
      emptyTitle="No deadlines set"
      emptyDescription="Track statutory and case deadlines to stay on top of important dates."
      emptyActionLabel="New Deadline"
      emptyActionHref="/deadlines/new"
      enableSelection
    />
  );
}
