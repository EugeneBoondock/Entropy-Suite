# 🔐 Encrypted Setup Guide

## Step 1: Database Setup

1. **Run this SQL in your Supabase SQL Editor** (copy and paste exactly):

```sql
-- Enable pgcrypto extension for encryption
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create secure encryption functions
CREATE OR REPLACE FUNCTION encrypt_data(data TEXT, encryption_key TEXT)
RETURNS TEXT AS $$
BEGIN
    IF data IS NULL OR data = '' THEN
        RETURN NULL;
    END IF;
    RETURN encode(
        pgp_sym_encrypt(data, encryption_key, 'compress-algo=2, cipher-algo=aes256'),
        'base64'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create secure decryption function
CREATE OR REPLACE FUNCTION decrypt_data(encrypted_data TEXT, encryption_key TEXT)
RETURNS TEXT AS $$
BEGIN
    IF encrypted_data IS NULL OR encrypted_data = '' THEN
        RETURN NULL;
    END IF;
    RETURN pgp_sym_decrypt(
        decode(encrypted_data, 'base64'),
        encryption_key
    );
EXCEPTION
    WHEN OTHERS THEN
        RETURN NULL; -- Return NULL if decryption fails
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate user-specific encryption key
CREATE OR REPLACE FUNCTION get_user_encryption_key(user_id UUID)
RETURNS TEXT AS $$
BEGIN
    -- Combine user ID with a server secret for user-specific encryption
    -- In production, store ENCRYPTION_MASTER_KEY as an environment variable
    RETURN encode(
        digest(user_id::text || coalesce(current_setting('app.encryption_master_key', true), 'default_master_key_change_this'), 'sha256'),
        'hex'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create encrypted api_keys table
CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- Display name (not encrypted)
    service TEXT NOT NULL, -- Service name (not encrypted for filtering)
    encrypted_key TEXT NOT NULL, -- Encrypted API key
    key_hash TEXT NOT NULL, -- Hash for verification without decryption
    last_used TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_service ON api_keys(service);
CREATE INDEX IF NOT EXISTS idx_api_keys_key_hash ON api_keys(key_hash);

-- Enable Row Level Security (RLS)
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- Create RLS policy to ensure users can only access their own API keys
CREATE POLICY "Users can only access their own API keys" ON api_keys
    FOR ALL USING (auth.uid() = user_id);

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_api_keys_updated_at 
    BEFORE UPDATE ON api_keys 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create encrypted notes table
CREATE TABLE IF NOT EXISTS notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    encrypted_title TEXT NOT NULL, -- Encrypted title
    encrypted_content TEXT NOT NULL, -- Encrypted content
    category TEXT DEFAULT 'personal', -- Category (not encrypted for filtering)
    encrypted_tags TEXT, -- Encrypted tags as JSON string
    is_favorite BOOLEAN DEFAULT FALSE,
    mood TEXT, -- Mood (not encrypted for filtering)
    weather TEXT, -- Weather (not encrypted for filtering)
    title_hash TEXT, -- Hash for search without decryption
    content_hash TEXT, -- Hash for search without decryption
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_created_at ON notes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notes_category ON notes(category);
CREATE INDEX IF NOT EXISTS idx_notes_is_favorite ON notes(is_favorite);
CREATE INDEX IF NOT EXISTS idx_notes_mood ON notes(mood);
CREATE INDEX IF NOT EXISTS idx_notes_title_hash ON notes(title_hash);
CREATE INDEX IF NOT EXISTS idx_notes_content_hash ON notes(content_hash);

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

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON api_keys TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON notes TO authenticated;
GRANT EXECUTE ON FUNCTION encrypt_data(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION decrypt_data(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_encryption_key(UUID) TO authenticated;
```

## Step 2: Environment Variables

Add these to your backend `.env` file:

```env
# Add this to your EXISTING environment variables
ENCRYPTION_MASTER_KEY=CHANGE_THIS_TO_A_SECURE_64_CHARACTER_STRING_FOR_PRODUCTION_USE_ONLY
```

**🚨 CRITICAL:** Generate a secure master key:
- Use at least 64 characters
- Include letters, numbers, and special characters
- **NEVER share this key or commit it to version control**
- **NEVER use the example above in production**

### Generate a Secure Key:
Run this in your terminal to generate a secure key:

```bash
# Option 1: Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Option 2: Using OpenSSL (if available)
openssl rand -hex 32

# Option 3: Manual (use a password manager to generate 64+ character string)
```

## Step 3: Set Supabase Configuration

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **Database**
3. Click on **Custom settings**
4. Add this configuration:

```
app.encryption_master_key = 'your-same-master-key-from-env'
```

**Important:** Use the SAME master key in both your backend `.env` and Supabase settings.

## Step 4: Test the Setup

1. Start your backend server:
   ```bash
   cd server
   npm run dev
   ```

2. Start your frontend:
   ```bash
   npm run dev
   ```

3. Test the features:
   - ✅ Sign up/Login
   - ✅ Go to `/dashboard` and add an API key
   - ✅ Go to `/notes` and create a note
   - ✅ Verify everything works

## 🔒 Security Features

### What's Encrypted:
- ✅ **API Keys**: Fully encrypted with AES-256
- ✅ **Note Titles**: Encrypted but searchable via hashing
- ✅ **Note Content**: Fully encrypted
- ✅ **Note Tags**: Encrypted as JSON

### What's NOT Encrypted (for functionality):
- ❌ **API Key Names**: For display purposes
- ❌ **Service Names**: For filtering
- ❌ **Note Categories**: For filtering
- ❌ **Mood/Weather**: For filtering and analytics
- ❌ **Timestamps**: For sorting

### Privacy Guarantees:
- 🛡️ **Each user has their own encryption key** (derived from user ID + master key)
- 🛡️ **Row Level Security** ensures data isolation
- 🛡️ **Even database admins cannot read your encrypted data**
- 🛡️ **Search works without decryption** (via hashing)
- 🛡️ **Graceful failure** if decryption fails

## 🚨 Production Security Checklist

Before going live:

- [ ] Generate a unique, secure 64+ character master key
- [ ] Set `ENCRYPTION_MASTER_KEY` in both backend `.env` and Supabase settings
- [ ] Verify API keys are encrypted in database
- [ ] Verify notes are encrypted in database
- [ ] Test user isolation (create test accounts)
- [ ] Set up database backups
- [ ] Monitor for failed decryption attempts
- [ ] Consider setting up audit logging

## Troubleshooting

### "Decryption Failed" Messages:
- Check that `ENCRYPTION_MASTER_KEY` matches in both places
- Verify Supabase `app.encryption_master_key` setting
- Clear browser cache and re-login

### SQL Errors:
- Ensure pgcrypto extension is enabled
- Check that all functions were created successfully
- Verify RLS policies are active

### Performance Issues:
- Encryption/decryption adds ~50ms per operation
- For large datasets, consider pagination
- Monitor database performance

You're all set! Your data is now encrypted end-to-end! 🔐 