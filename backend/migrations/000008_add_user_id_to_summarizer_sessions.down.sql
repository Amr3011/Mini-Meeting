BEGIN;

DROP INDEX IF EXISTS idx_summarizer_sessions_user_id;

ALTER TABLE summarizer_sessions DROP COLUMN IF EXISTS user_id;

COMMIT;
