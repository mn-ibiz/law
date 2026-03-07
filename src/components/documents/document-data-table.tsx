"use client";

import { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import {
  EnhancedDataTable,
  type DataTableFilterConfig,
  type ExportColumn,
} from "@/components/shared/enhanced-data-table";
import { documentColumns, type DocumentRow } from "./document-columns";
import { DocumentRowActions } from "./document-row-actions";
import { FileText } from "lucide-react";

const filters: DataTableFilterConfig[] = [
  {
    id: "category",
    label: "All Categories",
    options: [
      { value: "pleading", label: "Pleading" },
      { value: "correspondence", label: "Correspondence" },
      { value: "contract", label: "Contract" },
      { value: "evidence", label: "Evidence" },
      { value: "court_order", label: "Court Order" },
      { value: "filing", label: "Filing" },
      { value: "template", label: "Template" },
      { value: "other", label: "Other" },
    ],
  },
  {
    id: "status",
    label: "All Statuses",
    options: [
      { value: "draft", label: "Draft" },
      { value: "final", label: "Final" },
      { value: "signed", label: "Signed" },
      { value: "archived", label: "Archived" },
    ],
  },
];

const exportColumns: ExportColumn[] = [
  { key: "title", label: "Title" },
  { key: "category", label: "Category" },
  { key: "caseNumber", label: "Case" },
  { key: "status", label: "Status" },
  { key: "uploadedByName", label: "Uploaded By" },
  { key: "createdAt", label: "Date" },
];

interface DocumentDataTableProps {
  data: DocumentRow[];
  cases: { id: string; caseNumber: string; title: string }[];
  clients: { id: string; name: string }[];
}

export function DocumentDataTable({ data, cases, clients }: DocumentDataTableProps) {
  const columns = useMemo(() => {
    const actionsColumn: ColumnDef<DocumentRow> = {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => (
        <DocumentRowActions
          documentId={row.original.id}
          status={row.original.status}
          fileUrl={row.original.fileUrl}
          title={row.original.title}
          category={row.original.category}
          description={row.original.description}
          caseId={row.original.caseId}
          clientId={row.original.clientId}
          cases={cases}
          clients={clients}
        />
      ),
    };
    return [...documentColumns, actionsColumn];
  }, [cases, clients]);

  return (
    <EnhancedDataTable
      data={data}
      columns={columns}
      searchPlaceholder="Search by title, file name..."
      filters={filters}
      exportFilename="documents.csv"
      exportColumns={exportColumns}
      emptyIcon={FileText}
      emptyTitle="No documents yet"
      emptyDescription="Upload your first document to get started."
      emptyActionLabel="Upload Document"
      emptyActionHref="/documents/new"
      enableSelection
    />
  );
}
