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

**CURRENT CONTEXT: Today is August 24, 2025**

**Your task:** Carefully analyze the syllabus text to identify the academic year and semester.

**Look for these indicators (in order of priority):**
1. **Explicit semester/year statements**: "Fall 2025", "Spring 2026", "Summer 2025"
2. **Academic year ranges**: "Academic Year 2025-2026", "AY 2025-26"
3. **Course scheduling**: "ENGR 1300 - Fall 2025", "CS 101 Spring 2026"
4. **Full dates with years**: Any complete dates mentioned (e.g., "September 15, 2025")
5. **Document metadata**: Copyright dates, "Last updated" dates
6. **Calendar references**: Academic calendar years mentioned

**Critical Rules for academic year determination:**
- Current date context: It's August 24, 2025 (late summer/early fall)
- Fall semester 2025 = August-December 2025 (MOST LIKELY for current uploads)
- Spring semester 2026 = January-May 2026
- Summer semester 2025 = May-August 2025 (ending soon)
- If you see "Academic Year 2025-2026": Fall 2025, Spring 2026, Summer 2026

**IMPORTANT YEAR LOGIC:**
- Since it's August 2025, NEW syllabi are most likely for Fall 2025 or later
- DO NOT default to 2024 unless explicitly stated in the syllabus
- If semester is mentioned without year, assume:
  * "Fall" = Fall 2025 (current upcoming semester)
  * "Spring" = Spring 2026 (next spring)
  * "Summer" = Summer 2026 (next summer)

**If no explicit year found:**
- For Fall semester mentions: Default to 2025
- For Spring semester mentions: Default to 2026  
- For Summer semester mentions: Default to 2026
- If no semester indicators, analyze event timing and default to 2025-2026 academic year

**Return the MOST LIKELY academic year based on current date context (August 2025).**

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

**CURRENT CONTEXT: Today is August 24, 2025**

**DETECTED ACADEMIC CONTEXT:**
- Primary Year: {{{detectedYear}}}
- Semester: {{{semester}}}
- Evidence: {{{evidence}}}

**INSTRUCTIONS:**
- Use the detected year ({{{detectedYear}}}) for all dates that don't have explicit years
- For academic year spans: 
  * Academic Year 2025-2026: Fall dates = 2025, Spring dates = 2026
  * Academic Year 2024-2025: Fall dates = 2024, Spring dates = 2025
- Extract every date associated with assignments, tests, quizzes, projects, presentations, holidays, or academic events
- Format all dates as YYYY-MM-DD using the correct year identified above
- NEVER use years before the detected year unless explicitly stated

**YEAR APPLICATION RULES:**
- If detected year is 2025 and semester is Fall: "October 15" → "2025-10-15"
- If detected year is 2026 and semester is Spring: "March 20" → "2026-03-20"  
- If academic year is 2025-2026: 
  * Fall events (Aug-Dec): "November 15" → "2025-11-15"
  * Spring events (Jan-May): "February 10" → "2026-02-10"
  * Summer events (May-Aug): "June 5" → "2026-06-05"

**MONTH-TO-SEMESTER MAPPING:**
- August, September, October, November, December = Fall semester
- January, February, March, April, May = Spring semester  
- June, July, August = Summer semester

**CRITICAL: Always use the detected year or later. Do not use years before {{{detectedYear}}} unless explicitly mentioned in the syllabus.**

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
