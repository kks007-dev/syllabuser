'use server';

/**
 * @fileOverview Extracts assignment and test dates from a syllabus PDF with improved year detection.
 *
 * This module uses a two-step AI process:
 * 1. First, it analyzes the syllabus to detect the correct academic year and semester
 * 2. Then, it extracts all dates using the detected year context for accurate date formatting
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

// Schema for year detection step
const YearDetectionSchema = z.object({
  academicYear: z.string().describe("The primary academic year identified from the syllabus (e.g., '2024', '2025')"),
  semester: z.string().describe("The semester (Fall, Spring, Summer) if identified"),
  confidence: z.string().describe("High, Medium, or Low confidence in year detection"),
  evidence: z.string().describe("The text or context that led to this year determination"),
});

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

// First step: Detect the academic year from the syllabus
const yearDetectionPrompt = ai.definePrompt({
  name: 'yearDetectionPrompt',
  input: {schema: ExtractDatesFromSyllabusInputSchema},
  output: {schema: YearDetectionSchema},
  prompt: `
You are an expert at analyzing academic syllabi to determine the correct academic year and semester.

**Your task:** Carefully analyze the syllabus text to identify the academic year and semester.

**Look for these indicators (in order of priority):**
1. **Explicit semester/year statements**: "Fall 2024", "Spring 2025", "Summer 2024"
2. **Academic year ranges**: "Academic Year 2024-2025", "AY 2024-25"
3. **Course scheduling**: "ENGR 1300 - Fall 2024", "CS 101 Spring 2025"
4. **Full dates with years**: Any complete dates mentioned (e.g., "September 15, 2024")
5. **Document metadata**: Copyright dates, "Last updated" dates
6. **Calendar references**: Academic calendar years mentioned

**Critical Rules for academic year determination:**
- Current date context: It's August 24, 2025
- Fall semester = August-December (e.g., Fall 2025 = Aug-Dec 2025)
- Spring semester = January-May (e.g., Spring 2025 = Jan-May 2025)  
- Summer semester = May-August (e.g., Summer 2025 = May-Aug 2025)
- If you see "Academic Year 2024-2025": Fall 2024, Spring 2025, Summer 2025
- If you see "Academic Year 2025-2026": Fall 2025, Spring 2026, Summer 2026

**Default year logic (when no explicit year found):**
- If current date is August 2025 and semester appears to be Fall: assume Fall 2025
- If current date is August 2025 and semester appears to be Spring: assume Spring 2026
- If no semester indicators, analyze event timing to determine most likely year

**Return the MOST LIKELY academic year based on the strongest evidence found.**
**Be very careful about year boundaries - don't default to old years when current context suggests newer years.**

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
    // Step 1: Detect the academic year
    const {output: yearInfo} = await yearDetectionPrompt(input);
    
    // Step 2: Extract dates using the detected year information
    const enhancedPrompt = ai.definePrompt({
      name: 'enhancedExtractDatesPrompt',
      input: {
        schema: z.object({
          syllabusText: z.string(),
          detectedYear: z.string(),
          semester: z.string(),
          evidence: z.string(),
        })
      },
      output: {schema: ExtractDatesFromSyllabusOutputSchema},
      prompt: `
Based on the year detection analysis, extract all academic events from this syllabus.

**DETECTED ACADEMIC CONTEXT:**
- Primary Year: {{{detectedYear}}}
- Semester: {{{semester}}}
- Evidence: {{{evidence}}}

**INSTRUCTIONS:**
- Use the detected year ({{{detectedYear}}}) for all dates that don't have explicit years
- For academic year spans (e.g., 2024-2025): use 2024 for Fall semester dates, 2025 for Spring semester dates
- Extract every date associated with assignments, tests, quizzes, projects, presentations, holidays, or academic events
- Format all dates as YYYY-MM-DD using the correct year identified above

**EXAMPLES OF YEAR APPLICATION:**
- If detected year is 2024 and semester is Fall: "October 15" → "2024-10-15"
- If detected year is 2025 and semester is Spring: "March 20" → "2025-03-20"  
- If academic year is 2024-2025: "November 15" (Fall) → "2024-11-15", "February 10" (Spring) → "2025-02-10"

Syllabus Text: {{{syllabusText}}}
`
    });
    
    const {output} = await enhancedPrompt({
      syllabusText: input.syllabusText,
      detectedYear: yearInfo!.academicYear,
      semester: yearInfo!.semester,
      evidence: yearInfo!.evidence,
    });
    
    return output!;
  }
);
