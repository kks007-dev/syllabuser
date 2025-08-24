/**
 * Quick test for 2025 year detection
 */

import { extractDatesFromSyllabus } from './ai/flows/extract-dates-from-syllabus';

const test2025Syllabus = `
CS 150: Data Structures
Fall 2025

Important Dates:
- Assignment 1 due: September 10
- Midterm exam: October 15
- Project due: November 12
- Final exam: December 8
`;

async function quickTest() {
  console.log('🧪 Testing 2025 Year Detection\n');
  
  try {
    const result = await extractDatesFromSyllabus({ syllabusText: test2025Syllabus });
    
    console.log('✅ Extracted dates:');
    result.forEach((event, index) => {
      console.log(`  ${index + 1}. ${event.date} - ${event.type}: ${event.description}`);
    });
    
    // Check if years are 2025
    const years = result.map(event => event.date.substring(0, 4));
    const has2025 = years.some(year => year === '2025');
    const has2024 = years.some(year => year === '2024');
    
    console.log(`\n📅 Results:`);
    console.log(`  - Contains 2025 dates: ${has2025 ? '✅ YES' : '❌ NO'}`);
    console.log(`  - Contains 2024 dates: ${has2024 ? '❌ YES (BAD)' : '✅ NO (GOOD)'}`);
    console.log(`  - Years found: ${[...new Set(years)].join(', ')}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

quickTest().catch(console.error);
