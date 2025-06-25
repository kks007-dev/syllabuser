'use server';

import { PdfReader } from 'pdfreader';
import { extractDatesFromSyllabus, type ExtractDatesFromSyllabusOutput } from '@/ai/flows/extract-dates-from-syllabus';

function extractTextFromPDF(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    let text = '';
    new PdfReader().parseBuffer(buffer, (err, item) => {
      if (err) reject(err);
      else if (!item) resolve(text);
      else if (item.text) text += item.text + ' ';
    });
  });
}

export async function processSyllabus(
  file: File | Buffer
): Promise<{ success: true; data: ExtractDatesFromSyllabusOutput } | { success: false; error: string }> {
  try {
    // Convert File to Buffer if needed
    const buffer = file instanceof Buffer ? file : Buffer.from(await (file as File).arrayBuffer());

    // 1. Extract text from PDF
    const text = await extractTextFromPDF(buffer);

    // 2. Use Gemini AI to extract events
    const dates = await extractDatesFromSyllabus({ syllabusText: text });
    const sortedDates = dates.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return { success: true, data: sortedDates };
  } catch (error) {
    console.error('AI processing failed:', error);
    return { success: false, error: 'Could not analyze the syllabus. The AI service may be down or the document format is not supported.' };
  }
}
