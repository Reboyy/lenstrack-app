"use client"
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Briefcase, UserPlus, TrendingUp } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { getDatabase, ref, onValue } from 'firebase/database';
import { db } from '@/lib/firebase';
import { Client, Project } from '@/data/mock';

const chartData = [
  { name: 'Jan', clients: 0, projects: 0 },
  { name: 'Feb', clients: 0, projects: 0 },
  { name: 'Mar', clients: 0, projects: 0 },
  { name: 'Apr', clients: 0, projects: 0 },
  { name: 'May', clients: 0, projects: 0 },
  { name: 'Jun', clients: 0, projects: 0 },
];


export default function DashboardPage() {
  const [totalClients, setTotalClients] = useState(0);
  const [activeProjects, setActiveProjects] = useState(0);
  const [newClientsThisMonth, setNewClientsThisMonth] = useState(0);

  useEffect(() => {
    const clientsRef = ref(db, 'clients');
    const projectsRef = ref(db, 'projects');

    const unsubscribeClients = onValue(clientsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const clientsList: Client[] = Object.values(data);
        setTotalClients(clientsList.length);
        
        const today = new Date();
        const newThisMonth = clientsList.filter(c => {
          if (!c.cooperationDate) return false;
          const clientDate = new Date(c.cooperationDate);
          return clientDate.getMonth() === today.getMonth() && clientDate.getFullYear() === today.getFullYear();
        }).length;
        setNewClientsThisMonth(newThisMonth);
      } else {
        setTotalClients(0);
        setNewClientsThisMonth(0);
      }
    });

    const unsubscribeProjects = onValue(projectsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const projectsList: Project[] = Object.values(data);
        const active = projectsList.filter(p => p.status === 'In Progress').length;
        setActiveProjects(active);
      } else {
        setActiveProjects(0);
      }
    });
    
    return () => {
      unsubscribeClients();
      unsubscribeProjects();
    }
  }, []);


  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-headline text-3xl font-bold tracking-tight">
        Dashboard
      </h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Clients"
          value={totalClients}
          icon={Users}
          description="All registered clients"
        />
        <StatCard
          title="Active Projects"
          value={activeProjects}
          icon={Briefcase}
          description="Projects currently in progress"
        />
        <StatCard
          title="New Clients This Month"
          value={newClientsThisMonth}
          icon={UserPlus}
          description="Clients registered in the current month"
        />
      </div>

      <Card className="col-span-1 lg:col-span-2 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Client & Project Trends
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[350px] w-full p-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12}/>
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  borderColor: "hsl(var(--border))",
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="clients" stroke="hsl(var(--primary))" strokeWidth={2} name="New Clients" />
              <Line type="monotone" dataKey="projects" stroke="hsl(var(--accent))" strokeWidth={2} name="New Projects" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ElementType;
  description: string;
}

function StatCard({ title, value, icon: Icon, description }: StatCardProps) {
  return (
    <Card className="shadow-sm transition-all hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
