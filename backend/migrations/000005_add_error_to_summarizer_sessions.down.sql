-- Remove error column from summarizer_sessions table
ALTER TABLE summarizer_sessions DROP COLUMN IF EXISTS error;
