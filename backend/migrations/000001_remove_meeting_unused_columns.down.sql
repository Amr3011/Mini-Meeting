-- Rollback: Add back the columns (in case we need to revert)
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS title VARCHAR(255);

ALTER TABLE meetings ADD COLUMN IF NOT EXISTS description TEXT;

ALTER TABLE meetings ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMP;

ALTER TABLE meetings ADD COLUMN IF NOT EXISTS duration INTEGER;