"use client";

import { useRouter } from "next/navigation";
import {
  EnhancedDataTable,
  type DataTableFilterConfig,
  type ExportColumn,
} from "@/components/shared/enhanced-data-table";
import { caseColumns, type CaseRow } from "./case-columns";
import { Briefcase } from "lucide-react";

const filters: DataTableFilterConfig[] = [
  {
    id: "status",
    label: "All Statuses",
    options: [
      { value: "open", label: "Open" },
      { value: "in_progress", label: "In Progress" },
      { value: "hearing", label: "Hearing" },
      { value: "resolved", label: "Resolved" },
      { value: "closed", label: "Closed" },
      { value: "archived", label: "Archived" },
    ],
  },
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
    id: "caseType",
    label: "All Types",
    options: [
      { value: "civil", label: "Civil" },
      { value: "criminal", label: "Criminal" },
      { value: "family", label: "Family" },
      { value: "commercial", label: "Commercial" },
      { value: "conveyancing", label: "Conveyancing" },
      { value: "employment", label: "Employment" },
      { value: "tax", label: "Tax" },
      { value: "intellectual_property", label: "Intellectual Property" },
      { value: "immigration", label: "Immigration" },
      { value: "environmental", label: "Environmental" },
      { value: "other", label: "Other" },
    ],
  },
];

const exportColumns: ExportColumn[] = [
  { key: "caseNumber", label: "Case Number" },
  { key: "title", label: "Title" },
  { key: "clientName", label: "Client" },
  { key: "caseType", label: "Case Type" },
  { key: "status", label: "Status" },
  { key: "priority", label: "Priority" },
  { key: "billingType", label: "Billing Type" },
  { key: "dateFiled", label: "Date Filed" },
];

interface CaseDataTableProps {
  data: CaseRow[];
}

export function CaseDataTable({ data }: CaseDataTableProps) {
  const router = useRouter();

  return (
    <EnhancedDataTable
      data={data}
      columns={caseColumns}
      searchPlaceholder="Search by case number, title, client..."
      filters={filters}
      exportFilename="cases.csv"
      exportColumns={exportColumns}
      onRowClick={(row) => router.push(`/cases/${row.id}`)}
      emptyIcon={Briefcase}
      emptyTitle="No cases yet"
      emptyDescription="Create your first case to get started."
      emptyActionLabel="New Case"
      emptyActionHref="/cases/new"
      enableSelection
    />
  );
}
