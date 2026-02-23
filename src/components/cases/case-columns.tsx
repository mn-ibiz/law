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
import { APP_LOCALE } from "@/lib/constants/locale";

export interface CaseRow {
  id: string;
  caseNumber: string;
  fileNumber: string | null;
  title: string;
  status: string;
  priority: string;
  caseType: string;
  billingType: string;
  dateFiled: Date | null;
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
      <div>
        <Link
          href={`/cases/${row.original.id}`}
          className="font-mono font-medium text-primary hover:underline"
        >
          {row.getValue("caseNumber")}
        </Link>
        {row.original.fileNumber && (
          <p className="font-mono text-xs text-muted-foreground">
            {row.original.fileNumber}
          </p>
        )}
      </div>
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
      <div className="max-w-[220px]">
        <span className="truncate block font-medium">
          {row.getValue("title")}
        </span>
        <span className="text-xs text-muted-foreground">
          {formatEnum(row.original.caseType)}
        </span>
      </div>
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
    accessorKey: "dateFiled",
    header: () => (
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Date Filed
      </span>
    ),
    cell: ({ row }) => {
      const dateFiled = row.original.dateFiled;
      return dateFiled ? (
        <span className="text-sm text-muted-foreground">
          {new Date(dateFiled).toLocaleDateString(APP_LOCALE, {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </span>
      ) : (
        <span className="text-sm text-muted-foreground/50">&mdash;</span>
      );
    },
  },
  {
    accessorKey: "status",
    header: () => (
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Status
      </span>
    ),
    cell: ({ row }) => <CaseStatusBadge status={row.getValue("status") as string} />,
    filterFn: "equals",
  },
  {
    accessorKey: "priority",
    header: () => (
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Priority
      </span>
    ),
    cell: ({ row }) => <PriorityBadge priority={row.getValue("priority") as string} />,
    filterFn: "equals",
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
