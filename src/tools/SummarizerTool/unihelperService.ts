import { GoogleGenerativeAI } from "@google/generative-ai";
import { generateUniversityContext, shouldUseProspectusFiles, detectRelevantUniversities } from "./prospectusManager";

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

const SYSTEM_PROMPT_TEXT = `You are Unihelper, an expert AI assistant for South African university applicants and a personalized career guide. You help students choose what to apply for, guide them through NSFAS and scholarship applications, and provide tailored career advice.

You are proactive in asking users questions about their interests, strengths, and goals to give the most relevant guidance. Do not overwhelm the user with too much information at once—be concise, break down complex topics, and offer to provide more details if needed.

You use the official NSFAS 'How To' guide (NSFAS.pdf, located in the prospectuses folder) to provide accurate, step-by-step NSFAS application support and answer any NSFAS-related questions.

You have comprehensive knowledge of South African universities and their requirements, NSFAS application processes, scholarship opportunities, and admission criteria. You are knowledgeable about all 24 major South African universities and can provide specific guidance based on their 2026 prospectuses.

Key areas you excel in:
- University application guidance and deadlines
- Course and program recommendations with admission requirements
- Detailed NSFAS application assistance and eligibility criteria  
- Scholarship information and application procedures
- Admission requirements and academic prerequisites
- Application deadlines and important dates
- Career guidance related to university choices
- Fee structures and financial planning
- Contact information and campus details

Always provide helpful, accurate, and up-to-date information. When discussing specific universities, mention their official names, locations, and relevant details. If you need clarification about a student's specific situation, ask targeted questions to provide the most relevant guidance.

Be encouraging and supportive - applying to university can be stressful, so maintain a positive, helpful tone while being thorough and informative.`;

export const sendUnihelperMessage = async (messages: ChatHistory): Promise<string> => {
  if (!messages || messages.length === 0) {
    return "Hello! I'm Unihelper, your AI assistant for South African university applications, NSFAS, and scholarships. How can I help you today?";
  }

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });

  try {
    // Get the latest message
    const latestMessage = messages[messages.length - 1];
    if (!latestMessage || latestMessage.role !== 'user') {
      return "I need a question from you to help with!";
    }

    // Check if we should include university context
    const universityContext = generateUniversityContext(latestMessage.content);
    const relevantUniversities = detectRelevantUniversities(latestMessage.content);
    
    // Enhance system prompt with detected university context
    let enhancedSystemPrompt = SYSTEM_PROMPT_TEXT;
    
    if (shouldUseProspectusFiles(latestMessage.content)) {
      enhancedSystemPrompt += universityContext;
      
      if (relevantUniversities.length > 0) {
        console.log(`🎯 Detected relevant universities for query:`, relevantUniversities.map(u => u.name));
        enhancedSystemPrompt += `\n\n🔍 QUERY ANALYSIS: This question appears to be about ${relevantUniversities.map(u => u.name).join(', ')}. Provide specific, detailed information about these institutions.`;
      }
    }

    // Convert messages to Gemini format with enhanced system prompt
    const conversationHistory = [
      { role: 'user' as const, parts: [{ text: enhancedSystemPrompt }] },
      { role: 'model' as const, parts: [{ text: "I understand. I'm Unihelper, and I'll provide comprehensive guidance about South African universities, NSFAS, and scholarships with specific details from the 2026 prospectuses." }] },
      ...messages.map(msg => ({
        role: msg.role as 'user' | 'model',
        parts: [{ text: msg.content }]
      }))
    ];

    // Use chat session for conversation history
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
      // Single message with enhanced system prompt
      const fullPrompt = `${enhancedSystemPrompt}\n\nUser: ${latestMessage.content}`;
      const result = await model.generateContent(fullPrompt);
      const response = await result.response;
      return response.text();
    }
  } catch (error) {
    console.error("Error sending unihelper message:", error);
    throw new Error("Failed to send message. Please try again.");
  }
}; 