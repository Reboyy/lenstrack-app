"use client";

import { useState, useEffect } from "react";
import { PlusCircle, Sparkles } from "lucide-react";
import { getDatabase, ref, onValue, set, push, remove } from "firebase/database";
import { db } from "@/lib/firebase";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { generateClientOverview, ClientOverviewOutput } from "@/ai/flows/client-overview-flow";

import { Button } from "@/components/ui/button";
import { Client, Project, Log } from "@/data/mock";
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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";

const clientFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  company: z.string().min(2, "Company must be at least 2 characters."),
  email: z.string().email(),
  phone: z.string().min(10, "Phone number seems too short."),
  project: z.string().min(3, "Project name is required."),
  status: z.enum(["Active", "On Hold", "Completed", "Cancelled"]),
  cooperationDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
  notes: z.string().optional(),
});

type ClientFormValues = z.infer<typeof clientFormSchema>;

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const { toast } = useToast();

  const [isOverviewDialogOpen, setIsOverviewDialogOpen] = useState(false);
  const [isGeneratingOverview, setIsGeneratingOverview] = useState(false);
  const [overviewContent, setOverviewContent] = useState<ClientOverviewOutput | null>(null);
  const [selectedClientForOverview, setSelectedClientForOverview] = useState<Client | null>(null);

  useEffect(() => {
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

    const projectsRef = ref(db, 'projects');
    const unsubscribeProjects = onValue(projectsRef, (snapshot) => {
        const data = snapshot.val();
        const projectsList: Project[] = data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : [];
        setProjects(projectsList);
    });

    const logsRef = ref(db, 'logs');
    const unsubscribeLogs = onValue(logsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const logsList: Log[] = Object.keys(data).map(key => {
            const logData = data[key];
            // Backwards compatibility for old data with `media` field.
            if (logData.media && !logData.channel) {
              logData.channel = logData.media;
              delete logData.media;
            }
            return {
              id: key,
              ...logData
            };
          });
          setLogs(logsList);
        } else {
          setLogs([]);
        }
    });

    return () => {
      unsubscribeClients();
      unsubscribeProjects();
      unsubscribeLogs();
    };
  }, []);

  const addClient = (newClientData: ClientFormValues) => {
    const clientsRef = ref(db, 'clients');
    const newClientRef = push(clientsRef);
    
    const clientToSave = {
      ...newClientData,
      notes: newClientData.notes || "",
    }

    set(newClientRef, clientToSave)
      .then(() => {
        toast({
          title: "Client Added",
          description: `${newClientData.name} has been successfully added.`,
        });
        setIsSheetOpen(false);
      })
      .catch((error) => {
        toast({
          variant: "destructive",
          title: "Error",
          description: `Failed to add client: ${error.message}`,
        });
      });
  };

  const updateClient = (clientId: string, updatedData: ClientFormValues) => {
    const clientRef = ref(db, `clients/${clientId}`);
    const clientToSave = {
      ...updatedData,
      notes: updatedData.notes || ""
    };
    set(clientRef, clientToSave)
      .then(() => {
        toast({
          title: "Client Updated",
          description: `${updatedData.name} has been successfully updated.`
        });
        setIsSheetOpen(false);
        setEditingClient(null);
      })
      .catch((error) => {
        toast({
          variant: "destructive",
          title: "Error",
          description: `Failed to update client: ${error.message}`,
        });
      });
  };

  const handleFormSubmit = (data: ClientFormValues) => {
    if (editingClient) {
      updateClient(editingClient.id, data);
    } else {
      addClient(data);
    }
  };

  const deleteClient = (clientId: string) => {
    const clientToDelete = clients.find((client) => client.id === clientId);
    if (!clientToDelete) return;
    
    const clientRef = ref(db, `clients/${clientId}`);
    remove(clientRef)
      .then(() => {
        toast({
          variant: "destructive",
          title: "Client Deleted",
          description: `${clientToDelete.name} has been permanently deleted.`,
        });
      })
      .catch((error) => {
        toast({
          variant: "destructive",
          title: "Error",
          description: `Failed to delete client: ${error.message}`,
        });
      });
  };
  
  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setIsSheetOpen(true);
  };
  
  const handleSheetOpenChange = (open: boolean) => {
    setIsSheetOpen(open);
    if (!open) {
      setEditingClient(null);
    }
  };

  const handleGenerateAiOverview = async (client: Client) => {
    setSelectedClientForOverview(client);
    setIsOverviewDialogOpen(true);
    setIsGeneratingOverview(true);
    setOverviewContent(null);

    try {
      const clientProjects = projects.filter(p => p.clientName === client.company);
      const clientLogs = logs.filter(l => l.clientName === client.company);
      
      const result = await generateClientOverview({
        client,
        projects: clientProjects,
        logs: clientLogs,
      });

      setOverviewContent(result);
    } catch (error) {
      console.error("AI Overview failed:", error);
      toast({
        variant: "destructive",
        title: "AI Overview Failed",
        description: "Could not generate an overview for this client.",
      });
      setIsOverviewDialogOpen(false); // Close dialog on error
    } finally {
      setIsGeneratingOverview(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          Client Management
        </h1>
        <Sheet open={isSheetOpen} onOpenChange={handleSheetOpenChange}>
          <SheetTrigger asChild>
            <Button onClick={() => setIsSheetOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Client
            </Button>
          </SheetTrigger>
          <SheetContent className="sm:max-w-lg flex flex-col">
            <SheetHeader>
              <SheetTitle>{editingClient ? "Edit Client" : "Add New Client"}</SheetTitle>
              <SheetDescription>
                {editingClient ? "Update the client's details below." : "Fill in the details below to add a new client to the system."}
              </SheetDescription>
            </SheetHeader>
            <ScrollArea className="flex-1 -mx-6">
              <div className="px-6">
                <ClientForm onSubmit={handleFormSubmit} initialData={editingClient} />
              </div>
            </ScrollArea>
          </SheetContent>
        </Sheet>
      </div>
      <DataTable columns={columns} data={clients} meta={{ deleteClient, editClient: handleEdit, generateAiOverview: handleGenerateAiOverview }} />
      <Dialog open={isOverviewDialogOpen} onOpenChange={setIsOverviewDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                AI Overview: {selectedClientForOverview?.name}
            </DialogTitle>
            <DialogDescription>
                A summary of this client's projects and recent communications.
            </DialogDescription>
          </DialogHeader>
          {isGeneratingOverview ? (
            <div className="space-y-6 py-4">
                <div>
                    <Skeleton className="h-4 w-1/3 mb-2" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-4/5 mt-2" />
                </div>
                 <div>
                    <Skeleton className="h-4 w-1/4 mb-2" />
                    <Skeleton className="h-4 w-full mt-2" />
                </div>
                 <div>
                    <Skeleton className="h-4 w-1/3 mb-2" />
                    <Skeleton className="h-4 w-full" />
                </div>
                 <div>
                    <Skeleton className="h-4 w-1/2 mb-2" />
                    <Skeleton className="h-4 w-full" />
                </div>
            </div>
          ) : (
            overviewContent && (
                <ScrollArea className="max-h-[60vh] pr-4 -mx-6">
                  <div className="px-6 space-y-6 text-sm whitespace-pre-wrap">
                      <div>
                          <h3 className="font-semibold text-card-foreground mb-2">Client Summary</h3>
                          <p className="text-muted-foreground">{overviewContent.summary}</p>
                      </div>
                      <div>
                          <h3 className="font-semibold text-card-foreground mb-2">Project Status</h3>
                          <p className="text-muted-foreground">{overviewContent.projectStatus}</p>
                      </div>
                      <div>
                          <h3 className="font-semibold text-card-foreground mb-2">Communication Insights</h3>
                          <p className="text-muted-foreground">{overviewContent.communicationInsights}</p>
                      </div>
                      <div>
                          <h3 className="font-semibold text-card-foreground mb-2">Risks & Recommendations</h3>
                          <p className="text-muted-foreground">{overviewContent.risksAndRecommendations}</p>
                      </div>
                  </div>
                </ScrollArea>
            )
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ClientForm({
  onSubmit,
  initialData,
}: {
  onSubmit: (data: ClientFormValues) => void;
  initialData?: Client | null;
}) {
  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: initialData || {
      name: "",
      company: "",
      email: "",
      phone: "",
      project: "",
      status: "Active",
      cooperationDate: new Date().toISOString().split("T")[0],
      notes: "",
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset(initialData);
    } else {
      form.reset({
        name: "",
        company: "",
        email: "",
        phone: "",
        project: "",
        status: "Active",
        cooperationDate: new Date().toISOString().split("T")[0],
        notes: "",
      });
    }
  }, [initialData, form]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid gap-4 py-4"
      >
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="company"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="project"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="On Hold">On Hold</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="cooperationDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cooperation Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">
          Save Client
        </Button>
      </form>
    </Form>
  );
}
