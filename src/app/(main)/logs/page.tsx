
"use client";

import { useState, useEffect } from "react";
import { PlusCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Log, Client } from "@/data/mock";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { getDatabase, ref, onValue, set, push } from "firebase/database";
import { db } from "@/lib/firebase";
import { ScrollArea } from "@/components/ui/scroll-area";
import { summarizeLogs } from "@/ai/flows/summarize-logs-flow";

const logFormSchema = z.object({
  clientName: z.string().min(1, "Client selection is required."),
  communicationDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
  channel: z.enum(["Email", "WhatsApp", "Meeting"]),
  notes: z.string().min(10, "Notes must be at least 10 characters long."),
});

type LogFormValues = z.infer<typeof logFormSchema>;

export default function LogsPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<Log | null>(null);
  const { toast } = useToast();

  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [isSummaryDialogOpen, setIsSummaryDialogOpen] = useState(false);

  useEffect(() => {
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
        }).sort((a, b) => new Date(b.communicationDate).getTime() - new Date(a.communicationDate).getTime());
        setLogs(logsList);
      } else {
        setLogs([]);
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
      unsubscribeLogs();
      unsubscribeClients();
    };
  }, []);

  const addLog = (newLogData: LogFormValues) => {
    const logsRef = ref(db, 'logs');
    const newLogRef = push(logsRef);
    const logToSave: Omit<Log, "id"> = { ...newLogData };
    set(newLogRef, logToSave).then(() => {
        toast({
          title: "Log Added",
          description: `Communication with ${newLogData.clientName} has been logged.`,
        });
        setIsSheetOpen(false);
    }).catch(error => {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to add log: " + error.message,
        });
    });
  };

  const updateLog = (logId: string, updatedData: LogFormValues) => {
    const logRef = ref(db, `logs/${logId}`);
    set(logRef, updatedData)
      .then(() => {
        toast({
          title: "Log Updated",
          description: `Log for ${updatedData.clientName} has been successfully updated.`,
        });
        setIsSheetOpen(false);
        setEditingLog(null);
      })
      .catch((error) => {
        toast({
          variant: "destructive",
          title: "Error",
          description: `Failed to update log: ${error.message}`,
        });
      });
  };

  const handleFormSubmit = (data: LogFormValues) => {
    if (editingLog) {
      updateLog(editingLog.id, data);
    } else {
      addLog(data);
    }
  };

  const handleSummarize = async () => {
    if (logs.length === 0) {
      toast({
        title: "No logs to summarize",
        description: "Please add some communication logs first.",
      });
      return;
    }
    setIsSummarizing(true);
    try {
      const logsToSummarize = logs.map(({ id, ...rest }) => rest);
      const result = await summarizeLogs({ logs: logsToSummarize });
      setSummary(result.summary);
      setIsSummaryDialogOpen(true);
    } catch (error) {
      console.error("AI summarization failed:", error);
      toast({
        variant: "destructive",
        title: "AI Summarization Failed",
        description: "There was an error generating the summary. Please try again.",
      });
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleEdit = (log: Log) => {
    setEditingLog(log);
    setIsSheetOpen(true);
  };
  
  const handleSheetOpenChange = (open: boolean) => {
    setIsSheetOpen(open);
    if (!open) {
      setEditingLog(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          Communication Logs
        </h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleSummarize} disabled={isSummarizing}>
            {isSummarizing ? (
              <>
                <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                Summarizing...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Summarize with AI
              </>
            )}
          </Button>
          <Sheet open={isSheetOpen} onOpenChange={handleSheetOpenChange}>
            <SheetTrigger asChild>
              <Button onClick={() => setIsSheetOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Log
              </Button>
            </SheetTrigger>
            <SheetContent className="sm:max-w-lg flex flex-col">
              <SheetHeader>
                <SheetTitle>{editingLog ? "Edit Communication Log" : "Add Communication Log"}</SheetTitle>
                <SheetDescription>
                  {editingLog ? "Update the details of this interaction." : "Record a new interaction with a client."}
                </SheetDescription>
              </SheetHeader>
              <ScrollArea className="flex-1 -mx-6">
                <div className="px-6">
                  <LogForm onSubmit={handleFormSubmit} clients={clients} initialData={editingLog} />
                </div>
              </ScrollArea>
            </SheetContent>
          </Sheet>
        </div>
      </div>
      <DataTable columns={columns} data={logs} meta={{ editLog: handleEdit }} />
      <Dialog open={isSummaryDialogOpen} onOpenChange={setIsSummaryDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI Summary of Communication Logs
            </DialogTitle>
            <DialogDescription>
              Here is a concise summary of the recent communications.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[50vh] pr-4">
            <div className="whitespace-pre-wrap text-sm">
                {summary}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function LogForm({ 
  onSubmit, 
  clients, 
  initialData 
}: { 
  onSubmit: (data: LogFormValues) => void; 
  clients: Client[];
  initialData?: Log | null;
}) {
  const form = useForm<LogFormValues>({
    resolver: zodResolver(logFormSchema),
    defaultValues: initialData || {
      clientName: "",
      communicationDate: new Date().toISOString().split("T")[0],
      channel: "Email",
      notes: "",
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        ...initialData,
        communicationDate: new Date(initialData.communicationDate).toISOString().split("T")[0],
      });
    } else {
      form.reset({
        clientName: "",
        communicationDate: new Date().toISOString().split("T")[0],
        channel: "Email",
        notes: "",
      });
    }
  }, [initialData, form]);

  const uniqueCompanyNames = [...new Set(clients.map((client) => client.company))];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
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
        <FormField control={form.control} name="communicationDate" render={({ field }) => (
            <FormItem><FormLabel>Communication Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="channel" render={({ field }) => (
            <FormItem><FormLabel>Channel</FormLabel><Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                <SelectContent>
                    <SelectItem value="Email">Email</SelectItem>
                    <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                    <SelectItem value="Meeting">Meeting</SelectItem>
                </SelectContent>
            </Select><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="notes" render={({ field }) => (
            <FormItem><FormLabel>Notes</FormLabel><FormControl><Textarea {...field} className="min-h-[120px]" /></FormControl><FormMessage /></FormItem>
        )} />

        <Button type="submit" className="w-full mt-4">{initialData ? "Save Changes" : "Save Log"}</Button>
      </form>
    </Form>
  );
}
