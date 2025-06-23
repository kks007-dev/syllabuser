'use server';

/**
 * @fileOverview Extracts assignment and test dates from a syllabus PDF.
 *
 * - extractDatesFromSyllabus - A function that handles the date extraction process.
 * - ExtractDatesFromSyllabusInput - The input type for the extractDatesFromSyllabus function.
 * - ExtractDatesFromSyllabusOutput - The return type for the extractDatesFromSyllabus function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractDatesFromSyllabusInputSchema = z.object({
  syllabusText: z
    .string()
    .describe("The text content extracted from the syllabus PDF."),
});
export type ExtractDatesFromSyllabusInput = z.infer<typeof ExtractDatesFromSyllabusInputSchema>;

const ExtractDatesFromSyllabusOutputSchema = z.array(
  z.object({
    date: z.string().describe("The date of the assignment or test (YYYY-MM-DD)."),
    type: z.string().describe("The type of event (e.g., 'assignment', 'test')."),
    description: z.string().describe("A brief description of the assignment or test."),
  })
);
export type ExtractDatesFromSyllabusOutput = z.infer<typeof ExtractDatesFromSyllabusOutputSchema>;

export async function extractDatesFromSyllabus(input: ExtractDatesFromSyllabusInput): Promise<ExtractDatesFromSyllabusOutput> {
  return extractDatesFromSyllabusFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractDatesFromSyllabusPrompt',
  input: {schema: ExtractDatesFromSyllabusInputSchema},
  output: {schema: ExtractDatesFromSyllabusOutputSchema},
  prompt: `You are an AI assistant that extracts assignment and test dates from a syllabus.

  Analyze the following syllabus text and identify all assignment due dates and test dates. Return the dates in YYYY-MM-DD format.
  Categorize each date as either an 'assignment' or 'test'. Provide a brief description of each event.

  Syllabus Text: {{{syllabusText}}}

  Output the extracted dates as a JSON array of objects, each with 'date', 'type', and 'description' fields.
  `,
});

const extractDatesFromSyllabusFlow = ai.defineFlow(
  {
    name: 'extractDatesFromSyllabusFlow',
    inputSchema: ExtractDatesFromSyllabusInputSchema,
    outputSchema: ExtractDatesFromSyllabusOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
