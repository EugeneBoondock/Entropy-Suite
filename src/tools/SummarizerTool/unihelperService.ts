import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error("VITE_GEMINI_API_KEY is not set in the environment variables. Please add it to your .env file.");
}

const genAI = new GoogleGenerativeAI(API_KEY);

export type Message = {
  role: "user" | "model";
  content: string;
};

export type ChatHistory = Message[];

const SYSTEM_PROMPT_TEXT = `You are Unihelper, an expert AI assistant for South African university applicants. You help students choose what to apply for, and guide them through NSFAS and scholarship applications. 

You have knowledge of South African universities and their requirements, NSFAS application processes, scholarship opportunities, and admission criteria. Be concise, friendly, and clear in your responses. 

Key areas you help with:
- University application guidance
- Course and program recommendations
- NSFAS application assistance
- Scholarship information
- Admission requirements
- Application deadlines
- Career guidance related to university choices

Always provide helpful, accurate information and ask clarifying questions when needed. If you don't know something specific, say so and suggest where they might find that information.`;

export const sendUnihelperMessage = async (messages: ChatHistory): Promise<string> => {
  if (!messages || messages.length === 0) {
    return "Please ask me a question about university applications, NSFAS, or scholarships!";
  }

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });

  try {
    // Convert our messages to Gemini format with system prompt
    const conversationHistory = [
      { role: 'user' as const, parts: [{ text: SYSTEM_PROMPT_TEXT }] },
      { role: 'model' as const, parts: [{ text: "I understand. I'm Unihelper, and I'll help with university applications, NSFAS, and scholarship guidance for South African students." }] },
      ...messages.map(msg => ({
        role: msg.role as 'user' | 'model',
        parts: [{ text: msg.content }]
      }))
    ];

    // Get the latest message to send
    const latestMessage = messages[messages.length - 1];
    if (!latestMessage || latestMessage.role !== 'user') {
      return "I need a question from you to help with!";
    }

    // If we have conversation history, use chat session
    if (messages.length > 1) {
      // Remove the latest message from history since we'll send it separately
      const historyWithoutLatest = conversationHistory.slice(0, -1);
      
      const chat = model.startChat({
        history: historyWithoutLatest,
      });
      
      const result = await chat.sendMessage(latestMessage.content);
      const response = await result.response;
      return response.text();
    } else {
      // Single message with system prompt
      const fullPrompt = `${SYSTEM_PROMPT_TEXT}\n\nUser: ${latestMessage.content}`;
      const result = await model.generateContent(fullPrompt);
      const response = await result.response;
      return response.text();
    }
  } catch (error) {
    console.error("Error sending unihelper message:", error);
    throw new Error("Failed to send message. Please try again.");
  }
}; 