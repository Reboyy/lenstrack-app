"use client";

import { ColumnDef, CellContext } from "@tanstack/react-table";
import { MoreHorizontal, ArrowUpDown } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Log } from "@/data/mock";

declare module "@tanstack/react-table" {
  interface TableMeta<TData> {
    editLog: (log: Log) => void;
  }
}

const ActionCell = ({ row, table }: CellContext<Log, unknown>) => {
  const log = row.original;
  const [isNoteDialogOpen, setIsNoteDialogOpen] = React.useState(false);

  const handleEdit = () => {
    table.options.meta?.editLog(log);
  };

  return (
    <>
      <Dialog open={isNoteDialogOpen} onOpenChange={setIsNoteDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Full Note Details</DialogTitle>
            <DialogDescription>
              Communication log with {log.clientName} on{" "}
              {new Date(log.communicationDate).toLocaleDateString()}.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[50vh] pr-4">
            <div className="whitespace-pre-wrap text-sm">{log.notes}</div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setIsNoteDialogOpen(true)}>
            View Full Note
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleEdit}>Edit Log</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export const columns: ColumnDef<Log>[] = [
  {
    accessorKey: "clientName",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Client
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("clientName")}</div>
    ),
  },
  {
    accessorKey: "communicationDate",
    header: "Date",
    cell: ({ row }) =>
      new Date(row.getValue("communicationDate")).toLocaleDateString(),
  },
  {
    accessorKey: "channel",
    header: "Channel",
  },
  {
    accessorKey: "notes",
    header: "Notes",
    cell: ({ row }) => (
      <div className="truncate max-w-xs">{row.getValue("notes")}</div>
    ),
  },
  {
    id: "actions",
    cell: ActionCell,
  },
];
