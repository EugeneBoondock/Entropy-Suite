import { supabase } from '../../utils/supabaseClient';
import { GoogleGenerativeAI, TaskType } from "@google/generative-ai";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
let genAI: GoogleGenerativeAI | null = null;

if (!GEMINI_API_KEY) {
  console.warn("VITE_GEMINI_API_KEY is not set in the environment variables. Embedding features will be disabled.");
} else {
  genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
}

export interface KnowledgeChunk {
  id: string;
  content: string;
  embedding: number[];
  source_filename: string;
  chunk_index: number;
  created_at?: string;
}

export interface EmbeddingMatch {
  id: string;
  content: string;
  source_filename: string;
  chunk_index: number;
  similarity: number;
}

// Split text into chunks with overlap
export function splitIntoChunks(text: string, chunkSize: number = 1000, overlap: number = 200): string[] {
  const chunks: string[] = [];
  let i = 0;
  
  while (i < text.length) {
    const chunk = text.substring(i, i + chunkSize);
    chunks.push(chunk);
    i += chunkSize - overlap;
  }
  
  return chunks;
}

// Generate embedding for text using Gemini text-embedding-004
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    if (!genAI) {
      throw new Error("Gemini API not initialized - missing API key");
    }
    
    const embeddingModel = genAI.getGenerativeModel({ model: "text-embedding-004" });
    const result = await embeddingModel.embedContent({
      content: { role: "user", parts: [{ text }] },
      taskType: TaskType.SEMANTIC_SIMILARITY
    });
    if (!result.embedding?.values) throw new Error("No embedding returned from Gemini API");
    return result.embedding.values;
  } catch (error) {
    console.error("Error generating embedding:", error);
    throw error;
  }
}

// Store chunks and embeddings in Supabase
export async function storeKnowledgeChunks(chunks: string[], sourceFilename: string): Promise<void> {
  try {
    const chunksWithEmbeddings = await Promise.all(
      chunks.map(async (content, index) => {
        const embedding = await generateEmbedding(content);
        return {
          content,
          embedding,
          source_filename: sourceFilename,
          chunk_index: index
        };
      })
    );

    const { error } = await supabase
      .from('knowledge_chunks')
      .insert(chunksWithEmbeddings);

    if (error) {
      throw error;
    }

    console.log(`Stored ${chunksWithEmbeddings.length} chunks for ${sourceFilename}`);
  } catch (error) {
    console.error('Error storing knowledge chunks:', error);
    throw error;
  }
}

// Retrieve relevant knowledge chunks using semantic search
export async function retrieveRelevantKnowledge(
  query: string,
  matchThreshold: number = 0.5,
  matchCount: number = 20
): Promise<EmbeddingMatch[]> {
  try {
    const queryEmbedding = await generateEmbedding(query);

    const { data, error } = await supabase.rpc('match_knowledge', {
      query_embedding: queryEmbedding,
      match_threshold: matchThreshold,
      match_count: matchCount
    });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error retrieving knowledge:', error);
    return [];
  }
}

// Check if query should trigger knowledge retrieval
export function shouldRetrieveKnowledge(query: string): boolean {
  const trimmedQuery = query.trim().toLowerCase();
  
  // Skip for greetings and short messages
  const greetings = ['hi', 'hello', 'hey', 'yo', 'good morning', 'good afternoon', 'good evening'];
  const shortResponses = ['thanks', 'thank you', 'ok', 'okay', 'yes', 'no', 'bye', 'goodbye'];
  
  if (greetings.some(greeting => trimmedQuery.includes(greeting))) {
    return false;
  }
  
  if (shortResponses.includes(trimmedQuery)) {
    return false;
  }
  
  // Skip for very short queries
  if (trimmedQuery.length < 3) {
    return false;
  }
  
  return true;
}

// Combine multiple user messages for better context
export function buildSearchQuery(messages: Array<{ role: string; content: string }>): string {
  const userMessages = messages
    .filter(msg => msg.role === 'user')
    .map(msg => msg.content)
    .slice(-3); // Take last 3 user messages
  
  return userMessages.join(' ').trim();
}

// Format retrieved knowledge for AI context
export function formatKnowledgeContext(matches: EmbeddingMatch[]): string {
  if (matches.length === 0) {
    return '';
  }

  const contextParts = matches.map(match => 
    `[Source: ${match.source_filename}]\n${match.content}`
  );

  return contextParts.join('\n\n---\n\n');
} 