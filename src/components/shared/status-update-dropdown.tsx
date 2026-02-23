"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { formatEnum } from "@/lib/utils/format-enum";

interface StatusOption {
  value: string;
  label?: string;
  disabled?: boolean;
}

interface StatusUpdateDropdownProps {
  currentStatus: string;
  options: StatusOption[];
  onSelect: (status: string) => void;
  isPending?: boolean;
  label?: string;
  trigger?: React.ReactNode;
}

export function StatusUpdateDropdown({
  currentStatus,
  options,
  onSelect,
  isPending,
  label = "Update status",
  trigger,
}: StatusUpdateDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {trigger ?? (
          <Button variant="outline" size="sm" disabled={isPending}>
            {formatEnum(currentStatus)}
            <ChevronDown className="ml-1.5 h-3.5 w-3.5" />
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{label}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {options.map((opt) => (
          <DropdownMenuItem
            key={opt.value}
            disabled={opt.value === currentStatus || opt.disabled || isPending}
            onClick={() => onSelect(opt.value)}
          >
            {opt.label ?? formatEnum(opt.value)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
