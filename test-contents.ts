import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

const client = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function run() {
  const schema = {
    type: Type.OBJECT,
    properties: {
      vendorName: { type: Type.STRING }
    },
    required: ['vendorName']
  };

  try {
    console.log('Test 1 with gemini-2.5-flash: contents as [{ text: ... }]');
    const response1 = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          text: 'Vendor is Flipkart'
        }
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: schema
      }
    });
    console.log('Test 1 success:', response1.text);
  } catch (err: any) {
    console.error('Test 1 failed:', err.message);
  }

  try {
    console.log('Test 2 with gemini-2.5-flash: contents as a simple string');
    const response2 = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'Vendor is Flipkart',
      config: {
        responseMimeType: 'application/json',
        responseSchema: schema
      }
    });
    console.log('Test 2 success:', response2.text);
  } catch (err: any) {
    console.error('Test 2 failed:', err.message);
  }
}

run();
