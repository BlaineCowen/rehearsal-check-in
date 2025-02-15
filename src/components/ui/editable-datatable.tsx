"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  type SortingState,
  type ColumnFiltersState,
  getFilteredRowModel,
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

export type GridData = {
  id: string;
  firstName: string;
  lastName: string;
};

interface EditableDataTableProps {
  initialData: GridData[];
}

export default function EditableDataTable({
  initialData,
}: EditableDataTableProps) {
  const [data, setData] = useState<GridData[]>(initialData || []);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const blankRowRef = useRef<HTMLTableRowElement>(null);

  useEffect(() => {
    setData(initialData || []);
  }, [initialData]);

  const columns: ColumnDef<GridData>[] = [
    {
      accessorKey: "firstName",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            First Name
            {column.getIsSorted() === "asc" ? (
              <ChevronUp className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === "desc" ? (
              <ChevronDown className="ml-2 h-4 w-4" />
            ) : (
              <ChevronsUpDown className="ml-2 h-4 w-4" />
            )}
          </Button>
        );
      },
      cell: EditableCell,
    },
    {
      accessorKey: "lastName",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Last Name
            {column.getIsSorted() === "asc" ? (
              <ChevronUp className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === "desc" ? (
              <ChevronDown className="ml-2 h-4 w-4" />
            ) : (
              <ChevronsUpDown className="ml-2 h-4 w-4" />
            )}
          </Button>
        );
      },
      cell: EditableCell,
    },
    {
      accessorKey: "id",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            ID
            {column.getIsSorted() === "asc" ? (
              <ChevronUp className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === "desc" ? (
              <ChevronDown className="ml-2 h-4 w-4" />
            ) : (
              <ChevronsUpDown className="ml-2 h-4 w-4" />
            )}
          </Button>
        );
      },
      cell: EditableCell,
    },
  ];

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
          if (rowIndex === updatedData.length) {
            // This is the blank row, add a new row
            const newRow: GridData = {
              id: (updatedData.length + 1).toString(),
              firstName: "",
              lastName: "",
            };
            newRow[columnId as keyof GridData] = value;
            return [...updatedData, newRow];
          }
          return updatedData.map((row, index) => {
            if (index === rowIndex) {
              return {
                ...updatedData[rowIndex],
                [columnId]: value,
              };
            }
            return row;
          });
        });
      },
    },
  });

  const handlePaste = (e: React.ClipboardEvent<HTMLTableRowElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text");
    const rows = pastedData.split("\n");
    const newData = rows
      .map((row) => {
        const [firstName, lastName, id] = row.split(",");
        return {
          id: id?.trim() || ((data?.length || 0) + 1).toString(),
          firstName: firstName?.trim() || "",
          lastName: lastName?.trim() || "",
        };
      })
      .filter((row) => row.firstName || row.lastName || row.id);

    setData((oldData) => [...(oldData || []), ...newData]);
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
              {columns.map((column) => (
                // @ts-ignore
                <TableCell key={column.accessorKey as string}>
                  <Input
                    // @ts-ignore
                    placeholder={`Enter ${column.accessorKey}`}
                    onChange={(e) =>
                      // @ts-ignore
                      table.options.meta?.updateData(
                        (data || []).length,
                        // @ts-ignore
                        column.accessorKey as string,
                        e.target.value
                      )
                    }
                  />
                </TableCell>
              ))}
            </TableRow>
          </TableBody>
        </Table>
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
