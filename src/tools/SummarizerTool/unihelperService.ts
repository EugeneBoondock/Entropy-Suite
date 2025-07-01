import { GoogleGenerativeAI } from "@google/generative-ai";
import { generateUniversityContext, shouldUseProspectusFiles, detectRelevantUniversities, extractTextFromProspectus, extractAdmissionSections } from "./prospectusManager";

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

const SYSTEM_PROMPT_TEXT = `You are Unihelper, an expert AI assistant for South African university applicants. Your primary goal is to provide accurate, concise information based *only* on the provided document context.

**Core Directives:**
1.  **Strictly Fact-Based:** Your answers about universities (courses, admission requirements, fees, etc.) **must** be derived *exclusively* from the text provided in the 'RELEVANT PROSPECTUS EXTRACT'. Do not use your general knowledge or any outside information for these topics.
2.  **Admit When Unsure:** If you cannot find a specific answer within the provided text, you **must** state: "I could not find specific information about that in the provided documents." Do not invent courses, deadlines, or requirements.
3.  **Be Concise:** Keep your responses short, clear, and to the point. Use bullet points or short paragraphs to make information easy to digest. Avoid long, overwhelming walls of text.
4.  **NSFAS Expert:** For questions about NSFAS, use the official 'How To' guide (NSFAS.pdf) to provide accurate, step-by-step guidance.
5.  **Be Encouraging:** Maintain a positive, helpful, and supportive tone. Applying to university is stressful.

**Your Role-Play:**
You are a friendly and professional university guidance counselor. You ask clarifying questions to better understand the student's needs before providing information.
`;

export const sendUnihelperMessage = async (messages: ChatHistory): Promise<string> => {
  if (!messages || messages.length === 0) {
    return "Hello! I'm Unihelper, your AI assistant for South African university applications, NSFAS, and scholarships. How can I help you today?";
  }

  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

  try {
    // Get the latest message
    const latestMessage = messages[messages.length - 1];
    if (!latestMessage || latestMessage.role !== 'user') {
      return "I need a question from you to help with!";
    }

    // Check if we should include university context
    const universityContext = generateUniversityContext(latestMessage.content);
    const relevantUniversities = detectRelevantUniversities(latestMessage.content);
    let admissionText = '';
    // If the query is about APS/admission, extract from the top university's prospectus
    if (shouldUseProspectusFiles(latestMessage.content) && relevantUniversities.length > 0) {
      const uni = relevantUniversities[0];
      try {
        const fullText = await extractTextFromProspectus(uni.filename);
        admissionText = extractAdmissionSections(fullText);
      } catch (err) {
        console.warn('Could not extract admission/APS info from prospectus:', err);
      }
    }

    // Enhance system prompt with detected university context and admission/APS text
    let enhancedSystemPrompt = SYSTEM_PROMPT_TEXT;
    if (shouldUseProspectusFiles(latestMessage.content)) {
      enhancedSystemPrompt += universityContext;
      if (relevantUniversities.length > 0) {
        enhancedSystemPrompt += `\n\n🔍 QUERY ANALYSIS: This question appears to be about ${relevantUniversities.map(u => u.name).join(', ')}. Provide specific, detailed information about these institutions.`;
      }
      if (admissionText) {
        enhancedSystemPrompt += `\n\n📑 RELEVANT PROSPECTUS EXTRACT:\n${admissionText}`;
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