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

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  open: "outline",
  in_progress: "default",
  hearing: "default",
  resolved: "secondary",
  closed: "secondary",
  archived: "secondary",
};

const priorityVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  low: "secondary",
  medium: "outline",
  high: "default",
  urgent: "destructive",
};

export const caseColumns: ColumnDef<CaseRow>[] = [
  {
    accessorKey: "caseNumber",
    header: "Case #",
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
    header: "Title",
    cell: ({ row }) => (
      <span className="max-w-[200px] truncate block">{row.getValue("title")}</span>
    ),
  },
  {
    accessorKey: "clientName",
    header: "Client",
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
    header: "Type",
    cell: ({ row }) => (
      <span className="capitalize">{(row.getValue("caseType") as string).replace("_", " ")}</span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <Badge variant={statusVariant[status] ?? "secondary"}>
          {status.replace("_", " ")}
        </Badge>
      );
    },
  },
  {
    accessorKey: "priority",
    header: "Priority",
    cell: ({ row }) => {
      const priority = row.getValue("priority") as string;
      return (
        <Badge variant={priorityVariant[priority] ?? "secondary"}>
          {priority}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
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
