-- Restore local authentication columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS password VARCHAR(255);

ALTER TABLE users
ADD COLUMN IF NOT EXISTS verification_code VARCHAR(6);

ALTER TABLE users
ADD COLUMN IF NOT EXISTS verification_code_expiry TIMESTAMP;

ALTER TABLE users
ADD COLUMN IF NOT EXISTS password_reset_code VARCHAR(6);

ALTER TABLE users
ADD COLUMN IF NOT EXISTS password_reset_expiry TIMESTAMP;

ALTER TABLE users
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;