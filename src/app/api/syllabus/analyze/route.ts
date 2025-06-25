import { NextRequest, NextResponse } from 'next/server';
import { PdfReader } from 'pdfreader';
import { extractDatesFromSyllabus } from '@/ai/flows/extract-dates-from-syllabus';

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

function extractCourseName(text: string): string {
  // Try to find a line like: ENGR 1300: Transformation
  const match = text.match(/([A-Z]{2,5}\s?\d{3,4}:?\s?.+)/);
  if (match && match[1]) return match[1].trim();

  // Try to find a line like: Course: ENGR 1300: Transformation
  const match2 = text.match(/Course:\s*([A-Z]{2,5}\s?\d{3,4}:?\s?.+)/i);
  if (match2 && match2[1]) return match2[1].trim();

  // Fallback: first non-empty line
  const firstLine = text.split('\n').find(line => line.trim().length > 0);
  return firstLine ? firstLine.trim() : 'Syllabus Events';
}

export async function POST(request: NextRequest) {
  try {
    // Parse the multipart form data
    const formData = await request.formData();
    const file = formData.get('file');
    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Extract text from PDF
    const text = await extractTextFromPDF(buffer);
    const courseName = extractCourseName(text);

    // Use Gemini AI to extract events
    const dates = await extractDatesFromSyllabus({ syllabusText: text });
    const sortedDates = dates.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return NextResponse.json({ success: true, data: sortedDates, courseName });
  } catch (error) {
    console.error('Syllabus analysis failed:', error);
    return NextResponse.json({ success: false, error: 'Could not analyze the syllabus. The AI service may be down or the document format is not supported.' }, { status: 500 });
  }
} 