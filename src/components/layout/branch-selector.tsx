"use client";

import { Building2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Placeholder until branch data is fetched from the API
const branches = [
  { id: "main", name: "Main Office" },
];

export function BranchSelector() {
  return (
    <Select defaultValue="main">
      <SelectTrigger className="h-8 text-xs">
        <Building2 className="mr-1.5 h-3.5 w-3.5" />
        <SelectValue placeholder="Select branch" />
      </SelectTrigger>
      <SelectContent>
        {branches.map((branch) => (
          <SelectItem key={branch.id} value={branch.id}>
            {branch.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
