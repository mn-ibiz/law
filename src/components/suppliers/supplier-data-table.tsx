"use client";

import { useRouter } from "next/navigation";
import {
  EnhancedDataTable,
  type DataTableFilterConfig,
  type ExportColumn,
} from "@/components/shared/enhanced-data-table";
import { supplierColumns, type SupplierRow } from "./supplier-columns";
import { Truck } from "lucide-react";

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
  { key: "contactPerson", label: "Contact Person" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
  { key: "category", label: "Category" },
  { key: "kraPin", label: "KRA PIN" },
  { key: "isActive", label: "Status" },
];

interface SupplierDataTableProps {
  data: SupplierRow[];
}

export function SupplierDataTable({ data }: SupplierDataTableProps) {
  const router = useRouter();

  return (
    <EnhancedDataTable
      data={data}
      columns={supplierColumns}
      searchPlaceholder="Search by name, email, KRA PIN..."
      filters={filters}
      exportFilename="suppliers.csv"
      exportColumns={exportColumns}
      onRowClick={(row) => router.push(`/suppliers/${row.id}`)}
      emptyIcon={Truck}
      emptyTitle="No suppliers registered"
      emptyDescription="Add your first supplier to manage vendor invoices and payments."
      emptyActionLabel="Add Supplier"
      emptyActionHref="/suppliers/new"
      enableSelection
    />
  );
}
