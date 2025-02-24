"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  type SortingState,
  type ColumnFiltersState,
  getFilteredRowModel,
  ColumnDef,
  RowData,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Toaster } from "@/components/ui/toaster";
import { toast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { useQueryClient } from "@tanstack/react-query";

declare module "@tanstack/table-core" {
  interface TableMeta<TData extends RowData> {
    updateData: (rowIndex: number, columnId: string, value: string) => void;
  }
}

interface EditableDataTableProps<TData> {
  initialData: TData[];
  columns: ColumnDef<TData>[];
  onRowUpdate: (
    rowIndex: number,
    columnId: string,
    value: string
  ) => Promise<void>;
  onRowDelete: (rowIndex: number) => Promise<void>;
  onDataChange: (data: TData[]) => void;
  onSelectionChange?: (selectedRows: TData[]) => void;
  organizationId: string;
}

function useSkipper() {
  const shouldSkipRef = React.useRef(true);
  const shouldSkip = shouldSkipRef.current;

  const skip = React.useCallback(() => {
    shouldSkipRef.current = false;
  }, []);

  React.useEffect(() => {
    shouldSkipRef.current = true;
  });

  return [shouldSkip, skip] as const;
}

export default function EditableDataTable<TData extends { id: string }>({
  initialData,
  columns,
  onRowUpdate,
  onRowDelete,
  onDataChange,
  onSelectionChange,
  organizationId,
}: EditableDataTableProps<TData>) {
  const [data, setData] = useState<TData[]>(initialData || []);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const blankRowRef = useRef<HTMLTableRowElement>(null);
  const [pendingRow, setPendingRow] = useState<Partial<TData> & { id: string }>(
    {} as Partial<TData> & { id: string }
  );
  const [selectedRows, setSelectedRows] = useState<TData[]>([]);
  const queryClient = useQueryClient();
  const [autoResetPageIndex, skipAutoResetPageIndex] = useSkipper();

  // Add state for cell being edited
  const [editingCell, setEditingCell] = useState<{
    id: string;
    key: string;
  } | null>(null);

  // Add state for tracking the next cell to edit
  const [nextCellToEdit, setNextCellToEdit] = useState<{
    id: string;
    key: string;
  } | null>(null);

  // Add state for tracking cell selection
  const [isSelectingCell, setIsSelectingCell] = useState(false);

  useEffect(() => {
    setData(initialData || []);
  }, [initialData]);

  const allColumns = useMemo(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <div className="w-[40px] px-2">
            <Checkbox
              checked={
                selectedRows.length > 0 && selectedRows.length === data.length
              }
              onCheckedChange={(value) => {
                const newSelection = value ? [...data] : [];
                setSelectedRows(newSelection);
                onSelectionChange?.(newSelection);
              }}
            />
          </div>
        ),
        cell: ({ row }) => (
          <div className="w-[40px] px-2">
            <Checkbox
              checked={selectedRows.some((r) => r.id === row.original.id)}
              onCheckedChange={(checked) => {
                const newSelection = checked
                  ? [...selectedRows, row.original]
                  : selectedRows.filter((r) => r.id !== row.original.id);
                setSelectedRows(newSelection);
                onSelectionChange?.(newSelection);
              }}
            />
          </div>
        ),
        enableSorting: false,
        maxSize: 40,
      },
      ...columns,
    ],
    [columns, data.length, selectedRows, onSelectionChange, data]
  );

  const defaultColumn: Partial<ColumnDef<TData>> = {
    cell: ({ getValue, row: { index }, column: { id }, table }) => {
      const EditableCell = () => {
        const initialValue = getValue() as string;
        const [value, setValue] = React.useState(initialValue);

        React.useEffect(() => {
          setValue(initialValue);
        }, [initialValue]);

        return (
          <div className="group relative flex items-center">
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onBlur={() => {
                table.options.meta?.updateData(index, id, value);
              }}
              className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-4"
            />
            <span className="absolute right-2 text-2xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
              Click to edit
            </span>
          </div>
        );
      };

      return <EditableCell />;
    },
  };

  const table = useReactTable({
    data,
    columns: allColumns,
    defaultColumn,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    autoResetPageIndex,
    meta: {
      updateData: (rowIndex: number, columnId: string, value: string) => {
        skipAutoResetPageIndex();
        setData((old) =>
          old.map((row, index) =>
            index === rowIndex ? { ...row, [columnId]: value } : row
          )
        );
        onDataChange(data);
      },
    },
    state: {
      sorting,
      globalFilter,
      columnFilters,
    },
  });

  const handlePendingRowChange = (columnId: keyof TData, value: string) => {
    setPendingRow((prev) => ({
      ...prev,
      [columnId]: value,
    }));
  };

  const isRowComplete = (row: any) => {
    return row.firstName && row.lastName && row.studentId;
  };

  const handlePendingRowKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (
        // @ts-ignore
        !pendingRow.firstName ||
        // @ts-ignore
        !pendingRow.lastName ||
        // @ts-ignore
        !pendingRow.studentId
      ) {
        toast({
          title: "Incomplete row",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }
      // @ts-ignore
      const newRow = {
        ...pendingRow,
        id: crypto.randomUUID(),
        // @ts-ignore
        grade: pendingRow.grade || null,
      } as TData;
      onDataChange([...data, newRow]);
      setPendingRow({} as Partial<TData> & { id: string });
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTableRowElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text");
    const rows = pastedData.split("\n");

    const newData = rows
      .filter((row) => row.trim().length > 0)
      .map((row) => {
        // Split by tab and trim each cell
        const cells = row.split("\t").map((cell) => cell.trim());

        // Get column order from the table
        const columnOrder = columns
          // @ts-ignore
          .map((col) => col.accessorKey as string)
          .filter(Boolean);

        // Create an object with the correct order
        const rowData: any = {};
        columnOrder.forEach((key, index) => {
          rowData[key] = cells[index] || "";
        });

        if (!rowData.studentId || !rowData.firstName || !rowData.lastName)
          return null;

        return {
          id: crypto.randomUUID(),
          ...rowData,
          grade: null,
        } as unknown as TData;
      })
      .filter((row): row is TData => row !== null);

    onDataChange([...data, ...newData]);
  };

  const handleDelete = async (rows: TData[]) => {
    try {
      // Send delete request
      await fetch("/api/students/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentIds: rows.map((row) => row.id),
          organizationId,
        }),
      });

      // Update local state
      const newData = data.filter((d) => !rows.some((r) => r.id === d.id));
      setData(newData);
      onDataChange(newData);

      // Invalidate queries
      await queryClient.invalidateQueries({ queryKey: ["user"] });

      setSelectedRows([]);
    } catch (error) {
      console.error("Failed to delete students:", error);
      toast({
        title: "Error",
        description: "Failed to delete students",
        variant: "destructive",
      });
    }
  };

  const handleUpdate = async (rows: TData[]) => {
    try {
      await fetch("/api/students/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          students: rows,
          organizationId,
        }),
      });

      // Invalidate queries
      await queryClient.invalidateQueries({ queryKey: ["user"] });

      toast({
        title: "Success",
        description: "Students updated successfully",
      });

      setSelectedRows([]);
    } catch (error) {
      console.error("Failed to update students:", error);
      toast({
        title: "Error",
        description: "Failed to update students",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Manage Students</h1>
        {selectedRows.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-base-content">
              {selectedRows.length} selected
            </span>
            <Button
              variant="default"
              onClick={() => handleUpdate(selectedRows)}
            >
              Update Selected
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleDelete(selectedRows)}
            >
              Delete Selected
            </Button>
          </div>
        )}
      </div>
      <p className="text-sm text-muted-foreground">
        Add students individually or paste multiple students from a spreadsheet
      </p>
      <div className="flex items-center justify-between py-4">
        <Input
          placeholder="Search..."
          value={globalFilter ?? ""}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="w-1/2"
        />
      </div>
      <div className="rounded-md border overflow-hidden">
        <div className="overflow-auto max-h-[600px]">
          <Table>
            <TableHeader className="bg-base-100 z-10 sticky top-0">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody className="text-base-content">
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className={!isRowComplete(row.original) ? "bg-red-100" : ""}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="text-base-content p-0 hover:bg-base-100"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow></TableRow>
              )}
              <TableRow
                ref={blankRowRef}
                onPaste={handlePaste}
                className="bg-muted/50"
              >
                <TableCell className="w-[40px]" />
                {columns.map((column: ColumnDef<TData>) => (
                  // @ts-ignore
                  <TableCell key={column.accessorKey as string}>
                    <Input
                      className="border-none"
                      // @ts-ignore
                      placeholder={`Enter ${column.accessorKey as string}`}
                      value={
                        (pendingRow[
                          // @ts-ignore
                          column.accessorKey as keyof TData
                        ] as string) || ""
                      }
                      onChange={(e) =>
                        handlePendingRowChange(
                          // @ts-ignore
                          column.accessorKey as keyof TData,
                          e.target.value
                        )
                      }
                      onKeyDown={handlePendingRowKeyDown}
                    />
                  </TableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>
        </div>
        <Toaster />
      </div>
    </div>
  );
}
