"use client";

import { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import {
  EnhancedDataTable,
  type DataTableFilterConfig,
  type ExportColumn,
} from "@/components/shared/enhanced-data-table";
import { getExpenseColumns, type ExpenseRow } from "./expense-columns";
import { ExpenseRowActions } from "./expense-row-actions";
import { useOrgConfig } from "@/components/providers/tenant-config-provider";
import { Receipt } from "lucide-react";

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
  { key: "category", label: "Category" },
  { key: "caseNumber", label: "Case" },
  { key: "amount", label: "Amount" },
  { key: "isBillable", label: "Billable" },
];

interface ExpenseDataTableProps {
  data: ExpenseRow[];
}

export function ExpenseDataTable({ data }: ExpenseDataTableProps) {
  const { currency, locale } = useOrgConfig();
  const columns = useMemo(() => {
    const actionsColumn: ColumnDef<ExpenseRow> = {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => <ExpenseRowActions expense={row.original} />,
    };
    return [...getExpenseColumns(currency, locale), actionsColumn];
  }, [currency, locale]);

  return (
    <EnhancedDataTable
      data={data}
      columns={columns}
      searchPlaceholder="Search by description, category, case..."
      filters={filters}
      exportFilename="expenses.csv"
      exportColumns={exportColumns}
      emptyIcon={Receipt}
      emptyTitle="No expenses yet"
      emptyDescription="Record your first expense to get started."
      emptyActionLabel="New Expense"
      emptyActionHref="/time-expenses/new?type=expense"
      enableSelection
    />
  );
}
