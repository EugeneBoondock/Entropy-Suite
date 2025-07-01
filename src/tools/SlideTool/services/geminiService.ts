import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { Slide } from '../types.ts';
import { fetchImageFromPexels } from './imageService';

declare const console: Console;

// Safety settings types
type SafetySetting = {
  category: HarmCategory;
  threshold: HarmBlockThreshold;
};

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  console.warn("VITE_GEMINI_API_KEY environment variable not found. AI features will be disabled.");
}

const ai = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

const MODEL_NAME = 'gemini-2.0-flash-lite';

// Define safety settings for content generation
const safetySettings: SafetySetting[] = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

// Helper function to ensure layout is valid
const getValidLayout = (layout: string | undefined): Slide['layout'] => {
  const validLayouts: Slide['layout'][] = [
    'text-only', 
    'text-image-right', 
    'text-image-left', 
    'title-only', 
    'image-title-overlay', 
    'image-only'
  ];
  return (layout && validLayouts.includes(layout as any)) 
    ? layout as Slide['layout'] 
    : 'text-only';
};

interface RawSlide {
  title?: string;
  content?: string;
  layout?: string;
  imageUrl?: string;
  imageDescription?: string;
  imageQuery?: string;
}

const parseAIResponseToSlides = async (jsonStr: string): Promise<Slide[]> => {
  // Clean the JSON string first
  let cleanedJson = jsonStr
    .replace(/^```(?:json)?\s*/, '')  // Remove opening code fence
    .replace(/```\s*$/, '')           // Remove closing code fence
    .trim();

  // Remove any non-printable characters and fix common JSON issues
  cleanedJson = cleanedJson
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove control characters
    .replace(/[\u2018\u2019]/g, "'")  // Replace smart quotes
    .replace(/[\u201C\u201D]/g, '"')  // Replace smart double quotes
    .replace(/,\s*([}\]]])/g, '$1')    // Remove trailing commas
    .replace(/([{\[]\s*[{\[]|[}\]]\s*[}\]]|,)\s*[\r\n]+\s*/g, '$1') // Fix newlines
    .replace(/\\n/g, '\\n')           // Escape newlines
    .replace(/\\'/g, "'");            // Fix escaped single quotes

  let parsedData;
  try {
    parsedData = JSON.parse(cleanedJson);
  } catch (e) {
    console.error("Failed to parse JSON response from AI. Cleaned text:", cleanedJson, "Error:", e);
    throw new Error(`AI returned invalid JSON. ${e instanceof Error ? e.message : String(e)}`);
  }

  if (!Array.isArray(parsedData)) {
    throw new Error("AI response is not an array");
  }

  const slidePromises = parsedData.map(async (item: unknown) => {
    const slide = item as RawSlide;
    const slideId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    try {
      const imageQuery = slide.imageDescription || slide.title || '';
      const imageUrl = await fetchImageFromPexels(imageQuery);
      
      return {
        id: slideId,
        title: slide.title || 'Untitled Slide',
        content: slide.content || '',
        layout: getValidLayout(slide.layout),
        transition: 'fade',
        autoAdvanceDelay: 5,
        imageUrl,
        imageDescription: slide.imageDescription,
        imageQuery: slide.imageQuery || slide.imageDescription,
        backgroundColor: undefined,
        textColor: undefined
      } as Slide;
    } catch (error) {
      console.error("Error processing slide image:", error);
      return {
        id: slideId,
        title: slide.title || 'Untitled Slide',
        content: slide.content || '',
        layout: getValidLayout(slide.layout),
        transition: 'fade',
        autoAdvanceDelay: 5,
        backgroundColor: undefined,
        textColor: undefined
      } as Slide;
    }
  });

  const slides = await Promise.all(slidePromises);
  return slides.filter((slide): slide is Slide => 
    !!slide && 
    typeof slide.id === 'string' && 
    typeof slide.title === 'string' && 
    typeof slide.content === 'string' && 
    typeof slide.layout === 'string'
  );
};

export const generateSlidesFromAI = async (topic: string, existingSlidesSummary: string = ''): Promise<Slide[]> => {
  if (!ai) {
    throw new Error('Gemini API is not configured. Please check your API key.');
  }

  const systemInstructionText = `You are an AI assistant that helps create presentation slides.
${existingSlidesSummary ? 
    `The user wants to add more slides to an existing presentation on the topic: "${topic}".
Here's a summary of the existing slides:
${existingSlidesSummary}

Generate new slides that complement and expand upon the existing content.` : 
    `Generate a new presentation about: ${topic}`}

Respond with a JSON array of slide objects with the following structure:
[
  {
    "title": "Slide Title",
    "content": "Slide content with bullet points or paragraphs.",
    "imageQuery": "Description of an image that would be relevant for this slide"
  }
]`;

  const userPrompt = existingSlidesSummary 
    ? `Generate additional slides about: ${topic}`
    : `Create a new presentation about: ${topic}`;

  try {
    const model = ai.getGenerativeModel({ 
      model: MODEL_NAME,
      generationConfig: {
        temperature: 0.5,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
      },
      safetySettings: safetySettings
    });

    // Start a chat session
    const chat = model.startChat({
      generationConfig: {
        temperature: 0.5,
      },
      systemInstruction: {
        role: 'model',
        parts: [{ text: systemInstructionText }]
      },
      safetySettings: safetySettings
    });

    // Send message and get response
    const result = await chat.sendMessage(userPrompt);
    const response = await result.response;
    const text = response.text();

    if (!text) {
      throw new Error('Empty response from AI service');
    }

    // Parse the response and ensure we have valid slides
    const slides = await parseAIResponseToSlides(text);
    
    if (!Array.isArray(slides) || slides.length === 0) {
      throw new Error('No valid slides were generated');
    }

    // Map the raw slides to the expected Slide format
    return slides.map(slide => ({
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      title: slide.title || "Untitled Slide",
      content: slide.content || "",
      imageQuery: slide.imageQuery || "",
      imageUrl: slide.imageUrl || "",
      imageDescription: slide.imageDescription || "",
      layout: getValidLayout(slide.layout),
      transition: 'fade',
      backgroundColor: undefined,
      textColor: undefined,
      autoAdvanceDelay: 5,
    }));
  } catch (error) {
    console.error("Error generating slides with Gemini:", error);
    if (error instanceof Error) {
      if (error.message.includes("API key not valid") || error.message.includes("API_KEY_INVALID")) {
        throw new Error("The Gemini API key is invalid or missing. Please check your configuration.");
      }
      throw new Error(`Failed to generate slides: ${error.message}`);
    }
    throw new Error(`An unknown error occurred while generating slides: ${String(error)}`);
  }
};

export const generateMoreSlidesFromAI = async (existingSlides: Slide[], topic: string): Promise<Slide[]> => {
  try {
    if (!API_KEY) {
      throw new Error('Gemini API key not found');
    }

    // Create a summary of existing slides to avoid duplication
    const existingContent = existingSlides
      .map(slide => `${slide.title}: ${slide.content}`)
      .join('\n');

    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });

    const prompt = `You are a helpful assistant that generates presentation slides.
    
    Existing slides on "${topic}":
    ${existingContent}
    
    Please generate 2-3 additional slides that would complement the existing content. 
    Focus on adding new information or expanding on existing points.
    
    Format your response as a JSON array of slide objects with these properties:
    - title: string (short title for the slide)
    - content: string (main content, can be bullet points or paragraphs)
    - layout: string (one of: title, title-content, title-image, title-content-image)
    - imageDescription: string (description of an appropriate image for this slide)
    
    Return only the JSON array, no other text.`;

    const result = await model.generateContent({
      contents: [{
        role: 'user',
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2000,
      },
      safetySettings
    });

    const response = await result.response;
    const text = response.text();
    
    // Parse the response and create new slides
    const newSlides = await parseAIResponseToSlides(text);
    
    // Generate unique IDs for the new slides
    return newSlides.map(slide => ({
      ...slide,
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    }));
  } catch (error) {
    console.error('Error generating more slides:', error);
    throw new Error(`Failed to generate more slides: ${error instanceof Error ? error.message : String(error)}`);
  }
};
