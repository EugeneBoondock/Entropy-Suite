export interface AIProvider {
  name: string;
  apiKey: string;
  baseURL: string;
  models: string[];
  defaultModel: string;
  pricing: {
    input: number; // per million tokens
    output: number; // per million tokens
  };
}

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIResponse {
  content: string;
  usage: {
    input_tokens: number;
    output_tokens: number;
    cost: number;
  };
  model: string;
  provider: string;
}

export interface AITools {
  executeCode: (code: string, language: string) => Promise<string>;
  editFile: (filename: string, content: string) => Promise<void>;
  readFile: (filename: string) => Promise<string>;
  listFiles: (path?: string) => Promise<string[]>;
  runCommand: (command: string) => Promise<string>;
}

// AI Provider configurations for 2025
export const AI_PROVIDERS: Record<string, Omit<AIProvider, 'apiKey'>> = {
  openai: {
    name: 'OpenAI',
    baseURL: 'https://api.openai.com/v1',
    models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'],
    defaultModel: 'gpt-4o',
    pricing: { input: 2.5, output: 10.0 }
  },
  anthropic: {
    name: 'Anthropic',
    baseURL: 'https://api.anthropic.com/v1',
    models: ['claude-3.5-sonnet', 'claude-3-haiku', 'claude-3-opus'],
    defaultModel: 'claude-3.5-sonnet',
    pricing: { input: 3.0, output: 15.0 }
  },
  google: {
    name: 'Google',
    baseURL: 'https://generativelanguage.googleapis.com/v1beta',
    models: ['gemini-2.0-flash-lite', 'gemini-2.5-pro', 'gemini-2.0-flash', 'gemini-1.5-pro'],
    defaultModel: 'gemini-2.0-flash-lite',
    pricing: { input: 0.0, output: 0.0 } // Free tier for gemini-2.0-flash-lite
  },
  xai: {
    name: 'xAI',
    baseURL: 'https://api.x.ai/v1',
    models: ['grok-3', 'grok-3-mini', 'grok-2-beta'],
    defaultModel: 'grok-3',
    pricing: { input: 3.0, output: 15.0 }
  },
  deepseek: {
    name: 'DeepSeek',
    baseURL: 'https://api.deepseek.com/v1',
    models: ['deepseek-r1', 'deepseek-v3', 'deepseek-chat'],
    defaultModel: 'deepseek-r1',
    pricing: { input: 0.55, output: 2.19 }
  },
  mistral: {
    name: 'Mistral',
    baseURL: 'https://api.mistral.ai/v1',
    models: ['mistral-large-2', 'mistral-medium', 'mistral-7b-instruct'],
    defaultModel: 'mistral-large-2',
    pricing: { input: 2.0, output: 6.0 }
  }
};

export class AIProviderService {
  private providers: Map<string, AIProvider> = new Map();
  private currentProvider: string = 'google'; // Default to Gemini
  private currentModel: string = '';
  private tools: AITools;
  private freeGeminiKey: string | null = null;

  constructor(tools: AITools) {
    this.tools = tools;
    
    // Initialize with free Gemini access for gemini-2.0-flash-lite
    this.freeGeminiKey = import.meta.env.VITE_GEMINI_API_KEY || null;
    this.initializeGoogleProvider();
  }

  private initializeGoogleProvider(): void {
    // Always add Google provider with free tier access
    const googleConfig = AI_PROVIDERS.google;
    this.providers.set('google', {
      ...googleConfig,
      apiKey: 'free-tier' // Special marker for free tier
    });
    this.setProvider('google', 'gemini-2.0-flash-lite');
  }

  addProvider(providerId: string, apiKey: string): void {
    const config = AI_PROVIDERS[providerId];
    if (!config) {
      throw new Error(`Unknown provider: ${providerId}`);
    }

    // Special handling for Google provider
    if (providerId === 'google') {
      this.freeGeminiKey = apiKey;
      this.providers.set(providerId, {
        ...config,
        apiKey,
        pricing: { input: 1.25, output: 5.0 } // Update to paid pricing when API key is added
      });
    } else {
      this.providers.set(providerId, {
        ...config,
        apiKey
      });
    }
  }

  removeProvider(providerId: string): void {
    this.providers.delete(providerId);
    if (this.currentProvider === providerId) {
      // Switch to next available provider
      const available = Array.from(this.providers.keys());
      if (available.length > 0) {
        this.setProvider(available[0]);
      } else {
        this.currentProvider = '';
        this.currentModel = '';
      }
    }
  }

  setProvider(providerId: string, model?: string): void {
    const provider = this.providers.get(providerId);
    if (!provider) {
      throw new Error(`Provider not configured: ${providerId}`);
    }

    const targetModel = model || provider.defaultModel;

    // Check if switching to a non-free Google model
    if (providerId === 'google' && targetModel !== 'gemini-2.0-flash-lite') {
      if (!this.freeGeminiKey || provider.apiKey === 'free-tier') {
        throw new Error(`API key required for ${targetModel}. Please add your Google API key using: ai add-key google <your-api-key>`);
      }
    }

    this.currentProvider = providerId;
    this.currentModel = targetModel;
  }

  getAvailableProviders(): Array<{ id: string; name: string; models: string[] }> {
    return Array.from(this.providers.entries()).map(([id, provider]) => ({
      id,
      name: provider.name,
      models: provider.models
    }));
  }

  getCurrentProvider(): { id: string; name: string; model: string } | null {
    const provider = this.providers.get(this.currentProvider);
    if (!provider) return null;

    return {
      id: this.currentProvider,
      name: provider.name,
      model: this.currentModel
    };
  }

  async sendMessage(
    messages: AIMessage[],
    options: {
      temperature?: number;
      maxTokens?: number;
      systemPrompt?: string;
    } = {}
  ): Promise<AIResponse> {
    const provider = this.providers.get(this.currentProvider);
    if (!provider) {
      throw new Error('No AI provider configured');
    }

    // Prepare system message with terminal context
    const systemMessage: AIMessage = {
      role: 'system',
      content: this.buildSystemPrompt(options.systemPrompt)
    };

    const fullMessages = [systemMessage, ...messages];

    try {
      let response: any;

      switch (this.currentProvider) {
        case 'google':
          response = await this.callGemini(provider, fullMessages, options);
          break;
        case 'openai':
          response = await this.callOpenAI(provider, fullMessages, options);
          break;
        case 'anthropic':
          response = await this.callAnthropic(provider, fullMessages, options);
          break;
        case 'xai':
          response = await this.callXAI(provider, fullMessages, options);
          break;
        case 'deepseek':
          response = await this.callDeepSeek(provider, fullMessages, options);
          break;
        case 'mistral':
          response = await this.callMistral(provider, fullMessages, options);
          break;
        default:
          throw new Error(`Unsupported provider: ${this.currentProvider}`);
      }

      return response;
    } catch (error) {
      throw new Error(`AI request failed: ${error}`);
    }
  }

  private buildSystemPrompt(customPrompt?: string): string {
    const basePrompt = `# Entropy AI Agent - Supreme Terminal Intelligence

You are the **Entropy AI Agent**, the most advanced autonomous coding assistant ever integrated into a web-based terminal environment. You are a **proactive, intelligent development partner** that can see, think, create, execute, and iterate in real-time.

## Core Environment & Capabilities

### Entropy Real Terminal Environment
- **Persistent File System**: Full directory structure with real file operations
- **Python Environment**: Pyodide with NumPy, Pandas, Matplotlib, SciPy, and 100+ libraries
- **JavaScript Runtime**: Complete Node.js with full npm ecosystem via WebContainers
- **Git Integration**: Real version control with clone, commit, push, pull, branching
- **Advanced Text Editors**: Full vim, nano, emacs with syntax highlighting
- **Network Access**: HTTP/HTTPS requests, API interactions, web scraping

### Available Tools & Functions
- **executeCode(code, language)** - Execute Python/JavaScript with full output capture
- **editFile(filename, content)** - Create/modify files with syntax validation
- **readFile(filename)** - Read and analyze file contents
- **listFiles(path)** - Explore directory structures
- **runCommand(command)** - Execute terminal commands with shell access

### AI-Native Features
- **Self-Correction**: Automatic error detection and iterative fixing (up to 3 attempts)
- **Context Preservation**: Maintains conversation history and execution results
- **Intelligent Parsing**: Detects when code should be saved vs. executed temporarily
- **Error Recovery**: Sophisticated error handling with contextual problem-solving

## Code Creation Methods

### 1. File Creation + Execution (Recommended for Apps/Games)
\`\`\`python:filename.py
# This creates AND executes the file
print("This will be saved as filename.py and executed")
\`\`\`

### 2. Temporary Execution (Quick calculations/demos)
\`\`\`python
# This runs but doesn't save to file
print("Temporary execution")
\`\`\`

### 3. File Creation Without Execution
Use editFile(filename, content) for config files, documentation, etc.

## Operational Excellence

### Code Quality Standards
- **Clean Architecture**: Write maintainable, well-structured code
- **Error Handling**: Comprehensive try-catch blocks and validation
- **Type Safety**: Use type hints in Python, TypeScript when applicable
- **Security**: Never expose secrets, validate inputs, follow best practices
- **Performance**: Optimize algorithms and data structures for efficiency
- **Documentation**: Meaningful comments for complex logic only

### Problem-Solving Methodology
1. **Deep Understanding**: Analyze user request thoroughly with context
2. **Context Gathering**: Examine existing files, project structure, dependencies
3. **Strategic Planning**: Design comprehensive solution with contingencies
4. **Implementation**: Execute with attention to edge cases and error handling
5. **Validation**: Test functionality and validate against requirements
6. **Iteration**: Improve based on results, feedback, and best practices

### Self-Correction Process
1. **Immediate Detection**: Automatically identify syntax/runtime/logical errors
2. **Root Cause Analysis**: Understand fundamental cause, not just symptoms
3. **Intelligent Correction**: Implement appropriate fixes using contextual knowledge
4. **Validation Testing**: Ensure fixes resolve issues without new problems
5. **Learning Integration**: Update approach to prevent similar errors

## Advanced Capabilities

### Intelligent Code Generation
- Generate complete, production-ready applications from descriptions
- Create comprehensive test suites with edge case coverage
- Implement proper design patterns and architectural principles
- Optimize for performance, maintainability, and scalability

### Multi-Domain Expertise
- **Data Science**: pandas, numpy, matplotlib, machine learning, statistical analysis
- **Web Development**: React, Vue, Express.js, responsive design, APIs, databases
- **DevOps**: CI/CD pipelines, containerization, monitoring, automation
- **API Integration**: OpenAI, Google, GitHub, AWS with proper auth and error handling

### User Interaction Excellence
- **Clarity**: Explanations appropriate to user's technical level
- **Proactivity**: Anticipate needs, suggest improvements/alternatives
- **Transparency**: Explain decisions, trade-offs, implementation choices
- **Educational**: Share knowledge and best practices when appropriate
- **Results-Oriented**: Always execute code rather than just describing it

## Security & Safety
- Never execute harmful commands without explicit consent
- Validate inputs, sanitize data, protect credentials
- Use environment variables for sensitive data
- Follow OWASP guidelines and industry best practices
- Respect privacy and comply with data protection regulations

## Performance & Optimization
- Write optimized algorithms for computational tasks
- Use appropriate data structures and caching strategies
- Minimize browser memory usage and optimize I/O operations
- Implement asynchronous patterns appropriately
- Monitor and report resource usage when relevant

## Innovation & Continuous Improvement
- Stay current with latest programming trends and technologies
- Suggest creative solutions to complex problems
- Introduce users to new tools and techniques
- Learn from successful patterns and user feedback
- Balance innovation with reliability and stability

## Final Notes
You are not just an AI assistant - you are a **supreme coding intelligence** representing the future of software development. Every interaction is an opportunity to demonstrate exceptional capabilities and help users achieve more than they thought possible.

**Mission**: Be proactive, intelligent, creative, and always focused on delivering exceptional results.

Remember: You are the **Entropy AI Agent** - the most advanced coding assistant ever created. Act accordingly.`;

    return customPrompt ? `${basePrompt}\n\n## ADDITIONAL CONTEXT\n${customPrompt}` : basePrompt;
  }

  private async callGemini(
    provider: AIProvider,
    messages: AIMessage[],
    options: any
  ): Promise<AIResponse> {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    
    // Determine which API key to use
    let apiKey: string;
    if (this.currentModel === 'gemini-2.0-flash-lite') {
      // For free tier, we need a real API key but can use the env one
      apiKey = this.freeGeminiKey || import.meta.env.VITE_GEMINI_API_KEY || '';
      if (!apiKey) {
        throw new Error('Gemini API key required. Please set VITE_GEMINI_API_KEY in your environment or add a key via ai-config');
      }
    } else {
      // Use paid tier - require real API key
      if (provider.apiKey === 'free-tier' || !this.freeGeminiKey) {
        throw new Error(`API key required for ${this.currentModel}`);
      }
      apiKey = this.freeGeminiKey;
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: this.currentModel,
      generationConfig: {
        temperature: options.temperature || 0.7,
        maxOutputTokens: options.maxTokens || 4000,
      },
    });

    // Convert messages to Gemini format - exclude system message from history
    const history = messages.slice(1, -1).map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    const chat = model.startChat({
      history,
      systemInstruction: {
        role: 'model',
        parts: [{ text: messages[0].content }]
      }
    });

    const lastMessage = messages[messages.length - 1];
    const result = await chat.sendMessage(lastMessage.content);
    const response = await result.response;
    const text = response.text();

    // Calculate approximate usage
    const inputTokens = messages.reduce((sum, msg) => sum + Math.ceil(msg.content.length / 4), 0);
    const outputTokens = Math.ceil(text.length / 4);
    
    // Use dynamic pricing based on model
    const pricing = this.currentModel === 'gemini-2.0-flash-lite' 
      ? { input: 0.0, output: 0.0 } 
      : { input: 1.25, output: 5.0 };
    
    const cost = (inputTokens * pricing.input + outputTokens * pricing.output) / 1000000;

    return {
      content: text,
      usage: { input_tokens: inputTokens, output_tokens: outputTokens, cost },
      model: this.currentModel,
      provider: provider.name
    };
  }

  private async callOpenAI(
    provider: AIProvider,
    messages: AIMessage[],
    options: any
  ): Promise<AIResponse> {
    const response = await fetch(`${provider.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${provider.apiKey}`
      },
      body: JSON.stringify({
        model: this.currentModel,
        messages,
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 4000
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    const usage = data.usage;
    const cost = (usage.prompt_tokens * provider.pricing.input + usage.completion_tokens * provider.pricing.output) / 1000000;

    return {
      content,
      usage: {
        input_tokens: usage.prompt_tokens,
        output_tokens: usage.completion_tokens,
        cost
      },
      model: this.currentModel,
      provider: provider.name
    };
  }

  private async callAnthropic(
    provider: AIProvider,
    messages: AIMessage[],
    options: any
  ): Promise<AIResponse> {
    const systemMsg = messages.find(m => m.role === 'system');
    const userMessages = messages.filter(m => m.role !== 'system');

    const response = await fetch(`${provider.baseURL}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${provider.apiKey}`,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: this.currentModel,
        max_tokens: options.maxTokens || 4000,
        temperature: options.temperature || 0.7,
        system: systemMsg?.content,
        messages: userMessages
      })
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.content[0].text;
    const usage = data.usage;
    const cost = (usage.input_tokens * provider.pricing.input + usage.output_tokens * provider.pricing.output) / 1000000;

    return {
      content,
      usage: {
        input_tokens: usage.input_tokens,
        output_tokens: usage.output_tokens,
        cost
      },
      model: this.currentModel,
      provider: provider.name
    };
  }

  private async callXAI(
    provider: AIProvider,
    messages: AIMessage[],
    options: any
  ): Promise<AIResponse> {
    const response = await fetch(`${provider.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${provider.apiKey}`
      },
      body: JSON.stringify({
        model: this.currentModel,
        messages,
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 4000
      })
    });

    if (!response.ok) {
      throw new Error(`xAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    const usage = data.usage;
    const cost = (usage.prompt_tokens * provider.pricing.input + usage.completion_tokens * provider.pricing.output) / 1000000;

    return {
      content,
      usage: {
        input_tokens: usage.prompt_tokens,
        output_tokens: usage.completion_tokens,
        cost
      },
      model: this.currentModel,
      provider: provider.name
    };
  }

  private async callDeepSeek(
    provider: AIProvider,
    messages: AIMessage[],
    options: any
  ): Promise<AIResponse> {
    const response = await fetch(`${provider.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${provider.apiKey}`
      },
      body: JSON.stringify({
        model: this.currentModel,
        messages,
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 4000
      })
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    const usage = data.usage;
    const cost = (usage.prompt_tokens * provider.pricing.input + usage.completion_tokens * provider.pricing.output) / 1000000;

    return {
      content,
      usage: {
        input_tokens: usage.prompt_tokens,
        output_tokens: usage.completion_tokens,
        cost
      },
      model: this.currentModel,
      provider: provider.name
    };
  }

  private async callMistral(
    provider: AIProvider,
    messages: AIMessage[],
    options: any
  ): Promise<AIResponse> {
    const response = await fetch(`${provider.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${provider.apiKey}`
      },
      body: JSON.stringify({
        model: this.currentModel,
        messages,
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 4000
      })
    });

    if (!response.ok) {
      throw new Error(`Mistral API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    const usage = data.usage;
    const cost = (usage.prompt_tokens * provider.pricing.input + usage.completion_tokens * provider.pricing.output) / 1000000;

    return {
      content,
      usage: {
        input_tokens: usage.prompt_tokens,
        output_tokens: usage.completion_tokens,
        cost
      },
      model: this.currentModel,
      provider: provider.name
    };
  }
} 