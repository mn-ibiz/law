"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { sendInvoice } from "@/lib/actions/billing";
import { getInvoicePDFBase64, type InvoicePDFData } from "@/lib/utils/generate-invoice-pdf";
import { Send, X, Plus, Paperclip, Loader2 } from "lucide-react";

interface SendInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoiceId: string;
  invoiceNumber: string;
  clientName: string;
  clientEmail: string;
  totalAmount: string;
  firmName: string;
  pdfData: InvoicePDFData;
}

export function SendInvoiceDialog({
  open,
  onOpenChange,
  invoiceId,
  invoiceNumber,
  clientName,
  clientEmail,
  totalAmount,
  firmName,
  pdfData,
}: SendInvoiceDialogProps) {
  const router = useRouter();
  const [to, setTo] = useState(clientEmail);
  const [ccInput, setCcInput] = useState("");
  const [ccList, setCcList] = useState<string[]>([]);
  const [subject, setSubject] = useState(`Invoice ${invoiceNumber} from ${firmName}`);
  const [body, setBody] = useState(
    `Dear ${clientName},\n\nPlease find attached invoice ${invoiceNumber} for ${totalAmount}.\n\nPlease ensure payment is made by the due date indicated on the invoice.\n\nThank you for your business.\n\nBest regards,\n${firmName}`
  );
  const [attachPdf, setAttachPdf] = useState(true);
  const [sending, setSending] = useState(false);

  const addCc = useCallback(() => {
    const email = ccInput.trim().toLowerCase();
    if (!email) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Invalid email address");
      return;
    }
    if (ccList.includes(email)) {
      toast.error("Email already added");
      return;
    }
    setCcList((prev) => [...prev, email]);
    setCcInput("");
  }, [ccInput, ccList]);

  const removeCc = (email: string) => {
    setCcList((prev) => prev.filter((e) => e !== email));
  };

  const handleSend = async () => {
    if (!to.trim()) {
      toast.error("Recipient email is required");
      return;
    }

    setSending(true);
    try {
      // Generate PDF if needed
      let pdfBase64: string | undefined;
      if (attachPdf) {
        pdfBase64 = await getInvoicePDFBase64(pdfData);
      }

      // Wrap body in basic HTML
      const htmlBody = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #f8fafc; border-radius: 12px; padding: 32px; border: 1px solid #e2e8f0;">
    ${body
      .split("\n")
      .map((line) =>
        line.trim()
          ? `<p style="color: #475569; line-height: 1.6; margin: 4px 0;">${line}</p>`
          : `<br/>`
      )
      .join("\n")}
  </div>
  <p style="color: #94a3b8; font-size: 12px; margin-top: 16px; text-align: center;">
    Sent via ${firmName}
  </p>
</body>
</html>`.trim();

      const result = await sendInvoice(invoiceId, {
        to: to.trim(),
        cc: ccList,
        subject,
        body: htmlBody,
        pdfBase64,
      });

      if (result && "error" in result && result.error) {
        toast.error(result.error as string);
      } else {
        toast.success("Invoice sent successfully");
        onOpenChange(false);
        router.refresh();
      }
    } catch {
      toast.error("Failed to send invoice");
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Send Invoice {invoiceNumber}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* To */}
          <div className="space-y-1.5">
            <Label htmlFor="email-to">To</Label>
            <Input
              id="email-to"
              type="email"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="recipient@example.com"
            />
          </div>

          {/* CC */}
          <div className="space-y-1.5">
            <Label>CC</Label>
            <div className="flex gap-2">
              <Input
                type="email"
                value={ccInput}
                onChange={(e) => setCcInput(e.target.value)}
                placeholder="Add CC email..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addCc();
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={addCc}
                className="shrink-0"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {ccList.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {ccList.map((email) => (
                  <Badge key={email} variant="secondary" className="gap-1 pr-1">
                    {email}
                    <button
                      type="button"
                      onClick={() => removeCc(email)}
                      className="ml-1 rounded-full hover:bg-muted p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Subject */}
          <div className="space-y-1.5">
            <Label htmlFor="email-subject">Subject</Label>
            <Input
              id="email-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          {/* Body */}
          <div className="space-y-1.5">
            <Label htmlFor="email-body">Message</Label>
            <Textarea
              id="email-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={10}
              className="font-mono text-sm"
            />
          </div>

          {/* Attach PDF */}
          <div className="flex items-center gap-2 rounded-lg border p-3 bg-muted/30">
            <Checkbox
              id="attach-pdf"
              checked={attachPdf}
              onCheckedChange={(v) => setAttachPdf(!!v)}
            />
            <label
              htmlFor="attach-pdf"
              className="flex items-center gap-2 text-sm cursor-pointer"
            >
              <Paperclip className="h-4 w-4 text-muted-foreground" />
              Attach invoice as PDF ({invoiceNumber}.pdf)
            </label>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={sending}
          >
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={sending}>
            {sending ? (
              <>
                <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-1.5" />
                Send Invoice
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
