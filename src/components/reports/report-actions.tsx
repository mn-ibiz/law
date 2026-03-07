"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Spinner } from "@/components/ui/spinner";
import { Download, Eye, Mail, MoreVertical, FileDown } from "lucide-react";
import { generateCSV, downloadCSV } from "@/lib/utils/export-csv";
import {
  downloadReportPDF,
  previewReportPDF,
  getReportPDFBase64,
  type PDFReportOptions,
} from "@/lib/utils/generate-pdf";
import { emailReport } from "@/lib/actions/reports";
import { toast } from "sonner";

interface ReportActionsProps {
  title: string;
  subtitle?: string;
  dateRange?: { start: string; end: string };
  columns: { key: string; label: string; align?: "left" | "center" | "right" }[];
  data: Record<string, unknown>[];
  csvColumns: { key: string; label: string }[];
  filename: string;
  summary?: { label: string; value: string }[];
}

export function ReportActions({
  title,
  subtitle,
  dateRange,
  columns,
  data,
  csvColumns,
  filename,
  summary,
}: ReportActionsProps) {
  const [emailOpen, setEmailOpen] = useState(false);
  const [emailTo, setEmailTo] = useState("");
  const [emailSubject, setEmailSubject] = useState(`${title} Report`);
  const [isSending, setIsSending] = useState(false);

  const pdfOptions: PDFReportOptions = {
    title,
    subtitle,
    dateRange,
    columns,
    data,
    summary,
  };

  const handleDownloadPDF = () => {
    downloadReportPDF({ ...pdfOptions, filename });
  };

  const handlePreviewPDF = () => {
    previewReportPDF(pdfOptions);
  };

  const handleDownloadCSV = () => {
    const csv = generateCSV(data, csvColumns);
    downloadCSV(csv, `${filename}.csv`);
  };

  const handleEmail = async () => {
    if (!emailTo || !emailTo.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsSending(true);
    try {
      const base64 = await getReportPDFBase64(pdfOptions);
      const result = await emailReport({
        to: emailTo,
        subject: emailSubject,
        reportTitle: title,
        pdfBase64: base64,
        fileName: `${filename}.pdf`,
      });

      if (result.success) {
        toast.success(`Report sent to ${emailTo}`);
        setEmailOpen(false);
        setEmailTo("");
      } else {
        toast.error(result.error || "Failed to send email");
      }
    } catch {
      toast.error("Failed to send email");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8">
            <MoreVertical className="mr-1.5 h-3.5 w-3.5" />
            Actions
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={handlePreviewPDF}>
            <Eye className="mr-2 h-3.5 w-3.5" />
            Preview PDF
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDownloadPDF}>
            <Download className="mr-2 h-3.5 w-3.5" />
            Download PDF
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDownloadCSV}>
            <FileDown className="mr-2 h-3.5 w-3.5" />
            Download CSV
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setEmailOpen(true)}>
            <Mail className="mr-2 h-3.5 w-3.5" />
            Email Report
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={emailOpen} onOpenChange={setEmailOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Email Report</DialogTitle>
            <DialogDescription>
              Send the &quot;{title}&quot; report as a PDF attachment.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="email-to">Recipient Email</Label>
              <Input
                id="email-to"
                type="email"
                placeholder="name@example.com"
                value={emailTo}
                onChange={(e) => setEmailTo(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email-subject">Subject</Label>
              <Input
                id="email-subject"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEmailOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEmail} disabled={isSending}>
              {isSending && <Spinner className="mr-2 h-4 w-4" />}
              Send Email
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
