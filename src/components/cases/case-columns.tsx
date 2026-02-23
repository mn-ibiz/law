"use client";

import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { formatEnum } from "@/lib/utils/format-enum";
import { CaseStatusBadge, PriorityBadge } from "@/components/shared/status-badges";

export interface CaseRow {
  id: string;
  caseNumber: string;
  title: string;
  status: string;
  priority: string;
  caseType: string;
  billingType: string;
  clientName: string;
  clientId: string;
  createdAt: Date;
}

export const caseColumns: ColumnDef<CaseRow>[] = [
  {
    accessorKey: "caseNumber",
    header: () => (
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Case #
      </span>
    ),
    cell: ({ row }) => (
      <Link
        href={`/cases/${row.original.id}`}
        className="font-mono font-medium text-primary hover:underline"
      >
        {row.getValue("caseNumber")}
      </Link>
    ),
  },
  {
    accessorKey: "title",
    header: () => (
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Title
      </span>
    ),
    cell: ({ row }) => (
      <span className="max-w-[200px] truncate block font-medium">
        {row.getValue("title")}
      </span>
    ),
  },
  {
    accessorKey: "clientName",
    header: () => (
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Client
      </span>
    ),
    cell: ({ row }) => (
      <Link
        href={`/clients/${row.original.clientId}`}
        className="text-primary hover:underline"
      >
        {row.getValue("clientName")}
      </Link>
    ),
  },
  {
    accessorKey: "caseType",
    header: () => (
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Type
      </span>
    ),
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {formatEnum(row.getValue("caseType") as string)}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: () => (
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Status
      </span>
    ),
    cell: ({ row }) => <CaseStatusBadge status={row.getValue("status") as string} />,
  },
  {
    accessorKey: "priority",
    header: () => (
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Priority
      </span>
    ),
    cell: ({ row }) => <PriorityBadge priority={row.getValue("priority") as string} />,
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Actions">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href={`/cases/${row.original.id}`}>View</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/cases/${row.original.id}/edit`}>Edit</Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];
