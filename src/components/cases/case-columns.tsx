"use client";

import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SortableHeader } from "@/components/shared/enhanced-data-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, Pencil, Archive } from "lucide-react";
import { archiveCase } from "@/lib/actions/cases";
import { toast } from "sonner";
import { formatEnum } from "@/lib/utils/format-enum";
import { CaseStatusBadge, PriorityBadge } from "@/components/shared/status-badges";
import { PersonAvatar } from "@/components/shared/person-avatar";
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
  clientPhotoUrl: string | null;
  clientId: string;
  createdAt: Date;
}

export const caseColumns: ColumnDef<CaseRow>[] = [
  {
    accessorKey: "caseNumber",
    header: ({ column }) => <SortableHeader column={column}>Case #</SortableHeader>,
    cell: ({ row }) => {
      const isInactive = row.original.status === "closed" || row.original.status === "archived";
      return (
        <div className={isInactive ? "opacity-60" : undefined}>
          <Link
            href={`/cases/${row.original.id}`}
            className={`font-mono font-medium text-primary hover:underline ${isInactive ? "line-through decoration-muted-foreground/50" : ""}`}
          >
            {row.getValue("caseNumber")}
          </Link>
          {row.original.fileNumber && (
            <p className="font-mono text-xs text-muted-foreground">
              {row.original.fileNumber}
            </p>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "title",
    header: ({ column }) => <SortableHeader column={column}>Title</SortableHeader>,
    cell: ({ row }) => {
      const isInactive = row.original.status === "closed" || row.original.status === "archived";
      return (
        <div className={`max-w-[220px] ${isInactive ? "opacity-60" : ""}`}>
          <span className={`truncate block font-medium ${isInactive ? "line-through decoration-muted-foreground/50" : ""}`}>
            {row.getValue("title")}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatEnum(row.original.caseType)}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "clientName",
    header: ({ column }) => <SortableHeader column={column}>Client</SortableHeader>,
    cell: ({ row }) => (
      <Link
        href={`/clients/${row.original.clientId}`}
        className="flex items-center gap-2 text-sm text-primary hover:underline"
      >
        <PersonAvatar name={row.getValue("clientName")} imageUrl={row.original.clientPhotoUrl} size="sm" />
        {row.getValue("clientName")}
      </Link>
    ),
  },
  {
    accessorKey: "caseType",
    header: ({ column }) => <SortableHeader column={column}>Type</SortableHeader>,
    cell: ({ row }) => (
      <span className="text-sm">{formatEnum(row.getValue("caseType"))}</span>
    ),
    filterFn: (row, id, filterValue) => {
      return String(row.getValue(id)) === filterValue;
    },
  },
  {
    accessorKey: "dateFiled",
    header: ({ column }) => <SortableHeader column={column}>Date Filed</SortableHeader>,
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
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <div className="flex items-center gap-1.5">
          <CaseStatusBadge status={status} />
          {(status === "closed" || status === "archived") && (
            <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500 ring-1 ring-inset ring-gray-500/20">
              Closed
            </span>
          )}
        </div>
      );
    },
    filterFn: (row, id, filterValue) => {
      return String(row.getValue(id)) === filterValue;
    },
  },
  {
    accessorKey: "priority",
    header: "Priority",
    cell: ({ row }) => <PriorityBadge priority={row.getValue("priority") as string} />,
    filterFn: (row, id, filterValue) => {
      return String(row.getValue(id)) === filterValue;
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Actions">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href={`/cases/${row.original.id}`}>
              <Eye className="mr-2 h-3.5 w-3.5" />
              View Case
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href={`/cases/${row.original.id}/edit`}>
              <Pencil className="mr-2 h-3.5 w-3.5" />
              Edit
            </Link>
          </DropdownMenuItem>
          {row.original.status !== "closed" && row.original.status !== "archived" && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={async () => {
                  if (!confirm("Are you sure you want to archive this case?")) return;
                  const result = await archiveCase(row.original.id);
                  if (result?.error) {
                    toast.error(result.error as string);
                  } else {
                    toast.success("Case archived");
                  }
                }}
                className="text-destructive focus:text-destructive"
              >
                <Archive className="mr-2 h-3.5 w-3.5" />
                Archive
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];
