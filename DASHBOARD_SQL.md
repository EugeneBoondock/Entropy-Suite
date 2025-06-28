# Dashboard Database Schema

## SQL for API Keys Table

Run this SQL in your Supabase SQL editor to create the necessary table for the dashboard:

```sql
-- Create api_keys table
CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    service TEXT NOT NULL,
    key TEXT NOT NULL,
    last_used TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on user_id for performance
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);

-- Create index on service for filtering
CREATE INDEX IF NOT EXISTS idx_api_keys_service ON api_keys(service);

-- Enable Row Level Security (RLS)
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- Create RLS policy to ensure users can only access their own API keys
CREATE POLICY "Users can only access their own API keys" ON api_keys
    FOR ALL USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_api_keys_updated_at 
    BEFORE UPDATE ON api_keys 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Optional: Create function to encrypt API keys (basic encryption example)
-- Note: For production, consider using more robust encryption
CREATE OR REPLACE FUNCTION encrypt_api_key(api_key TEXT, user_salt TEXT DEFAULT 'default_salt')
RETURNS TEXT AS $$
BEGIN
    -- This is a simple example - use proper encryption in production
    RETURN encode(digest(api_key || user_salt, 'sha256'), 'hex');
END;
$$ LANGUAGE plpgsql;

-- Optional: Create view for API key management (excluding actual key values)
CREATE OR REPLACE VIEW api_keys_view AS
SELECT 
    id,
    user_id,
    name,
    service,
    CASE 
        WHEN length(key) > 8 THEN 
            left(key, 4) || repeat('*', length(key) - 8) || right(key, 4)
        ELSE 
            repeat('*', length(key))
    END as masked_key,
    last_used,
    created_at,
    updated_at
FROM api_keys;

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON api_keys TO authenticated;
GRANT SELECT ON api_keys_view TO authenticated;
```

## Additional Supabase Setup

1. **Enable Authentication**: Make sure Supabase Authentication is enabled in your project
2. **Environment Variables**: Add these to your `.env` files:

```env
# Frontend (.env)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Backend (.env)
DATABASE_URL=your_postgresql_connection_string
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Security Considerations

1. **API Key Encryption**: The current implementation stores API keys in plain text. For production, implement proper encryption:
   ```sql
   -- Example with pgcrypto extension
   CREATE EXTENSION IF NOT EXISTS pgcrypto;
   
   -- Function to encrypt API keys
   CREATE OR REPLACE FUNCTION encrypt_api_key(api_key TEXT, encryption_key TEXT)
   RETURNS TEXT AS $$
   BEGIN
       RETURN encode(
           pgp_sym_encrypt(api_key, encryption_key),
           'base64'
       );
   END;
   $$ LANGUAGE plpgsql;
   
   -- Function to decrypt API keys
   CREATE OR REPLACE FUNCTION decrypt_api_key(encrypted_key TEXT, encryption_key TEXT)
   RETURNS TEXT AS $$
   BEGIN
       RETURN pgp_sym_decrypt(
           decode(encrypted_key, 'base64'),
           encryption_key
       );
   END;
   $$ LANGUAGE plpgsql;
   ```

2. **Row Level Security**: The RLS policies ensure users can only access their own API keys

3. **Rate Limiting**: Consider implementing rate limiting for API key operations

4. **Audit Logging**: Add audit trail for API key access and modifications:
   ```sql
   CREATE TABLE api_key_audit (
       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
       user_id UUID NOT NULL,
       api_key_id UUID NOT NULL,
       action TEXT NOT NULL, -- 'created', 'accessed', 'updated', 'deleted'
       timestamp TIMESTAMPTZ DEFAULT NOW(),
       ip_address INET,
       user_agent TEXT
   );
   ```

## YouTube Downloader Dependencies

For the YouTube downloader to work, you'll need to install these dependencies on your server:

```bash
# Install yt-dlp
pip install yt-dlp

# Install ffmpeg (Ubuntu/Debian)
sudo apt update
sudo apt install ffmpeg

# Install ffmpeg (Windows)
# Download from https://ffmpeg.org/download.html

# Install ffmpeg (macOS)
brew install ffmpeg
```

## Testing the Setup

1. Create a test user account
2. Login and navigate to `/dashboard`
3. Add a test API key
4. Verify that only the authenticated user can see their keys
5. Test the YouTube downloader with various URLs

## API Endpoints

The dashboard uses these API endpoints:

- `POST /api/youtube/info` - Get video information
- `POST /api/youtube/download` - Download video/audio
- `GET /api/youtube/health` - Health check

Make sure your server is running and these endpoints are accessible.

## Notes & Journal Feature

Add this SQL to create the notes table for the journaling feature:

```sql
-- Create notes table for journaling feature
CREATE TABLE IF NOT EXISTS notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT DEFAULT 'personal',
    tags TEXT[] DEFAULT '{}',
    is_favorite BOOLEAN DEFAULT FALSE,
    mood TEXT,
    weather TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_created_at ON notes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notes_category ON notes(category);
CREATE INDEX IF NOT EXISTS idx_notes_is_favorite ON notes(is_favorite);
CREATE INDEX IF NOT EXISTS idx_notes_tags ON notes USING GIN(tags);

-- Enable Row Level Security (RLS) on notes table
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for notes - users can only access their own notes
CREATE POLICY "Users can only access their own notes" ON notes
    FOR ALL USING (auth.uid() = user_id);

-- Create trigger to automatically update updated_at timestamp for notes
CREATE TRIGGER update_notes_updated_at 
    BEFORE UPDATE ON notes 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions for notes
GRANT SELECT, INSERT, UPDATE, DELETE ON notes TO authenticated;
```

### Notes Features:
- **Categories**: personal, work, ideas, travel, health, learning, goals, gratitude
- **Tags**: Array of custom tags for organization
- **Mood tracking**: Optional mood emoji/label
- **Weather tracking**: Optional weather condition
- **Favorites**: Mark important notes
- **Full-text search**: Search through titles, content, and tags
- **Sorting**: By date created, last updated, or title 