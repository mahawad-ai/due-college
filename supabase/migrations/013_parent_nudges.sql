-- 013_parent_nudges.sql
-- Track nudges sent by parents so we can rate-limit them.

CREATE TABLE IF NOT EXISTS parent_nudges (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_connection_id UUID NOT NULL REFERENCES parent_connections(id) ON DELETE CASCADE,
  deadline_id       UUID REFERENCES deadlines(id) ON DELETE SET NULL,
  message           TEXT,
  sent_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_parent_nudges_connection
  ON parent_nudges (parent_connection_id, sent_at DESC);

-- Rate limit: max 3 nudges per parent per day (enforced in app code, index supports the query).
