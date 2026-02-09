-- Remove local authentication columns from users table
ALTER TABLE users DROP COLUMN IF EXISTS password;

ALTER TABLE users DROP COLUMN IF EXISTS verification_code;

ALTER TABLE users DROP COLUMN IF EXISTS verification_code_expiry;

ALTER TABLE users DROP COLUMN IF EXISTS password_reset_code;

ALTER TABLE users DROP COLUMN IF EXISTS password_reset_expiry;

ALTER TABLE users DROP COLUMN IF EXISTS email_verified;