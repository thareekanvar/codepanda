"use client";

import * as React from "react";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconPlus,
  IconLayoutColumns,
} from "@tabler/icons-react";
import {
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type VisibilityState,
  type ColumnFiltersState,
  type SortingState,
} from "@tanstack/react-table";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { type OutlineItem } from "./data-table-types";
import { columns } from "./data-table-columns";
import { DraggableRow } from "./draggable-row";

export function DataTable({
  data: initialData,
}: {
  data: OutlineItem[];
}) {
  const [data, setData] = React.useState(() => initialData);
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const sortableId = React.useId();
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {})
  );

  const dataIds = React.useMemo<UniqueIdentifier[]>(
    () => data?.map(({ id }) => id) || [],
    [data]
  );

  const updateRow = React.useCallback((rowId: string, updatedValues: Partial<OutlineItem>) => {
    setData((prev) =>
      prev.map((row) =>
        row.id.toString() === rowId ? { ...row, ...updatedValues } : row
      )
    );
  }, []);

  const deleteRow = React.useCallback((rowId: string) => {
    setData((prev) => prev.filter((row) => row.id.toString() !== rowId));
    toast.success("Section deleted");
  }, []);

  const duplicateRow = React.useCallback((rowId: string) => {
    setData((prev) => {
      const idx = prev.findIndex((row) => row.id.toString() === rowId);
      if (idx === -1) return prev;
      const source = prev[idx];
      const nextId = Math.max(...prev.map((r) => r.id), 0) + 1;
      const copy = {
        ...source,
        id: nextId,
        header: `${source.header} (Copy)`,
      };
      const updated = [...prev];
      updated.splice(idx + 1, 0, copy);
      return updated;
    });
    toast.success("Section duplicated");
  }, []);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    meta: {
      updateRow,
      deleteRow,
      duplicateRow,
    },
    getRowId: (row) => row.id.toString(),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      setData((data) => {
        const oldIndex = dataIds.indexOf(active.id);
        const newIndex = dataIds.indexOf(over.id);
        return arrayMove(data, oldIndex, newIndex);
      });
    }
  }

  return (
    <Tabs
      defaultValue="outline"
      className="w-full flex-col justify-start gap-4"
    >
      <div className="flex items-center justify-between px-2 py-1">
        <Label htmlFor="view-selector" className="sr-only">
          View
        </Label>
        <Select defaultValue="outline">
          <SelectTrigger
            className="flex w-fit lg:hidden"
            size="sm"
            id="view-selector"
          >
            <SelectValue placeholder="Select a view" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="outline">Outline</SelectItem>
            <SelectItem value="past-performance">Past Performance</SelectItem>
            <SelectItem value="key-personnel">Key Personnel</SelectItem>
            <SelectItem value="focus-documents">Focus Documents</SelectItem>
          </SelectContent>
        </Select>
        <TabsList className="hidden lg:flex shrink-0">
          <TabsTrigger value="outline" className="text-xs">Outline</TabsTrigger>
          <TabsTrigger value="past-performance" className="text-xs">
            Past Performance <Badge variant="secondary" className="ml-1.5 h-4 px-1 rounded bg-muted text-[10px]">3</Badge>
          </TabsTrigger>
          <TabsTrigger value="key-personnel" className="text-xs">
            Key Personnel <Badge variant="secondary" className="ml-1.5 h-4 px-1 rounded bg-muted text-[10px]">2</Badge>
          </TabsTrigger>
          <TabsTrigger value="focus-documents" className="text-xs">Focus Documents</TabsTrigger>
        </TabsList>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger render={
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" />
            }>
              <IconLayoutColumns className="size-3.5" />
              <span className="hidden lg:inline">Customize Columns</span>
              <span className="lg:hidden">Columns</span>
              <IconChevronDown className="size-3" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {table
                .getAllColumns()
                .filter(
                  (column) =>
                    typeof column.accessorFn !== "undefined" &&
                    column.getCanHide()
                )
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1" onClick={() => {
            const nextId = Math.max(...data.map((r) => r.id), 0) + 1;
            const newRow = {
              id: nextId,
              header: `New Section ${nextId}`,
              type: "Narrative",
              status: "Not Started",
              target: "1000",
              limit: "1500",
              reviewer: "Assign reviewer",
            };
            setData((prev) => [...prev, newRow]);
            toast.success("New section added");
          }}>
            <IconPlus className="size-3.5" />
            <span className="hidden lg:inline">Add Section</span>
          </Button>
        </div>
      </div>
      <TabsContent
        value="outline"
        className="relative flex flex-col gap-4 overflow-auto py-1"
      >
        <div className="overflow-hidden rounded-lg border bg-card/40">
          <DndContext
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleDragEnd}
            sensors={sensors}
            id={sortableId}
          >
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-muted/90 backdrop-blur-xs">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id} colSpan={header.colSpan} className="text-xs py-2 h-10">
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
              <TableBody className="**:data-[slot=table-cell]:first:w-8 text-xs">
                {table.getRowModel().rows?.length ? (
                  <SortableContext
                    items={dataIds}
                    strategy={verticalListSortingStrategy}
                  >
                    {table.getRowModel().rows.map((row) => (
                      <DraggableRow key={row.id} row={row} />
                    ))}
                  </SortableContext>
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </DndContext>
        </div>
        <div className="flex items-center justify-between px-1">
          <div className="hidden flex-1 text-xs text-muted-foreground lg:flex">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>
          <div className="flex w-full items-center justify-between lg:justify-end gap-6 lg:w-fit">
            <div className="hidden items-center gap-2 lg:flex">
              <Label htmlFor="rows-per-page" className="text-xs font-medium text-muted-foreground">
                Rows per page
              </Label>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                  if (value) {
                    table.setPageSize(Number(value));
                  }
                }}
              >
                <SelectTrigger size="sm" className="w-16 h-8 text-xs rounded-xl" id="rows-per-page">
                  <SelectValue
                    placeholder={table.getState().pagination.pageSize}
                  />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-center text-xs font-medium text-muted-foreground">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                className="hidden h-7 w-7 p-0 lg:flex"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to first page</span>
                <IconChevronsLeft className="size-3.5" />
              </Button>
              <Button
                variant="outline"
                className="size-7 p-0"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to previous page</span>
                <IconChevronLeft className="size-3.5" />
              </Button>
              <Button
                variant="outline"
                className="size-7 p-0"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to next page</span>
                <IconChevronRight className="size-3.5" />
              </Button>
              <Button
                variant="outline"
                className="hidden size-7 p-0 lg:flex"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to last page</span>
                <IconChevronsRight className="size-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </TabsContent>
      <TabsContent
        value="past-performance"
        className="flex flex-col gap-4 py-1"
      >
        <div className="aspect-video w-full flex-1 rounded-xl border border-dashed flex items-center justify-center bg-muted/5">
          <span className="text-xs text-muted-foreground">Past Performance Content Details</span>
        </div>
      </TabsContent>
      <TabsContent value="key-personnel" className="flex flex-col gap-4 py-1">
        <div className="aspect-video w-full flex-1 rounded-xl border border-dashed flex items-center justify-center bg-muted/5">
          <span className="text-xs text-muted-foreground">Key Personnel Content Details</span>
        </div>
      </TabsContent>
      <TabsContent
        value="focus-documents"
        className="flex flex-col gap-4 py-1"
      >
        <div className="aspect-video w-full flex-1 rounded-xl border border-dashed flex items-center justify-center bg-muted/5">
          <span className="text-xs text-muted-foreground">Focus Documents Content Details</span>
        </div>
      </TabsContent>
    </Tabs>
  );
}
