/**
 * Generate a CSV string from an array of objects.
 * Handles quoting fields that contain commas, quotes, or newlines.
 */
export function generateCSV<T extends Record<string, unknown>>(
  data: T[],
  columns: { key: keyof T; label: string }[]
): string {
  const escapeField = (value: unknown): string => {
    let str = value == null ? "" : String(value);
    // Prevent CSV formula injection — prefix formula-triggering characters
    if (str.length > 0 && /^[=+\-@|^]/.test(str)) {
      str = `'${str}`;
    }
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const header = columns.map((col) => escapeField(col.label)).join(",");
  const rows = data.map((row) =>
    columns.map((col) => escapeField(row[col.key])).join(",")
  );

  return [header, ...rows].join("\n");
}

/** Trigger a CSV file download in the browser */
export function downloadCSV(csv: string, filename: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
