"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteServiceOfDocument } from "@/lib/actions/courts";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2, ExternalLink } from "lucide-react";

interface ServiceRecord {
  id: string;
  caseId: string;
  documentTitle: string;
  servedTo: string;
  method: string;
  serviceDate: Date | null;
  proofOfServiceUrl: string | null;
  notes: string | null;
}

interface ServiceRowActionsProps {
  record: ServiceRecord;
  cases: { id: string; caseNumber: string; title: string }[];
  onEdit: (record: ServiceRecord) => void;
}

export function ServiceRowActions({ record, onEdit }: ServiceRowActionsProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this service record?")) return;
    setLoading(true);
    try {
      const result = await deleteServiceOfDocument(record.id);
      if (result?.error) {
        toast.error(result.error as string);
      } else {
        toast.success("Service record deleted");
        router.refresh();
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8" disabled={loading} aria-label="Actions">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {record.proofOfServiceUrl && (
          <DropdownMenuItem asChild>
            <a href={record.proofOfServiceUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-3.5 w-3.5" />
              View Proof
            </a>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={() => onEdit(record)}>
          <Pencil className="mr-2 h-3.5 w-3.5" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive">
          <Trash2 className="mr-2 h-3.5 w-3.5" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
