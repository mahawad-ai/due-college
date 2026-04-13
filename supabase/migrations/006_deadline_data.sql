-- Insert colleges (skip if already exists)
INSERT INTO colleges (id, name, common_app) VALUES
  (gen_random_uuid(), 'Harvard University', true),
  (gen_random_uuid(), 'Stanford University', true),
  (gen_random_uuid(), 'Massachusetts Institute of Technology', true),
  (gen_random_uuid(), 'Yale University', true),
  (gen_random_uuid(), 'Princeton University', true),
  (gen_random_uuid(), 'Columbia University', true),
  (gen_random_uuid(), 'University of Pennsylvania', true),
  (gen_random_uuid(), 'Brown University', true),
  (gen_random_uuid(), 'Dartmouth College', true),
  (gen_random_uuid(), 'Cornell University', true),
  (gen_random_uuid(), 'Duke University', true),
  (gen_random_uuid(), 'Vanderbilt University', true),
  (gen_random_uuid(), 'Northwestern University', true),
  (gen_random_uuid(), 'Johns Hopkins University', true),
  (gen_random_uuid(), 'Rice University', true),
  (gen_random_uuid(), 'University of Notre Dame', true),
  (gen_random_uuid(), 'Georgetown University', true),
  (gen_random_uuid(), 'Emory University', true),
  (gen_random_uuid(), 'Tufts University', true),
  (gen_random_uuid(), 'Tulane University', true),
  (gen_random_uuid(), 'UCLA', true),
  (gen_random_uuid(), 'UC Berkeley', false),
  (gen_random_uuid(), 'University of Michigan', true),
  (gen_random_uuid(), 'University of Virginia', true),
  (gen_random_uuid(), 'UNC Chapel Hill', true),
  (gen_random_uuid(), 'New York University', true),
  (gen_random_uuid(), 'Boston University', true),
  (gen_random_uuid(), 'Northeastern University', true),
  (gen_random_uuid(), 'University of Florida', true),
  (gen_random_uuid(), 'Ohio State University', true),
  (gen_random_uuid(), 'Penn State University', true),
  (gen_random_uuid(), 'University of Alabama', true),
  (gen_random_uuid(), 'University of Tennessee', true)
ON CONFLICT (name) DO NOTHING;

-- Insert deadlines
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'REA', '2025-11-01' FROM colleges WHERE name = 'Harvard University';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-01-01' FROM colleges WHERE name = 'Harvard University';

INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'REA', '2025-11-01' FROM colleges WHERE name = 'Stanford University';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-01-05' FROM colleges WHERE name = 'Stanford University';

INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-11-01' FROM colleges WHERE name = 'Massachusetts Institute of Technology';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-01-06' FROM colleges WHERE name = 'Massachusetts Institute of Technology';

INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'REA', '2025-11-01' FROM colleges WHERE name = 'Yale University';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-01-02' FROM colleges WHERE name = 'Yale University';

INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'REA', '2025-11-01' FROM colleges WHERE name = 'Princeton University';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-01-01' FROM colleges WHERE name = 'Princeton University';

INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED1', '2025-11-01' FROM colleges WHERE name = 'Columbia University';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-01-01' FROM colleges WHERE name = 'Columbia University';

INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED1', '2025-11-01' FROM colleges WHERE name = 'University of Pennsylvania';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-01-05' FROM colleges WHERE name = 'University of Pennsylvania';

INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED1', '2025-11-01' FROM colleges WHERE name = 'Brown University';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED2', '2026-01-01' FROM colleges WHERE name = 'Brown University';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-01-05' FROM colleges WHERE name = 'Brown University';

INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED1', '2025-11-01' FROM colleges WHERE name = 'Dartmouth College';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED2', '2026-01-02' FROM colleges WHERE name = 'Dartmouth College';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-01-01' FROM colleges WHERE name = 'Dartmouth College';

INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED1', '2025-11-01' FROM colleges WHERE name = 'Cornell University';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED2', '2026-01-01' FROM colleges WHERE name = 'Cornell University';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-01-02' FROM colleges WHERE name = 'Cornell University';

INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED1', '2025-11-01' FROM colleges WHERE name = 'Duke University';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED2', '2026-01-05' FROM colleges WHERE name = 'Duke University';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-01-05' FROM colleges WHERE name = 'Duke University';

INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED1', '2025-11-01' FROM colleges WHERE name = 'Vanderbilt University';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED2', '2026-01-01' FROM colleges WHERE name = 'Vanderbilt University';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-01-01' FROM colleges WHERE name = 'Vanderbilt University';

INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED1', '2025-11-01' FROM colleges WHERE name = 'Northwestern University';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED2', '2026-01-01' FROM colleges WHERE name = 'Northwestern University';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-01-02' FROM colleges WHERE name = 'Northwestern University';

INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED1', '2025-11-01' FROM colleges WHERE name = 'Johns Hopkins University';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED2', '2026-01-02' FROM colleges WHERE name = 'Johns Hopkins University';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-01-02' FROM colleges WHERE name = 'Johns Hopkins University';

INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED1', '2025-11-01' FROM colleges WHERE name = 'Rice University';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED2', '2026-01-01' FROM colleges WHERE name = 'Rice University';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-01-04' FROM colleges WHERE name = 'Rice University';

INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'REA', '2025-11-01' FROM colleges WHERE name = 'University of Notre Dame';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-01-02' FROM colleges WHERE name = 'University of Notre Dame';

INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-11-01' FROM colleges WHERE name = 'Georgetown University';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-01-10' FROM colleges WHERE name = 'Georgetown University';

INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED1', '2025-11-01' FROM colleges WHERE name = 'Emory University';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED2', '2026-01-01' FROM colleges WHERE name = 'Emory University';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-01-01' FROM colleges WHERE name = 'Emory University';

INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED1', '2025-11-01' FROM colleges WHERE name = 'Tufts University';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED2', '2026-01-01' FROM colleges WHERE name = 'Tufts University';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-01-04' FROM colleges WHERE name = 'Tufts University';

INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED1', '2025-11-01' FROM colleges WHERE name = 'Tulane University';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-11-10' FROM colleges WHERE name = 'Tulane University';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED2', '2026-01-15' FROM colleges WHERE name = 'Tulane University';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-01-15' FROM colleges WHERE name = 'Tulane University';

INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2025-11-30' FROM colleges WHERE name = 'UCLA';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2025-11-30' FROM colleges WHERE name = 'UC Berkeley';

INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-11-01' FROM colleges WHERE name = 'University of Michigan';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-02-01' FROM colleges WHERE name = 'University of Michigan';

INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED1', '2025-11-01' FROM colleges WHERE name = 'University of Virginia';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-11-01' FROM colleges WHERE name = 'University of Virginia';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-01-05' FROM colleges WHERE name = 'University of Virginia';

INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-10-15' FROM colleges WHERE name = 'UNC Chapel Hill';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-01-15' FROM colleges WHERE name = 'UNC Chapel Hill';

INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED1', '2025-11-01' FROM colleges WHERE name = 'New York University';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED2', '2026-01-15' FROM colleges WHERE name = 'New York University';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-01-01' FROM colleges WHERE name = 'New York University';

INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED1', '2025-11-01' FROM colleges WHERE name = 'Boston University';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED2', '2026-01-02' FROM colleges WHERE name = 'Boston University';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-01-05' FROM colleges WHERE name = 'Boston University';

INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-11-01' FROM colleges WHERE name = 'Northeastern University';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED1', '2025-11-01' FROM colleges WHERE name = 'Northeastern University';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'ED2', '2026-01-01' FROM colleges WHERE name = 'Northeastern University';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-01-01' FROM colleges WHERE name = 'Northeastern University';

INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-11-01' FROM colleges WHERE name = 'University of Florida';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-01-15' FROM colleges WHERE name = 'University of Florida';

INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-11-01' FROM colleges WHERE name = 'Ohio State University';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-01-15' FROM colleges WHERE name = 'Ohio State University';

INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-11-01' FROM colleges WHERE name = 'Penn State University';

INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'Scholarship', '2025-12-05' FROM colleges WHERE name = 'University of Alabama';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'RD', '2026-01-10' FROM colleges WHERE name = 'University of Alabama';

INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'EA', '2025-11-01' FROM colleges WHERE name = 'University of Tennessee';
INSERT INTO deadlines (id, college_id, type, date) SELECT gen_random_uuid(), id, 'Scholarship', '2026-01-15' FROM colleges WHERE name = 'University of Tennessee';
