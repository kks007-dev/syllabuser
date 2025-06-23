// Summarizes the key topics, grading policies, and important dates from a syllabus.

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeSyllabusInputSchema = z.object({
  syllabusText: z.string().describe('The text content of the syllabus.'),
});
export type SummarizeSyllabusInput = z.infer<typeof SummarizeSyllabusInputSchema>;

const SummarizeSyllabusOutputSchema = z.object({
  summary: z.string().describe('A summary of the syllabus, including key topics, grading policies, and important dates.'),
});
export type SummarizeSyllabusOutput = z.infer<typeof SummarizeSyllabusOutputSchema>;

export async function summarizeSyllabus(input: SummarizeSyllabusInput): Promise<SummarizeSyllabusOutput> {
  return summarizeSyllabusFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeSyllabusPrompt',
  input: {schema: SummarizeSyllabusInputSchema},
  output: {schema: SummarizeSyllabusOutputSchema},
  prompt: `You are an AI assistant designed to summarize syllabi.

  Summarize the following syllabus, extracting key topics, grading policies, and important dates:

  {{syllabusText}}`,
});

const summarizeSyllabusFlow = ai.defineFlow(
  {
    name: 'summarizeSyllabusFlow',
    inputSchema: SummarizeSyllabusInputSchema,
    outputSchema: SummarizeSyllabusOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
