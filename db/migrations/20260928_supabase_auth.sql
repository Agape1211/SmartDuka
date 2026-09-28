ALTER TABLE users
  ADD COLUMN IF NOT EXISTS auth_user_id UUID;

ALTER TABLE users
  ALTER COLUMN password_hash DROP NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_auth_user_id
  ON users (auth_user_id)
  WHERE auth_user_id IS NOT NULL;