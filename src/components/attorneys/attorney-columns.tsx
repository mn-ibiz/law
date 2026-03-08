"use client";

import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { ActiveBadge } from "@/components/shared/status-badges";
import { SortableHeader } from "@/components/shared/enhanced-data-table";
import { Button } from "@/components/ui/button";
import { PersonAvatar } from "@/components/shared/person-avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, Pencil } from "lucide-react";
import { formatCurrency } from "@/lib/utils/format";
import { formatEnum } from "@/lib/utils/format-enum";

export interface AttorneyRow {
  id: string;
  name: string;
  email: string;
  title: string;
  department: string | null;
  barNumber: string;
  lskNumber: string | null;
  hourlyRate: string | null;
  photoUrl: string | null;
  isActive: boolean;
}

export function getAttorneyColumns(currency: string, locale: string): ColumnDef<AttorneyRow>[] {
  return [
  {
    accessorKey: "name",
    header: ({ column }) => <SortableHeader column={column}>Name</SortableHeader>,
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <PersonAvatar name={row.getValue("name")} imageUrl={row.original.photoUrl} />
        <div className="min-w-0">
          <Link
            href={`/attorneys/${row.original.id}`}
            className="font-medium text-foreground hover:text-primary hover:underline"
          >
            {row.getValue("name")}
          </Link>
          <p className="text-xs text-muted-foreground truncate">{row.original.email}</p>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "title",
    header: ({ column }) => <SortableHeader column={column}>Title</SortableHeader>,
    cell: ({ row }) => (
      <span className="text-sm">{formatEnum(row.getValue("title") as string)}</span>
    ),
  },
  {
    accessorKey: "department",
    header: ({ column }) => <SortableHeader column={column}>Department</SortableHeader>,
    cell: ({ row }) => (
      <span className="text-sm">{row.getValue("department") ?? "\u2014"}</span>
    ),
  },
  {
    accessorKey: "barNumber",
    header: "Bar Number",
    cell: ({ row }) => (
      <span className="font-mono text-sm">{row.getValue("barNumber")}</span>
    ),
  },
  {
    accessorKey: "lskNumber",
    header: "LSK Number",
    cell: ({ row }) => (
      <span className="font-mono text-sm">{row.getValue("lskNumber") ?? "\u2014"}</span>
    ),
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => <ActiveBadge active={row.getValue("isActive")} />,
    filterFn: (row, id, filterValue) => {
      return String(row.getValue(id)) === filterValue;
    },
  },
  {
    accessorKey: "hourlyRate",
    header: ({ column }) => <SortableHeader column={column}>Rate</SortableHeader>,
    cell: ({ row }) => {
      const rate = row.getValue("hourlyRate") as string | null;
      return rate ? (
        <span className="font-medium">{formatCurrency(Number(rate), currency, locale)}</span>
      ) : (
        <span className="text-muted-foreground">\u2014</span>
      );
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
            <Link href={`/attorneys/${row.original.id}`}>
              <Eye className="mr-2 h-3.5 w-3.5" />
              View Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href={`/attorneys/${row.original.id}/edit`}>
              <Pencil className="mr-2 h-3.5 w-3.5" />
              Edit
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];
}
