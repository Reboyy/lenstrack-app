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
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge";
import { Project } from "@/data/mock";

declare module "@tanstack/react-table" {
  interface TableMeta<TData> {
    editProject: (project: Project) => void;
  }
}

const ActionCell = ({ row, table }: CellContext<Project, unknown>) => {
  const project = row.original;
  const [isDetailsOpen, setIsDetailsOpen] = React.useState(false);

  const handleEdit = () => {
    table.options.meta?.editProject(project);
  };

  return (
    <>
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{project.projectName}</DialogTitle>
            <DialogDescription>
                Project details for {project.clientName}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 items-center gap-4">
                <p className="text-sm font-medium text-muted-foreground">Client</p>
                <p>{project.clientName}</p>
            </div>
             <div className="grid grid-cols-2 items-center gap-4">
                <p className="text-sm font-medium text-muted-foreground">Deadline</p>
                <p>{new Date(project.deadline).toLocaleDateString()}</p>
            </div>
             <div className="grid grid-cols-2 items-center gap-4">
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <p>{project.status}</p>
            </div>
             <div className="grid grid-cols-2 items-center gap-4">
                <p className="text-sm font-medium text-muted-foreground">PIC</p>
                <p>{project.pic}</p>
            </div>
          </div>
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
          <DropdownMenuItem onClick={() => setIsDetailsOpen(true)}>
            View Details
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleEdit}>
            Edit Project
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export const columns: ColumnDef<Project>[] = [
  {
    accessorKey: "projectName",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Project Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
     cell: ({ row }) => (
        <div className="font-medium">{row.getValue("projectName")}</div>
    ),
  },
  {
    accessorKey: "clientName",
    header: "Client",
  },
  {
    accessorKey: "deadline",
    header: "Deadline",
    cell: ({ row }) => new Date(row.getValue("deadline")).toLocaleDateString(),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const variant: "default" | "secondary" | "destructive" | "outline" =
        status === "In Progress"
          ? "default"
          : status === "Completed"
          ? "secondary"
          : status === "Pending"
          ? "outline"
          : "destructive";
      return <Badge variant={variant} className={status === 'In Progress' ? 'bg-blue-500/80 hover:bg-blue-500 text-white' : status === 'Overdue' ? 'bg-red-500/80 hover:bg-red-500 text-white' : ''}>{status}</Badge>;
    },
  },
  {
    accessorKey: "pic",
    header: "PIC",
  },
  {
    id: "actions",
    cell: ActionCell,
  },
];
