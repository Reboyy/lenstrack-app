'use server';
/**
 * @fileOverview An AI flow for generating a comprehensive client overview.
 *
 * - generateClientOverview - A function that takes client data, projects, and logs to return a detailed summary.
 * - ClientOverviewInput - The input type for the generateClientOverview function.
 * - ClientOverviewOutput - The return type for the generateClientOverview function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Schemas are not exported because of 'use server' constraints
const ClientSchema = z.object({
  id: z.string(),
  name: z.string(),
  company: z.string(),
  email: z.string(),
  phone: z.string(),
  project: z.string(),
  status: z.enum(["Active", "On Hold", "Completed", "Cancelled"]),
  cooperationDate: z.string(),
  notes: z.string(),
});

const ProjectSchema = z.object({
  id: z.string(),
  projectName: z.string(),
  clientName: z.string(),
  deadline: z.string(),
  status: z.enum(["In Progress", "Completed", "Pending", "Overdue"]),
  pic: z.string(),
});

const LogSchema = z.object({
  id: z.string(),
  clientName: z.string(),
  communicationDate: z.string(),
  channel: z.enum(["Email", "WhatsApp", "Meeting"]),
  notes: z.string(),
});


const ClientOverviewInputSchema = z.object({
  client: ClientSchema.describe("The client's primary data."),
  projects: z.array(ProjectSchema).describe("A list of all projects associated with this client."),
  logs: z.array(LogSchema).describe("A list of all communication logs associated with this client."),
});
export type ClientOverviewInput = z.infer<typeof ClientOverviewInputSchema>;

const ClientOverviewOutputSchema = z.object({
    summary: z.string().describe("A high-level summary of the client's current standing and relationship."),
    projectStatus: z.string().describe("An overview of the client's project statuses, mentioning active, completed, or overdue projects."),
    communicationInsights: z.string().describe("Key insights from recent communications, including sentiment and important discussion points."),
    risksAndRecommendations: z.string().describe("Identified potential risks (e.g., approaching deadlines, negative sentiment) and actionable recommendations."),
});
export type ClientOverviewOutput = z.infer<typeof ClientOverviewOutputSchema>;

export async function generateClientOverview(input: ClientOverviewInput): Promise<ClientOverviewOutput> {
  return clientOverviewFlow(input);
}

const prompt = ai.definePrompt({
  name: 'clientOverviewPrompt',
  input: { schema: ClientOverviewInputSchema },
  output: { schema: ClientOverviewOutputSchema },
  prompt: `You are an expert project manager and business analyst. Your task is to generate a comprehensive overview of a client based on their profile, associated projects, and communication logs. Provide a clear, concise, and actionable summary.

Analyze the following data:

CLIENT INFORMATION:
- Name: {{client.name}}
- Company: {{client.company}}
- Status: {{client.status}}
- Cooperation Start Date: {{client.cooperationDate}}
- Internal Notes: {{{client.notes}}}

ASSOCIATED PROJECTS:
{{#if projects}}
  {{#each projects}}
  - Project: {{projectName}}
    - Status: {{status}}
    - Deadline: {{deadline}}
    - PIC: {{pic}}
  ---
  {{/each}}
{{else}}
- No projects found for this client.
{{/if}}

COMMUNICATION LOGS:
{{#if logs}}
  {{#each logs}}
  - Date: {{communicationDate}}
    - Channel: {{channel}}
    - Notes: {{{notes}}}
  ---
  {{/each}}
{{else}}
- No communication logs found for this client.
{{/if}}

Based on all the information provided, generate the client overview. Be insightful and proactive in your analysis.
- For "summary", provide a brief on the overall client health.
- For "projectStatus", summarize the state of their projects.
- For "communicationInsights", detect the overall tone/sentiment and pull out key recent topics.
- For "risksAndRecommendations", identify potential issues (like tight deadlines, unresolved issues in logs) and suggest next steps. If there are no risks, state that.`,
});

const clientOverviewFlow = ai.defineFlow(
  {
    name: 'clientOverviewFlow',
    inputSchema: ClientOverviewInputSchema,
    outputSchema: ClientOverviewOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
