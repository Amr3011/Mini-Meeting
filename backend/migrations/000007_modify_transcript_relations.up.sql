-- Migration: modify_transcript_relations
-- Created: 2026-02-17 15:13:41

-- Write your UP migration here

ALTER TABLE transcripts DROP COLUMN IF EXISTS chunk_id;

ALTER TABLE summarizer_sessions ADD COLUMN IF NOT EXISTS transcript TEXT;
ALTER TABLE summarizer_sessions ADD COLUMN IF NOT EXISTS summary TEXT;
