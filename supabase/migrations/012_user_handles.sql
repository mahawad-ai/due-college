-- 012_user_handles.sql
-- Shareable personal handles for due.college/{handle} invite URLs.

CREATE TABLE IF NOT EXISTS user_handles (
  user_id     TEXT PRIMARY KEY,
  handle      TEXT NOT NULL UNIQUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Case-insensitive lookup (usernames are lowercase-canonical but defensive).
CREATE INDEX IF NOT EXISTS idx_user_handles_handle_lower
  ON user_handles (LOWER(handle));

-- Grace pool: when a user changes their handle, the old one lives here briefly
-- so someone else can't immediately claim it and hijack invite links.
CREATE TABLE IF NOT EXISTS handle_grace_pool (
  handle        TEXT PRIMARY KEY,
  previous_user_id TEXT NOT NULL,
  released_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reclaim_at    TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days')
);

CREATE INDEX IF NOT EXISTS idx_handle_grace_reclaim_at
  ON handle_grace_pool (reclaim_at);
