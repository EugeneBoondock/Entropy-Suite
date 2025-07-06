import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

let genAI: GoogleGenerativeAI | null = null;

if (!API_KEY) {
  console.warn("VITE_GEMINI_API_KEY is not set in the environment variables. Summarizer features will be disabled.");
} else {
  genAI = new GoogleGenerativeAI(API_KEY);
}

export const summarizeText = async (text: string): Promise<string> => {
  if (!text.trim()) {
    return "No text provided to summarize.";
  }

  if (!genAI) {
    return "Summarizer service is currently unavailable due to missing API configuration.";
  }

  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

  const prompt = `Summarize the following text:\n\n${text}`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const summary = response.text();
    return summary;
  } catch (error) {
    console.error("Error summarizing text with Gemini API:", error);
    throw new Error("Failed to summarize text. Please try again.");
  }
}; 