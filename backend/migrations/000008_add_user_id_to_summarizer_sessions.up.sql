BEGIN;

-- Add user_id column to summarizer_sessions as a proper FK reference to users
ALTER TABLE summarizer_sessions
    ADD COLUMN user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE;

-- Add index for faster lookups by user
CREATE INDEX IF NOT EXISTS idx_summarizer_sessions_user_id ON summarizer_sessions(user_id);

COMMIT;
