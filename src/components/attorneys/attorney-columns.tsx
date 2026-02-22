"use client";

import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { formatKES } from "@/lib/utils/format";
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
  isActive: boolean;
}

export const attorneyColumns: ColumnDef<AttorneyRow>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <Link
        href={`/attorneys/${row.original.id}`}
        className="font-medium text-primary hover:underline"
      >
        {row.getValue("name")}
      </Link>
    ),
  },
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => (
      <span className="capitalize">{formatEnum(row.getValue("title") as string)}</span>
    ),
  },
  {
    accessorKey: "department",
    header: "Department",
    cell: ({ row }) => row.getValue("department") ?? "—",
  },
  {
    accessorKey: "barNumber",
    header: "Bar Number",
  },
  {
    accessorKey: "lskNumber",
    header: "LSK Number",
    cell: ({ row }) => row.getValue("lskNumber") ?? "—",
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={row.getValue("isActive") ? "default" : "secondary"}>
        {row.getValue("isActive") ? "Active" : "Inactive"}
      </Badge>
    ),
  },
  {
    accessorKey: "hourlyRate",
    header: "Rate",
    cell: ({ row }) => {
      const rate = row.getValue("hourlyRate") as string | null;
      return rate ? formatKES(Number(rate)) : "—";
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
            <Link href={`/attorneys/${row.original.id}`}>View</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/attorneys/${row.original.id}/edit`}>Edit</Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];
