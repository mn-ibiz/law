"use client";

import { ColumnDef } from "@tanstack/react-table";
import { SortableHeader } from "@/components/shared/enhanced-data-table";
import { formatEnum } from "@/lib/utils/format-enum";

import { cn } from "@/lib/utils";

export interface DocumentRow {
  id: string;
  title: string;
  category: string;
  status: string;
  description: string | null;
  fileName: string;
  fileSize: number | null;
  fileUrl: string | null;
  mimeType: string | null;
  caseId: string | null;
  clientId: string | null;
  createdAt: Date;
  caseNumber: string | null;
  uploadedByName: string | null;
}

const capsule =
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold leading-none whitespace-nowrap";

const docStatusStyles: Record<string, string> = {
  draft: "bg-slate-50 text-slate-600 ring-1 ring-inset ring-slate-500/20",
  final: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20",
  signed: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20",
  archived: "bg-gray-50 text-gray-500 ring-1 ring-inset ring-gray-500/20",
};

export function getDocumentColumns(locale: string): ColumnDef<DocumentRow>[] {
  return [
  {
    accessorKey: "title",
    header: ({ column }) => <SortableHeader column={column}>Title</SortableHeader>,
    cell: ({ row }) => (
      <span className="font-medium">{row.getValue("title")}</span>
    ),
  },
  {
    accessorKey: "category",
    header: ({ column }) => <SortableHeader column={column}>Category</SortableHeader>,
    cell: ({ row }) => (
      <span className="text-sm">{formatEnum(row.getValue("category"))}</span>
    ),
    filterFn: (row, id, filterValue) => {
      return String(row.getValue(id)) === filterValue;
    },
  },
  {
    accessorKey: "caseNumber",
    header: "Case",
    cell: ({ row }) => (
      <span className="font-mono text-xs">
        {row.getValue("caseNumber") ?? "\u2014"}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <span className={cn(capsule, docStatusStyles[status] ?? docStatusStyles.draft)}>
          {formatEnum(status)}
        </span>
      );
    },
    filterFn: (row, id, filterValue) => {
      return String(row.getValue(id)) === filterValue;
    },
  },
  {
    accessorKey: "uploadedByName",
    header: "Uploaded By",
    cell: ({ row }) => (
      <span className="text-sm">{row.getValue("uploadedByName") ?? "\u2014"}</span>
    ),
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => <SortableHeader column={column}>Date</SortableHeader>,
    cell: ({ row }) => (
      <span className="text-sm">
        {new Date(row.getValue("createdAt") as Date).toLocaleDateString(locale)}
      </span>
    ),
  },
];
}
