
"use client";

import { useState, useEffect } from "react";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Project, Client } from "@/data/mock";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { getDatabase, ref, onValue, set, push } from "firebase/database";
import { db } from "@/lib/firebase";
import { ScrollArea } from "@/components/ui/scroll-area";

const projectFormSchema = z.object({
  projectName: z.string().min(3, "Project name must be at least 3 characters."),
  clientName: z.string().min(1, "Client selection is required."),
  deadline: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
  status: z.enum(["In Progress", "Completed", "Pending", "Overdue"]),
  pic: z.string().min(2, "PIC name is required."),
});

type ProjectFormValues = z.infer<typeof projectFormSchema>;

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const projectsRef = ref(db, 'projects');
    const unsubscribeProjects = onValue(projectsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const projectsList: Project[] = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setProjects(projectsList);
      } else {
        setProjects([]);
      }
    });

    const clientsRef = ref(db, 'clients');
    const unsubscribeClients = onValue(clientsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const clientsList: Client[] = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setClients(clientsList);
      } else {
        setClients([]);
      }
    });

    return () => {
      unsubscribeProjects();
      unsubscribeClients();
    };
  }, []);

  const addProject = (newProjectData: ProjectFormValues) => {
    const projectsRef = ref(db, 'projects');
    const newProjectRef = push(projectsRef);
    const projectToSave: Omit<Project, "id"> = { ...newProjectData };

    set(newProjectRef, projectToSave).then(() => {
      toast({
        title: "Project Added",
        description: `${newProjectData.projectName} has been successfully added.`,
      });
      setIsSheetOpen(false);
    }).catch(error => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add project: " + error.message,
      });
    });
  };
  
  const updateProject = (projectId: string, updatedData: ProjectFormValues) => {
    const projectRef = ref(db, `projects/${projectId}`);
    set(projectRef, updatedData)
      .then(() => {
        toast({
          title: "Project Updated",
          description: `${updatedData.projectName} has been successfully updated.`,
        });
        setIsSheetOpen(false);
        setEditingProject(null);
      })
      .catch((error) => {
        toast({
          variant: "destructive",
          title: "Error",
          description: `Failed to update project: ${error.message}`,
        });
      });
  };

  const handleFormSubmit = (data: ProjectFormValues) => {
    if (editingProject) {
      updateProject(editingProject.id, data);
    } else {
      addProject(data);
    }
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setIsSheetOpen(true);
  };
  
  const handleSheetOpenChange = (open: boolean) => {
    setIsSheetOpen(open);
    if (!open) {
      setEditingProject(null);
    }
  };


  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          Project Management
        </h1>
        <Sheet open={isSheetOpen} onOpenChange={handleSheetOpenChange}>
          <SheetTrigger asChild>
            <Button onClick={() => setIsSheetOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Project
            </Button>
          </SheetTrigger>
          <SheetContent className="sm:max-w-lg flex flex-col">
            <SheetHeader>
              <SheetTitle>{editingProject ? 'Edit Project' : 'Add New Project'}</SheetTitle>
              <SheetDescription>
                 {editingProject ? "Update the project's details below." : 'Fill in the details for the new project.'}
              </SheetDescription>
            </SheetHeader>
            <ScrollArea className="flex-1 -mx-6">
              <div className="px-6">
                <ProjectForm onSubmit={handleFormSubmit} clients={clients} initialData={editingProject} />
              </div>
            </ScrollArea>
          </SheetContent>
        </Sheet>
      </div>
      <DataTable columns={columns} data={projects} meta={{ editProject: handleEditProject }}/>
    </div>
  );
}

function ProjectForm({ 
  onSubmit, 
  clients, 
  initialData 
}: { 
  onSubmit: (data: ProjectFormValues) => void, 
  clients: Client[], 
  initialData?: Project | null 
}) {
  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: initialData || {
      projectName: "",
      clientName: "",
      deadline: new Date().toISOString().split("T")[0],
      status: "Pending",
      pic: "",
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        ...initialData,
        deadline: new Date(initialData.deadline).toISOString().split("T")[0]
      });
    } else {
      form.reset({
        projectName: "",
        clientName: "",
        deadline: new Date().toISOString().split("T")[0],
        status: "Pending",
        pic: "",
      });
    }
  }, [initialData, form]);

  const uniqueCompanyNames = [...new Set(clients.map((client) => client.company))];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
        <FormField control={form.control} name="projectName" render={({ field }) => (
            <FormItem><FormLabel>Project Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="clientName" render={({ field }) => (
            <FormItem><FormLabel>Client</FormLabel><Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue placeholder="Select a client" /></SelectTrigger></FormControl>
                <SelectContent>
                    {uniqueCompanyNames.map(company => (
                        <SelectItem key={company} value={company}>{company}</SelectItem>
                    ))}
                </SelectContent>
            </Select><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="deadline" render={({ field }) => (
            <FormItem><FormLabel>Deadline</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="status" render={({ field }) => (
            <FormItem><FormLabel>Status</FormLabel><Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                <SelectContent>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Overdue">Overdue</SelectItem>
                </SelectContent>
            </Select><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="pic" render={({ field }) => (
            <FormItem><FormLabel>Person In Charge (PIC)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )} />

        <Button type="submit" className="w-full mt-4">{initialData ? 'Save Changes' : 'Save Project'}</Button>
      </form>
    </Form>
  );
}
