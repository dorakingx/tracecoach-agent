import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GOOGLE_API_KEY;
const model = process.env.GEMINI_MODEL || "gemini-3-pro";
const ai = apiKey ? new GoogleGenAI({ apiKey }) : undefined;

export function hasGemini() {
  return Boolean(ai);
}

export async function generateText(prompt: string) {
  if (!ai) {
    throw new Error("GOOGLE_API_KEY is not configured");
  }

  const response = await ai.models.generateContent({
    model,
    contents: prompt
  });

  return response.text ?? "";
}
