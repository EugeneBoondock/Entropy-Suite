# Unihelper Semantic Embedding System Setup

This document outlines the setup process for the new semantic embedding-based knowledge retrieval system for Unihelper.

## Overview

The new system uses:
- **OpenAI Embeddings** for semantic search
- **Supabase with pgvector** for vector storage
- **Semantic chunking** of prospectus files and knowledge documents
- **Intelligent retrieval** based on conversation context

## Prerequisites

1. **Supabase Project** with pgvector extension enabled
2. **OpenAI API Key** for generating embeddings
3. **Environment Variables** configured

## Environment Variables

Add these to your `.env` file:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_OPENAI_API_KEY=your_openai_api_key
VITE_GEMINI_API_KEY=your_gemini_api_key
```

## Database Setup

1. **Enable pgvector extension** in your Supabase project:
   - Go to Supabase Dashboard → Database → Extensions
   - Enable the `vector` extension

2. **Run the SQL setup script**:
   - Go to Supabase Dashboard → SQL Editor
   - Copy and paste the contents of `supabase-setup.sql`
   - Execute the script

This will create:
- `knowledge_chunks` table for storing embeddings
- `match_knowledge` function for semantic search
- Required indexes for performance

## Knowledge Base Generation

### Option 1: Run the Generation Script

```bash
# Install dependencies if needed
npm install

# Run the embedding generation script
node scripts/generate-embeddings.mjs
```

### Option 2: Manual Setup

1. **Create knowledge files** in `src/knowledge/`:
   - `funding_options.txt` - NSFAS and scholarship information
   - `application_process.txt` - University application steps
   - `course_catalogs.txt` - Degree and program information

2. **Process prospectus files** from `public/prospectuses/`

## How It Works

### 1. Knowledge Processing
- Prospectus PDFs are extracted and chunked into ~1000 character segments
- Each chunk gets a semantic embedding using OpenAI's text-embedding-3-small
- Chunks are stored in Supabase with metadata

### 2. Query Processing
- User messages are analyzed to determine if knowledge retrieval is needed
- For relevant queries, the system combines recent messages for context
- A semantic search query is generated and embedded

### 3. Knowledge Retrieval
- The `match_knowledge` function finds the most similar chunks
- Top 20 matches above 0.5 similarity threshold are retrieved
- Retrieved knowledge is formatted and injected into AI context

### 4. AI Response
- The AI receives the relevant knowledge as context
- Responses are generated as if the AI inherently knows the information
- No mention of external sources or documents

## File Structure

```
src/
├── tools/SummarizerTool/
│   ├── embeddingService.ts      # Core embedding functionality
│   ├── unihelperService.ts      # Updated service with embedding support
│   └── prospectusManager.ts     # Existing prospectus handling
├── knowledge/                   # Additional knowledge files
│   ├── funding_options.txt
│   ├── application_process.txt
│   └── course_catalogs.txt
└── utils/
    └── supabaseClient.ts        # Supabase configuration

scripts/
└── generate-embeddings.mjs      # Knowledge base generation script

supabase-setup.sql               # Database setup script
```

## Smart Filtering

The system intelligently skips knowledge retrieval for:
- Greetings (`hi`, `hello`, `hey`, etc.)
- Short responses (`thanks`, `okay`, etc.)
- Very short queries (<3 characters)
- System prompts or non-user messages

## Fallback System

If embedding retrieval fails, the system falls back to the original prospectus-based method, ensuring reliability.

## Performance Considerations

- **Chunk size**: 1000 characters with 200 character overlap
- **Similarity threshold**: 0.5 (configurable)
- **Match count**: 20 chunks maximum
- **Rate limiting**: 100ms delay between embedding requests

## Monitoring

Use the `get_knowledge_stats()` function to monitor your knowledge base:

```sql
SELECT * FROM get_knowledge_stats();
```

## Troubleshooting

### Common Issues

1. **pgvector not enabled**: Enable the vector extension in Supabase
2. **Missing environment variables**: Check all required API keys
3. **Rate limiting**: The script includes delays to avoid OpenAI rate limits
4. **Large files**: Some prospectus files are very large and may take time to process

### Debugging

- Check browser console for embedding retrieval logs
- Monitor Supabase logs for database errors
- Verify OpenAI API key has sufficient credits

## Benefits

1. **More Accurate**: Semantic search finds relevant information even with different wording
2. **Faster**: No need to load entire prospectus files for each query
3. **Smarter**: Combines context from multiple recent messages
4. **Scalable**: Easy to add new knowledge sources
5. **Reliable**: Fallback system ensures continued operation

## Future Enhancements

- **Hybrid search**: Combine semantic and keyword search
- **Dynamic chunking**: Adaptive chunk sizes based on content
- **Knowledge updates**: Automated updates when new prospectuses are added
- **User feedback**: Learn from user interactions to improve retrieval 