export type Client = {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  project: string;
  status: "Active" | "On Hold" | "Completed" | "Cancelled";
  cooperationDate: string;
  notes: string;
};

export type Project = {
  id: string;
  projectName: string;
  clientName: string;
  deadline: string;
  status: "In Progress" | "Completed" | "Pending" | "Overdue";
  pic: string;
};

export type Log = {
  id: string;
  clientName: string;
  communicationDate: string;
  channel: "Email" | "WhatsApp" | "Meeting";
  notes: string;
};

// Mock data has been removed and will be fetched from Firebase.
