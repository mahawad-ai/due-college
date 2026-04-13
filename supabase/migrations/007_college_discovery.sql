-- ─── Expand Colleges Table ──────────────────────────────────────────────────────
ALTER TABLE colleges ADD COLUMN IF NOT EXISTS sat_25th INTEGER;
ALTER TABLE colleges ADD COLUMN IF NOT EXISTS sat_75th INTEGER;
ALTER TABLE colleges ADD COLUMN IF NOT EXISTS act_25th INTEGER;
ALTER TABLE colleges ADD COLUMN IF NOT EXISTS act_75th INTEGER;
ALTER TABLE colleges ADD COLUMN IF NOT EXISTS gpa_25th DECIMAL(3,2);
ALTER TABLE colleges ADD COLUMN IF NOT EXISTS gpa_75th DECIMAL(3,2);
ALTER TABLE colleges ADD COLUMN IF NOT EXISTS acceptance_rate DECIMAL(3,2);
ALTER TABLE colleges ADD COLUMN IF NOT EXISTS tuition_in_state INTEGER;
ALTER TABLE colleges ADD COLUMN IF NOT EXISTS tuition_out_of_state INTEGER;
ALTER TABLE colleges ADD COLUMN IF NOT EXISTS avg_merit_aid INTEGER;
ALTER TABLE colleges ADD COLUMN IF NOT EXISTS avg_need_based_aid INTEGER;
ALTER TABLE colleges ADD COLUMN IF NOT EXISTS avg_starting_salary INTEGER;
ALTER TABLE colleges ADD COLUMN IF NOT EXISTS career_placement_rate DECIMAL(3,2);
ALTER TABLE colleges ADD COLUMN IF NOT EXISTS campus_culture_rating DECIMAL(2,1);
ALTER TABLE colleges ADD COLUMN IF NOT EXISTS size TEXT; -- 'small', 'medium', 'large'
ALTER TABLE colleges ADD COLUMN IF NOT EXISTS setting TEXT; -- 'urban', 'suburban', 'rural'
ALTER TABLE colleges ADD COLUMN IF NOT EXISTS majors_offered JSONB DEFAULT '[]';
ALTER TABLE colleges ADD COLUMN IF NOT EXISTS student_reviews_count INTEGER DEFAULT 0;
ALTER TABLE colleges ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

CREATE INDEX IF NOT EXISTS colleges_sat_range_idx ON colleges(sat_25th, sat_75th);
CREATE INDEX IF NOT EXISTS colleges_gpa_range_idx ON colleges(gpa_25th, gpa_75th);
CREATE INDEX IF NOT EXISTS colleges_acceptance_rate_idx ON colleges(acceptance_rate);
CREATE INDEX IF NOT EXISTS colleges_size_idx ON colleges(size);
CREATE INDEX IF NOT EXISTS colleges_setting_idx ON colleges(setting);

-- ─── Student Profiles Table ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS student_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL UNIQUE REFERENCES users(clerk_user_id) ON DELETE CASCADE,
  sat_score INTEGER,
  act_score INTEGER,
  gpa_weighted DECIMAL(4,3),
  gpa_unweighted DECIMAL(4,3),
  intended_majors JSONB DEFAULT '[]',
  extracurriculars JSONB DEFAULT '[]', -- [{name, type, hours_per_week, leadership_role}, ...]
  location_preference TEXT, -- state or 'any'
  budget_constraint INTEGER, -- max annual cost
  size_preference TEXT, -- 'small', 'medium', 'large', 'any'
  culture_preferences JSONB DEFAULT '{}', -- {party_scene, diversity, competitiveness, ...}
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS student_profiles_user_id_idx ON student_profiles(user_id);

-- ─── College Matches Table (stores personalized fit scores) ──────────────────────
CREATE TABLE IF NOT EXISTS college_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(clerk_user_id) ON DELETE CASCADE,
  college_id UUID NOT NULL REFERENCES colleges(id) ON DELETE CASCADE,
  match_type TEXT NOT NULL CHECK (match_type IN ('reach', 'target', 'likely')),
  overall_fit_score INTEGER CHECK (overall_fit_score >= 0 AND overall_fit_score <= 100),
  academic_fit_score INTEGER,
  culture_fit_score INTEGER,
  affordability_fit_score INTEGER,
  career_fit_score INTEGER,
  chancing_percentage INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, college_id)
);

CREATE INDEX IF NOT EXISTS college_matches_user_id_idx ON college_matches(user_id);
CREATE INDEX IF NOT EXISTS college_matches_match_type_idx ON college_matches(match_type);
CREATE INDEX IF NOT EXISTS college_matches_overall_fit_idx ON college_matches(overall_fit_score);

-- ─── College Reviews Table ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS college_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(clerk_user_id) ON DELETE CASCADE,
  college_id UUID NOT NULL REFERENCES colleges(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  category TEXT, -- 'campus_culture', 'academics', 'social_life', 'diversity', 'value'
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS college_reviews_college_id_idx ON college_reviews(college_id);
CREATE INDEX IF NOT EXISTS college_reviews_user_id_idx ON college_reviews(user_id);

-- ─── Enable RLS on new tables ────────────────────────────────────────────────────
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE college_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE college_reviews ENABLE ROW LEVEL SECURITY;

-- Service role bypass
CREATE POLICY "Service role bypass student_profiles" ON student_profiles
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role bypass college_matches" ON college_matches
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role bypass college_reviews" ON college_reviews
  FOR ALL TO service_role USING (true) WITH CHECK (true);
