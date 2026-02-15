-- Add error column to summarizer_sessions table
-- This allows tracking failure details while keeping status at the failed stage
ALTER TABLE summarizer_sessions ADD COLUMN error TEXT;
