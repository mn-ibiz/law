"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Send, Pencil, Download } from "lucide-react";
import Link from "next/link";
import { SendInvoiceDialog } from "./send-invoice-dialog";
import { downloadInvoicePDF, type InvoicePDFData } from "@/lib/utils/generate-invoice-pdf";

interface InvoiceActionsProps {
  invoiceId: string;
  status: string;
  invoiceNumber: string;
  clientName: string;
  clientEmail: string;
  totalAmount: string;
  firmName: string;
  pdfData: InvoicePDFData;
}

export function InvoiceActions({
  invoiceId,
  status,
  invoiceNumber,
  clientName,
  clientEmail,
  totalAmount,
  firmName,
  pdfData,
}: InvoiceActionsProps) {
  const [showSend, setShowSend] = useState(false);

  const handleDownloadPdf = () => {
    try {
      downloadInvoicePDF(pdfData);
      toast.success("PDF downloaded");
    } catch {
      toast.error("Failed to generate PDF");
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Edit - always available */}
      <Button size="sm" variant="outline" asChild>
        <Link href={`/billing/${invoiceId}/edit`}>
          <Pencil className="h-3.5 w-3.5 mr-1.5" />
          Edit
        </Link>
      </Button>

      {/* Download PDF - always available */}
      <Button size="sm" variant="outline" onClick={handleDownloadPdf}>
        <Download className="h-3.5 w-3.5 mr-1.5" />
        Download PDF
      </Button>

      {/* Send - always available for sending/resending */}
      <Button size="sm" onClick={() => setShowSend(true)}>
        <Send className="h-3.5 w-3.5 mr-1.5" />
        {status === "sent" || status === "viewed" ? "Resend" : "Send"}
      </Button>

      {/* Send Invoice Dialog */}
      <SendInvoiceDialog
        open={showSend}
        onOpenChange={setShowSend}
        invoiceId={invoiceId}
        invoiceNumber={invoiceNumber}
        clientName={clientName}
        clientEmail={clientEmail}
        totalAmount={totalAmount}
        firmName={firmName}
        pdfData={pdfData}
      />

    </div>
  );
}
