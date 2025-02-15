"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  type SortingState,
  type ColumnFiltersState,
  getFilteredRowModel,
  ColumnDef,
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
}

export default function EditableDataTable<TData extends { id: string }>({
  initialData,
  columns,
  onRowUpdate,
  onRowDelete,
  onDataChange,
}: EditableDataTableProps<TData>) {
  const [data, setData] = useState<TData[]>(initialData || []);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const blankRowRef = useRef<HTMLTableRowElement>(null);
  const [pendingRow, setPendingRow] = useState<Partial<TData> & { id: string }>(
    {} as Partial<TData> & { id: string }
  );

  useEffect(() => {
    setData(initialData || []);
  }, [initialData]);

  const table = useReactTable({
    data: data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,

    state: {
      sorting,
      globalFilter,
      columnFilters,
    },
    meta: {
      updateData: (rowIndex: number, columnId: string, value: string) => {
        setData((old) => {
          const updatedData = old || [];
          return updatedData.map((row, index) => {
            if (index === rowIndex) {
              onDataChange(updatedData);
              return {
                ...updatedData[rowIndex],
                [columnId]: value,
              };
            }
            onDataChange(updatedData);
            return row;
          });
        });
      },
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
        !pendingRow.firstName ||
        !pendingRow.lastName ||
        !pendingRow.studentId
      ) {
        toast({
          title: "Incomplete row",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }
      const newRow = {
        ...pendingRow,
        id: crypto.randomUUID(),
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
        const [studentId, firstName, lastName] = row
          .split("\t")
          .map((cell) => cell.trim());

        if (!studentId || !firstName || !lastName) return null;

        return {
          id: crypto.randomUUID(),
          studentId,
          firstName,
          lastName,
          grade: null,
        } as unknown as TData;
      })
      .filter((row): row is TData => row !== null);

    onDataChange([...data, ...newData]);
  };

  return (
    <div className="container mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold mb-4">Editable DataTable</h1>
      <Input
        placeholder="Search..."
        value={globalFilter ?? ""}
        onChange={(e) => setGlobalFilter(e.target.value)}
      />
      <div className="rounded-md border">
        <Table>
          <TableHeader>
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
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={!isRowComplete(row.original) ? "bg-red-100" : ""}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
            <TableRow
              ref={blankRowRef}
              onPaste={handlePaste}
              className="bg-muted/50"
            >
              {columns.map((column: ColumnDef<TData>) => (
                <TableCell key={column.accessorKey as string}>
                  <Input
                    placeholder={`Enter ${column.accessorKey as string}`}
                    value={
                      (pendingRow[
                        column.accessorKey as keyof TData
                      ] as string) || ""
                    }
                    onChange={(e) =>
                      handlePendingRowChange(
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
        <Toaster />
      </div>

      <div className="flex items-center justify-between space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

function EditableCell({
  getValue,
  row: { index },
  column: { id },
  table,
}: {
  getValue: () => any;
  row: { index: number };
  column: { id: string };
  table: any;
}) {
  const initialValue = getValue();
  const [value, setValue] = useState(initialValue);

  const onBlur = () => {
    table.options.meta?.updateData(index, id, value);
  };

  React.useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  return (
    <Input
      value={value as string}
      onChange={(e) => setValue(e.target.value)}
      onBlur={onBlur}
    />
  );
}
