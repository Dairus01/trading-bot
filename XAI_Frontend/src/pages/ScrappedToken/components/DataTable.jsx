import React, { useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataTablePagination } from "@/components/DataTablePagination";
import { Inbox, Loader2 } from "lucide-react";

const DataTable = ({
  columns,
  data,
  paginationData,
  pagination,
  setPagination,
  isFetching,
}) => {
  const [columnVisibility, setColumnVisibility] = useState({
    _id: false,
  });

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    manualPagination: true,
    onPaginationChange: setPagination,
    // pageCount: Math.ceil(data?.pagination?.totalRecords / pageSize), // Set pageCount based on total items
    pageCount: paginationData?.totalPages,
    state: {
      columnVisibility,
      pagination,
    },
  });

  return (
    <>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                );
              })}
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
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : isFetching ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                <div className="w-full flex justify-center">
                  <Loader2 className="h-4 w-4 animate-spin text-purple-600/50" />
                </div>
              </TableCell>
            </TableRow>
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns?.length}
                className="h-24 text-purple-600/80 font-medium text-center"
              >
                <div className="w-full flex flex-col gap-2 justify-center items-center">
                  <Inbox className="h-16 w-16 text-purple-500/60" />
                  No results
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <DataTablePagination table={table} />
    </>
  );
};

export default DataTable;
