-- ─── Custom Deadlines ──────────────────────────────────────────────────────
-- User-created deadlines (scholarships, housing apps, personal reminders)
CREATE TABLE IF NOT EXISTS custom_deadlines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(clerk_user_id) ON DELETE CASCADE,
  college_id UUID REFERENCES colleges(id) ON DELETE SET NULL,
  college_name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'Custom',
  due_date DATE NOT NULL,
  notes TEXT,
  is_submitted BOOLEAN DEFAULT false,
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS custom_deadlines_user_id_idx ON custom_deadlines(user_id);
CREATE INDEX IF NOT EXISTS custom_deadlines_due_date_idx ON custom_deadlines(due_date);

-- Add notes support to existing deadline statuses
ALTER TABLE user_deadline_status ADD COLUMN IF NOT EXISTS user_notes TEXT;

-- ─── Activities ────────────────────────────────────────────────────────────
-- Volunteering, internships, extracurriculars, awards, etc.
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(clerk_user_id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('volunteering', 'internship', 'work', 'extracurricular', 'research', 'award', 'other')),
  title TEXT NOT NULL,
  organization TEXT NOT NULL,
  role TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  is_ongoing BOOLEAN DEFAULT false,
  hours_per_week INTEGER,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS activities_user_id_idx ON activities(user_id);
CREATE INDEX IF NOT EXISTS activities_type_idx ON activities(type);

-- ─── RLS Policies ──────────────────────────────────────────────────────────
ALTER TABLE custom_deadlines ENABLE ROW LEVEL SECURITY;

-- Service role bypasses RLS (used by all API routes)
CREATE POLICY "Service role bypass custom_deadlines" ON custom_deadlines
  FOR ALL TO service_role USING (true) WITH CHECK (true);

ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role bypass activities" ON activities
  FOR ALL TO service_role USING (true) WITH CHECK (true);
