"use client";

import { useRouter } from "next/navigation";
import {
  EnhancedDataTable,
  SortableHeader,
  type DataTableFilterConfig,
  type ExportColumn,
} from "@/components/shared/enhanced-data-table";
import { attorneyColumns, type AttorneyRow } from "./attorney-columns";
import { Scale } from "lucide-react";

const filters: DataTableFilterConfig[] = [
  {
    id: "isActive",
    label: "All Statuses",
    options: [
      { value: "true", label: "Active" },
      { value: "false", label: "Inactive" },
    ],
  },
];

const exportColumns: ExportColumn[] = [
  { key: "name", label: "Name" },
  { key: "title", label: "Title" },
  { key: "department", label: "Department" },
  { key: "barNumber", label: "Bar Number" },
  { key: "lskNumber", label: "LSK Number" },
  { key: "hourlyRate", label: "Hourly Rate" },
  { key: "isActive", label: "Status" },
];

interface AttorneyDataTableProps {
  data: AttorneyRow[];
}

export function AttorneyDataTable({ data }: AttorneyDataTableProps) {
  const router = useRouter();

  return (
    <EnhancedDataTable
      data={data}
      columns={attorneyColumns}
      searchPlaceholder="Search by name, bar number, email..."
      filters={filters}
      exportFilename="attorneys.csv"
      exportColumns={exportColumns}
      onRowClick={(row) => router.push(`/attorneys/${row.id}`)}
      emptyIcon={Scale}
      emptyTitle="No attorneys yet"
      emptyDescription="Add your first attorney to get started."
      emptyActionLabel="Add Attorney"
      emptyActionHref="/attorneys/new"
      enableSelection
    />
  );
}
