import { GoogleGenerativeAI } from "@google/generative-ai";
import { generateUniversityContext, shouldUseProspectusFiles, detectRelevantUniversities, extractTextFromProspectus, extractAdmissionSections } from "./prospectusManager";
import { 
  retrieveRelevantKnowledge, 
  shouldRetrieveKnowledge, 
  buildSearchQuery, 
  formatKnowledgeContext 
} from "./embeddingService";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

let genAI: GoogleGenerativeAI | null = null;

if (!API_KEY) {
  console.warn("VITE_GEMINI_API_KEY is not set in the environment variables. Unihelper features will be disabled.");
} else {
  genAI = new GoogleGenerativeAI(API_KEY);
}

export type Message = {
  role: "user" | "model";
  content: string;
};

export type ChatHistory = Message[];

const SYSTEM_PROMPT_TEXT = `You are Unihelper, an expert AI assistant for South African university applicants. Your primary goal is to provide accurate, concise information and act as a knowledgeable guidance counselor.

**Core Directives:**
1. **Source of Truth:** Your knowledge about universities (courses, admission requirements, fees, etc.) comes from the comprehensive knowledge base provided in the context. Treat this information as your own expertise.
2. **Seamless Presentation:** Present the information as if it is from your own knowledge. **Do not mention "the document", "the prospectus", "the provided text", or any similar phrases.** Act as an expert.
3. **Admit When Unsure:** If you cannot find a specific answer within the provided context, you **must** state: "I don't have specific information on that. It's always a good idea to check the university's official website for the most current details." Do not invent courses, deadlines, or requirements.
4. **Be Concise:** Keep your responses short, clear, and to the point. Use bullet points or short paragraphs to make information easy to digest. Avoid long, overwhelming walls of text.
5. **NSFAS Expert:** For questions about NSFAS, provide accurate, step-by-step guidance based on your knowledge, but still present it as your own expertise.
6. **Be Encouraging:** Maintain a positive, helpful, and supportive tone. Applying to university is stressful.

**Your Role-Play:**
You are a friendly and professional university guidance counselor. You ask clarifying questions to better understand the student's needs before providing information. You seamlessly integrate the provided information into your conversation.

You were made by Eugene Ncube, dev name is Eugene Boondock, you're on a website called Entropy Suite, you're one of the tools that are offered on the website: https://entropysuite.co.za 
`;

export const sendUnihelperMessage = async (messages: ChatHistory): Promise<string> => {
  if (!messages || messages.length === 0) {
    return "Hello! I'm Unihelper, your AI assistant for South African university applications, NSFAS, and scholarships. How can I help you today?";
  }

  if (!genAI) {
    return "I'm sorry, but Unihelper is currently unavailable due to missing API configuration. Please contact the administrator.";
  }

  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

  try {
    // Get the latest message
    const latestMessage = messages[messages.length - 1];
    if (!latestMessage || latestMessage.role !== 'user') {
      return "I need a question from you to help with!";
    }

    let knowledgeContext = '';
    
    // Use semantic search for knowledge retrieval
    if (shouldRetrieveKnowledge(latestMessage.content)) {
      try {
        // Build search query from recent messages for better context
        const searchQuery = buildSearchQuery(messages);
        console.log('Searching knowledge base with query:', searchQuery);
        
        // Retrieve relevant knowledge chunks
        const knowledgeMatches = await retrieveRelevantKnowledge(searchQuery, 0.6, 20);
        
        if (knowledgeMatches.length > 0) {
          knowledgeContext = formatKnowledgeContext(knowledgeMatches);
          console.log(`Retrieved ${knowledgeMatches.length} relevant knowledge chunks`);
        }
      } catch (error) {
        console.warn('Error retrieving knowledge:', error);
        // Fall back to old method if embedding retrieval fails
      }
    }

    // Fallback to old prospectus method if no knowledge context found
    if (!knowledgeContext) {
      const universityContext = generateUniversityContext(latestMessage.content);
      const relevantUniversities = detectRelevantUniversities(latestMessage.content);
      let prospectusText = '';
      
      if (shouldUseProspectusFiles(latestMessage.content) && relevantUniversities.length > 0) {
        const uni = relevantUniversities[0];
        try {
          prospectusText = await extractTextFromProspectus(uni.filename);
        } catch (err) {
          console.warn(`Could not extract text from prospectus ${uni.filename}:`, err);
          prospectusText = `Failed to load the prospectus for ${uni.name}. Please advise the user to check the university's official website.`;
        }
      }

      if (shouldUseProspectusFiles(latestMessage.content)) {
        knowledgeContext = universityContext;
        if (relevantUniversities.length > 0) {
          knowledgeContext += `\n\n🔍 QUERY ANALYSIS: This question appears to be about ${relevantUniversities.map(u => u.name).join(', ')}. Provide specific, detailed information about these institutions based on the document below.`;
        }
        if (prospectusText) {
          knowledgeContext += `\n\n📑 RELEVANT PROSPECTUS EXTRACT:\n${prospectusText}`;
        }
      }
    }

    // Enhance system prompt with knowledge context
    let enhancedSystemPrompt = SYSTEM_PROMPT_TEXT;
    if (knowledgeContext) {
      enhancedSystemPrompt += `\n\n📚 KNOWLEDGE BASE CONTEXT:\n${knowledgeContext}`;
    }

    // Convert messages to Gemini format with enhanced system prompt
    const conversationHistory = [
      { role: 'user' as const, parts: [{ text: enhancedSystemPrompt }] },
      { role: 'model' as const, parts: [{ text: "I understand. I'm Unihelper, and I'll provide comprehensive guidance about South African universities, NSFAS, and scholarships based on my knowledge base." }] },
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