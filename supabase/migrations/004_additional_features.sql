-- ─── Essays ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS essays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(clerk_user_id) ON DELETE CASCADE,
  college_id UUID REFERENCES colleges(id) ON DELETE SET NULL,
  college_name TEXT,
  type TEXT NOT NULL DEFAULT 'supplemental'
    CHECK (type IN ('common_app', 'supplemental', 'why_school', 'additional', 'other')),
  prompt TEXT,
  word_limit INTEGER,
  status TEXT NOT NULL DEFAULT 'not_started'
    CHECK (status IN ('not_started', 'draft', 'reviewed', 'final')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS essays_user_id_idx ON essays(user_id);

-- ─── Recommendations ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(clerk_user_id) ON DELETE CASCADE,
  recommender_name TEXT NOT NULL,
  recommender_role TEXT NOT NULL DEFAULT 'teacher'
    CHECK (recommender_role IN ('teacher', 'counselor', 'employer', 'mentor', 'other')),
  subject TEXT,
  date_asked DATE,
  status TEXT NOT NULL DEFAULT 'not_asked'
    CHECK (status IN ('not_asked', 'asked', 'confirmed', 'submitted')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS recommendations_user_id_idx ON recommendations(user_id);

-- ─── Application status on user_colleges ────────────────────────────────────
ALTER TABLE user_colleges ADD COLUMN IF NOT EXISTS app_status TEXT DEFAULT 'not_started'
  CHECK (app_status IN ('not_started','in_progress','submitted','accepted','waitlisted','rejected','deferred','enrolled'));
ALTER TABLE user_colleges ADD COLUMN IF NOT EXISTS college_notes TEXT;
ALTER TABLE user_colleges ADD COLUMN IF NOT EXISTS decision_date DATE;

-- ─── Document Checklist ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS document_checklist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(clerk_user_id) ON DELETE CASCADE,
  college_id UUID NOT NULL REFERENCES colleges(id) ON DELETE CASCADE,
  item TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS document_checklist_user_college_idx ON document_checklist(user_id, college_id);

-- ─── Scholarships ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS scholarships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(clerk_user_id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  organization TEXT,
  amount INTEGER,
  deadline DATE,
  requirements TEXT,
  status TEXT NOT NULL DEFAULT 'researching'
    CHECK (status IN ('researching','in_progress','submitted','awarded','rejected')),
  website TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS scholarships_user_id_idx ON scholarships(user_id);

-- ─── Test Scores ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS test_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(clerk_user_id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('SAT','ACT','SAT_Math','SAT_EBRW','AP','IB','TOEFL','PSAT','Other')),
  score INTEGER NOT NULL,
  max_score INTEGER,
  test_date DATE,
  subject TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS test_scores_user_id_idx ON test_scores(user_id);

-- ─── Interviews ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS interviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(clerk_user_id) ON DELETE CASCADE,
  college_id UUID REFERENCES colleges(id) ON DELETE SET NULL,
  college_name TEXT NOT NULL,
  interview_date DATE,
  format TEXT DEFAULT 'unknown' CHECK (format IN ('virtual','in_person','phone','unknown')),
  interviewer_name TEXT,
  status TEXT NOT NULL DEFAULT 'invited'
    CHECK (status IN ('invited','scheduled','completed','cancelled')),
  prep_notes TEXT,
  outcome_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS interviews_user_id_idx ON interviews(user_id);

-- ─── RLS (service role bypass for all new tables) ───────────────────────────
ALTER TABLE essays ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role bypass essays" ON essays FOR ALL TO service_role USING (true) WITH CHECK (true);

ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role bypass recommendations" ON recommendations FOR ALL TO service_role USING (true) WITH CHECK (true);

ALTER TABLE document_checklist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role bypass document_checklist" ON document_checklist FOR ALL TO service_role USING (true) WITH CHECK (true);

ALTER TABLE scholarships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role bypass scholarships" ON scholarships FOR ALL TO service_role USING (true) WITH CHECK (true);

ALTER TABLE test_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role bypass test_scores" ON test_scores FOR ALL TO service_role USING (true) WITH CHECK (true);

ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role bypass interviews" ON interviews FOR ALL TO service_role USING (true) WITH CHECK (true);
