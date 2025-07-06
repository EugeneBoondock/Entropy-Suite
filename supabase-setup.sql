-- Enable the pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create the knowledge_chunks table
CREATE TABLE IF NOT EXISTS knowledge_chunks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content TEXT NOT NULL,
    embedding VECTOR(1536), -- OpenAI text-embedding-3-small dimension
    source_filename TEXT NOT NULL,
    chunk_index INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on the embedding column for efficient similarity search
CREATE INDEX IF NOT EXISTS knowledge_chunks_embedding_idx ON knowledge_chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Create the match_knowledge function for semantic search
CREATE OR REPLACE FUNCTION match_knowledge(
    query_embedding VECTOR(1536),
    match_threshold FLOAT DEFAULT 0.5,
    match_count INT DEFAULT 20
)
RETURNS TABLE (
    id UUID,
    content TEXT,
    source_filename TEXT,
    chunk_index INTEGER,
    similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        kc.id,
        kc.content,
        kc.source_filename,
        kc.chunk_index,
        1 - (kc.embedding <=> query_embedding) AS similarity
    FROM knowledge_chunks kc
    WHERE 1 - (kc.embedding <=> query_embedding) > match_threshold
    ORDER BY kc.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- Create a function to clear all knowledge chunks (useful for re-indexing)
CREATE OR REPLACE FUNCTION clear_knowledge_base()
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM knowledge_chunks;
END;
$$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS knowledge_chunks_source_filename_idx ON knowledge_chunks(source_filename);
CREATE INDEX IF NOT EXISTS knowledge_chunks_created_at_idx ON knowledge_chunks(created_at);

-- Create a function to get statistics about the knowledge base
CREATE OR REPLACE FUNCTION get_knowledge_stats()
RETURNS TABLE (
    total_chunks BIGINT,
    total_sources BIGINT,
    avg_chunk_length FLOAT,
    latest_update TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::BIGINT as total_chunks,
        COUNT(DISTINCT source_filename)::BIGINT as total_sources,
        AVG(LENGTH(content))::FLOAT as avg_chunk_length,
        MAX(created_at) as latest_update
    FROM knowledge_chunks;
END;
$$; 