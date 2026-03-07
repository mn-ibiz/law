"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { generateCSV, downloadCSV } from "@/lib/utils/export-csv";

interface ExportReportButtonProps {
  data: Record<string, unknown>[];
  columns: { key: string; label: string }[];
  filename: string;
}

export function ExportReportButton({
  data,
  columns,
  filename,
}: ExportReportButtonProps) {
  const handleExport = () => {
    if (data.length === 0) return;
    const csv = generateCSV(data, columns);
    downloadCSV(csv, filename);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className="h-8"
      onClick={handleExport}
      disabled={data.length === 0}
    >
      <Download className="mr-1.5 h-3.5 w-3.5" />
      Export CSV
    </Button>
  );
}
