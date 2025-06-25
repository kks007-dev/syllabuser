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
  prompt: `
You are an AI assistant that extracts ALL important academic events from a course syllabus.

**Instructions:**
- Extract every date that is associated with an assignment, test, quiz, project, presentation, holiday, or any other important academic event.
- Include events even if they are described in sentences, tables, or lists.
- For each event, provide:
  - 'date': The date in YYYY-MM-DD format (if only a month/day is given, use the year from the syllabus header or context).
  - 'type': assignment, test, quiz, project, presentation, holiday, or other (be descriptive).
  - 'description': A brief description of the event (e.g., "Final Project Due", "Midterm Exam", "Spring Break", etc.).

**Examples:**
Syllabus text:
- Project Proposal Due: 2024-09-10. This is a critical first step.
- The midterm exam will be held on October 15, 2024.
- Thanksgiving Break: November 23-27, 2024.
- Final presentations are scheduled for December 14.

Output:
[
  {"date": "2024-09-10", "type": "assignment", "description": "Project Proposal Due"},
  {"date": "2024-10-15", "type": "test", "description": "Midterm Exam"},
  {"date": "2024-11-23", "type": "holiday", "description": "Thanksgiving Break Start"},
  {"date": "2024-11-27", "type": "holiday", "description": "Thanksgiving Break End"},
  {"date": "2024-12-14", "type": "presentation", "description": "Final Presentations"}
]

Now, analyze the following syllabus and output all events as a JSON array as shown above.

Syllabus Text: {{{syllabusText}}}
`
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
