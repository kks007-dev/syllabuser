/**
 * Test script to verify Gemini API key configuration
 * Run this with: npm run dev:ai or node -r esbuild-register src/test-gemini-config.ts
 */

import { getGeminiApiKey, validateGeminiApiKey } from './lib/gemini-config';

console.log('Testing Gemini API key configuration...');

try {
  const apiKey = getGeminiApiKey();
  console.log('✅ API key found:', apiKey ? `${apiKey.substring(0, 10)}...` : 'undefined');
  
  validateGeminiApiKey();
  console.log('✅ API key validation passed');
  
  console.log('\nEnvironment variables:');
  console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? `${process.env.GEMINI_API_KEY.substring(0, 10)}...` : 'undefined');
  console.log('NEXT_PUBLIC_GEMINI_API_KEY:', process.env.NEXT_PUBLIC_GEMINI_API_KEY ? `${process.env.NEXT_PUBLIC_GEMINI_API_KEY.substring(0, 10)}...` : 'undefined');
  
} catch (error) {
  console.error('❌ Configuration error:', error);
}
