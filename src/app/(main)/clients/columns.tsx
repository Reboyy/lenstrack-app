"use client";

import { ColumnDef, CellContext } from "@tanstack/react-table";
import { MoreHorizontal, ArrowUpDown, Sparkles } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Client } from "@/data/mock";

declare module "@tanstack/react-table" {
  interface TableMeta<TData> {
    deleteClient: (clientId: string) => void;
    editClient: (client: Client) => void;
    generateAiOverview: (client: Client) => void;
  }
}

const ActionCell = ({ row, table }: CellContext<Client, unknown>) => {
  const client = row.original;
  const [isAlertOpen, setIsAlertOpen] = React.useState(false);

  const handleDelete = () => {
    table.options.meta?.deleteClient(client.id);
    setIsAlertOpen(false);
  };

  const handleEdit = () => {
    table.options.meta?.editClient(client);
  };

  const handleAiOverview = () => {
    table.options.meta?.generateAiOverview(client);
  };

  return (
    <>
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this
              client&apos;s data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={handleAiOverview}>
            <Sparkles className="mr-2 h-4 w-4" />
            AI Overview
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleEdit}>Edit</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => navigator.clipboard.writeText(client.id)}
          >
            Copy Client ID
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-destructive focus:bg-destructive/20 focus:text-destructive"
            onClick={() => setIsAlertOpen(true)}
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export const columns: ColumnDef<Client>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
  },
  {
    accessorKey: "company",
    header: "Company",
  },
  {
    accessorKey: "project",
    header: "Project",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const variant: "default" | "secondary" | "destructive" | "outline" =
        status === "Active"
          ? "default"
          : status === "Completed"
          ? "secondary"
          : status === "On Hold"
          ? "outline"
          : "destructive";
      return (
        <Badge
          variant={variant}
          className={
            status === "Active"
              ? "bg-green-500/80 hover:bg-green-500 text-white"
              : ""
          }
        >
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "cooperationDate",
    header: "Cooperation Date",
    cell: ({ row }) =>
      new Date(row.getValue("cooperationDate")).toLocaleDateString(),
  },
  {
    id: "actions",
    cell: ActionCell,
  },
];
