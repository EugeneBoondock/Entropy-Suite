import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

let genAI: GoogleGenerativeAI | null = null;

if (!API_KEY) {
  console.warn("VITE_GEMINI_API_KEY is not set in the environment variables. Chatbot features will be disabled.");
} else {
  genAI = new GoogleGenerativeAI(API_KEY);
}

export const sendChatMessage = async (message: string, conversationHistory?: Array<{role: 'user' | 'model', parts: Array<{text: string}>}>): Promise<string> => {
  if (!message.trim()) {
    return "Please provide a message.";
  }

  if (!genAI) {
    return "Chatbot service is currently unavailable due to missing API configuration.";
  }

  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

  try {
    // If we have conversation history, use chat session
    if (conversationHistory && conversationHistory.length > 0) {
      const chat = model.startChat({
        history: conversationHistory,
      });
      const result = await chat.sendMessage(message);
      const response = await result.response;
      return response.text();
    } else {
      // Single message
      const result = await model.generateContent(message);
      const response = await result.response;
      return response.text();
    }
  } catch (error) {
    console.error("Error sending chat message with Gemini API:", error);
    throw new Error("Failed to send message. Please try again.");
  }
}; 