"use client";

import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { SortableHeader } from "@/components/shared/enhanced-data-table";
import { TaskStatusBadge, PriorityBadge } from "@/components/shared/status-badges";
import { PersonAvatar } from "@/components/shared/person-avatar";


export interface DeadlineRow {
  id: string;
  title: string;
  description: string | null;
  dueDate: Date;
  priority: string;
  isStatutory: boolean;
  completedAt: Date | null;
  caseId: string | null;
  caseNumber: string | null;
  assignedToName: string | null;
  assignedToAvatar: string | null;
}

export function getDeadlineColumns(locale: string): ColumnDef<DeadlineRow>[] {
  return [
  {
    accessorKey: "title",
    header: ({ column }) => <SortableHeader column={column}>Title</SortableHeader>,
    cell: ({ row }) => (
      <div>
        <span className="font-medium">{row.getValue("title")}</span>
        {row.original.isStatutory && (
          <span className="ml-2 inline-flex items-center rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-semibold leading-none text-rose-700 ring-1 ring-inset ring-rose-600/20">
            Statutory
          </span>
        )}
      </div>
    ),
  },
  {
    accessorKey: "caseNumber",
    header: "Case",
    cell: ({ row }) =>
      row.original.caseId ? (
        <Link
          href={`/cases/${row.original.caseId}`}
          className="text-primary hover:underline font-mono text-xs"
        >
          {row.original.caseNumber}
        </Link>
      ) : (
        <span className="text-muted-foreground">{"\u2014"}</span>
      ),
  },
  {
    accessorKey: "assignedToName",
    header: "Assigned To",
    cell: ({ row }) => {
      const name = row.getValue("assignedToName") as string | null;
      return name ? (
        <div className="flex items-center gap-2">
          <PersonAvatar name={name} imageUrl={row.original.assignedToAvatar} size="sm" />
          <span className="text-sm">{name}</span>
        </div>
      ) : (
        <span className="text-sm text-muted-foreground">Unassigned</span>
      );
    },
  },
  {
    accessorKey: "priority",
    header: "Priority",
    cell: ({ row }) => <PriorityBadge priority={row.getValue("priority")} />,
    filterFn: (row, id, filterValue) => {
      return String(row.getValue(id)) === filterValue;
    },
  },
  {
    accessorKey: "dueDate",
    header: ({ column }) => <SortableHeader column={column}>Due Date</SortableHeader>,
    cell: ({ row }) => {
      const dueDate = new Date(row.original.dueDate);
      const isOverdue = !row.original.completedAt && dueDate < new Date();
      return (
        <span className={isOverdue ? "text-destructive font-medium" : "text-sm"}>
          {dueDate.toLocaleDateString(locale)}
        </span>
      );
    },
  },
  {
    accessorKey: "completedAt",
    header: "Status",
    cell: ({ row }) => {
      const isOverdue =
        !row.original.completedAt && new Date(row.original.dueDate) < new Date();
      if (row.original.completedAt) return <TaskStatusBadge status="completed" />;
      if (isOverdue) return <TaskStatusBadge status="overdue" />;
      return <TaskStatusBadge status="pending" />;
    },
    filterFn: (row, _id, filterValue) => {
      const isOverdue =
        !row.original.completedAt && new Date(row.original.dueDate) < new Date();
      if (filterValue === "completed") return !!row.original.completedAt;
      if (filterValue === "overdue") return isOverdue;
      if (filterValue === "pending") return !row.original.completedAt && !isOverdue;
      return true;
    },
  },
];
}
