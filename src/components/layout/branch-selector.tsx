"use client";

import { useEffect, useState } from "react";
import { Building2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Branch {
  id: string;
  name: string;
  isMain: boolean;
}

export function BranchSelector() {
  const [branches, setBranches] = useState<Branch[]>([
    { id: "main", name: "Main Office", isMain: true },
  ]);
  const [selected, setSelected] = useState("main");

  useEffect(() => {
    fetch("/api/branches")
      .then((res) => {
        if (res.ok) return res.json();
        return null;
      })
      .then((data) => {
        if (data && Array.isArray(data) && data.length > 0) {
          setBranches(data);
          const main = data.find((b: Branch) => b.isMain);
          if (main) setSelected(main.id);
        }
      })
      .catch(() => {
        // Keep default branches on error
      });
  }, []);

  return (
    <Select value={selected} onValueChange={setSelected}>
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
