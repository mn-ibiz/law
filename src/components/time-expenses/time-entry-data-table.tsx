"use client";

import { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import {
  EnhancedDataTable,
  type DataTableFilterConfig,
  type ExportColumn,
} from "@/components/shared/enhanced-data-table";
import { getTimeEntryColumns, type TimeEntryRow } from "./time-entry-columns";
import { TimeEntryRowActions } from "./time-entry-row-actions";
import { useOrgConfig } from "@/components/providers/tenant-config-provider";
import { Clock } from "lucide-react";

const filters: DataTableFilterConfig[] = [
  {
    id: "isBillable",
    label: "Billable Status",
    options: [
      { value: "true", label: "Billable" },
      { value: "false", label: "Non-Billable" },
    ],
  },
];

const exportColumns: ExportColumn[] = [
  { key: "date", label: "Date" },
  { key: "description", label: "Description" },
  { key: "caseNumber", label: "Case" },
  { key: "userName", label: "Attorney" },
  { key: "hours", label: "Hours" },
  { key: "amount", label: "Amount" },
  { key: "isBillable", label: "Billable" },
];

interface TimeEntryDataTableProps {
  data: TimeEntryRow[];
}

export function TimeEntryDataTable({ data }: TimeEntryDataTableProps) {
  const { currency, locale } = useOrgConfig();
  const columns = useMemo(() => {
    const actionsColumn: ColumnDef<TimeEntryRow> = {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => (
        <TimeEntryRowActions entry={row.original} />
      ),
    };
    return [...getTimeEntryColumns(currency, locale), actionsColumn];
  }, [currency, locale]);

  return (
    <EnhancedDataTable
      data={data}
      columns={columns}
      searchPlaceholder="Search by description, case, attorney..."
      filters={filters}
      exportFilename="time-entries.csv"
      exportColumns={exportColumns}
      emptyIcon={Clock}
      emptyTitle="No time entries yet"
      emptyDescription="Record your first billable time entry to get started."
      emptyActionLabel="New Time Entry"
      emptyActionHref="/time-expenses/new?type=time"
      enableSelection
    />
  );
}
