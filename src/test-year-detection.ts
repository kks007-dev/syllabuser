/**
 * Test script for the enhanced year detection in syllabus processing
 */

import { extractDatesFromSyllabus } from './ai/flows/extract-dates-from-syllabus';

const sampleSyllabusTexts = [
  {
    name: 'Fall 2025 Syllabus (Current)',
    text: `
    ENGR 1300: Introduction to Engineering
    Fall 2025 Semester
    
    Important Dates:
    - First day of class: August 28
    - Project 1 due: September 15
    - Midterm exam: October 22
    - Thanksgiving break: November 28-29
    - Final project due: December 10
    `
  },
  {
    name: 'Spring 2026 Syllabus',
    text: `
    CS 101: Computer Science Fundamentals
    Spring 2026
    
    Schedule:
    - Classes begin: January 15
    - Assignment 1: February 10
    - Spring break: March 15-22
    - Final exam: May 8
    `
  },
  {
    name: 'Academic Year 2025-2026 Syllabus',
    text: `
    MATH 201: Calculus II
    Academic Year 2025-2026
    
    Fall Semester Events:
    - First quiz: September 20
    - Midterm: November 5
    
    Spring Semester Events:
    - Second midterm: March 12
    - Final exam: May 15
    `
  },
  {
    name: 'No Explicit Year Syllabus (Should default to 2025-2026)',
    text: `
    PHYS 101: Physics Fundamentals
    Fall Semester
    
    Important Dates:
    - Lab begins: September 5
    - First test: October 10
    - Project due: November 20
    - Final exam: December 15
    `
  }
];

async function testYearDetection() {
  console.log('🧪 Testing Enhanced Year Detection in Syllabus Processing\n');
  
  for (const sample of sampleSyllabusTexts) {
    console.log(`📄 Testing: ${sample.name}`);
    console.log('=' .repeat(50));
    
    try {
      const result = await extractDatesFromSyllabus({ syllabusText: sample.text });
      
      console.log('✅ Extracted dates:');
      result.forEach((event, index) => {
        console.log(`  ${index + 1}. ${event.date} - ${event.type}: ${event.description}`);
      });
      
      // Verify years are correctly applied
      const years = result.map(event => event.date.substring(0, 4));
      const uniqueYears = [...new Set(years)];
      console.log(`📅 Years detected: ${uniqueYears.join(', ')}`);
      
    } catch (error) {
      console.error('❌ Error processing syllabus:', error);
    }
    
    console.log('\n');
  }
}

// Only run if this file is executed directly
if (require.main === module) {
  testYearDetection().catch(console.error);
}

export { testYearDetection };
