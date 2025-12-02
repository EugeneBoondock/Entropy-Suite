import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.GEMINI_API_KEY;

let genAI: GoogleGenerativeAI | null = null;

if (!API_KEY) {
  console.warn("GEMINI_API_KEY is not set in the environment variables. Translation features will be disabled.");
} else {
  genAI = new GoogleGenerativeAI(API_KEY);
}

export const translateText = async (text: string, sourceLanguage: string, targetLanguage: string): Promise<string> => {
  if (!text.trim()) {
    return text;
  }

  if (!genAI) {
    return "Translation service is currently unavailable due to missing API configuration.";
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
    'hi': 'Hindi',
    'af': 'Afrikaans',
    'zu': 'Zulu',
    'xh': 'Xhosa',
    'st': 'Sesotho',
    'tn': 'Setswana',
    'ss': 'Siswati',
    've': 'Tshivenda',
    'ts': 'Xitsonga',
    'nr': 'Ndebele'
  };

  const sourceLang = languageNames[sourceLanguage] || sourceLanguage;
  const targetLang = languageNames[targetLanguage] || targetLanguage;

  const prompt = `Translate the following text from ${sourceLang} to ${targetLang}. Only return the translation, no explanations:

${text}`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const translation = response.text();
    return translation;
  } catch (error) {
    console.error("Translation error:", error);
    throw new Error("Failed to translate text. Please try again.");
  }
}; 