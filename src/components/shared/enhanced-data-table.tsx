"use client";

import { useState, useMemo, useCallback } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type VisibilityState,
  type RowSelectionState,
} from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/shared/empty-state";
import { generateCSV, downloadCSV } from "@/lib/utils/export-csv";
import type { LucideIcon } from "lucide-react";
import {
  Search,
  X,
  Download,
  Columns3,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  FileText,
} from "lucide-react";

// ---------- Types ----------

export interface FilterOption {
  value: string;
  label: string;
}

export interface DataTableFilterConfig {
  id: string;
  label: string;
  options: FilterOption[];
}

export interface ExportColumn {
  key: string;
  label: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface EnhancedDataTableProps<TData extends Record<string, any>> {
  data: TData[];
  columns: ColumnDef<TData, unknown>[];
  searchPlaceholder?: string;
  filters?: DataTableFilterConfig[];
  exportFilename?: string;
  exportColumns?: ExportColumn[];
  onRowClick?: (row: TData) => void;
  emptyIcon?: LucideIcon;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyActionLabel?: string;
  emptyActionHref?: string;
  enableSelection?: boolean;
  defaultPageSize?: number;
}

// ---------- Sortable Header Helper ----------

export function SortableHeader({
  column,
  children,
}: {
  column: { getIsSorted: () => false | "asc" | "desc"; toggleSorting: (desc?: boolean) => void };
  children: React.ReactNode;
}) {
  const sorted = column.getIsSorted();
  return (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-3 h-8 text-xs font-medium uppercase tracking-wide text-muted-foreground hover:text-foreground"
      onClick={() => column.toggleSorting(sorted === "asc")}
    >
      {children}
      {sorted === "asc" ? (
        <ArrowUp className="ml-1 h-3.5 w-3.5" />
      ) : sorted === "desc" ? (
        <ArrowDown className="ml-1 h-3.5 w-3.5" />
      ) : (
        <ArrowUpDown className="ml-1 h-3.5 w-3.5 opacity-50" />
      )}
    </Button>
  );
}

// ---------- Main Component ----------

const ALL_VALUE = "__all__";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function EnhancedDataTable<TData extends Record<string, any>>({
  data,
  columns,
  searchPlaceholder = "Search...",
  filters = [],
  exportFilename,
  exportColumns,
  onRowClick,
  emptyIcon,
  emptyTitle = "No results found",
  emptyDescription = "Try adjusting your search or filters.",
  emptyActionLabel,
  emptyActionHref,
  enableSelection = false,
  defaultPageSize = 10,
}: EnhancedDataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  // Prepend selection column if enabled
  const allColumns = useMemo(() => {
    if (!enableSelection) return columns;
    const selectionCol: ColumnDef<TData, unknown> = {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="translate-y-[2px]"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="translate-y-[2px]"
          onClick={(e) => e.stopPropagation()}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    };
    return [selectionCol, ...columns];
  }, [columns, enableSelection]);

  const table = useReactTable({
    data,
    columns: allColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: { sorting, globalFilter, columnFilters, columnVisibility, rowSelection },
    initialState: { pagination: { pageSize: defaultPageSize } },
  });

  const hasFilters = globalFilter || columnFilters.length > 0;
  const filteredCount = table.getFilteredRowModel().rows.length;
  const totalCount = data.length;
  const pageIndex = table.getState().pagination.pageIndex;
  const pageSize = table.getState().pagination.pageSize;
  const pageCount = table.getPageCount();
  const startRow = pageIndex * pageSize + 1;
  const endRow = Math.min((pageIndex + 1) * pageSize, filteredCount);

  const clearFilters = useCallback(() => {
    setGlobalFilter("");
    setColumnFilters([]);
  }, []);

  const handleExport = useCallback(() => {
    if (!exportColumns || !exportFilename) return;
    const rows = table.getFilteredRowModel().rows.map((r) => r.original);
    const csv = generateCSV(rows, exportColumns);
    downloadCSV(csv, exportFilename);
  }, [table, exportColumns, exportFilename]);

  const hidableColumns = table
    .getAllColumns()
    .filter((col) => col.getCanHide() && col.id !== "select" && col.id !== "actions");

  return (
    <div className="space-y-4">
      {/* ─── Toolbar ─── */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          {/* Search */}
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-9 h-9"
            />
          </div>

          {/* Filters */}
          {filters.map((filter) => {
            const currentValue = columnFilters.find((f) => f.id === filter.id)?.value as
              | string
              | undefined;
            return (
              <Select
                key={filter.id}
                value={currentValue ?? ALL_VALUE}
                onValueChange={(val) => {
                  setColumnFilters((prev) => {
                    const next = prev.filter((f) => f.id !== filter.id);
                    if (val !== ALL_VALUE) next.push({ id: filter.id, value: val });
                    return next;
                  });
                }}
              >
                <SelectTrigger className="w-[160px] h-9">
                  <SelectValue placeholder={filter.label} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_VALUE}>{filter.label}</SelectItem>
                  {filter.options.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            );
          })}

          {hasFilters && (
            <Button variant="ghost" size="sm" className="h-9 px-2" onClick={clearFilters}>
              <X className="mr-1 h-3.5 w-3.5" />
              Clear
            </Button>
          )}
        </div>

        {/* Right toolbar actions */}
        <div className="flex items-center gap-2">
          {/* Column visibility */}
          {hidableColumns.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9">
                  <Columns3 className="mr-1.5 h-3.5 w-3.5" />
                  Columns
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {hidableColumns.map((col) => (
                  <DropdownMenuCheckboxItem
                    key={col.id}
                    checked={col.getIsVisible()}
                    onCheckedChange={(val) => col.toggleVisibility(!!val)}
                    className="capitalize"
                  >
                    {typeof col.columnDef.header === "string"
                      ? col.columnDef.header
                      : col.id.replace(/([A-Z])/g, " $1").trim()}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Export */}
          {exportColumns && exportFilename && (
            <Button
              variant="outline"
              size="sm"
              className="h-9"
              onClick={handleExport}
              disabled={filteredCount === 0}
            >
              <Download className="mr-1.5 h-3.5 w-3.5" />
              Export CSV
            </Button>
          )}
        </div>
      </div>

      {/* ─── Table ─── */}
      <Card className="shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-muted/40 hover:bg-muted/40 border-b">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="h-10 text-xs font-medium uppercase tracking-wide text-muted-foreground"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={
                    onRowClick
                      ? "cursor-pointer transition-colors hover:bg-muted/50"
                      : "transition-colors hover:bg-muted/50"
                  }
                  onClick={(e) => {
                    if (!onRowClick) return;
                    if ((e.target as HTMLElement).closest("a, button, [role=checkbox]")) return;
                    onRowClick(row.original);
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={allColumns.length} className="h-48">
                  {hasFilters ? (
                    <EmptyState
                      icon={Search}
                      title="No matching results"
                      description="Try adjusting your search or filter criteria."
                    />
                  ) : (
                    <EmptyState
                      icon={emptyIcon ?? FileText}
                      title={emptyTitle}
                      description={emptyDescription}
                      actionLabel={emptyActionLabel}
                      actionHref={emptyActionHref}
                    />
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* ─── Footer: Info + Pagination ─── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Left: row count + rows per page */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {enableSelection && Object.keys(rowSelection).length > 0 ? (
            <span>
              {Object.keys(rowSelection).length} of {filteredCount} row(s) selected
            </span>
          ) : (
            <span>
              Showing {filteredCount > 0 ? startRow : 0} to {endRow} of {filteredCount}
              {hasFilters && totalCount !== filteredCount && ` (filtered from ${totalCount})`}
            </span>
          )}
          <div className="flex items-center gap-2">
            <span className="whitespace-nowrap">Rows per page:</span>
            <Select
              value={String(pageSize)}
              onValueChange={(val) => table.setPageSize(Number(val))}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[10, 20, 30, 50, 100].map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Right: pagination controls */}
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          {pageCount > 0 && (
            <div className="flex items-center gap-1 px-2">
              {Array.from({ length: Math.min(pageCount, 5) }, (_, i) => {
                let pageNum: number;
                if (pageCount <= 5) {
                  pageNum = i;
                } else if (pageIndex < 3) {
                  pageNum = i;
                } else if (pageIndex > pageCount - 4) {
                  pageNum = pageCount - 5 + i;
                } else {
                  pageNum = pageIndex - 2 + i;
                }
                return (
                  <Button
                    key={pageNum}
                    variant={pageNum === pageIndex ? "default" : "outline"}
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => table.setPageIndex(pageNum)}
                  >
                    {pageNum + 1}
                  </Button>
                );
              })}
            </div>
          )}
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => table.setPageIndex(pageCount - 1)}
            disabled={!table.getCanNextPage()}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
