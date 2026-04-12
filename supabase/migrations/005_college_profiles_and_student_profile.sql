-- ─── Extend colleges table with profile data ───────────────────────────────
ALTER TABLE colleges ADD COLUMN IF NOT EXISTS acceptance_rate NUMERIC(5,2);
ALTER TABLE colleges ADD COLUMN IF NOT EXISTS avg_gpa NUMERIC(4,2);
ALTER TABLE colleges ADD COLUMN IF NOT EXISTS sat_25 INTEGER;
ALTER TABLE colleges ADD COLUMN IF NOT EXISTS sat_75 INTEGER;
ALTER TABLE colleges ADD COLUMN IF NOT EXISTS act_25 INTEGER;
ALTER TABLE colleges ADD COLUMN IF NOT EXISTS act_75 INTEGER;
ALTER TABLE colleges ADD COLUMN IF NOT EXISTS tuition_in_state INTEGER;
ALTER TABLE colleges ADD COLUMN IF NOT EXISTS tuition_out_state INTEGER;
ALTER TABLE colleges ADD COLUMN IF NOT EXISTS enrollment INTEGER;
ALTER TABLE colleges ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'private' CHECK (type IN ('public','private','liberal_arts','community'));
ALTER TABLE colleges ADD COLUMN IF NOT EXISTS region TEXT;
ALTER TABLE colleges ADD COLUMN IF NOT EXISTS setting TEXT CHECK (setting IN ('urban','suburban','rural','small_town'));
ALTER TABLE colleges ADD COLUMN IF NOT EXISTS majors TEXT[];
ALTER TABLE colleges ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- Update existing 50 colleges with realistic profile data
-- Tier 1: Ivy League
UPDATE colleges SET acceptance_rate=3.2,  avg_gpa=3.95, sat_25=1500, sat_75=1580, act_25=34, act_75=36, tuition_out_state=59950, enrollment=21000, type='private', region='Northeast', setting='urban'    WHERE name='Harvard University';
UPDATE colleges SET acceptance_rate=3.7,  avg_gpa=3.96, sat_25=1510, sat_75=1590, act_25=34, act_75=36, tuition_out_state=59890, enrollment=7000,  type='private', region='Northeast', setting='suburban' WHERE name='Princeton University';
UPDATE colleges SET acceptance_rate=4.4,  avg_gpa=3.95, sat_25=1500, sat_75=1580, act_25=34, act_75=36, tuition_out_state=62016, enrollment=6600,  type='private', region='Northeast', setting='urban'    WHERE name='Yale University';
UPDATE colleges SET acceptance_rate=6.9,  avg_gpa=3.9,  sat_25=1490, sat_75=1570, act_25=34, act_75=36, tuition_out_state=63518, enrollment=15000, type='private', region='Northeast', setting='urban'    WHERE name='Columbia University';
UPDATE colleges SET acceptance_rate=7.9,  avg_gpa=3.9,  sat_25=1490, sat_75=1570, act_25=33, act_75=36, tuition_out_state=63025, enrollment=10000, type='private', region='Northeast', setting='urban'    WHERE name='University of Pennsylvania';
UPDATE colleges SET acceptance_rate=9.0,  avg_gpa=3.9,  sat_25=1480, sat_75=1570, act_25=33, act_75=35, tuition_out_state=63590, enrollment=14500, type='private', region='Northeast', setting='suburban' WHERE name='Dartmouth College';
UPDATE colleges SET acceptance_rate=10.8, avg_gpa=3.88, sat_25=1460, sat_75=1560, act_25=32, act_75=35, tuition_out_state=63025, enrollment=15000, type='private', region='Northeast', setting='suburban' WHERE name='Cornell University';
UPDATE colleges SET acceptance_rate=8.9,  avg_gpa=3.9,  sat_25=1490, sat_75=1570, act_25=33, act_75=36, tuition_out_state=63590, enrollment=9000,  type='private', region='Northeast', setting='urban'    WHERE name='Brown University';

-- Tier 2: Elite Private
UPDATE colleges SET acceptance_rate=3.9,  avg_gpa=3.96, sat_25=1510, sat_75=1590, act_25=34, act_75=36, tuition_out_state=62484, enrollment=7000,  type='private', region='West', setting='suburban'   WHERE name='Stanford University';
UPDATE colleges SET acceptance_rate=3.9,  avg_gpa=3.97, sat_25=1510, sat_75=1590, act_25=35, act_75=36, tuition_out_state=59750, enrollment=4500,  type='private', region='West', setting='urban'       WHERE name='MIT';
UPDATE colleges SET acceptance_rate=7.3,  avg_gpa=3.9,  sat_25=1490, sat_75=1570, act_25=34, act_75=36, tuition_out_state=59070, enrollment=6400,  type='private', region='South', setting='suburban'   WHERE name='Duke University';
UPDATE colleges SET acceptance_rate=6.4,  avg_gpa=3.92, sat_25=1490, sat_75=1580, act_25=33, act_75=36, tuition_out_state=61194, enrollment=7000,  type='private', region='South', setting='suburban'   WHERE name='Vanderbilt University';
UPDATE colleges SET acceptance_rate=9.2,  avg_gpa=3.9,  sat_25=1480, sat_75=1570, act_25=33, act_75=35, tuition_out_state=62468, enrollment=9000,  type='private', region='South', setting='urban'       WHERE name='Rice University';
UPDATE colleges SET acceptance_rate=11.0, avg_gpa=3.85, sat_25=1460, sat_75=1560, act_25=32, act_75=35, tuition_out_state=64384, enrollment=10000, type='private', region='South', setting='urban'       WHERE name='Georgetown University';
UPDATE colleges SET acceptance_rate=11.0, avg_gpa=3.87, sat_25=1450, sat_75=1560, act_25=32, act_75=35, tuition_out_state=62470, enrollment=9200,  type='private', region='Northeast', setting='suburban' WHERE name='Tufts University';
UPDATE colleges SET acceptance_rate=12.0, avg_gpa=3.85, sat_25=1440, sat_75=1550, act_25=32, act_75=35, tuition_out_state=65804, enrollment=8400,  type='private', region='West', setting='urban'        WHERE name='University of Southern California';
UPDATE colleges SET acceptance_rate=16.5, avg_gpa=3.8,  sat_25=1400, sat_75=1540, act_25=31, act_75=35, tuition_out_state=60798, enrollment=7600,  type='private', region='Northeast', setting='urban'   WHERE name='Boston University';
UPDATE colleges SET acceptance_rate=14.0, avg_gpa=3.83, sat_25=1430, sat_75=1550, act_25=32, act_75=35, tuition_out_state=61506, enrollment=8600,  type='private', region='Northeast', setting='urban'   WHERE name='Northeastern University';
UPDATE colleges SET acceptance_rate=17.0, avg_gpa=3.79, sat_25=1390, sat_75=1530, act_25=31, act_75=35, tuition_out_state=60292, enrollment=12000, type='private', region='West', setting='urban'        WHERE name='University of Notre Dame';

-- Tier 3: Top Liberal Arts
UPDATE colleges SET acceptance_rate=7.0,  avg_gpa=3.92, sat_25=1480, sat_75=1570, act_25=33, act_75=35, tuition_out_state=64410, enrollment=2100,  type='liberal_arts', region='Northeast', setting='rural'    WHERE name='Williams College';
UPDATE colleges SET acceptance_rate=8.0,  avg_gpa=3.9,  sat_25=1470, sat_75=1570, act_25=33, act_75=35, tuition_out_state=63970, enrollment=1900,  type='liberal_arts', region='Northeast', setting='suburban'  WHERE name='Amherst College';
UPDATE colleges SET acceptance_rate=9.0,  avg_gpa=3.88, sat_25=1460, sat_75=1570, act_25=33, act_75=35, tuition_out_state=63230, enrollment=2100,  type='liberal_arts', region='Northeast', setting='suburban'  WHERE name='Swarthmore College';
UPDATE colleges SET acceptance_rate=10.0, avg_gpa=3.88, sat_25=1450, sat_75=1560, act_25=32, act_75=35, tuition_out_state=64490, enrollment=1800,  type='liberal_arts', region='Northeast', setting='rural'    WHERE name='Middlebury College';
UPDATE colleges SET acceptance_rate=11.0, avg_gpa=3.86, sat_25=1440, sat_75=1560, act_25=32, act_75=35, tuition_out_state=61270, enrollment=2900,  type='liberal_arts', region='Northeast', setting='suburban'  WHERE name='Bowdoin College';
UPDATE colleges SET acceptance_rate=13.0, avg_gpa=3.84, sat_25=1420, sat_75=1540, act_25=31, act_75=35, tuition_out_state=62950, enrollment=2900,  type='liberal_arts', region='Northeast', setting='suburban'  WHERE name='Colby College';
UPDATE colleges SET acceptance_rate=14.0, avg_gpa=3.82, sat_25=1410, sat_75=1540, act_25=31, act_75=34, tuition_out_state=63450, enrollment=1700,  type='liberal_arts', region='Northeast', setting='suburban'  WHERE name='Colgate University';
UPDATE colleges SET acceptance_rate=14.0, avg_gpa=3.82, sat_25=1410, sat_75=1540, act_25=31, act_75=34, tuition_out_state=62154, enrollment=2400,  type='liberal_arts', region='Northeast', setting='rural'    WHERE name='Bates College';
UPDATE colleges SET acceptance_rate=17.0, avg_gpa=3.79, sat_25=1380, sat_75=1530, act_25=30, act_75=34, tuition_out_state=66190, enrollment=2400,  type='liberal_arts', region='South', setting='suburban'     WHERE name='Davidson College';
UPDATE colleges SET acceptance_rate=17.0, avg_gpa=3.79, sat_25=1380, sat_75=1530, act_25=30, act_75=34, tuition_out_state=62960, enrollment=2000,  type='liberal_arts', region='South', setting='suburban'     WHERE name='Haverford College';

-- Tier 4: Top Public
UPDATE colleges SET acceptance_rate=11.4, avg_gpa=4.15, sat_25=1310, sat_75=1530, act_25=28, act_75=35, tuition_in_state=14312, tuition_out_state=44066, enrollment=32000, type='public', region='West', setting='suburban'   WHERE name='UCLA';
UPDATE colleges SET acceptance_rate=11.5, avg_gpa=4.15, sat_25=1310, sat_75=1530, act_25=28, act_75=35, tuition_in_state=14307, tuition_out_state=44066, enrollment=31800, type='public', region='West', setting='urban'      WHERE name='UC Berkeley';
UPDATE colleges SET acceptance_rate=26.0, avg_gpa=3.89, sat_25=1200, sat_75=1480, act_25=25, act_75=33, tuition_in_state=10958, tuition_out_state=29026, enrollment=46000, type='public', region='South', setting='urban'     WHERE name='University of Michigan';
UPDATE colleges SET acceptance_rate=20.0, avg_gpa=3.85, sat_25=1270, sat_75=1490, act_25=27, act_75=33, tuition_in_state=10726, tuition_out_state=39086, enrollment=35000, type='public', region='Northeast', setting='suburban' WHERE name='University of Virginia';
UPDATE colleges SET acceptance_rate=45.0, avg_gpa=3.8,  sat_25=1240, sat_75=1450, act_25=27, act_75=33, tuition_in_state=11520, tuition_out_state=36250, enrollment=50000, type='public', region='South', setting='suburban'  WHERE name='University of North Carolina';
UPDATE colleges SET acceptance_rate=45.0, avg_gpa=3.78, sat_25=1230, sat_75=1450, act_25=26, act_75=32, tuition_in_state=10726, tuition_out_state=36726, enrollment=47000, type='public', region='Midwest', setting='urban'   WHERE name='University of Wisconsin';
UPDATE colleges SET acceptance_rate=52.0, avg_gpa=3.7,  sat_25=1180, sat_75=1430, act_25=25, act_75=31, tuition_in_state=11958, tuition_out_state=37622, enrollment=48000, type='public', region='Midwest', setting='urban'   WHERE name='Ohio State University';
UPDATE colleges SET acceptance_rate=57.0, avg_gpa=3.68, sat_25=1160, sat_75=1400, act_25=25, act_75=31, tuition_in_state=15070, tuition_out_state=38250, enrollment=53000, type='public', region='South', setting='urban'     WHERE name='University of Texas Austin';
UPDATE colleges SET acceptance_rate=44.0, avg_gpa=3.75, sat_25=1200, sat_75=1430, act_25=26, act_75=31, tuition_in_state=16988, tuition_out_state=53790, enrollment=47000, type='public', region='South', setting='suburban'  WHERE name='Georgia Tech';
UPDATE colleges SET acceptance_rate=57.0, avg_gpa=3.72, sat_25=1160, sat_75=1390, act_25=25, act_75=31, tuition_in_state=16078, tuition_out_state=44044, enrollment=45000, type='public', region='South', setting='urban'     WHERE name='University of Florida';

-- ─── Student Academic Profile ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS student_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL UNIQUE REFERENCES users(clerk_user_id) ON DELETE CASCADE,
  gpa NUMERIC(4,2),
  gpa_scale NUMERIC(4,2) DEFAULT 4.0,
  weighted_gpa NUMERIC(4,2),
  class_rank INTEGER,
  class_size INTEGER,
  graduation_year INTEGER,
  intended_major TEXT,
  intended_major_2 TEXT,
  preferred_regions TEXT[],
  preferred_settings TEXT[],
  preferred_size TEXT CHECK (preferred_size IN ('small','medium','large','any')),
  best_sat INTEGER,
  best_act INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role bypass student_profiles" ON student_profiles
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS student_profiles_user_id_idx ON student_profiles(user_id);
