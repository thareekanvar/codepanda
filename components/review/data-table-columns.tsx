"use client";

import * as React from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { 
  IconCircleCheckFilled, 
  IconLoader, 
  IconDotsVertical 
} from "@tabler/icons-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type OutlineItem } from "./data-table-types";
import { TableCellViewer } from "./table-cell-viewer";
import { DragHandle } from "./draggable-row";

interface TableMeta {
  updateRow?: (rowId: string, updatedValues: Partial<OutlineItem>) => void;
  deleteRow?: (rowId: string) => void;
  duplicateRow?: (rowId: string) => void;
}

export const columns: ColumnDef<OutlineItem>[] = [
  {
    id: "drag",
    header: () => null,
    cell: ({ row }) => <DragHandle id={row.original.id} />,
  },
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "header",
    header: "Header",
    cell: ({ row, table }) => {
      const updateRow = (table.options.meta as TableMeta)?.updateRow;
      return <TableCellViewer item={row.original} updateRow={updateRow} />;
    },
    enableHiding: false,
  },
  {
    accessorKey: "type",
    header: "Section Type",
    cell: ({ row, table }) => {
      const updateRow = (table.options.meta as TableMeta)?.updateRow;
      return (
        <Select
          value={row.original.type}
          onValueChange={(val) => {
            if (val) {
              updateRow?.(row.original.id.toString(), { type: val });
              toast.success(`Section type updated to ${val}`);
            }
          }}
        >
          <SelectTrigger className="border-none bg-transparent hover:bg-muted/30 rounded px-1.5 h-8 gap-1.5 font-medium text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Table of Contents">Table of Contents</SelectItem>
            <SelectItem value="Executive Summary">Executive Summary</SelectItem>
            <SelectItem value="Technical Approach">Technical Approach</SelectItem>
            <SelectItem value="Design">Design</SelectItem>
            <SelectItem value="Capabilities">Capabilities</SelectItem>
            <SelectItem value="Focus Documents">Focus Documents</SelectItem>
            <SelectItem value="Narrative">Narrative</SelectItem>
            <SelectItem value="Cover Page">Cover Page</SelectItem>
          </SelectContent>
        </Select>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row, table }) => {
      const updateRow = (table.options.meta as TableMeta)?.updateRow;
      return (
        <Select
          value={row.original.status}
          onValueChange={(val) => {
            if (val) {
              updateRow?.(row.original.id.toString(), { status: val });
              toast.success(`Status updated to ${val} for ${row.original.header}`);
            }
          }}
        >
          <SelectTrigger className="border-none bg-transparent hover:bg-muted/30 rounded px-1.5 h-8 gap-1.5 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-1.5">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Done">
              <span className="flex items-center gap-1.5 text-xs">
                <IconCircleCheckFilled className="size-3.5 fill-emerald-500 dark:fill-emerald-400 shrink-0" />
                Done
              </span>
            </SelectItem>
            <SelectItem value="In Progress">
              <span className="flex items-center gap-1.5 text-xs">
                <IconLoader className="size-3.5 text-amber-500 animate-spin shrink-0" />
                In Progress
              </span>
            </SelectItem>
            <SelectItem value="Not Started">
              <span className="flex items-center gap-1.5 text-xs">
                <span className="size-2 rounded-full bg-zinc-400 dark:bg-zinc-600 shrink-0" />
                Not Started
              </span>
            </SelectItem>
          </SelectContent>
        </Select>
      );
    },
  },
  {
    accessorKey: "target",
    header: () => <div className="w-full text-right pr-2">Target</div>,
    cell: ({ row, table }) => {
      const updateRow = (table.options.meta as TableMeta)?.updateRow;
      return (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const form = e.currentTarget;
            const input = form.elements.namedItem("target") as HTMLInputElement;
            updateRow?.(row.original.id.toString(), { target: input.value });
            toast.success(`Saved target: ${input.value}`);
          }}
        >
          <Label htmlFor={`${row.original.id}-target`} className="sr-only">
            Target
          </Label>
          <Input
            name="target"
            className="h-8 w-16 border-transparent bg-transparent text-right shadow-none hover:bg-input/30 focus-visible:border focus-visible:bg-background dark:bg-transparent dark:hover:bg-input/30 dark:focus-visible:bg-input/30"
            defaultValue={row.original.target}
            id={`${row.original.id}-target`}
            onBlur={(e) => {
              updateRow?.(row.original.id.toString(), { target: e.target.value });
            }}
          />
        </form>
      );
    },
  },
  {
    accessorKey: "limit",
    header: () => <div className="w-full text-right pr-2">Limit</div>,
    cell: ({ row, table }) => {
      const updateRow = (table.options.meta as TableMeta)?.updateRow;
      return (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const form = e.currentTarget;
            const input = form.elements.namedItem("limit") as HTMLInputElement;
            updateRow?.(row.original.id.toString(), { limit: input.value });
            toast.success(`Saved limit: ${input.value}`);
          }}
        >
          <Label htmlFor={`${row.original.id}-limit`} className="sr-only">
            Limit
          </Label>
          <Input
            name="limit"
            className="h-8 w-16 border-transparent bg-transparent text-right shadow-none hover:bg-input/30 focus-visible:border focus-visible:bg-background dark:bg-transparent dark:hover:bg-input/30 dark:focus-visible:bg-input/30"
            defaultValue={row.original.limit}
            id={`${row.original.id}-limit`}
            onBlur={(e) => {
              updateRow?.(row.original.id.toString(), { limit: e.target.value });
            }}
          />
        </form>
      );
    },
  },
  {
    accessorKey: "reviewer",
    header: "Reviewer",
    cell: ({ row, table }) => {
      const updateRow = (table.options.meta as TableMeta)?.updateRow;
      return (
        <>
          <Label htmlFor={`${row.original.id}-reviewer`} className="sr-only">
            Reviewer
          </Label>
          <Select
            value={row.original.reviewer}
            onValueChange={(val) => {
              if (val) {
                updateRow?.(row.original.id.toString(), { reviewer: val });
                toast.success(`Assigned ${val} to ${row.original.header}`);
              }
            }}
          >
            <SelectTrigger
              className="w-36 *:data-[slot=select-value]:block *:data-[slot=select-value]:truncate"
              size="sm"
              id={`${row.original.id}-reviewer`}
            >
              <SelectValue placeholder="Assign reviewer" />
            </SelectTrigger>
            <SelectContent align="end">
              <SelectItem value="Assign reviewer">Assign reviewer</SelectItem>
              <SelectItem value="Eddie Lake">Eddie Lake</SelectItem>
              <SelectItem value="Jamik Tashpulatov">Jamik Tashpulatov</SelectItem>
              <SelectItem value="Emily Whalen">Emily Whalen</SelectItem>
            </SelectContent>
          </Select>
        </>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row, table }) => {
      const deleteRow = (table.options.meta as TableMeta)?.deleteRow;
      const duplicateRow = (table.options.meta as TableMeta)?.duplicateRow;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger render={
            <Button
              variant="ghost"
              className="flex size-8 text-muted-foreground data-[state=open]:bg-muted"
              size="icon"
            />
          }>
            <IconDotsVertical className="size-4" />
            <span className="sr-only">Open menu</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-32">
            <DropdownMenuItem onClick={() => {
              toast.info(`Click on the section name to edit details.`);
            }}>Edit</DropdownMenuItem>
            <DropdownMenuItem onClick={() => duplicateRow?.(row.original.id.toString())}>Make a copy</DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast.success(`Added ${row.original.header} to favorites`)}>Favorite</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={() => deleteRow?.(row.original.id.toString())}>Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
