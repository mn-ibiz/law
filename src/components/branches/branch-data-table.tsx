"use client";

import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface BranchRow {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  county: string | null;
  phone: string | null;
  email: string | null;
  isMain: boolean;
  isActive: boolean;
}

interface BranchDataTableProps {
  data: BranchRow[];
}

export function BranchDataTable({ data }: BranchDataTableProps) {
  const router = useRouter();

  if (data.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No branches configured.</p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Location</TableHead>
          <TableHead>Contact</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((branch) => (
          <TableRow
            key={branch.id}
            className="cursor-pointer"
            onClick={() => router.push(`/settings/branches/${branch.id}`)}
          >
            <TableCell className="font-medium">{branch.name}</TableCell>
            <TableCell>
              <div className="text-sm">
                {branch.address && <p>{branch.address}</p>}
                <p className="text-muted-foreground">
                  {[branch.city, branch.county].filter(Boolean).join(", ") ||
                    "—"}
                </p>
              </div>
            </TableCell>
            <TableCell>
              <div className="text-sm">
                {branch.phone && <p>{branch.phone}</p>}
                {branch.email && (
                  <p className="text-muted-foreground">{branch.email}</p>
                )}
                {!branch.phone && !branch.email && "—"}
              </div>
            </TableCell>
            <TableCell>
              {branch.isMain ? (
                <Badge>Head Office</Badge>
              ) : (
                <Badge variant="outline">Branch</Badge>
              )}
            </TableCell>
            <TableCell>
              <Badge variant={branch.isActive ? "default" : "secondary"}>
                {branch.isActive ? "Active" : "Inactive"}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
