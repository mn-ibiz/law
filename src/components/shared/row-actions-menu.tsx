"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Eye, Pencil, Trash2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface RowAction {
  label: string;
  icon?: LucideIcon;
  onClick: () => void;
  destructive?: boolean;
  disabled?: boolean;
  separator?: boolean;
}

interface RowActionsMenuProps {
  actions: RowAction[];
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function RowActionsMenu({ actions, onView, onEdit, onDelete }: RowActionsMenuProps) {
  const allActions: RowAction[] = [];

  if (onView) allActions.push({ label: "View", icon: Eye, onClick: onView });
  if (onEdit) allActions.push({ label: "Edit", icon: Pencil, onClick: onEdit });

  allActions.push(...actions);

  if (onDelete) {
    allActions.push({ label: "Delete", icon: Trash2, onClick: onDelete, destructive: true, separator: true });
  }

  if (allActions.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {allActions.map((action, i) => {
          const Icon = action.icon;
          return (
            <span key={i}>
              {action.separator && <DropdownMenuSeparator />}
              <DropdownMenuItem
                onClick={action.onClick}
                disabled={action.disabled}
                className={action.destructive ? "text-destructive focus:text-destructive" : ""}
              >
                {Icon && <Icon className="mr-2 h-3.5 w-3.5" />}
                {action.label}
              </DropdownMenuItem>
            </span>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
