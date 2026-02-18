-- Drop audio_chunks table and indexes
DROP INDEX IF EXISTS idx_audio_chunks_user_identity;
DROP INDEX IF EXISTS idx_audio_chunks_session_id;
DROP TABLE IF EXISTS audio_chunks;
