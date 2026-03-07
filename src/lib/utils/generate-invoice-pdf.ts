"use client";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export interface InvoicePDFData {
  invoiceNumber: string;
  status: string;
  issueDate: string;
  dueDate: string;
  caseNumber?: string;
  caseTitle?: string;
  createdBy: string;
  firmName: string;
  firmEmail?: string;
  firmPhone?: string;
  firmAddress?: string;
  firmWebsite?: string;
  firmTagline?: string;
  firmLogoUrl?: string;
  invoiceFooter?: string;
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  clientAddress?: string[];
  lineItems: {
    description: string;
    quantity: string;
    unitPrice: string;
    amount: string;
  }[];
  subtotal: string;
  vatRate: string;
  vatAmount: string;
  totalAmount: string;
  paidAmount: string;
  balanceDue: string;
  notes?: string;
  currency?: string;
}

/* ── Helpers ── */

const COLORS = {
  dark: [15, 23, 42] as [number, number, number],       // slate-900
  heading: [30, 41, 59] as [number, number, number],     // slate-800
  body: [51, 65, 85] as [number, number, number],        // slate-600
  muted: [100, 116, 139] as [number, number, number],    // slate-500
  light: [148, 163, 184] as [number, number, number],    // slate-400
  veryLight: [226, 232, 240] as [number, number, number],// slate-200
  bg: [248, 250, 252] as [number, number, number],       // slate-50
  white: [255, 255, 255] as [number, number, number],
  accent: [37, 99, 235] as [number, number, number],     // blue-600
  accentLight: [219, 234, 254] as [number, number, number], // blue-100
  green: [22, 163, 74] as [number, number, number],      // green-600
};

function fmtKES(amount: string | number): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (!Number.isFinite(num)) return "KES 0";
  return `KES ${num.toLocaleString("en-KE", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function setColor(doc: jsPDF, color: [number, number, number]) {
  doc.setTextColor(color[0], color[1], color[2]);
}

/* ── Main Generator ── */

export function generateInvoicePDF(data: InvoicePDFData): jsPDF {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pw = doc.internal.pageSize.getWidth();   // 210
  const ph = doc.internal.pageSize.getHeight();   // 297
  const ml = 18;
  const mr = 18;
  const contentWidth = pw - ml - mr;

  let y = 0;

  // ═══════════════════════════════════════════════
  //  HEADER BAND
  // ═══════════════════════════════════════════════

  const headerH = 38;
  doc.setFillColor(...COLORS.dark);
  doc.rect(0, 0, pw, headerH, "F");

  // Accent stripe at bottom of header
  doc.setFillColor(...COLORS.accent);
  doc.rect(0, headerH, pw, 1.2, "F");

  // Firm name (large, white, left)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  setColor(doc, COLORS.white);
  doc.text(data.firmName, ml, 16);

  // Tagline under firm name
  if (data.firmTagline) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(200, 210, 225);
    doc.text(data.firmTagline, ml, 22);
  }

  // Firm contact in header (small, right-aligned)
  let hy = 12;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(180, 195, 215);
  if (data.firmPhone) {
    doc.text(data.firmPhone, pw - mr, hy, { align: "right" });
    hy += 3.5;
  }
  if (data.firmEmail) {
    doc.text(data.firmEmail, pw - mr, hy, { align: "right" });
    hy += 3.5;
  }
  if (data.firmWebsite) {
    doc.text(data.firmWebsite, pw - mr, hy, { align: "right" });
    hy += 3.5;
  }
  if (data.firmAddress) {
    const addrLines = data.firmAddress.split("\n");
    for (const line of addrLines) {
      doc.text(line.trim(), pw - mr, hy, { align: "right" });
      hy += 3.5;
    }
  }

  // ═══════════════════════════════════════════════
  //  INVOICE TITLE + NUMBER
  // ═══════════════════════════════════════════════

  y = headerH + 10;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  setColor(doc, COLORS.heading);
  doc.text("INVOICE", ml, y + 2);

  // Invoice number + status on the right
  doc.setFontSize(11);
  setColor(doc, COLORS.accent);
  doc.text(data.invoiceNumber, pw - mr, y - 2, { align: "right" });

  // Status pill
  if (data.status) {
    const statusText = data.status.replace(/_/g, " ").toUpperCase();
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    const pillW = doc.getTextWidth(statusText) + 8;
    const pillX = pw - mr - pillW;
    const pillY = y + 2;

    const isPaid = data.status === "paid";
    const isOverdue = data.status === "overdue";
    doc.setFillColor(
      ...(isPaid ? COLORS.green : isOverdue ? [220, 38, 38] as [number, number, number] : COLORS.muted)
    );
    doc.roundedRect(pillX, pillY, pillW, 5, 1.5, 1.5, "F");
    setColor(doc, COLORS.white);
    doc.text(statusText, pillX + pillW / 2, pillY + 3.5, { align: "center" });
  }

  y += 14;

  // ═══════════════════════════════════════════════
  //  FROM / BILL TO — TWO COLUMNS
  // ═══════════════════════════════════════════════

  const colLeft = ml;
  const colRight = pw / 2 + 15;
  const colY = y;

  // Section label style
  function sectionLabel(x: number, yPos: number, text: string) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    setColor(doc, COLORS.muted);
    doc.text(text, x, yPos);
    // Underline
    doc.setDrawColor(...COLORS.accent);
    doc.setLineWidth(0.6);
    doc.line(x, yPos + 1.5, x + doc.getTextWidth(text), yPos + 1.5);
  }

  // ── FROM column ──
  sectionLabel(colLeft, colY, "FROM");
  let ly = colY + 7;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  setColor(doc, COLORS.heading);
  doc.text(data.firmName, colLeft, ly);
  ly += 5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  setColor(doc, COLORS.body);
  if (data.firmEmail) { doc.text(data.firmEmail, colLeft, ly); ly += 4; }
  if (data.firmPhone) { doc.text(data.firmPhone, colLeft, ly); ly += 4; }
  if (data.firmAddress) {
    const lines = data.firmAddress.split("\n");
    for (const line of lines) {
      doc.text(line.trim(), colLeft, ly);
      ly += 4;
    }
  }
  if (data.firmWebsite) { doc.text(data.firmWebsite, colLeft, ly); ly += 4; }

  // ── BILL TO column ──
  sectionLabel(colRight, colY, "BILL TO");
  let ry = colY + 7;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  setColor(doc, COLORS.heading);
  doc.text(data.clientName, colRight, ry);
  ry += 5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  setColor(doc, COLORS.body);
  if (data.clientEmail) { doc.text(data.clientEmail, colRight, ry); ry += 4; }
  if (data.clientPhone) { doc.text(data.clientPhone, colRight, ry); ry += 4; }
  if (data.clientAddress) {
    for (const line of data.clientAddress) {
      doc.text(line, colRight, ry);
      ry += 4;
    }
  }

  y = Math.max(ly, ry) + 6;

  // ═══════════════════════════════════════════════
  //  INVOICE META — date cards
  // ═══════════════════════════════════════════════

  const metaH = 16;
  doc.setFillColor(...COLORS.bg);
  doc.roundedRect(ml, y, contentWidth, metaH, 2, 2, "F");

  const metaFields = [
    { label: "ISSUE DATE", value: data.issueDate },
    { label: "DUE DATE", value: data.dueDate },
    { label: "CREATED BY", value: data.createdBy },
  ];
  if (data.caseNumber) {
    metaFields.push({
      label: "MATTER",
      value: `${data.caseNumber}${data.caseTitle ? ` — ${data.caseTitle}` : ""}`,
    });
  }

  const metaCellW = contentWidth / metaFields.length;
  metaFields.forEach((field, i) => {
    const fx = ml + metaCellW * i + 5;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    setColor(doc, COLORS.muted);
    doc.text(field.label, fx, y + 5.5);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    setColor(doc, COLORS.heading);
    const truncVal = doc.splitTextToSize(field.value, metaCellW - 10);
    doc.text(truncVal[0], fx, y + 11);
  });

  y += metaH + 8;

  // ═══════════════════════════════════════════════
  //  LINE ITEMS TABLE
  // ═══════════════════════════════════════════════

  const tableHead = [["Description", "Qty", "Unit Price", "Amount"]];
  const tableBody = data.lineItems.map((item) => [
    item.description,
    parseFloat(item.quantity).toFixed(2),
    fmtKES(item.unitPrice),
    fmtKES(item.amount),
  ]);

  autoTable(doc, {
    startY: y,
    head: tableHead,
    body: tableBody,
    margin: { left: ml, right: mr },
    styles: {
      fontSize: 9,
      cellPadding: { top: 4, bottom: 4, left: 4, right: 4 },
      textColor: COLORS.heading,
      lineColor: COLORS.veryLight,
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: COLORS.dark,
      textColor: COLORS.white,
      fontStyle: "bold",
      fontSize: 7.5,
      cellPadding: { top: 3.5, bottom: 3.5, left: 4, right: 4 },
    },
    columnStyles: {
      0: { cellWidth: contentWidth * 0.48 },
      1: { halign: "center", cellWidth: contentWidth * 0.1 },
      2: { halign: "right", cellWidth: contentWidth * 0.21 },
      3: { halign: "right", cellWidth: contentWidth * 0.21, fontStyle: "bold" },
    },
    alternateRowStyles: {
      fillColor: [250, 251, 253],
    },
    didParseCell(hookData) {
      // Bold the amount column
      if (hookData.section === "body" && hookData.column.index === 3) {
        hookData.cell.styles.fontStyle = "bold";
      }
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  y = (doc as any).lastAutoTable?.finalY ?? y + 20;
  y += 6;

  // ═══════════════════════════════════════════════
  //  TOTALS
  // ═══════════════════════════════════════════════

  const totalsBoxW = 82;
  const totalsBoxX = pw - mr - totalsBoxW;

  // Background box for totals
  const totalsLines = [
    { label: "Subtotal", value: fmtKES(data.subtotal), bold: false },
    { label: `VAT (${data.vatRate}%)`, value: fmtKES(data.vatAmount), bold: false },
  ];
  const paid = parseFloat(data.paidAmount);
  const totalLineCount = totalsLines.length + (paid > 0 ? 2 : 1) + 1; // +1 for total, +1 for balance
  const totalsBoxH = totalLineCount * 7 + 14;

  doc.setFillColor(...COLORS.bg);
  doc.roundedRect(totalsBoxX, y - 2, totalsBoxW, totalsBoxH, 2, 2, "F");

  let ty = y + 3;
  const tLabelX = totalsBoxX + 5;
  const tValueX = totalsBoxX + totalsBoxW - 5;

  // Subtotal & VAT
  for (const row of totalsLines) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    setColor(doc, COLORS.muted);
    doc.text(row.label, tLabelX, ty);
    setColor(doc, COLORS.heading);
    doc.text(row.value, tValueX, ty, { align: "right" });
    ty += 6.5;
  }

  // Separator
  doc.setDrawColor(...COLORS.veryLight);
  doc.setLineWidth(0.3);
  doc.line(tLabelX, ty - 2, tValueX, ty - 2);

  // Total
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  setColor(doc, COLORS.muted);
  doc.text("Total", tLabelX, ty + 2);
  setColor(doc, COLORS.heading);
  doc.text(fmtKES(data.totalAmount), tValueX, ty + 2, { align: "right" });
  ty += 7;

  // Paid
  if (paid > 0) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    setColor(doc, COLORS.green);
    doc.text("Paid", tLabelX, ty);
    doc.text(`-${fmtKES(data.paidAmount)}`, tValueX, ty, { align: "right" });
    ty += 7;
  }

  // Double separator for Amount Due
  doc.setDrawColor(...COLORS.dark);
  doc.setLineWidth(0.6);
  doc.line(tLabelX, ty - 2, tValueX, ty - 2);

  // Amount Due (large)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  setColor(doc, COLORS.dark);
  doc.text("AMOUNT DUE", tLabelX, ty + 4);
  doc.setFontSize(13);
  setColor(doc, COLORS.accent);
  doc.text(fmtKES(data.balanceDue), tValueX, ty + 4, { align: "right" });

  y += totalsBoxH + 6;

  // ═══════════════════════════════════════════════
  //  NOTES
  // ═══════════════════════════════════════════════

  if (data.notes) {
    if (y > ph - 50) { doc.addPage(); y = 20; }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    setColor(doc, COLORS.muted);
    doc.text("NOTES", ml, y);
    y += 4;

    doc.setDrawColor(...COLORS.accent);
    doc.setLineWidth(0.4);
    doc.line(ml, y, ml, y + 14);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    setColor(doc, COLORS.body);
    const noteLines = doc.splitTextToSize(data.notes, contentWidth - 6);
    doc.text(noteLines, ml + 3, y + 3);
    y += noteLines.length * 3.5 + 8;
  }

  // ═══════════════════════════════════════════════
  //  INVOICE FOOTER TEXT
  // ═══════════════════════════════════════════════

  if (data.invoiceFooter) {
    if (y > ph - 40) { doc.addPage(); y = 20; }

    doc.setDrawColor(...COLORS.veryLight);
    doc.setLineWidth(0.3);
    doc.line(ml, y, pw - mr, y);
    y += 5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    setColor(doc, COLORS.light);
    const footerLines = doc.splitTextToSize(data.invoiceFooter, contentWidth);
    doc.text(footerLines, ml, y);
  }

  // ═══════════════════════════════════════════════
  //  PAGE FOOTER
  // ═══════════════════════════════════════════════

  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    // Bottom accent line
    doc.setFillColor(...COLORS.accent);
    doc.rect(0, ph - 8, pw, 1, "F");

    // Footer text
    doc.setFontSize(6.5);
    doc.setFont("helvetica", "normal");
    setColor(doc, COLORS.light);

    const footerParts = [data.firmName];
    if (data.firmPhone) footerParts.push(data.firmPhone);
    if (data.firmEmail) footerParts.push(data.firmEmail);

    doc.text(
      footerParts.join("  |  "),
      ml,
      ph - 4,
    );

    doc.text(
      `Page ${i} of ${totalPages}`,
      pw - mr,
      ph - 4,
      { align: "right" }
    );
  }

  return doc;
}

export function downloadInvoicePDF(data: InvoicePDFData): void {
  const doc = generateInvoicePDF(data);
  doc.save(`${data.invoiceNumber}.pdf`);
}

export async function getInvoicePDFBase64(data: InvoicePDFData): Promise<string> {
  const doc = generateInvoicePDF(data);
  const blob = doc.output("blob");
  const buffer = await blob.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
