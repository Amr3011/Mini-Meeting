-- Remove unused columns from meetings table
ALTER TABLE meetings DROP COLUMN IF EXISTS title;

ALTER TABLE meetings DROP COLUMN IF EXISTS description;

ALTER TABLE meetings DROP COLUMN IF EXISTS scheduled_at;

ALTER TABLE meetings DROP COLUMN IF EXISTS duration;