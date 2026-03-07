"use client";

import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { SortableHeader } from "@/components/shared/enhanced-data-table";
import { ActiveBadge } from "@/components/shared/status-badges";
import { formatEnum } from "@/lib/utils/format-enum";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, Pencil, Building2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export interface SupplierRow {
  id: string;
  name: string;
  contactPerson: string | null;
  email: string | null;
  phone: string | null;
  category: string | null;
  kraPin: string | null;
  logoUrl: string | null;
  isActive: boolean;
  createdAt: Date;
}

export const supplierColumns: ColumnDef<SupplierRow>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => <SortableHeader column={column}>Name</SortableHeader>,
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <Avatar className="h-8 w-8">
          {row.original.logoUrl && (
            <AvatarImage src={row.original.logoUrl} alt={row.getValue("name")} />
          )}
          <AvatarFallback className="bg-primary/10 text-primary text-xs">
            <Building2 className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
        <Link
          href={`/suppliers/${row.original.id}`}
          className="font-medium text-foreground hover:text-primary hover:underline"
        >
          {row.getValue("name")}
        </Link>
      </div>
    ),
  },
  {
    accessorKey: "contactPerson",
    header: "Contact Person",
    cell: ({ row }) => (
      <span className="text-sm">{row.getValue("contactPerson") ?? "\u2014"}</span>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => (
      <span className="text-sm">{row.getValue("email") ?? "\u2014"}</span>
    ),
  },
  {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ row }) => (
      <span className="text-sm">{row.getValue("phone") ?? "\u2014"}</span>
    ),
  },
  {
    accessorKey: "category",
    header: ({ column }) => <SortableHeader column={column}>Category</SortableHeader>,
    cell: ({ row }) => {
      const val = row.getValue("category") as string | null;
      return <span className="text-sm">{val ? formatEnum(val) : "\u2014"}</span>;
    },
    filterFn: (row, id, filterValue) => {
      return String(row.getValue(id)) === filterValue;
    },
  },
  {
    accessorKey: "kraPin",
    header: "KRA PIN",
    cell: ({ row }) => (
      <span className="font-mono text-xs">{row.getValue("kraPin") ?? "\u2014"}</span>
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
            <Link href={`/suppliers/${row.original.id}`}>
              <Eye className="mr-2 h-3.5 w-3.5" />
              View
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href={`/suppliers/${row.original.id}/edit`}>
              <Pencil className="mr-2 h-3.5 w-3.5" />
              Edit
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];
