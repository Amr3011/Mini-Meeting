-- Drop summarizer_sessions table and indexes
DROP INDEX IF EXISTS idx_summarizer_sessions_status;
DROP INDEX IF EXISTS idx_summarizer_sessions_meeting_id;
DROP TABLE IF EXISTS summarizer_sessions;
