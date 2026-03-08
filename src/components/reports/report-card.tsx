"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ReportActions } from "./report-actions";
import { formatCurrency } from "@/lib/utils/format";
import { formatEnum } from "@/lib/utils/format-enum";
import { useOrgConfig } from "@/components/providers/tenant-config-provider";
interface ReportColumn {
  key: string;
  label: string;
  align?: "left" | "center" | "right";
  format?: "currency" | "number" | "percent" | "enum" | "date";
}

interface ReportCardProps {
  title: string;
  description?: string;
  iconNode: React.ReactNode;
  iconColor: string;
  columns: ReportColumn[];
  data: Record<string, unknown>[];
  filename: string;
  dateRange?: { start: string; end: string };
  summary?: { label: string; value: string }[];
  emptyMessage?: string;
}

export function ReportCard({
  title,
  description,
  iconNode,
  iconColor,
  columns,
  data,
  filename,
  dateRange,
  summary,
  emptyMessage = "No data available for this period.",
}: ReportCardProps) {
  const { currency, locale } = useOrgConfig();

  function formatValue(value: unknown, format?: ReportColumn["format"]): string {
    if (value == null) return "\u2014";
    switch (format) {
      case "currency":
        return formatCurrency(Number(value), currency, locale);
      case "number":
        return Number(value).toFixed(2);
      case "percent":
        return `${Number(value).toFixed(1)}%`;
      case "enum":
        return formatEnum(String(value));
      case "date":
        return value instanceof Date
          ? value.toLocaleDateString(locale)
          : String(value);
      default:
        return String(value);
    }
  }

  const csvColumns = columns.map((c) => ({ key: c.key, label: c.label }));
  const pdfColumns = columns.map((c) => ({
    key: c.key,
    label: c.label,
    align: c.align,
  }));

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${iconColor}`}>
              {iconNode}
            </div>
            <div>
              <CardTitle className="text-base font-semibold">{title}</CardTitle>
              {description && (
                <CardDescription className="text-xs">{description}</CardDescription>
              )}
            </div>
          </div>
          <ReportActions
            title={title}
            subtitle={description}
            dateRange={dateRange}
            columns={pdfColumns}
            data={data}
            csvColumns={csvColumns}
            filename={filename}
            summary={summary}
          />
        </div>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">
            {emptyMessage}
          </p>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((col) => (
                    <TableHead
                      key={col.key}
                      className={`text-xs font-medium uppercase tracking-wide text-muted-foreground ${
                        col.align === "right" ? "text-right" : ""
                      }`}
                    >
                      {col.label}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row, i) => (
                  <TableRow key={i} className="transition-colors hover:bg-muted/50">
                    {columns.map((col) => (
                      <TableCell
                        key={col.key}
                        className={col.align === "right" ? "text-right" : ""}
                      >
                        {formatValue(row[col.key], col.format)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {summary && summary.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-4 border-t pt-4">
                {summary.map((s) => (
                  <div key={s.label} className="text-sm">
                    <span className="text-muted-foreground">{s.label}: </span>
                    <span className="font-semibold">{s.value}</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
