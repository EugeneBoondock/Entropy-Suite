import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY as string);

export async function generateInputSchema(name: string, description: string): Promise<string> {
  const systemPrompt = `
You are an expert API designer who generates JSON Schema Draft-07 objects for MCP tool input parameters.

CRITICAL REQUIREMENTS:
1. Return ONLY a valid JSON object (no code fences, no explanations)
2. The response must be valid JSON that starts with { and ends with }
3. Use JSON Schema Draft-07 format with proper "type", "properties", "required" fields
4. For simple tools, keep schemas minimal but complete
5. All property types must be valid: "string", "number", "boolean", "array", "object"
6. Include "required" array for mandatory parameters
7. Add "description" for each property to explain its purpose

EXAMPLE OUTPUT:
{
  "type": "object",
  "properties": {
    "query": {
      "type": "string",
      "description": "The search query to execute"
    },
    "limit": {
      "type": "number",
      "description": "Maximum number of results to return",
      "minimum": 1,
      "maximum": 100
    }
  },
  "required": ["query"]
}
`.trim();

  const userPrompt = `Generate a JSON Schema for the input parameters of this MCP tool:

Tool Name: ${name}
Description: ${description}

Return only the JSON schema object:`;

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });
    const result = await model.generateContent([systemPrompt, userPrompt]);
    let responseText = result.response.text().trim();

    // Remove any potential code fences or markdown formatting
    responseText = responseText
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```\s*$/i, '')
      .replace(/^\s*["'`]|["'`]\s*$/g, '') // Remove surrounding quotes
      .trim();

    // Validate that it's valid JSON
    let parsedSchema;
    try {
      parsedSchema = JSON.parse(responseText);
    } catch (parseError) {
      console.error('AI generated invalid JSON:', responseText);
      throw new Error('AI generated invalid JSON schema');
    }

    // Basic validation that it looks like a JSON Schema
    if (!parsedSchema || typeof parsedSchema !== 'object') {
      throw new Error('AI response is not a valid object');
    }

    if (!parsedSchema.type || !parsedSchema.properties) {
      console.warn('Generated schema missing type or properties, adding defaults');
      parsedSchema = {
        type: 'object',
        properties: parsedSchema.properties || {
          input: {
            type: 'string',
            description: 'Input parameter'
          }
        },
        required: parsedSchema.required || [],
        ...parsedSchema
      };
    }

    // Return the formatted JSON string
    return JSON.stringify(parsedSchema, null, 2);

  } catch (error) {
    console.error('Error generating schema:', error);
    // Return a safe fallback schema
    const fallbackSchema = {
      type: 'object',
      properties: {
        input: {
          type: 'string',
          description: `Input for ${name}`
        }
      },
      required: []
    };
    return JSON.stringify(fallbackSchema, null, 2);
  }
} 