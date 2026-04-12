-- ════════════════════════════════════════════════════════════════
--  SEED DATA: 50 colleges + realistic 2026-2027 deadlines
-- ════════════════════════════════════════════════════════════════

-- ─── IVY LEAGUE ─────────────────────────────────────────────────
insert into colleges (id, name, state, city, website, common_app) values
  ('a0000001-0000-0000-0000-000000000001', 'Harvard University', 'MA', 'Cambridge', 'https://college.harvard.edu', true),
  ('a0000001-0000-0000-0000-000000000002', 'Yale University', 'CT', 'New Haven', 'https://yale.edu', true),
  ('a0000001-0000-0000-0000-000000000003', 'Princeton University', 'NJ', 'Princeton', 'https://princeton.edu', true),
  ('a0000001-0000-0000-0000-000000000004', 'Columbia University', 'NY', 'New York', 'https://columbia.edu', true),
  ('a0000001-0000-0000-0000-000000000005', 'University of Pennsylvania', 'PA', 'Philadelphia', 'https://upenn.edu', true),
  ('a0000001-0000-0000-0000-000000000006', 'Dartmouth College', 'NH', 'Hanover', 'https://dartmouth.edu', true),
  ('a0000001-0000-0000-0000-000000000007', 'Brown University', 'RI', 'Providence', 'https://brown.edu', true),
  ('a0000001-0000-0000-0000-000000000008', 'Cornell University', 'NY', 'Ithaca', 'https://cornell.edu', true)
on conflict (id) do nothing;

-- ─── ELITE PRIVATE ──────────────────────────────────────────────
insert into colleges (id, name, state, city, website, common_app) values
  ('b0000002-0000-0000-0000-000000000001', 'MIT', 'MA', 'Cambridge', 'https://mit.edu', false),
  ('b0000002-0000-0000-0000-000000000002', 'Stanford University', 'CA', 'Stanford', 'https://stanford.edu', false),
  ('b0000002-0000-0000-0000-000000000003', 'Duke University', 'NC', 'Durham', 'https://duke.edu', true),
  ('b0000002-0000-0000-0000-000000000004', 'Northwestern University', 'IL', 'Evanston', 'https://northwestern.edu', true),
  ('b0000002-0000-0000-0000-000000000005', 'Vanderbilt University', 'TN', 'Nashville', 'https://vanderbilt.edu', true),
  ('b0000002-0000-0000-0000-000000000006', 'University of Notre Dame', 'IN', 'Notre Dame', 'https://nd.edu', true),
  ('b0000002-0000-0000-0000-000000000007', 'Georgetown University', 'DC', 'Washington', 'https://georgetown.edu', false),
  ('b0000002-0000-0000-0000-000000000008', 'Emory University', 'GA', 'Atlanta', 'https://emory.edu', true),
  ('b0000002-0000-0000-0000-000000000009', 'Tufts University', 'MA', 'Medford', 'https://tufts.edu', true),
  ('b0000002-0000-0000-0000-000000000010', 'University of Southern California', 'CA', 'Los Angeles', 'https://usc.edu', true),
  ('b0000002-0000-0000-0000-000000000011', 'New York University', 'NY', 'New York', 'https://nyu.edu', true),
  ('b0000002-0000-0000-0000-000000000012', 'Rice University', 'TX', 'Houston', 'https://rice.edu', true)
on conflict (id) do nothing;

-- ─── TOP LIBERAL ARTS ────────────────────────────────────────────
insert into colleges (id, name, state, city, website, common_app) values
  ('c0000003-0000-0000-0000-000000000001', 'Williams College', 'MA', 'Williamstown', 'https://williams.edu', true),
  ('c0000003-0000-0000-0000-000000000002', 'Amherst College', 'MA', 'Amherst', 'https://amherst.edu', true),
  ('c0000003-0000-0000-0000-000000000003', 'Swarthmore College', 'PA', 'Swarthmore', 'https://swarthmore.edu', true),
  ('c0000003-0000-0000-0000-000000000004', 'Wellesley College', 'MA', 'Wellesley', 'https://wellesley.edu', true),
  ('c0000003-0000-0000-0000-000000000005', 'Bowdoin College', 'ME', 'Brunswick', 'https://bowdoin.edu', true)
on conflict (id) do nothing;

-- ─── TOP PUBLIC ──────────────────────────────────────────────────
insert into colleges (id, name, state, city, website, common_app) values
  ('d0000004-0000-0000-0000-000000000001', 'UCLA', 'CA', 'Los Angeles', 'https://ucla.edu', false),
  ('d0000004-0000-0000-0000-000000000002', 'UC Berkeley', 'CA', 'Berkeley', 'https://berkeley.edu', false),
  ('d0000004-0000-0000-0000-000000000003', 'University of Michigan', 'MI', 'Ann Arbor', 'https://umich.edu', true),
  ('d0000004-0000-0000-0000-000000000004', 'UT Austin', 'TX', 'Austin', 'https://utexas.edu', false),
  ('d0000004-0000-0000-0000-000000000005', 'UNC Chapel Hill', 'NC', 'Chapel Hill', 'https://unc.edu', true),
  ('d0000004-0000-0000-0000-000000000006', 'University of Virginia', 'VA', 'Charlottesville', 'https://virginia.edu', true),
  ('d0000004-0000-0000-0000-000000000007', 'Georgia Tech', 'GA', 'Atlanta', 'https://gatech.edu', true),
  ('d0000004-0000-0000-0000-000000000008', 'UC San Diego', 'CA', 'San Diego', 'https://ucsd.edu', false),
  ('d0000004-0000-0000-0000-000000000009', 'UC Davis', 'CA', 'Davis', 'https://ucdavis.edu', false),
  ('d0000004-0000-0000-0000-000000000010', 'UC Santa Barbara', 'CA', 'Santa Barbara', 'https://ucsb.edu', false),
  ('d0000004-0000-0000-0000-000000000011', 'University of Florida', 'FL', 'Gainesville', 'https://ufl.edu', true),
  ('d0000004-0000-0000-0000-000000000012', 'Ohio State University', 'OH', 'Columbus', 'https://osu.edu', true),
  ('d0000004-0000-0000-0000-000000000013', 'Penn State University', 'PA', 'State College', 'https://psu.edu', true),
  ('d0000004-0000-0000-0000-000000000014', 'University of Wisconsin', 'WI', 'Madison', 'https://wisc.edu', true),
  ('d0000004-0000-0000-0000-000000000015', 'University of Illinois', 'IL', 'Champaign', 'https://illinois.edu', true)
on conflict (id) do nothing;

-- ─── MOST APPLIED-TO ─────────────────────────────────────────────
insert into colleges (id, name, state, city, website, common_app) values
  ('e0000005-0000-0000-0000-000000000001', 'Arizona State University', 'AZ', 'Tempe', 'https://asu.edu', true),
  ('e0000005-0000-0000-0000-000000000002', 'Florida State University', 'FL', 'Tallahassee', 'https://fsu.edu', true),
  ('e0000005-0000-0000-0000-000000000003', 'Purdue University', 'IN', 'West Lafayette', 'https://purdue.edu', true),
  ('e0000005-0000-0000-0000-000000000004', 'Indiana University', 'IN', 'Bloomington', 'https://iu.edu', true),
  ('e0000005-0000-0000-0000-000000000005', 'Michigan State University', 'MI', 'East Lansing', 'https://msu.edu', true),
  ('e0000005-0000-0000-0000-000000000006', 'Texas A&M University', 'TX', 'College Station', 'https://tamu.edu', false),
  ('e0000005-0000-0000-0000-000000000007', 'University of Washington', 'WA', 'Seattle', 'https://uw.edu', true),
  ('e0000005-0000-0000-0000-000000000008', 'University of Colorado Boulder', 'CO', 'Boulder', 'https://colorado.edu', true),
  ('e0000005-0000-0000-0000-000000000009', 'University of Oregon', 'OR', 'Eugene', 'https://uoregon.edu', true),
  ('e0000005-0000-0000-0000-000000000010', 'Rutgers University', 'NJ', 'New Brunswick', 'https://rutgers.edu', true)
on conflict (id) do nothing;

-- ════════════════════════════════════════════════════════════════
-- DEADLINES
-- Ivy League: ED1 Nov 1, REA/EA Nov 1, RD Jan 1, Decision late Mar
-- Elite Private: ED1 Nov 1, EA Nov 1 or 15, RD Jan 1 or 15
-- Liberal Arts: ED1 Nov 1, ED2 Jan 1, RD Jan 15
-- Top Public: No ED, EA Oct 31 or Nov 1, RD Nov 30–Jan 1
-- Most Applied: RD Rolling or fixed, EA Aug–Oct
-- ════════════════════════════════════════════════════════════════

-- Harvard
insert into deadlines (college_id, type, date, time, notes) values
  ('a0000001-0000-0000-0000-000000000001', 'REA', '2026-11-01', '11:59 PM ET', 'Restrictive Early Action'),
  ('a0000001-0000-0000-0000-000000000001', 'RD', '2027-01-01', '11:59 PM ET', 'Regular Decision'),
  ('a0000001-0000-0000-0000-000000000001', 'FAFSA', '2026-10-01', '11:59 PM ET', 'CSS Profile priority deadline'),
  ('a0000001-0000-0000-0000-000000000001', 'Decision', '2026-12-15', null, 'REA decisions released'),
  ('a0000001-0000-0000-0000-000000000001', 'Decision', '2027-03-28', null, 'RD decisions released')
on conflict do nothing;

-- Yale
insert into deadlines (college_id, type, date, time, notes) values
  ('a0000001-0000-0000-0000-000000000002', 'REA', '2026-11-01', '11:59 PM ET', 'Restrictive Early Action'),
  ('a0000001-0000-0000-0000-000000000002', 'RD', '2027-01-02', '11:59 PM ET', 'Regular Decision'),
  ('a0000001-0000-0000-0000-000000000002', 'FAFSA', '2026-10-15', '11:59 PM ET', 'CSS Profile priority'),
  ('a0000001-0000-0000-0000-000000000002', 'Decision', '2026-12-15', null, 'REA decisions'),
  ('a0000001-0000-0000-0000-000000000002', 'Decision', '2027-03-31', null, 'RD decisions')
on conflict do nothing;

-- Princeton
insert into deadlines (college_id, type, date, time, notes) values
  ('a0000001-0000-0000-0000-000000000003', 'REA', '2026-11-01', '11:59 PM ET', 'Restrictive Early Action'),
  ('a0000001-0000-0000-0000-000000000003', 'RD', '2027-01-01', '11:59 PM ET', 'Regular Decision'),
  ('a0000001-0000-0000-0000-000000000003', 'FAFSA', '2026-10-01', '11:59 PM ET', 'Financial aid priority'),
  ('a0000001-0000-0000-0000-000000000003', 'Decision', '2026-12-15', null, 'REA decisions'),
  ('a0000001-0000-0000-0000-000000000003', 'Decision', '2027-03-26', null, 'RD decisions')
on conflict do nothing;

-- Columbia
insert into deadlines (college_id, type, date, time, notes) values
  ('a0000001-0000-0000-0000-000000000004', 'ED1', '2026-11-01', '11:59 PM ET', 'Early Decision I'),
  ('a0000001-0000-0000-0000-000000000004', 'ED2', '2027-01-01', '11:59 PM ET', 'Early Decision II'),
  ('a0000001-0000-0000-0000-000000000004', 'RD', '2027-01-01', '11:59 PM ET', 'Regular Decision'),
  ('a0000001-0000-0000-0000-000000000004', 'FAFSA', '2026-11-01', '11:59 PM ET', 'CSS Profile priority'),
  ('a0000001-0000-0000-0000-000000000004', 'Decision', '2026-12-15', null, 'ED1 decisions')
on conflict do nothing;

-- UPenn
insert into deadlines (college_id, type, date, time, notes) values
  ('a0000001-0000-0000-0000-000000000005', 'ED1', '2026-11-01', '11:59 PM ET', 'Early Decision I'),
  ('a0000001-0000-0000-0000-000000000005', 'ED2', '2027-01-01', '11:59 PM ET', 'Early Decision II'),
  ('a0000001-0000-0000-0000-000000000005', 'RD', '2027-01-07', '11:59 PM ET', 'Regular Decision'),
  ('a0000001-0000-0000-0000-000000000005', 'FAFSA', '2026-11-01', '11:59 PM ET', 'CSS Profile priority'),
  ('a0000001-0000-0000-0000-000000000005', 'Decision', '2026-12-15', null, 'ED1 decisions')
on conflict do nothing;

-- Dartmouth
insert into deadlines (college_id, type, date, time, notes) values
  ('a0000001-0000-0000-0000-000000000006', 'ED1', '2026-11-01', '11:59 PM ET', 'Early Decision I'),
  ('a0000001-0000-0000-0000-000000000006', 'ED2', '2027-01-01', '11:59 PM ET', 'Early Decision II'),
  ('a0000001-0000-0000-0000-000000000006', 'RD', '2027-01-03', '11:59 PM ET', 'Regular Decision'),
  ('a0000001-0000-0000-0000-000000000006', 'FAFSA', '2026-11-01', '11:59 PM ET', 'CSS Profile priority'),
  ('a0000001-0000-0000-0000-000000000006', 'Decision', '2026-12-15', null, 'ED1 decisions')
on conflict do nothing;

-- Brown
insert into deadlines (college_id, type, date, time, notes) values
  ('a0000001-0000-0000-0000-000000000007', 'ED1', '2026-11-01', '11:59 PM ET', 'Early Decision I'),
  ('a0000001-0000-0000-0000-000000000007', 'ED2', '2027-01-01', '11:59 PM ET', 'Early Decision II'),
  ('a0000001-0000-0000-0000-000000000007', 'RD', '2027-01-05', '11:59 PM ET', 'Regular Decision'),
  ('a0000001-0000-0000-0000-000000000007', 'FAFSA', '2026-11-01', '11:59 PM ET', 'CSS Profile priority'),
  ('a0000001-0000-0000-0000-000000000007', 'Decision', '2026-12-15', null, 'ED1 decisions')
on conflict do nothing;

-- Cornell
insert into deadlines (college_id, type, date, time, notes) values
  ('a0000001-0000-0000-0000-000000000008', 'ED1', '2026-11-01', '11:59 PM ET', 'Early Decision I'),
  ('a0000001-0000-0000-0000-000000000008', 'ED2', '2027-01-01', '11:59 PM ET', 'Early Decision II'),
  ('a0000001-0000-0000-0000-000000000008', 'RD', '2027-01-02', '11:59 PM ET', 'Regular Decision'),
  ('a0000001-0000-0000-0000-000000000008', 'FAFSA', '2026-11-15', '11:59 PM ET', 'CSS Profile priority'),
  ('a0000001-0000-0000-0000-000000000008', 'Decision', '2026-12-15', null, 'ED1 decisions')
on conflict do nothing;

-- MIT
insert into deadlines (college_id, type, date, time, notes) values
  ('b0000002-0000-0000-0000-000000000001', 'EA', '2026-11-01', '11:59 PM ET', 'Early Action'),
  ('b0000002-0000-0000-0000-000000000001', 'RD', '2027-01-01', '11:59 PM ET', 'Regular Decision'),
  ('b0000002-0000-0000-0000-000000000001', 'FAFSA', '2026-11-01', '11:59 PM ET', 'CSS Profile priority'),
  ('b0000002-0000-0000-0000-000000000001', 'Decision', '2026-12-15', null, 'EA decisions'),
  ('b0000002-0000-0000-0000-000000000001', 'Decision', '2027-03-15', null, 'RD decisions')
on conflict do nothing;

-- Stanford
insert into deadlines (college_id, type, date, time, notes) values
  ('b0000002-0000-0000-0000-000000000002', 'REA', '2026-11-01', '11:59 PM ET', 'Restrictive Early Action'),
  ('b0000002-0000-0000-0000-000000000002', 'RD', '2027-01-02', '11:59 PM ET', 'Regular Decision'),
  ('b0000002-0000-0000-0000-000000000002', 'FAFSA', '2026-11-01', '11:59 PM ET', 'CSS Profile priority'),
  ('b0000002-0000-0000-0000-000000000002', 'Decision', '2026-12-15', null, 'REA decisions'),
  ('b0000002-0000-0000-0000-000000000002', 'Decision', '2027-04-01', null, 'RD decisions')
on conflict do nothing;

-- Duke
insert into deadlines (college_id, type, date, time, notes) values
  ('b0000002-0000-0000-0000-000000000003', 'ED1', '2026-11-01', '11:59 PM ET', 'Early Decision I'),
  ('b0000002-0000-0000-0000-000000000003', 'ED2', '2027-01-02', '11:59 PM ET', 'Early Decision II'),
  ('b0000002-0000-0000-0000-000000000003', 'RD', '2027-01-03', '11:59 PM ET', 'Regular Decision'),
  ('b0000002-0000-0000-0000-000000000003', 'FAFSA', '2026-11-01', '11:59 PM ET', 'CSS Profile priority'),
  ('b0000002-0000-0000-0000-000000000003', 'Decision', '2026-12-15', null, 'ED1 decisions')
on conflict do nothing;

-- Northwestern
insert into deadlines (college_id, type, date, time, notes) values
  ('b0000002-0000-0000-0000-000000000004', 'ED1', '2026-11-01', '11:59 PM ET', 'Early Decision I'),
  ('b0000002-0000-0000-0000-000000000004', 'ED2', '2027-01-01', '11:59 PM ET', 'Early Decision II'),
  ('b0000002-0000-0000-0000-000000000004', 'RD', '2027-01-01', '11:59 PM ET', 'Regular Decision'),
  ('b0000002-0000-0000-0000-000000000004', 'FAFSA', '2026-11-01', '11:59 PM ET', 'CSS Profile priority'),
  ('b0000002-0000-0000-0000-000000000004', 'Decision', '2026-12-15', null, 'ED1 decisions')
on conflict do nothing;

-- Vanderbilt
insert into deadlines (college_id, type, date, time, notes) values
  ('b0000002-0000-0000-0000-000000000005', 'ED1', '2026-11-01', '11:59 PM ET', 'Early Decision I'),
  ('b0000002-0000-0000-0000-000000000005', 'ED2', '2027-01-01', '11:59 PM ET', 'Early Decision II'),
  ('b0000002-0000-0000-0000-000000000005', 'RD', '2027-01-15', '11:59 PM ET', 'Regular Decision'),
  ('b0000002-0000-0000-0000-000000000005', 'FAFSA', '2026-11-01', '11:59 PM ET', null),
  ('b0000002-0000-0000-0000-000000000005', 'Decision', '2026-12-15', null, 'ED1 decisions')
on conflict do nothing;

-- Notre Dame
insert into deadlines (college_id, type, date, time, notes) values
  ('b0000002-0000-0000-0000-000000000006', 'REA', '2026-11-01', '11:59 PM ET', 'Restrictive Early Action'),
  ('b0000002-0000-0000-0000-000000000006', 'RD', '2027-01-01', '11:59 PM ET', 'Regular Decision'),
  ('b0000002-0000-0000-0000-000000000006', 'FAFSA', '2026-10-15', '11:59 PM ET', null),
  ('b0000002-0000-0000-0000-000000000006', 'Decision', '2026-12-15', null, 'REA decisions')
on conflict do nothing;

-- Georgetown
insert into deadlines (college_id, type, date, time, notes) values
  ('b0000002-0000-0000-0000-000000000007', 'EA', '2026-11-01', '11:59 PM ET', 'Early Action'),
  ('b0000002-0000-0000-0000-000000000007', 'RD', '2027-01-10', '11:59 PM ET', 'Regular Decision'),
  ('b0000002-0000-0000-0000-000000000007', 'FAFSA', '2026-11-01', '11:59 PM ET', 'CSS Profile priority'),
  ('b0000002-0000-0000-0000-000000000007', 'Decision', '2027-12-15', null, 'EA decisions'),
  ('b0000002-0000-0000-0000-000000000007', 'Decision', '2027-04-01', null, 'RD decisions')
on conflict do nothing;

-- Emory
insert into deadlines (college_id, type, date, time, notes) values
  ('b0000002-0000-0000-0000-000000000008', 'ED1', '2026-11-01', '11:59 PM ET', 'Early Decision I'),
  ('b0000002-0000-0000-0000-000000000008', 'ED2', '2027-01-01', '11:59 PM ET', 'Early Decision II'),
  ('b0000002-0000-0000-0000-000000000008', 'EA', '2026-11-15', '11:59 PM ET', 'Early Action'),
  ('b0000002-0000-0000-0000-000000000008', 'RD', '2027-01-15', '11:59 PM ET', 'Regular Decision'),
  ('b0000002-0000-0000-0000-000000000008', 'FAFSA', '2026-11-15', '11:59 PM ET', null)
on conflict do nothing;

-- Tufts
insert into deadlines (college_id, type, date, time, notes) values
  ('b0000002-0000-0000-0000-000000000009', 'ED1', '2026-11-01', '11:59 PM ET', 'Early Decision I'),
  ('b0000002-0000-0000-0000-000000000009', 'ED2', '2027-01-01', '11:59 PM ET', 'Early Decision II'),
  ('b0000002-0000-0000-0000-000000000009', 'RD', '2027-01-01', '11:59 PM ET', 'Regular Decision'),
  ('b0000002-0000-0000-0000-000000000009', 'FAFSA', '2026-11-01', '11:59 PM ET', null)
on conflict do nothing;

-- USC
insert into deadlines (college_id, type, date, time, notes) values
  ('b0000002-0000-0000-0000-000000000010', 'ED1', '2026-11-01', '11:59 PM ET', 'Early Decision I'),
  ('b0000002-0000-0000-0000-000000000010', 'EA', '2026-12-01', '11:59 PM ET', 'Early Action'),
  ('b0000002-0000-0000-0000-000000000010', 'RD', '2027-01-15', '11:59 PM ET', 'Regular Decision'),
  ('b0000002-0000-0000-0000-000000000010', 'FAFSA', '2026-11-01', '11:59 PM ET', null)
on conflict do nothing;

-- NYU
insert into deadlines (college_id, type, date, time, notes) values
  ('b0000002-0000-0000-0000-000000000011', 'ED1', '2026-11-01', '11:59 PM ET', 'Early Decision I'),
  ('b0000002-0000-0000-0000-000000000011', 'ED2', '2027-01-01', '11:59 PM ET', 'Early Decision II'),
  ('b0000002-0000-0000-0000-000000000011', 'RD', '2027-01-05', '11:59 PM ET', 'Regular Decision'),
  ('b0000002-0000-0000-0000-000000000011', 'FAFSA', '2026-11-01', '11:59 PM ET', null)
on conflict do nothing;

-- Rice
insert into deadlines (college_id, type, date, time, notes) values
  ('b0000002-0000-0000-0000-000000000012', 'ED1', '2026-11-01', '11:59 PM ET', 'Early Decision I'),
  ('b0000002-0000-0000-0000-000000000012', 'ED2', '2027-01-01', '11:59 PM ET', 'Early Decision II'),
  ('b0000002-0000-0000-0000-000000000012', 'RD', '2027-01-01', '11:59 PM ET', 'Regular Decision'),
  ('b0000002-0000-0000-0000-000000000012', 'FAFSA', '2026-11-01', '11:59 PM ET', null)
on conflict do nothing;

-- Williams
insert into deadlines (college_id, type, date, time, notes) values
  ('c0000003-0000-0000-0000-000000000001', 'ED1', '2026-11-15', '11:59 PM ET', 'Early Decision I'),
  ('c0000003-0000-0000-0000-000000000001', 'ED2', '2027-01-01', '11:59 PM ET', 'Early Decision II'),
  ('c0000003-0000-0000-0000-000000000001', 'RD', '2027-01-15', '11:59 PM ET', 'Regular Decision'),
  ('c0000003-0000-0000-0000-000000000001', 'FAFSA', '2026-11-15', '11:59 PM ET', null)
on conflict do nothing;

-- Amherst
insert into deadlines (college_id, type, date, time, notes) values
  ('c0000003-0000-0000-0000-000000000002', 'ED1', '2026-11-01', '11:59 PM ET', 'Early Decision I'),
  ('c0000003-0000-0000-0000-000000000002', 'ED2', '2027-01-01', '11:59 PM ET', 'Early Decision II'),
  ('c0000003-0000-0000-0000-000000000002', 'RD', '2027-01-01', '11:59 PM ET', 'Regular Decision'),
  ('c0000003-0000-0000-0000-000000000002', 'FAFSA', '2026-11-01', '11:59 PM ET', null)
on conflict do nothing;

-- Swarthmore
insert into deadlines (college_id, type, date, time, notes) values
  ('c0000003-0000-0000-0000-000000000003', 'ED1', '2026-11-15', '11:59 PM ET', 'Early Decision I'),
  ('c0000003-0000-0000-0000-000000000003', 'ED2', '2027-01-02', '11:59 PM ET', 'Early Decision II'),
  ('c0000003-0000-0000-0000-000000000003', 'RD', '2027-01-15', '11:59 PM ET', 'Regular Decision'),
  ('c0000003-0000-0000-0000-000000000003', 'FAFSA', '2026-11-15', '11:59 PM ET', null)
on conflict do nothing;

-- Wellesley
insert into deadlines (college_id, type, date, time, notes) values
  ('c0000003-0000-0000-0000-000000000004', 'ED1', '2026-11-01', '11:59 PM ET', 'Early Decision I'),
  ('c0000003-0000-0000-0000-000000000004', 'ED2', '2027-01-15', '11:59 PM ET', 'Early Decision II'),
  ('c0000003-0000-0000-0000-000000000004', 'RD', '2027-01-15', '11:59 PM ET', 'Regular Decision'),
  ('c0000003-0000-0000-0000-000000000004', 'FAFSA', '2026-11-01', '11:59 PM ET', null)
on conflict do nothing;

-- Bowdoin
insert into deadlines (college_id, type, date, time, notes) values
  ('c0000003-0000-0000-0000-000000000005', 'ED1', '2026-11-15', '11:59 PM ET', 'Early Decision I'),
  ('c0000003-0000-0000-0000-000000000005', 'ED2', '2027-01-01', '11:59 PM ET', 'Early Decision II'),
  ('c0000003-0000-0000-0000-000000000005', 'RD', '2027-01-15', '11:59 PM ET', 'Regular Decision'),
  ('c0000003-0000-0000-0000-000000000005', 'FAFSA', '2026-11-15', '11:59 PM ET', null)
on conflict do nothing;

-- UCLA (UC deadlines: Nov 30)
insert into deadlines (college_id, type, date, time, notes) values
  ('d0000004-0000-0000-0000-000000000001', 'RD', '2026-11-30', '11:59 PM PT', 'UC Application deadline'),
  ('d0000004-0000-0000-0000-000000000001', 'FAFSA', '2027-03-02', '11:59 PM PT', 'FAFSA priority deadline'),
  ('d0000004-0000-0000-0000-000000000001', 'Decision', '2027-03-31', null, 'Admissions decisions')
on conflict do nothing;

-- UC Berkeley
insert into deadlines (college_id, type, date, time, notes) values
  ('d0000004-0000-0000-0000-000000000002', 'RD', '2026-11-30', '11:59 PM PT', 'UC Application deadline'),
  ('d0000004-0000-0000-0000-000000000002', 'FAFSA', '2027-03-02', '11:59 PM PT', 'FAFSA priority deadline'),
  ('d0000004-0000-0000-0000-000000000002', 'Decision', '2027-03-31', null, 'Admissions decisions')
on conflict do nothing;

-- University of Michigan
insert into deadlines (college_id, type, date, time, notes) values
  ('d0000004-0000-0000-0000-000000000003', 'EA', '2026-11-01', '11:59 PM ET', 'Early Action'),
  ('d0000004-0000-0000-0000-000000000003', 'RD', '2027-02-01', '11:59 PM ET', 'Regular Decision'),
  ('d0000004-0000-0000-0000-000000000003', 'FAFSA', '2026-11-01', '11:59 PM ET', 'Financial aid priority'),
  ('d0000004-0000-0000-0000-000000000003', 'Decision', '2027-01-31', null, 'EA decisions')
on conflict do nothing;

-- UT Austin
insert into deadlines (college_id, type, date, time, notes) values
  ('d0000004-0000-0000-0000-000000000004', 'EA', '2026-10-15', '11:59 PM CT', 'Early Action (Architecture)'),
  ('d0000004-0000-0000-0000-000000000004', 'RD', '2026-12-01', '11:59 PM CT', 'Priority deadline'),
  ('d0000004-0000-0000-0000-000000000004', 'FAFSA', '2026-12-01', '11:59 PM CT', 'FAFSA priority'),
  ('d0000004-0000-0000-0000-000000000004', 'Decision', '2027-03-01', null, 'Admissions decisions')
on conflict do nothing;

-- UNC Chapel Hill
insert into deadlines (college_id, type, date, time, notes) values
  ('d0000004-0000-0000-0000-000000000005', 'EA', '2026-10-15', '11:59 PM ET', 'Early Action'),
  ('d0000004-0000-0000-0000-000000000005', 'RD', '2027-01-15', '11:59 PM ET', 'Regular Decision'),
  ('d0000004-0000-0000-0000-000000000005', 'FAFSA', '2026-10-15', '11:59 PM ET', 'Financial aid priority'),
  ('d0000004-0000-0000-0000-000000000005', 'Decision', '2026-12-31', null, 'EA decisions')
on conflict do nothing;

-- UVA
insert into deadlines (college_id, type, date, time, notes) values
  ('d0000004-0000-0000-0000-000000000006', 'ED1', '2026-11-01', '11:59 PM ET', 'Early Decision I'),
  ('d0000004-0000-0000-0000-000000000006', 'ED2', '2027-01-01', '11:59 PM ET', 'Early Decision II'),
  ('d0000004-0000-0000-0000-000000000006', 'RD', '2027-01-01', '11:59 PM ET', 'Regular Decision'),
  ('d0000004-0000-0000-0000-000000000006', 'FAFSA', '2026-11-01', '11:59 PM ET', 'Financial aid priority'),
  ('d0000004-0000-0000-0000-000000000006', 'Decision', '2026-12-15', null, 'ED1 decisions')
on conflict do nothing;

-- Georgia Tech
insert into deadlines (college_id, type, date, time, notes) values
  ('d0000004-0000-0000-0000-000000000007', 'EA', '2026-10-15', '11:59 PM ET', 'Early Action'),
  ('d0000004-0000-0000-0000-000000000007', 'RD', '2027-01-10', '11:59 PM ET', 'Regular Decision'),
  ('d0000004-0000-0000-0000-000000000007', 'FAFSA', '2026-10-15', '11:59 PM ET', 'Priority financial aid'),
  ('d0000004-0000-0000-0000-000000000007', 'Decision', '2026-12-13', null, 'EA decisions')
on conflict do nothing;

-- UC San Diego, UC Davis, UC Santa Barbara
insert into deadlines (college_id, type, date, time, notes) values
  ('d0000004-0000-0000-0000-000000000008', 'RD', '2026-11-30', '11:59 PM PT', 'UC Application deadline'),
  ('d0000004-0000-0000-0000-000000000008', 'FAFSA', '2027-03-02', '11:59 PM PT', 'FAFSA priority'),
  ('d0000004-0000-0000-0000-000000000009', 'RD', '2026-11-30', '11:59 PM PT', 'UC Application deadline'),
  ('d0000004-0000-0000-0000-000000000009', 'FAFSA', '2027-03-02', '11:59 PM PT', 'FAFSA priority'),
  ('d0000004-0000-0000-0000-000000000010', 'RD', '2026-11-30', '11:59 PM PT', 'UC Application deadline'),
  ('d0000004-0000-0000-0000-000000000010', 'FAFSA', '2027-03-02', '11:59 PM PT', 'FAFSA priority')
on conflict do nothing;

-- University of Florida
insert into deadlines (college_id, type, date, time, notes) values
  ('d0000004-0000-0000-0000-000000000011', 'EA', '2026-11-01', '11:59 PM ET', 'Early Action'),
  ('d0000004-0000-0000-0000-000000000011', 'RD', '2027-03-01', '11:59 PM ET', 'Regular Decision'),
  ('d0000004-0000-0000-0000-000000000011', 'FAFSA', '2026-12-01', '11:59 PM ET', 'Priority deadline')
on conflict do nothing;

-- Ohio State
insert into deadlines (college_id, type, date, time, notes) values
  ('d0000004-0000-0000-0000-000000000012', 'EA', '2026-11-01', '11:59 PM ET', 'Early Action'),
  ('d0000004-0000-0000-0000-000000000012', 'RD', '2027-02-01', '11:59 PM ET', 'Regular Decision'),
  ('d0000004-0000-0000-0000-000000000012', 'FAFSA', '2026-10-01', '11:59 PM ET', 'Priority financial aid')
on conflict do nothing;

-- Penn State, Wisconsin, Illinois
insert into deadlines (college_id, type, date, time, notes) values
  ('d0000004-0000-0000-0000-000000000013', 'EA', '2026-11-01', '11:59 PM ET', 'Early Action'),
  ('d0000004-0000-0000-0000-000000000013', 'RD', '2027-02-01', '11:59 PM ET', 'Regular Decision'),
  ('d0000004-0000-0000-0000-000000000013', 'FAFSA', '2026-11-01', '11:59 PM ET', null),
  ('d0000004-0000-0000-0000-000000000014', 'EA', '2026-11-01', '11:59 PM CT', 'Early Action'),
  ('d0000004-0000-0000-0000-000000000014', 'RD', '2027-02-01', '11:59 PM CT', 'Regular Decision'),
  ('d0000004-0000-0000-0000-000000000014', 'FAFSA', '2026-12-01', '11:59 PM CT', null),
  ('d0000004-0000-0000-0000-000000000015', 'EA', '2026-11-01', '11:59 PM CT', 'Early Action'),
  ('d0000004-0000-0000-0000-000000000015', 'RD', '2027-01-05', '11:59 PM CT', 'Regular Decision'),
  ('d0000004-0000-0000-0000-000000000015', 'FAFSA', '2026-11-15', '11:59 PM CT', null)
on conflict do nothing;

-- Most Applied-To schools (rolling or fixed RD)
insert into deadlines (college_id, type, date, time, notes) values
  ('e0000005-0000-0000-0000-000000000001', 'EA', '2026-11-01', '11:59 PM MT', 'Priority EA deadline'),
  ('e0000005-0000-0000-0000-000000000001', 'RD', '2027-02-01', '11:59 PM MT', 'Regular Decision'),
  ('e0000005-0000-0000-0000-000000000001', 'FAFSA', '2026-12-01', '11:59 PM MT', null),
  ('e0000005-0000-0000-0000-000000000002', 'EA', '2026-11-01', '11:59 PM ET', 'Early Action'),
  ('e0000005-0000-0000-0000-000000000002', 'RD', '2027-03-01', '11:59 PM ET', 'Regular Decision'),
  ('e0000005-0000-0000-0000-000000000002', 'FAFSA', '2027-01-01', '11:59 PM ET', null),
  ('e0000005-0000-0000-0000-000000000003', 'EA', '2026-11-01', '11:59 PM ET', 'Early Action'),
  ('e0000005-0000-0000-0000-000000000003', 'RD', '2027-02-01', '11:59 PM ET', 'Regular Decision'),
  ('e0000005-0000-0000-0000-000000000003', 'FAFSA', '2026-10-01', '11:59 PM ET', null),
  ('e0000005-0000-0000-0000-000000000004', 'EA', '2026-11-01', '11:59 PM ET', 'Early Action'),
  ('e0000005-0000-0000-0000-000000000004', 'RD', '2027-02-01', '11:59 PM ET', 'Regular Decision'),
  ('e0000005-0000-0000-0000-000000000004', 'FAFSA', '2026-12-01', '11:59 PM ET', null),
  ('e0000005-0000-0000-0000-000000000005', 'EA', '2026-11-01', '11:59 PM ET', 'Early Action'),
  ('e0000005-0000-0000-0000-000000000005', 'RD', '2027-02-01', '11:59 PM ET', 'Regular Decision'),
  ('e0000005-0000-0000-0000-000000000005', 'FAFSA', '2026-12-01', '11:59 PM ET', null),
  ('e0000005-0000-0000-0000-000000000006', 'EA', '2026-10-15', '11:59 PM CT', 'Priority deadline'),
  ('e0000005-0000-0000-0000-000000000006', 'RD', '2026-12-01', '11:59 PM CT', 'Regular Decision'),
  ('e0000005-0000-0000-0000-000000000006', 'FAFSA', '2026-10-15', '11:59 PM CT', null),
  ('e0000005-0000-0000-0000-000000000007', 'EA', '2026-11-01', '11:59 PM PT', 'Early Action'),
  ('e0000005-0000-0000-0000-000000000007', 'RD', '2027-01-15', '11:59 PM PT', 'Regular Decision'),
  ('e0000005-0000-0000-0000-000000000007', 'FAFSA', '2027-01-15', '11:59 PM PT', null),
  ('e0000005-0000-0000-0000-000000000008', 'EA', '2026-11-15', '11:59 PM MT', 'Early Action'),
  ('e0000005-0000-0000-0000-000000000008', 'RD', '2027-01-15', '11:59 PM MT', 'Regular Decision'),
  ('e0000005-0000-0000-0000-000000000008', 'FAFSA', '2027-01-15', '11:59 PM MT', null),
  ('e0000005-0000-0000-0000-000000000009', 'EA', '2026-11-01', '11:59 PM PT', 'Early Action'),
  ('e0000005-0000-0000-0000-000000000009', 'RD', '2027-01-15', '11:59 PM PT', 'Regular Decision'),
  ('e0000005-0000-0000-0000-000000000009', 'FAFSA', '2027-01-15', '11:59 PM PT', null),
  ('e0000005-0000-0000-0000-000000000010', 'EA', '2026-12-01', '11:59 PM ET', 'Early Action'),
  ('e0000005-0000-0000-0000-000000000010', 'RD', '2027-02-01', '11:59 PM ET', 'Regular Decision'),
  ('e0000005-0000-0000-0000-000000000010', 'FAFSA', '2027-01-01', '11:59 PM ET', null)
on conflict do nothing;
