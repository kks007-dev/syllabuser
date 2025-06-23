'use server';

import { extractDatesFromSyllabus, type ExtractDatesFromSyllabusOutput } from '@/ai/flows/extract-dates-from-syllabus';

// This is a hardcoded sample syllabus text.
// In a real-world application, you would use a library like 'pdf-parse' on the server
// or 'pdfjs-dist' on the client to extract text from the uploaded PDF file.
const FAKE_SYLLABUS_TEXT = `
Course: CSCE 482: Senior Capstone Design
Instructor: Dr. John Doe
Semester: Fall 2024

Important Dates:
- Project Proposal Due: 2024-09-10. This is a critical first step for our capstone. It should be a 5 page document.
- Mid-term Presentation: 2024-10-15. Group presentation of progress. Each group will have 15 minutes.
- Final Report Draft: 2024-11-20. Submit for feedback from the TAs and instructor.
- Test 1: 2024-09-25. Covers all material from the first month.
- Test 2: 2024-11-05. Covers material after the midterm.
- Final Exam: 2024-12-12. In-class final examination. Location: ZACH 222.
- Final Presentation & Demo: 2024-12-14. Final project showcase.
`;

export async function processSyllabus(
  fileName: string
): Promise<{ success: true; data: ExtractDatesFromSyllabusOutput } | { success: false; error: string }> {
  console.log(`Processing syllabus for: ${fileName}`);
  // In a real app, you would parse the file here. We are using fake text.
  try {
    // Add a fake delay to simulate processing
    await new Promise(resolve => setTimeout(resolve, 2500));
    const dates = await extractDatesFromSyllabus({ syllabusText: FAKE_SYLLABUS_TEXT });
    
    // Sort dates chronologically
    const sortedDates = dates.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    return { success: true, data: sortedDates };
  } catch (error) {
    console.error('AI processing failed:', error);
    return { success: false, error: 'Could not analyze the syllabus. The AI service may be down or the document format is not supported.' };
  }
}
