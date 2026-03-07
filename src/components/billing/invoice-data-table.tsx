"use client";

import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import {
  EnhancedDataTable,
  type DataTableFilterConfig,
  type ExportColumn,
} from "@/components/shared/enhanced-data-table";
import { invoiceColumns, type InvoiceRow } from "./invoice-columns";
import { InvoiceRowActions } from "./invoice-row-actions";
import { FileText } from "lucide-react";

const filters: DataTableFilterConfig[] = [
  {
    id: "status",
    label: "All Statuses",
    options: [
      { value: "draft", label: "Draft" },
      { value: "sent", label: "Sent" },
      { value: "viewed", label: "Viewed" },
      { value: "partially_paid", label: "Partially Paid" },
      { value: "paid", label: "Paid" },
      { value: "overdue", label: "Overdue" },
      { value: "cancelled", label: "Cancelled" },
      { value: "written_off", label: "Written Off" },
    ],
  },
];

const exportColumns: ExportColumn[] = [
  { key: "invoiceNumber", label: "Invoice #" },
  { key: "clientName", label: "Client" },
  { key: "caseNumber", label: "Case" },
  { key: "totalAmount", label: "Total" },
  { key: "paidAmount", label: "Paid" },
  { key: "dueDate", label: "Due Date" },
  { key: "status", label: "Status" },
];

interface InvoiceDataTableProps {
  data: InvoiceRow[];
  userRole: string;
}

export function InvoiceDataTable({ data, userRole }: InvoiceDataTableProps) {
  const router = useRouter();

  const columns = useMemo(() => {
    const actionsColumn: ColumnDef<InvoiceRow> = {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => (
        <InvoiceRowActions
          invoiceId={row.original.id}
          status={row.original.status}
          totalAmount={Number(row.original.totalAmount)}
          paidAmount={Number(row.original.paidAmount)}
          userRole={userRole}
        />
      ),
    };
    return [...invoiceColumns, actionsColumn];
  }, [userRole]);

  return (
    <EnhancedDataTable
      data={data}
      columns={columns}
      searchPlaceholder="Search by invoice number, client..."
      filters={filters}
      exportFilename="invoices.csv"
      exportColumns={exportColumns}
      onRowClick={(row) => router.push(`/billing/${row.id}`)}
      emptyIcon={FileText}
      emptyTitle="No invoices yet"
      emptyDescription="Create your first invoice to start billing clients."
      emptyActionLabel="New Invoice"
      emptyActionHref="/billing/new"
      enableSelection
    />
  );
}
