import { GoogleGenAI } from '@google/genai';
import { env } from '../config/env';

let aiClient: GoogleGenAI | null = null;

export function getGemini(): GoogleGenAI {
  if (!env.geminiApiKey) {
    throw new Error('GEMINI_API_KEY is not configured. Add it to your .env file.');
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey: env.geminiApiKey });
  }
  return aiClient;
}

export function isGeminiConfigured(): boolean {
  return !!env.geminiApiKey;
}

export async function generateText(
  prompt: string,
  systemInstruction?: string
): Promise<string> {
  const ai = getGemini();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    ...(systemInstruction ? { config: { systemInstruction } } : {}),
  });
  return response.text || '';
}

export async function generateJson<T>(
  prompt: string,
  systemInstruction?: string
): Promise<T> {
  const ai = getGemini();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      systemInstruction,
      responseMimeType: 'application/json',
    },
  });
  const text = response.text || '';
  return JSON.parse(text) as T;
}
