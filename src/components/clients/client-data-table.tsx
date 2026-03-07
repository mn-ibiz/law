"use client";

import { useRouter } from "next/navigation";
import {
  EnhancedDataTable,
  type DataTableFilterConfig,
  type ExportColumn,
} from "@/components/shared/enhanced-data-table";
import { clientColumns, type ClientRow } from "./client-columns";
import { Users } from "lucide-react";

const filters: DataTableFilterConfig[] = [
  {
    id: "status",
    label: "All Statuses",
    options: [
      { value: "active", label: "Active" },
      { value: "inactive", label: "Inactive" },
      { value: "prospective", label: "Prospective" },
    ],
  },
  {
    id: "type",
    label: "All Types",
    options: [
      { value: "individual", label: "Individual" },
      { value: "organization", label: "Organization" },
    ],
  },
  {
    id: "isPep",
    label: "PEP Status",
    options: [
      { value: "true", label: "PEP" },
      { value: "false", label: "Non-PEP" },
    ],
  },
];

const exportColumns: ExportColumn[] = [
  { key: "firstName", label: "First Name" },
  { key: "lastName", label: "Last Name" },
  { key: "companyName", label: "Company" },
  { key: "type", label: "Type" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
  { key: "county", label: "County" },
  { key: "isPep", label: "PEP" },
  { key: "status", label: "Status" },
];

interface ClientDataTableProps {
  data: ClientRow[];
}

export function ClientDataTable({ data }: ClientDataTableProps) {
  const router = useRouter();

  return (
    <EnhancedDataTable
      data={data}
      columns={clientColumns}
      searchPlaceholder="Search by name, email, company..."
      filters={filters}
      exportFilename="clients.csv"
      exportColumns={exportColumns}
      onRowClick={(row) => router.push(`/clients/${row.id}`)}
      emptyIcon={Users}
      emptyTitle="No clients yet"
      emptyDescription="Add your first client to get started."
      emptyActionLabel="Add Client"
      emptyActionHref="/clients/new"
      enableSelection
    />
  );
}
