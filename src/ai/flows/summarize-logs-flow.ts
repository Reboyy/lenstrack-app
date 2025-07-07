'use server';
/**
 * @fileOverview An AI flow for summarizing communication logs.
 *
 * - summarizeLogs - A function that takes communication logs and returns a summary.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const LogSchema = z.object({
  clientName: z.string(),
  communicationDate: z.string(),
  channel: z.string(),
  notes: z.string(),
});

const SummarizeLogsInputSchema = z.object({
  logs: z.array(LogSchema).describe('A list of communication logs to be summarized.'),
});
type SummarizeLogsInput = z.infer<typeof SummarizeLogsInputSchema>;

const SummarizeLogsOutputSchema = z.object({
    summary: z.string().describe('A concise summary of the provided communication logs.'),
});
type SummarizeLogsOutput = z.infer<typeof SummarizeLogsOutputSchema>;

export async function summarizeLogs(input: SummarizeLogsInput): Promise<SummarizeLogsOutput> {
  return summarizeLogsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeLogsPrompt',
  input: {schema: SummarizeLogsInputSchema},
  output: {schema: SummarizeLogsOutputSchema},
  prompt: `You are an expert business analyst. Your task is to summarize a series of communication logs with a client.
Provide a concise, high-level summary that captures the key points, decisions, and action items from the logs.
Focus on the most recent and relevant information.

Here are the communication logs:
{{#each logs}}
- Date: {{communicationDate}}
- Client: {{clientName}}
- Channel: {{channel}}
- Notes: {{{notes}}}
---
{{/each}}
`,
});

const summarizeLogsFlow = ai.defineFlow(
  {
    name: 'summarizeLogsFlow',
    inputSchema: SummarizeLogsInputSchema,
    outputSchema: SummarizeLogsOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
