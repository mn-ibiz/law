"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import {
  EnhancedDataTable,
  type DataTableFilterConfig,
  type ExportColumn,
} from "@/components/shared/enhanced-data-table";
import { trustAccountColumns, type TrustAccountRow } from "./trust-account-columns";
import { TrustTransactionDialog } from "./trust-transaction-dialog";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowDownToLine, ArrowUpFromLine, Landmark } from "lucide-react";

const filters: DataTableFilterConfig[] = [
  {
    id: "type",
    label: "All Types",
    options: [
      { value: "client", label: "Client" },
      { value: "general", label: "General" },
      { value: "office", label: "Office" },
      { value: "escrow", label: "Escrow" },
    ],
  },
];

const exportColumns: ExportColumn[] = [
  { key: "accountName", label: "Account Name" },
  { key: "accountNumber", label: "Account Number" },
  { key: "type", label: "Type" },
  { key: "clientName", label: "Client" },
  { key: "bankName", label: "Bank" },
  { key: "balance", label: "Balance" },
];

interface TrustAccountDataTableProps {
  data: TrustAccountRow[];
}

export function TrustAccountDataTable({ data }: TrustAccountDataTableProps) {
  const router = useRouter();

  const columns = useMemo(() => {
    const actionsColumn: ColumnDef<TrustAccountRow> = {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const balance = Number(row.original.balance);
        return (
          <div className="flex items-center justify-end gap-1">
            <TrustTransactionDialog
              accountId={row.original.id}
              type="deposit"
              currentBalance={balance}
              trigger={
                <Button variant="ghost" size="icon" className="h-8 w-8" title="Deposit">
                  <ArrowDownToLine className="h-3.5 w-3.5 text-emerald-600" />
                </Button>
              }
            />
            <TrustTransactionDialog
              accountId={row.original.id}
              type="withdrawal"
              currentBalance={balance}
              trigger={
                <Button variant="ghost" size="icon" className="h-8 w-8" title="Withdraw">
                  <ArrowUpFromLine className="h-3.5 w-3.5 text-amber-600" />
                </Button>
              }
            />
            <Button variant="ghost" size="icon" className="h-8 w-8" asChild title="View details">
              <Link href={`/trust-accounts/${row.original.id}`}>
                <Landmark className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        );
      },
    };
    return [...trustAccountColumns, actionsColumn];
  }, []);

  return (
    <EnhancedDataTable
      data={data}
      columns={columns}
      searchPlaceholder="Search by account name, number, client..."
      filters={filters}
      exportFilename="trust-accounts.csv"
      exportColumns={exportColumns}
      onRowClick={(row) => router.push(`/trust-accounts/${row.id}`)}
      emptyIcon={Landmark}
      emptyTitle="No trust accounts"
      emptyDescription="Create your first trust account to manage client funds securely."
      enableSelection
    />
  );
}
