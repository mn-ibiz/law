"use client";
// This file runs on the client side for PDF generation

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import { formatCurrency } from "@/lib/utils/format";
import { siteConfig } from "@/lib/config/site";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PDFColumnDef {
  key: string;
  label: string;
  align?: "left" | "center" | "right";
}

export interface PDFReportOptions {
  title: string;
  subtitle?: string;
  dateRange?: { start: string; end: string };
  columns: PDFColumnDef[];
  data: Record<string, unknown>[];
  summary?: { label: string; value: string }[];
  firmName?: string;
  /** Filename used by downloadReportPDF (without .pdf extension). */
  filename?: string;
  /** Currency code for formatting monetary values (default: "KES") */
  currency?: string;
  /** Locale for formatting dates and numbers (default: "en-KE") */
  locale?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const DEFAULT_FIRM_NAME = siteConfig.name;

/** Format the current date/time for the "Generated on" line. */
function generatedTimestamp(locale: string): string {
  return new Date().toLocaleString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Attempt to detect currency-like numbers (contain a decimal point and parse
 * as a finite number) and format them with the org's currency prefix.
 */
function formatCellValue(value: unknown, currency: string, locale: string): string {
  if (value == null) return "";
  const str = String(value);
  // Match values that look like decimal numbers (e.g. 1200.00, 50000.50)
  if (/^-?\d[\d,]*\.\d+$/.test(str.replace(/,/g, ""))) {
    const num = parseFloat(str.replace(/,/g, ""));
    if (Number.isFinite(num)) {
      return formatCurrency(num, currency, locale);
    }
  }
  return str;
}

// ---------------------------------------------------------------------------
// Core generator
// ---------------------------------------------------------------------------

/**
 * Generate a professional PDF report and return it as a Blob.
 */
export function generateReportPDF(options: PDFReportOptions): Blob {
  const {
    title,
    subtitle,
    dateRange,
    columns,
    data,
    summary,
    firmName = DEFAULT_FIRM_NAME,
    currency = "KES",
    locale = "en-KE",
  } = options;

  // A4 landscape for wider reports
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;

  // ---- Header ----
  let cursorY = margin;

  // Firm logo placeholder area
  doc.setFillColor(245, 245, 245);
  doc.roundedRect(margin, cursorY, 30, 12, 1, 1, "F");
  doc.setFontSize(7);
  doc.setTextColor(160, 160, 160);
  doc.text("LOGO", margin + 15, cursorY + 7, { align: "center" });

  // Firm name
  doc.setFontSize(16);
  doc.setTextColor(33, 33, 33);
  doc.setFont("helvetica", "bold");
  doc.text(firmName, margin + 35, cursorY + 5);

  // Generated on (right-aligned)
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(120, 120, 120);
  doc.text(`Generated on: ${generatedTimestamp(locale)}`, pageWidth - margin, cursorY + 5, {
    align: "right",
  });

  cursorY += 16;

  // Divider
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(margin, cursorY, pageWidth - margin, cursorY);
  cursorY += 6;

  // Report title
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(33, 33, 33);
  doc.text(title, margin, cursorY);
  cursorY += 6;

  // Subtitle
  if (subtitle) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    doc.text(subtitle, margin, cursorY);
    cursorY += 5;
  }

  // Date range
  if (dateRange) {
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text(`Period: ${dateRange.start} - ${dateRange.end}`, margin, cursorY);
    cursorY += 5;
  }

  cursorY += 2;

  // ---- Table ----
  const headLabels = columns.map((col) => col.label);
  const bodyRows = data.map((row) =>
    columns.map((col) => formatCellValue(row[col.key], currency, locale))
  );

  // Build column styles for alignment
  const columnStyles: Record<number, { halign: "left" | "center" | "right" }> = {};
  columns.forEach((col, idx) => {
    if (col.align) {
      columnStyles[idx] = { halign: col.align };
    }
  });

  autoTable(doc, {
    startY: cursorY,
    head: [headLabels],
    body: bodyRows,
    margin: { left: margin, right: margin },
    styles: {
      fontSize: 8,
      cellPadding: 3,
      lineColor: [220, 220, 220],
      lineWidth: 0.1,
      textColor: [50, 50, 50],
    },
    headStyles: {
      fillColor: [100, 100, 100],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      halign: "left",
    },
    alternateRowStyles: {
      fillColor: [248, 248, 248],
    },
    columnStyles,
    didDrawPage: () => {
      // Footer with page numbers is added after all pages are drawn
    },
  });

  // ---- Summary section ----
  if (summary && summary.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const finalY: number = (doc as any).lastAutoTable?.finalY ?? cursorY + 10;
    let summaryY = finalY + 8;

    // Check if we need a new page for the summary
    if (summaryY + summary.length * 6 > pageHeight - 20) {
      doc.addPage();
      summaryY = margin;
    }

    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(margin, summaryY, pageWidth - margin, summaryY);
    summaryY += 6;

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(33, 33, 33);
    doc.text("Summary", margin, summaryY);
    summaryY += 6;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);

    for (const item of summary) {
      doc.setTextColor(80, 80, 80);
      doc.text(`${item.label}:`, margin + 2, summaryY);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(33, 33, 33);
      doc.text(item.value, margin + 60, summaryY);
      doc.setFont("helvetica", "normal");
      summaryY += 6;
    }
  }

  // ---- Page numbers footer (all pages) ----
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(150, 150, 150);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 8, {
      align: "center",
    });
  }

  // Return as Blob
  return doc.output("blob");
}

// ---------------------------------------------------------------------------
// Convenience wrappers
// ---------------------------------------------------------------------------

/**
 * Generate a PDF report and trigger a browser download.
 */
export function downloadReportPDF(
  options: PDFReportOptions & { filename?: string }
): void {
  const blob = generateReportPDF(options);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${options.filename ?? "report"}.pdf`;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Generate a PDF report and open it in a new browser tab for preview.
 */
export function previewReportPDF(options: PDFReportOptions): void {
  const blob = generateReportPDF(options);
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank");
}

/**
 * Generate a PDF report and return it as a base64-encoded string.
 * Useful for email attachments or embedding.
 */
export async function getReportPDFBase64(
  options: PDFReportOptions
): Promise<string> {
  const blob = generateReportPDF(options);
  const buffer = await blob.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
