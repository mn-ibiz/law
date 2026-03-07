"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteSupplierInvoice, paySupplierInvoice } from "@/lib/actions/suppliers";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Trash2, CheckCircle, ExternalLink } from "lucide-react";

interface SupplierInvoiceActionsProps {
  invoiceId: string;
  status: string;
  fileUrl: string | null;
}

export function SupplierInvoiceActions({ invoiceId, status, fileUrl }: SupplierInvoiceActionsProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this invoice?")) return;
    setLoading(true);
    try {
      const result = await deleteSupplierInvoice(invoiceId);
      if (result?.error) {
        toast.error(result.error as string);
      } else {
        toast.success("Invoice deleted");
        router.refresh();
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  async function handlePay() {
    if (!confirm("Mark this invoice as paid?")) return;
    setLoading(true);
    try {
      const result = await paySupplierInvoice(invoiceId);
      if (result?.error) {
        toast.error(result.error as string);
      } else {
        toast.success("Invoice marked as paid");
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
        {fileUrl && (
          <DropdownMenuItem asChild>
            <a href={fileUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-3.5 w-3.5" />
              View File
            </a>
          </DropdownMenuItem>
        )}
        {status !== "paid" && (
          <DropdownMenuItem onClick={handlePay}>
            <CheckCircle className="mr-2 h-3.5 w-3.5" />
            Mark as Paid
          </DropdownMenuItem>
        )}
        {status !== "paid" && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive">
              <Trash2 className="mr-2 h-3.5 w-3.5" />
              Delete
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
