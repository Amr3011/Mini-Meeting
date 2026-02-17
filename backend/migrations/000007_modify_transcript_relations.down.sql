-- Migration Rollback: modify_transcript_relations
-- Created: 2026-02-17 15:13:41

-- Write your DOWN migration here (to undo the UP migration)
-- Example: ALTER TABLE users DROP COLUMN avatar_url;

ALTER TABLE transcripts ADD COLUMN IF NOT EXISTS chunk_id INTEGER;
ALTER TABLE transcripts
    ADD CONSTRAINT fk_transcripts_chunk
    FOREIGN KEY (chunk_id) REFERENCES audio_chunks(id)
    ON DELETE SET NULL;

ALTER TABLE summarizer_sessions DROP COLUMN IF EXISTS transcript;
ALTER TABLE summarizer_sessions DROP COLUMN IF EXISTS summary;
