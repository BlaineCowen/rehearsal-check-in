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
import { Checkbox } from "@/components/ui/checkbox";
import { useQueryClient } from "@tanstack/react-query";

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

  useEffect(() => {
    setData(initialData || []);
  }, [initialData]);

  const selectionColumn: ColumnDef<TData> = {
    id: "select",
    header: ({ table }) => (
      <div className="w-[40px] px-2">
        <Checkbox
          checked={selectedRows.length === data.length}
          onCheckedChange={(value) => {
            const newSelection = value ? [...data] : [];
            setSelectedRows(newSelection);
            onSelectionChange?.(newSelection);
          }}
          aria-label="Select all"
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
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
    maxSize: 40,
  };

  const allColumns = [selectionColumn, ...columns];

  const table = useReactTable({
    data: data || [],
    columns: allColumns,
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
        const [firstName, lastName, studentId] = row
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

  return (
    <div className="container mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold text-base-content mb-4">
        Add/Delete Students
      </h1>
      <h2>Copy and paste as multiple students into the bottom row</h2>
      <div className="flex items-center justify-between py-4">
        <Input
          placeholder="Search..."
          value={globalFilter ?? ""}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="w-1/2"
        />
        {selectedRows.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-base-content">
              {selectedRows.length} selected
            </span>
            <Button
              variant="destructive"
              onClick={() => handleDelete(selectedRows)}
            >
              Delete Selected
            </Button>
          </div>
        )}
      </div>
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
          <TableBody className="text-base-content">
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={!isRowComplete(row.original) ? "bg-red-100" : ""}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="text-base-content">
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
        <Toaster />
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
