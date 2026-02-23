"use client";

import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { ActiveBadge } from "@/components/shared/status-badges";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
  createdAt: Date;
}

export const clientColumns: ColumnDef<ClientRow>[] = [
  {
    accessorKey: "name",
    header: "Name",
    accessorFn: (row) =>
      row.type === "organization" && row.companyName
        ? row.companyName
        : `${row.firstName} ${row.lastName}`,
    cell: ({ row }) => (
      <Link
        href={`/clients/${row.original.id}`}
        className="font-medium text-primary hover:underline"
      >
        {row.getValue("name")}
      </Link>
    ),
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => (
      <span className="capitalize">{row.getValue("type")}</span>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "phone",
    header: "Phone",
  },
  {
    accessorKey: "county",
    header: "County",
    cell: ({ row }) => row.getValue("county") ?? "\u2014",
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
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <ActiveBadge active={status === "active"} />
      );
    },
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
            <Link href={`/clients/${row.original.id}`}>View</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/clients/${row.original.id}/edit`}>Edit</Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];
