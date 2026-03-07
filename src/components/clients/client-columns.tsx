"use client";

import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { ActiveBadge } from "@/components/shared/status-badges";
import { SortableHeader } from "@/components/shared/enhanced-data-table";
import { formatEnum } from "@/lib/utils/format-enum";
import { Button } from "@/components/ui/button";
import { PersonAvatar } from "@/components/shared/person-avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, Pencil, ShieldAlert } from "lucide-react";

export interface ClientRow {
  id: string;
  type: string;
  status: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  companyName: string | null;
  county: string | null;
  isPep: boolean;
  photoUrl: string | null;
  createdAt: Date;
}

function getDisplayName(row: ClientRow) {
  return row.type === "organization" && row.companyName
    ? row.companyName
    : `${row.firstName} ${row.lastName}`;
}

export const clientColumns: ColumnDef<ClientRow>[] = [
  {
    accessorKey: "name",
    accessorFn: (row) => getDisplayName(row),
    header: ({ column }) => <SortableHeader column={column}>Name</SortableHeader>,
    cell: ({ row }) => {
      const name = getDisplayName(row.original);
      return (
        <div className="flex items-center gap-3">
          <PersonAvatar name={name} imageUrl={row.original.photoUrl} />
          <div className="min-w-0">
            <Link
              href={`/clients/${row.original.id}`}
              className="font-medium text-foreground hover:text-primary hover:underline"
            >
              {name}
            </Link>
            <p className="text-xs text-muted-foreground truncate">{row.original.email}</p>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "type",
    header: ({ column }) => <SortableHeader column={column}>Type</SortableHeader>,
    cell: ({ row }) => (
      <span className="text-sm">{formatEnum(row.getValue("type"))}</span>
    ),
    filterFn: (row, id, filterValue) => {
      return String(row.getValue(id)) === filterValue;
    },
  },
  {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ row }) => (
      <span className="text-sm">{row.getValue("phone") || "\u2014"}</span>
    ),
  },
  {
    accessorKey: "county",
    header: ({ column }) => <SortableHeader column={column}>County</SortableHeader>,
    cell: ({ row }) => (
      <span className="text-sm">{row.getValue("county") ?? "\u2014"}</span>
    ),
  },
  {
    accessorKey: "isPep",
    header: "PEP",
    cell: ({ row }) => {
      const isPep = row.original.isPep;
      if (!isPep) return null;
      return (
        <Badge variant="destructive" className="gap-1 text-[11px]">
          <ShieldAlert className="h-3 w-3" />
          PEP
        </Badge>
      );
    },
    filterFn: (row, id, filterValue) => {
      return String(row.getValue(id)) === filterValue;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return <ActiveBadge active={status === "active"} />;
    },
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
            <Link href={`/clients/${row.original.id}`}>
              <Eye className="mr-2 h-3.5 w-3.5" />
              View Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href={`/clients/${row.original.id}/edit`}>
              <Pencil className="mr-2 h-3.5 w-3.5" />
              Edit
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];
