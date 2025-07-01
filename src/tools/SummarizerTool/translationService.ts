import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error("VITE_GEMINI_API_KEY is not set in the environment variables. Please add it to your .env file.");
}

const genAI = new GoogleGenerativeAI(API_KEY);

export const translateText = async (text: string, sourceLanguage: string, targetLanguage: string): Promise<string> => {
  if (!text.trim()) {
    return "";
  }

  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

  const languageNames: Record<string, string> = {
    'en': 'English',
    'es': 'Spanish',
    'fr': 'French',
    'de': 'German',
    'it': 'Italian',
    'pt': 'Portuguese',
    'ru': 'Russian',
    'ja': 'Japanese',
    'ko': 'Korean',
    'zh': 'Chinese',
    'ar': 'Arabic',
    'auto': 'Auto-detect'
  };

  const sourceLangName = languageNames[sourceLanguage] || sourceLanguage;
  const targetLangName = languageNames[targetLanguage] || targetLanguage;

  const prompt = sourceLanguage === 'auto' 
    ? `Translate the following text to ${targetLangName}. Detect the source language automatically and provide an accurate translation:\n\n${text}`
    : `Translate the following text from ${sourceLangName} to ${targetLangName}:\n\n${text}`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const translation = response.text();
    return translation;
  } catch (error) {
    console.error("Error translating text with Gemini API:", error);
    throw new Error("Failed to translate text. Please try again.");
  }
}; 