-- ══════════════════════════════════════════════════════════════════════════════
-- due.college — Full Data Correction Script
-- Generated: 2026-04-18
-- Data sources: CDS 2024-25, institutional admissions pages, IPEDS
-- Acceptance rates stored as PERCENTAGE (3.7 = 3.7%, not 0.037)
--
-- HOW TO RUN: Supabase Dashboard → SQL Editor → paste → Run
-- ══════════════════════════════════════════════════════════════════════════════

BEGIN;

-- ══════════════════════════════════════════════════════════════════════════════
-- PART 1 · REMOVE DUPLICATE COLLEGE ROWS
-- Migration 006 may have inserted extra rows for the 50 schools that already
-- have fixed UUIDs from migration 002 (the IDs all start with a0000001-,
-- b0000002-, c0000003-, d0000004-, or e0000005-).  Any row with the same
-- name but a different (random) ID is a duplicate; remove its deadlines then
-- the row itself.  CASCADE on user_colleges will clean up any user lists that
-- pointed to the orphan rows.
-- ══════════════════════════════════════════════════════════════════════════════

DELETE FROM deadlines
WHERE college_id IN (
  SELECT c.id FROM colleges c
  WHERE c.name IN (
    SELECT name FROM colleges
    WHERE id::text ~ '^[abcde]0000[0-9]'
  )
  AND id::text !~ '^[abcde]0000[0-9]'
);

DELETE FROM colleges
WHERE name IN (
  SELECT name FROM colleges
  WHERE id::text ~ '^[abcde]0000[0-9]'
)
AND id::text !~ '^[abcde]0000[0-9]';


-- ══════════════════════════════════════════════════════════════════════════════
-- PART 2 · COLLEGE STATS — 50 CORE SCHOOLS (fixed UUIDs)
-- Updates BOTH column families:
--   sat_25 / sat_75 / act_25 / act_75 / tuition_out_state          (mig 005)
--   sat_25th / sat_75th / act_25th / act_75th / tuition_out_of_state (mig 007)
-- NULL = school does not publish the figure (test-blind UCs, Dartmouth, etc.)
-- ══════════════════════════════════════════════════════════════════════════════

-- ── IVY LEAGUE ───────────────────────────────────────────────────────────────

-- Harvard University  [est. ~3.6%; declined to release official rate]
UPDATE colleges SET
  acceptance_rate = 3.6,
  sat_25 = 1510, sat_75 = 1580, sat_25th = 1510, sat_75th = 1580,
  act_25 = 34,   act_75 = 36,   act_25th = 34,   act_75th = 36,
  tuition_out_state = 59320, tuition_out_of_state = 59320,
  enrollment = 8844, type = 'private', setting = 'urban', region = 'Northeast'
WHERE id = 'a0000001-0000-0000-0000-000000000001';

-- Yale University  [official 4.24%]
UPDATE colleges SET
  acceptance_rate = 4.24,
  sat_25 = 1480, sat_75 = 1560, sat_25th = 1480, sat_75th = 1560,
  act_25 = 33,   act_75 = 35,   act_25th = 33,   act_75th = 35,
  tuition_out_state = 69900, tuition_out_of_state = 69900,
  enrollment = 6814, type = 'private', setting = 'urban', region = 'Northeast'
WHERE id = 'a0000001-0000-0000-0000-000000000002';

-- Princeton University  [est. ~4.0%; declined to release official rate]
UPDATE colleges SET
  acceptance_rate = 4.0,
  sat_25 = 1500, sat_75 = 1560, sat_25th = 1500, sat_75th = 1560,
  act_25 = 34,   act_75 = 35,   act_25th = 34,   act_75th = 35,
  tuition_out_state = 65210, tuition_out_of_state = 65210,
  enrollment = 5813, type = 'private', setting = 'suburban', region = 'Northeast'
WHERE id = 'a0000001-0000-0000-0000-000000000003';

-- Columbia University  [official 4.23%]
UPDATE colleges SET
  acceptance_rate = 4.23,
  sat_25 = 1520, sat_75 = 1560, sat_25th = 1520, sat_75th = 1560,
  act_25 = 34,   act_75 = 36,   act_25th = 34,   act_75th = 36,
  tuition_out_state = 70170, tuition_out_of_state = 70170,
  enrollment = 6400, type = 'private', setting = 'urban', region = 'Northeast'
WHERE id = 'a0000001-0000-0000-0000-000000000004';

-- University of Pennsylvania  [est. ~4.5%; declined to release official rate]
UPDATE colleges SET
  acceptance_rate = 4.5,
  sat_25 = 1500, sat_75 = 1570, sat_25th = 1500, sat_75th = 1570,
  act_25 = 34,   act_75 = 35,   act_25th = 34,   act_75th = 35,
  tuition_out_state = 63204, tuition_out_of_state = 63204,
  enrollment = 10000, type = 'private', setting = 'urban', region = 'Northeast'
WHERE id = 'a0000001-0000-0000-0000-000000000005';

-- Dartmouth College  [official 5.84%; does not publish SAT/ACT since returning test-required]
UPDATE colleges SET
  acceptance_rate = 5.84,
  sat_25 = NULL, sat_75 = NULL, sat_25th = NULL, sat_75th = NULL,
  act_25 = NULL, act_75 = NULL, act_25th = NULL, act_75th = NULL,
  tuition_out_state = 69207, tuition_out_of_state = 69207,
  enrollment = 4600, type = 'private', setting = 'rural', region = 'Northeast'
WHERE id = 'a0000001-0000-0000-0000-000000000006';

-- Brown University  [official 5.35%]
UPDATE colleges SET
  acceptance_rate = 5.35,
  sat_25 = 1510, sat_75 = 1560, sat_25th = 1510, sat_75th = 1560,
  act_25 = 34,   act_75 = 35,   act_25th = 34,   act_75th = 35,
  tuition_out_state = 71700, tuition_out_of_state = 71700,
  enrollment = 7910, type = 'private', setting = 'urban', region = 'Northeast'
WHERE id = 'a0000001-0000-0000-0000-000000000007';

-- Cornell University  [est. ~6.9%; declined to release official rate]
UPDATE colleges SET
  acceptance_rate = 6.9,
  sat_25 = 1510, sat_75 = 1560, sat_25th = 1510, sat_75th = 1560,
  act_25 = 33,   act_75 = 35,   act_25th = 33,   act_75th = 35,
  tuition_out_state = 71266, tuition_out_of_state = 71266,
  enrollment = 15500, type = 'private', setting = 'suburban', region = 'Northeast'
WHERE id = 'a0000001-0000-0000-0000-000000000008';


-- ── ELITE PRIVATE ────────────────────────────────────────────────────────────

-- MIT  [est. ~3.5%; EA rate ~5.5%; declined to release overall rate]
UPDATE colleges SET
  acceptance_rate = 3.5,
  sat_25 = 1520, sat_75 = 1570, sat_25th = 1520, sat_75th = 1570,
  act_25 = 34,   act_75 = 36,   act_25th = 34,   act_75th = 36,
  tuition_out_state = 62730, tuition_out_of_state = 62730,
  enrollment = 4535, type = 'private', setting = 'urban', region = 'Northeast'
WHERE id = 'b0000002-0000-0000-0000-000000000001';

-- Stanford University  [est. ~3.7%; declined to release official rate — NOT 50%]
UPDATE colleges SET
  acceptance_rate = 3.7,
  sat_25 = 1510, sat_75 = 1570, sat_25th = 1510, sat_75th = 1570,
  act_25 = 34,   act_75 = 35,   act_25th = 34,   act_75th = 35,
  tuition_out_state = 68544, tuition_out_of_state = 68544,
  enrollment = 7904, type = 'private', setting = 'suburban', region = 'West'
WHERE id = 'b0000002-0000-0000-0000-000000000002';

-- Duke University  [official 4.73%]
UPDATE colleges SET
  acceptance_rate = 4.73,
  sat_25 = 1490, sat_75 = 1560, sat_25th = 1490, sat_75th = 1560,
  act_25 = 33,   act_75 = 35,   act_25th = 33,   act_75th = 35,
  tuition_out_state = 70265, tuition_out_of_state = 70265,
  enrollment = 6700, type = 'private', setting = 'suburban', region = 'South'
WHERE id = 'b0000002-0000-0000-0000-000000000003';

-- Northwestern University  [~7.0%]
UPDATE colleges SET
  acceptance_rate = 7.0,
  sat_25 = 1500, sat_75 = 1560, sat_25th = 1500, sat_75th = 1560,
  act_25 = 33,   act_75 = 35,   act_25th = 33,   act_75th = 35,
  tuition_out_state = 70589, tuition_out_of_state = 70589,
  enrollment = 8300, type = 'private', setting = 'suburban', region = 'Midwest'
WHERE id = 'b0000002-0000-0000-0000-000000000004';

-- Vanderbilt University  [official 4.08%]
UPDATE colleges SET
  acceptance_rate = 4.08,
  sat_25 = 1510, sat_75 = 1560, sat_25th = 1510, sat_75th = 1560,
  act_25 = 34,   act_75 = 35,   act_25th = 34,   act_75th = 35,
  tuition_out_state = 67934, tuition_out_of_state = 67934,
  enrollment = 7000, type = 'private', setting = 'urban', region = 'South'
WHERE id = 'b0000002-0000-0000-0000-000000000005';

-- University of Notre Dame  [9.0%]
UPDATE colleges SET
  acceptance_rate = 9.0,
  sat_25 = 1470, sat_75 = 1540, sat_25th = 1470, sat_75th = 1540,
  act_25 = 33,   act_75 = 35,   act_25th = 33,   act_75th = 35,
  tuition_out_state = 67444, tuition_out_of_state = 67444,
  enrollment = 8900, type = 'private', setting = 'suburban', region = 'Midwest'
WHERE id = 'b0000002-0000-0000-0000-000000000006';

-- Georgetown University  [13.0%]
UPDATE colleges SET
  acceptance_rate = 13.0,
  sat_25 = 1400, sat_75 = 1540, sat_25th = 1400, sat_75th = 1540,
  act_25 = 31,   act_75 = 35,   act_25th = 31,   act_75th = 35,
  tuition_out_state = 71136, tuition_out_of_state = 71136,
  enrollment = 7500, type = 'private', setting = 'urban', region = 'Northeast'
WHERE id = 'b0000002-0000-0000-0000-000000000007';

-- Emory University  [official 12.29%]
UPDATE colleges SET
  acceptance_rate = 12.29,
  sat_25 = 1480, sat_75 = 1540, sat_25th = 1480, sat_75th = 1540,
  act_25 = 32,   act_75 = 35,   act_25th = 32,   act_75th = 35,
  tuition_out_state = 67080, tuition_out_of_state = 67080,
  enrollment = 7200, type = 'private', setting = 'suburban', region = 'South'
WHERE id = 'b0000002-0000-0000-0000-000000000008';

-- Tufts University  [10.0%]
UPDATE colleges SET
  acceptance_rate = 10.0,
  sat_25 = 1480, sat_75 = 1540, sat_25th = 1480, sat_75th = 1540,
  act_25 = 33,   act_75 = 35,   act_25th = 33,   act_75th = 35,
  tuition_out_state = 71982, tuition_out_of_state = 71982,
  enrollment = 5900, type = 'private', setting = 'suburban', region = 'Northeast'
WHERE id = 'b0000002-0000-0000-0000-000000000009';

-- University of Southern California  [10.4%]
UPDATE colleges SET
  acceptance_rate = 10.4,
  sat_25 = 1450, sat_75 = 1530, sat_25th = 1450, sat_75th = 1530,
  act_25 = 32,   act_75 = 35,   act_25th = 32,   act_75th = 35,
  tuition_out_state = 73260, tuition_out_of_state = 73260,
  enrollment = 21000, type = 'private', setting = 'urban', region = 'West'
WHERE id = 'b0000002-0000-0000-0000-000000000010';

-- New York University  [~7.7%]
UPDATE colleges SET
  acceptance_rate = 7.7,
  sat_25 = 1480, sat_75 = 1550, sat_25th = 1480, sat_75th = 1550,
  act_25 = 34,   act_75 = 35,   act_25th = 34,   act_75th = 35,
  tuition_out_state = 65246, tuition_out_of_state = 65246,
  enrollment = 28000, type = 'private', setting = 'urban', region = 'Northeast'
WHERE id = 'b0000002-0000-0000-0000-000000000011';

-- Rice University  [official 7.73%]
UPDATE colleges SET
  acceptance_rate = 7.73,
  sat_25 = 1510, sat_75 = 1570, sat_25th = 1510, sat_75th = 1570,
  act_25 = 34,   act_75 = 35,   act_25th = 34,   act_75th = 35,
  tuition_out_state = 61247, tuition_out_of_state = 61247,
  enrollment = 4789, type = 'private', setting = 'urban', region = 'South'
WHERE id = 'b0000002-0000-0000-0000-000000000012';


-- ── TOP LIBERAL ARTS ─────────────────────────────────────────────────────────

-- Williams College  [8.5%]
UPDATE colleges SET
  acceptance_rate = 8.5,
  sat_25 = 1500, sat_75 = 1560, sat_25th = 1500, sat_75th = 1560,
  act_25 = 34,   act_75 = 35,   act_25th = 34,   act_75th = 35,
  tuition_out_state = 72170, tuition_out_of_state = 72170,
  enrollment = 2200, type = 'liberal_arts', setting = 'rural', region = 'Northeast'
WHERE id = 'c0000003-0000-0000-0000-000000000001';

-- Amherst College  [7.4%]
UPDATE colleges SET
  acceptance_rate = 7.4,
  sat_25 = 1500, sat_75 = 1560, sat_25th = 1500, sat_75th = 1560,
  act_25 = 33,   act_75 = 35,   act_25th = 33,   act_75th = 35,
  tuition_out_state = 67280, tuition_out_of_state = 67280,
  enrollment = 1850, type = 'liberal_arts', setting = 'suburban', region = 'Northeast'
WHERE id = 'c0000003-0000-0000-0000-000000000002';

-- Swarthmore College  [official 7.44%]
UPDATE colleges SET
  acceptance_rate = 7.4,
  sat_25 = 1500, sat_75 = 1550, sat_25th = 1500, sat_75th = 1550,
  act_25 = 33,   act_75 = 35,   act_25th = 33,   act_75th = 35,
  tuition_out_state = 65494, tuition_out_of_state = 65494,
  enrollment = 1650, type = 'liberal_arts', setting = 'suburban', region = 'Northeast'
WHERE id = 'c0000003-0000-0000-0000-000000000003';

-- Wellesley College  [13.7%]
UPDATE colleges SET
  acceptance_rate = 13.7,
  sat_25 = 1460, sat_75 = 1560, sat_25th = 1460, sat_75th = 1560,
  act_25 = 33,   act_75 = 35,   act_25th = 33,   act_75th = 35,
  tuition_out_state = 65000, tuition_out_of_state = 65000,
  enrollment = 2400, type = 'liberal_arts', setting = 'suburban', region = 'Northeast'
WHERE id = 'c0000003-0000-0000-0000-000000000004';

-- Bowdoin College  [official 6.53%]
UPDATE colleges SET
  acceptance_rate = 6.53,
  sat_25 = 1470, sat_75 = 1540, sat_25th = 1470, sat_75th = 1540,
  act_25 = 33,   act_75 = 35,   act_25th = 33,   act_75th = 35,
  tuition_out_state = 67832, tuition_out_of_state = 67832,
  enrollment = 1850, type = 'liberal_arts', setting = 'suburban', region = 'Northeast'
WHERE id = 'c0000003-0000-0000-0000-000000000005';


-- ── TOP PUBLIC ────────────────────────────────────────────────────────────────

-- UCLA  [9.4%; test-blind — no SAT/ACT published]
UPDATE colleges SET
  acceptance_rate = 9.4,
  sat_25 = NULL, sat_75 = NULL, sat_25th = NULL, sat_75th = NULL,
  act_25 = NULL, act_75 = NULL, act_25th = NULL, act_75th = NULL,
  tuition_in_state = 14934, tuition_out_state = 52536, tuition_out_of_state = 52536,
  enrollment = 32000, type = 'public', setting = 'urban', region = 'West'
WHERE id = 'd0000004-0000-0000-0000-000000000001';

-- UC Berkeley  [11.4%; test-blind]
UPDATE colleges SET
  acceptance_rate = 11.4,
  sat_25 = NULL, sat_75 = NULL, sat_25th = NULL, sat_75th = NULL,
  act_25 = NULL, act_75 = NULL, act_25th = NULL, act_75th = NULL,
  tuition_in_state = 14934, tuition_out_state = 52536, tuition_out_of_state = 52536,
  enrollment = 32000, type = 'public', setting = 'urban', region = 'West'
WHERE id = 'd0000004-0000-0000-0000-000000000002';

-- University of Michigan  [~12.5% for Class of 2030; record 115k+ applicants]
UPDATE colleges SET
  acceptance_rate = 12.5,
  sat_25 = 1360, sat_75 = 1530, sat_25th = 1360, sat_75th = 1530,
  act_25 = 31,   act_75 = 34,   act_25th = 31,   act_75th = 34,
  tuition_in_state = 18346, tuition_out_state = 63962, tuition_out_of_state = 63962,
  enrollment = 32000, type = 'public', setting = 'urban', region = 'Midwest'
WHERE id = 'd0000004-0000-0000-0000-000000000003';

-- UT Austin  [~27% overall; does not publish SAT/ACT composite ranges]
UPDATE colleges SET
  acceptance_rate = 27.0,
  sat_25 = NULL, sat_75 = NULL, sat_25th = NULL, sat_75th = NULL,
  act_25 = NULL, act_75 = NULL, act_25th = NULL, act_75th = NULL,
  tuition_in_state = 11688, tuition_out_state = 44908, tuition_out_of_state = 44908,
  enrollment = 43165, type = 'public', setting = 'urban', region = 'South'
WHERE id = 'd0000004-0000-0000-0000-000000000004';

-- UNC Chapel Hill  [~15.3%]
UPDATE colleges SET
  acceptance_rate = 15.3,
  sat_25 = 1400, sat_75 = 1530, sat_25th = 1400, sat_75th = 1530,
  act_25 = 28,   act_75 = 34,   act_25th = 28,   act_75th = 34,
  tuition_in_state = 9096, tuition_out_state = 45228, tuition_out_of_state = 45228,
  enrollment = 21075, type = 'public', setting = 'suburban', region = 'South'
WHERE id = 'd0000004-0000-0000-0000-000000000005';

-- University of Virginia  [official 12.53%; 82,118 applicants]
UPDATE colleges SET
  acceptance_rate = 12.53,
  sat_25 = 1410, sat_75 = 1540, sat_25th = 1410, sat_75th = 1540,
  act_25 = 32,   act_75 = 35,   act_25th = 32,   act_75th = 35,
  tuition_in_state = 23897, tuition_out_state = 62923, tuition_out_of_state = 62923,
  enrollment = 17000, type = 'public', setting = 'suburban', region = 'South'
WHERE id = 'd0000004-0000-0000-0000-000000000006';

-- Georgia Tech  [~12.8% overall; 28% in-state / 9% out-of-state]
UPDATE colleges SET
  acceptance_rate = 12.8,
  sat_25 = 1370, sat_75 = 1530, sat_25th = 1370, sat_75th = 1530,
  act_25 = 30,   act_75 = 34,   act_25th = 30,   act_75th = 34,
  tuition_in_state = 12008, tuition_out_state = 35092, tuition_out_of_state = 35092,
  enrollment = 18000, type = 'public', setting = 'urban', region = 'South'
WHERE id = 'd0000004-0000-0000-0000-000000000007';

-- UC San Diego  [official 28.4%; test-blind]
UPDATE colleges SET
  acceptance_rate = 28.4,
  sat_25 = NULL, sat_75 = NULL, sat_25th = NULL, sat_75th = NULL,
  act_25 = NULL, act_75 = NULL, act_25th = NULL, act_75th = NULL,
  tuition_in_state = 14934, tuition_out_state = 52536, tuition_out_of_state = 52536,
  enrollment = 33000, type = 'public', setting = 'suburban', region = 'West'
WHERE id = 'd0000004-0000-0000-0000-000000000008';

-- UC Davis  [official 44.6%; test-blind]
UPDATE colleges SET
  acceptance_rate = 44.6,
  sat_25 = NULL, sat_75 = NULL, sat_25th = NULL, sat_75th = NULL,
  act_25 = NULL, act_75 = NULL, act_25th = NULL, act_75th = NULL,
  tuition_in_state = 14934, tuition_out_state = 52536, tuition_out_of_state = 52536,
  enrollment = 32000, type = 'public', setting = 'suburban', region = 'West'
WHERE id = 'd0000004-0000-0000-0000-000000000009';

-- UC Santa Barbara  [official 38.2%; test-blind]
UPDATE colleges SET
  acceptance_rate = 38.2,
  sat_25 = NULL, sat_75 = NULL, sat_25th = NULL, sat_75th = NULL,
  act_25 = NULL, act_75 = NULL, act_25th = NULL, act_75th = NULL,
  tuition_in_state = 14934, tuition_out_state = 52536, tuition_out_of_state = 52536,
  enrollment = 23232, type = 'public', setting = 'suburban', region = 'West'
WHERE id = 'd0000004-0000-0000-0000-000000000010';

-- University of Florida  [~30%]
UPDATE colleges SET
  acceptance_rate = 30.0,
  sat_25 = 1320, sat_75 = 1470, sat_25th = 1320, sat_75th = 1470,
  act_25 = 28,   act_75 = 33,   act_25th = 28,   act_75th = 33,
  tuition_in_state = 6381, tuition_out_state = 28659, tuition_out_of_state = 28659,
  enrollment = 38000, type = 'public', setting = 'suburban', region = 'South'
WHERE id = 'd0000004-0000-0000-0000-000000000011';

-- Ohio State University  [~60.6%]
UPDATE colleges SET
  acceptance_rate = 60.6,
  sat_25 = 1310, sat_75 = 1480, sat_25th = 1310, sat_75th = 1480,
  act_25 = 28,   act_75 = 32,   act_25th = 28,   act_75th = 32,
  tuition_in_state = 13641, tuition_out_state = 42423, tuition_out_of_state = 42423,
  enrollment = 46815, type = 'public', setting = 'urban', region = 'Midwest'
WHERE id = 'd0000004-0000-0000-0000-000000000012';

-- Penn State University Park  [~60.5%]
UPDATE colleges SET
  acceptance_rate = 60.5,
  sat_25 = 1200, sat_75 = 1400, sat_25th = 1200, sat_75th = 1400,
  act_25 = 26,   act_75 = 32,   act_25th = 26,   act_75th = 32,
  tuition_in_state = 21098, tuition_out_state = 43490, tuition_out_of_state = 43490,
  enrollment = 42604, type = 'public', setting = 'suburban', region = 'Northeast'
WHERE id = 'd0000004-0000-0000-0000-000000000013';

-- University of Wisconsin–Madison  [~49%]
UPDATE colleges SET
  acceptance_rate = 49.0,
  sat_25 = 1370, sat_75 = 1490, sat_25th = 1370, sat_75th = 1490,
  act_25 = 29,   act_75 = 33,   act_25th = 29,   act_75th = 33,
  tuition_in_state = 11603, tuition_out_state = 42103, tuition_out_of_state = 42103,
  enrollment = 38040, type = 'public', setting = 'urban', region = 'Midwest'
WHERE id = 'd0000004-0000-0000-0000-000000000014';

-- University of Illinois Urbana-Champaign  [official 36.6%]
UPDATE colleges SET
  acceptance_rate = 36.6,
  sat_25 = 1390, sat_75 = 1520, sat_25th = 1390, sat_75th = 1520,
  act_25 = 30,   act_75 = 34,   act_25th = 30,   act_75th = 34,
  tuition_in_state = 18267, tuition_out_state = 40096, tuition_out_of_state = 40096,
  enrollment = 37140, type = 'public', setting = 'urban', region = 'Midwest'
WHERE id = 'd0000004-0000-0000-0000-000000000015';


-- ── MOST APPLIED-TO ──────────────────────────────────────────────────────────

-- Arizona State University  [~90%]
UPDATE colleges SET
  acceptance_rate = 90.0,
  sat_25 = 1130, sat_75 = 1360, sat_25th = 1130, sat_75th = 1360,
  act_25 = 22,   act_75 = 29,   act_25th = 22,   act_75th = 29,
  tuition_in_state = 11822, tuition_out_state = 34014, tuition_out_of_state = 34014,
  enrollment = 77000, type = 'public', setting = 'urban', region = 'West'
WHERE id = 'e0000005-0000-0000-0000-000000000001';

-- Florida State University  [official ~24.2%]
UPDATE colleges SET
  acceptance_rate = 24.2,
  sat_25 = 1290, sat_75 = 1410, sat_25th = 1290, sat_75th = 1410,
  act_25 = 29,   act_75 = 32,   act_25th = 29,   act_75th = 32,
  tuition_in_state = 6517, tuition_out_state = 21683, tuition_out_of_state = 21683,
  enrollment = 35000, type = 'public', setting = 'suburban', region = 'South'
WHERE id = 'e0000005-0000-0000-0000-000000000002';

-- Purdue University  [~67%]
UPDATE colleges SET
  acceptance_rate = 67.0,
  sat_25 = 1210, sat_75 = 1470, sat_25th = 1210, sat_75th = 1470,
  act_25 = 27,   act_75 = 34,   act_25th = 27,   act_75th = 34,
  tuition_in_state = 9992, tuition_out_state = 28794, tuition_out_of_state = 28794,
  enrollment = 38000, type = 'public', setting = 'suburban', region = 'Midwest'
WHERE id = 'e0000005-0000-0000-0000-000000000003';

-- Indiana University Bloomington  [~78.2%]
UPDATE colleges SET
  acceptance_rate = 78.2,
  sat_25 = 1180, sat_75 = 1390, sat_25th = 1180, sat_75th = 1390,
  act_25 = 27,   act_75 = 33,   act_25th = 27,   act_75th = 33,
  tuition_in_state = 12144, tuition_out_state = 41891, tuition_out_of_state = 41891,
  enrollment = 39000, type = 'public', setting = 'suburban', region = 'Midwest'
WHERE id = 'e0000005-0000-0000-0000-000000000004';

-- Michigan State University  [~84.8%]
UPDATE colleges SET
  acceptance_rate = 84.8,
  sat_25 = 1100, sat_75 = 1310, sat_25th = 1100, sat_75th = 1310,
  act_25 = 24,   act_75 = 30,   act_25th = 24,   act_75th = 30,
  tuition_in_state = 18079, tuition_out_state = 44850, tuition_out_of_state = 44850,
  enrollment = 40000, type = 'public', setting = 'suburban', region = 'Midwest'
WHERE id = 'e0000005-0000-0000-0000-000000000005';

-- Texas A&M University  [~57.4%]
UPDATE colleges SET
  acceptance_rate = 57.4,
  sat_25 = 1150, sat_75 = 1400, sat_25th = 1150, sat_75th = 1400,
  act_25 = 25,   act_75 = 31,   act_25th = 25,   act_75th = 31,
  tuition_in_state = 12995, tuition_out_state = 40124, tuition_out_of_state = 40124,
  enrollment = 59000, type = 'public', setting = 'suburban', region = 'South'
WHERE id = 'e0000005-0000-0000-0000-000000000006';

-- University of Washington  [~49%]
UPDATE colleges SET
  acceptance_rate = 49.0,
  sat_25 = 1270, sat_75 = 1470, sat_25th = 1270, sat_75th = 1470,
  act_25 = 28,   act_75 = 33,   act_25th = 28,   act_75th = 33,
  tuition_in_state = 12973, tuition_out_state = 43209, tuition_out_of_state = 43209,
  enrollment = 35000, type = 'public', setting = 'urban', region = 'West'
WHERE id = 'e0000005-0000-0000-0000-000000000007';

-- University of Colorado Boulder  [~78%]
UPDATE colleges SET
  acceptance_rate = 78.0,
  sat_25 = 1240, sat_75 = 1430, sat_25th = 1240, sat_75th = 1430,
  act_25 = 29,   act_75 = 33,   act_25th = 29,   act_75th = 33,
  tuition_in_state = 15214, tuition_out_state = 42970, tuition_out_of_state = 42970,
  enrollment = 30000, type = 'public', setting = 'urban', region = 'West'
WHERE id = 'e0000005-0000-0000-0000-000000000008';

-- University of Oregon  [~88%]
UPDATE colleges SET
  acceptance_rate = 88.0,
  sat_25 = 1130, sat_75 = 1360, sat_25th = 1130, sat_75th = 1360,
  act_25 = 22,   act_75 = 30,   act_25th = 22,   act_75th = 30,
  tuition_in_state = 15320, tuition_out_state = 42516, tuition_out_of_state = 42516,
  enrollment = 22000, type = 'public', setting = 'suburban', region = 'West'
WHERE id = 'e0000005-0000-0000-0000-000000000009';

-- Rutgers University  [~65%]
UPDATE colleges SET
  acceptance_rate = 65.0,
  sat_25 = 1270, sat_75 = 1480, sat_25th = 1270, sat_75th = 1480,
  act_25 = 28,   act_75 = 33,   act_25th = 28,   act_75th = 33,
  tuition_in_state = 14933, tuition_out_state = 35758, tuition_out_of_state = 35758,
  enrollment = 36000, type = 'public', setting = 'suburban', region = 'Northeast'
WHERE id = 'e0000005-0000-0000-0000-000000000010';


-- ══════════════════════════════════════════════════════════════════════════════
-- PART 3 · COLLEGE STATS — ADDITIONAL SCHOOLS (matched by name)
-- ══════════════════════════════════════════════════════════════════════════════

UPDATE colleges SET
  acceptance_rate = 6.0,
  sat_25 = 1530, sat_75 = 1570, sat_25th = 1530, sat_75th = 1570,
  act_25 = 34, act_75 = 36, act_25th = 34, act_75th = 36,
  tuition_out_state = 67170, tuition_out_of_state = 67170,
  enrollment = 6356, type = 'private', setting = 'urban', region = 'Northeast'
WHERE name = 'Johns Hopkins University';

UPDATE colleges SET
  acceptance_rate = 3.78,
  sat_25 = NULL, sat_75 = NULL, sat_25th = NULL, sat_75th = NULL,
  act_25 = NULL, act_75 = NULL, act_25th = NULL, act_75th = NULL,
  tuition_out_state = 65622, tuition_out_of_state = 65622,
  enrollment = 987, type = 'private', setting = 'suburban', region = 'West'
WHERE name IN ('California Institute of Technology', 'Caltech');

UPDATE colleges SET
  acceptance_rate = 12.0,
  sat_25 = 1500, sat_75 = 1570, sat_25th = 1500, sat_75th = 1570,
  act_25 = 33, act_75 = 35, act_25th = 33, act_75th = 35,
  tuition_out_state = 68240, tuition_out_of_state = 68240,
  enrollment = 8220, type = 'private', setting = 'urban', region = 'Midwest'
WHERE name = 'Washington University in St. Louis';

UPDATE colleges SET
  acceptance_rate = 12.7,
  sat_25 = 1460, sat_75 = 1520, sat_25th = 1460, sat_75th = 1520,
  act_25 = 33, act_75 = 35, act_25th = 33, act_75th = 35,
  tuition_out_state = 72180, tuition_out_of_state = 72180,
  enrollment = 10200, type = 'private', setting = 'urban', region = 'Northeast'
WHERE name = 'Boston College';

UPDATE colleges SET
  acceptance_rate = 14.0,
  sat_25 = 1430, sat_75 = 1510, sat_25th = 1430, sat_75th = 1510,
  act_25 = 32, act_75 = 34, act_25th = 32, act_75th = 34,
  tuition_out_state = 71168, tuition_out_of_state = 71168,
  enrollment = 18805, type = 'private', setting = 'urban', region = 'Northeast'
WHERE name = 'Boston University';

UPDATE colleges SET
  acceptance_rate = 5.6,
  sat_25 = 1450, sat_75 = 1520, sat_25th = 1450, sat_75th = 1520,
  act_25 = 33, act_75 = 35, act_25th = 33, act_75th = 35,
  tuition_out_state = 69289, tuition_out_of_state = 69289,
  enrollment = 17432, type = 'private', setting = 'urban', region = 'Northeast'
WHERE name = 'Northeastern University';

UPDATE colleges SET
  acceptance_rate = 15.0,
  sat_25 = 1410, sat_75 = 1500, sat_25th = 1410, sat_75th = 1500,
  act_25 = 31, act_75 = 34, act_25th = 31, act_75th = 34,
  tuition_out_state = 71968, tuition_out_of_state = 71968,
  enrollment = 7200, type = 'private', setting = 'urban', region = 'South'
WHERE name = 'Tulane University';

UPDATE colleges SET
  acceptance_rate = 14.0,
  sat_25 = 1450, sat_75 = 1530, sat_25th = 1450, sat_75th = 1530,
  act_25 = 33, act_75 = 35, act_25th = 33, act_75th = 35,
  tuition_out_state = 65000, tuition_out_of_state = 65000,
  enrollment = 2700, type = 'liberal_arts', setting = 'rural', region = 'Northeast'
WHERE name = 'Middlebury College';

UPDATE colleges SET
  acceptance_rate = 19.5,
  sat_25 = 1470, sat_75 = 1540, sat_25th = 1470, sat_75th = 1540,
  act_25 = 32, act_75 = 35, act_25th = 32, act_75th = 35,
  tuition_out_state = 62634, tuition_out_of_state = 62634,
  enrollment = 2019, type = 'liberal_arts', setting = 'suburban', region = 'Midwest'
WHERE name = 'Carleton College';

UPDATE colleges SET
  acceptance_rate = 7.0,
  sat_25 = 1430, sat_75 = 1540, sat_25th = 1430, sat_75th = 1540,
  act_25 = 32, act_75 = 34, act_25th = 32, act_75th = 34,
  tuition_out_state = 64000, tuition_out_of_state = 64000,
  enrollment = 2200, type = 'liberal_arts', setting = 'suburban', region = 'Northeast'
WHERE name = 'Colby College';

UPDATE colleges SET
  acceptance_rate = 17.4,
  sat_25 = 1450, sat_75 = 1510, sat_25th = 1450, sat_75th = 1510,
  act_25 = 33, act_75 = 35, act_25th = 33, act_75th = 35,
  tuition_out_state = 65000, tuition_out_of_state = 65000,
  enrollment = 3100, type = 'liberal_arts', setting = 'suburban', region = 'Northeast'
WHERE name = 'Colgate University';

UPDATE colleges SET
  acceptance_rate = 13.6,
  sat_25 = 1460, sat_75 = 1530, sat_25th = 1460, sat_75th = 1530,
  act_25 = 33, act_75 = 35, act_25th = 33, act_75th = 35,
  tuition_out_state = 65000, tuition_out_of_state = 65000,
  enrollment = 2100, type = 'liberal_arts', setting = 'rural', region = 'Northeast'
WHERE name = 'Hamilton College';

UPDATE colleges SET
  acceptance_rate = 13.3,
  sat_25 = 1470, sat_75 = 1540, sat_25th = 1470, sat_75th = 1540,
  act_25 = 33, act_75 = 35, act_25th = 33, act_75th = 35,
  tuition_out_state = 65000, tuition_out_of_state = 65000,
  enrollment = 1400, type = 'liberal_arts', setting = 'suburban', region = 'Northeast'
WHERE name = 'Haverford College';

UPDATE colleges SET
  acceptance_rate = 18.6,
  sat_25 = 1450, sat_75 = 1550, sat_25th = 1450, sat_75th = 1550,
  act_25 = 33, act_75 = 35, act_25th = 33, act_75th = 35,
  tuition_out_state = 64000, tuition_out_of_state = 64000,
  enrollment = 2500, type = 'liberal_arts', setting = 'suburban', region = 'Northeast'
WHERE name = 'Vassar College';

UPDATE colleges SET
  acceptance_rate = 13.4,
  sat_25 = 1400, sat_75 = 1530, sat_25th = 1400, sat_75th = 1530,
  act_25 = 31, act_75 = 34, act_25th = 31, act_75th = 34,
  tuition_out_state = 62000, tuition_out_of_state = 62000,
  enrollment = 2000, type = 'liberal_arts', setting = 'suburban', region = 'South'
WHERE name = 'Davidson College';

UPDATE colleges SET
  acceptance_rate = 13.3,
  sat_25 = 1430, sat_75 = 1510, sat_25th = 1430, sat_75th = 1510,
  act_25 = 32, act_75 = 34, act_25th = 32, act_75th = 34,
  tuition_out_state = 64000, tuition_out_of_state = 64000,
  enrollment = 1800, type = 'liberal_arts', setting = 'suburban', region = 'Northeast'
WHERE name = 'Bates College';

UPDATE colleges SET
  acceptance_rate = 55.0,
  sat_25 = 1180, sat_75 = 1390, sat_25th = 1180, sat_75th = 1390,
  act_25 = 25, act_75 = 31, act_25th = 25, act_75th = 31,
  tuition_in_state = 16526, tuition_out_state = 38977, tuition_out_of_state = 38977,
  enrollment = 28000, type = 'public', setting = 'suburban', region = 'South'
WHERE name = 'Virginia Tech';

UPDATE colleges SET
  acceptance_rate = 38.3,
  sat_25 = 1240, sat_75 = 1410, sat_25th = 1240, sat_75th = 1410,
  act_25 = 28, act_75 = 32, act_25th = 28, act_75th = 32,
  tuition_in_state = 14038, tuition_out_state = 40562, tuition_out_of_state = 40562,
  enrollment = 24000, type = 'public', setting = 'suburban', region = 'South'
WHERE name = 'Clemson University';

UPDATE colleges SET
  acceptance_rate = 34.1,
  sat_25 = 1365, sat_75 = 1510, sat_25th = 1365, sat_75th = 1510,
  act_25 = 32, act_75 = 34, act_25th = 32, act_75th = 34,
  tuition_in_state = 25734, tuition_out_state = 51038, tuition_out_of_state = 51038,
  enrollment = 6300, type = 'public', setting = 'suburban', region = 'South'
WHERE name = 'College of William and Mary';

UPDATE colleges SET
  acceptance_rate = 58.1,
  sat_25 = 1280, sat_75 = 1460, sat_25th = 1280, sat_75th = 1460,
  act_25 = 29, act_75 = 33, act_25th = 29, act_75th = 33,
  tuition_in_state = 21926, tuition_out_state = 41430, tuition_out_of_state = 41430,
  enrollment = 20000, type = 'public', setting = 'urban', region = 'Northeast'
WHERE name = 'University of Pittsburgh';

UPDATE colleges SET
  acceptance_rate = 37.7,
  sat_25 = 1270, sat_75 = 1480, sat_25th = 1270, sat_75th = 1480,
  act_25 = 29, act_75 = 34, act_25th = 29, act_75th = 34,
  tuition_in_state = 11450, tuition_out_state = 31688, tuition_out_of_state = 31688,
  enrollment = 30000, type = 'public', setting = 'suburban', region = 'South'
WHERE name = 'University of Georgia';

UPDATE colleges SET
  acceptance_rate = 45.0,
  sat_25 = 1310, sat_75 = 1490, sat_25th = 1310, sat_75th = 1490,
  act_25 = 30, act_75 = 34, act_25th = 30, act_75th = 34,
  tuition_in_state = 11809, tuition_out_state = 41186, tuition_out_of_state = 41186,
  enrollment = 30000, type = 'public', setting = 'suburban', region = 'Northeast'
WHERE name IN ('University of Maryland', 'University of Maryland, College Park');

UPDATE colleges SET
  acceptance_rate = 41.7,
  sat_25 = 1300, sat_75 = 1470, sat_25th = 1300, sat_75th = 1470,
  act_25 = 28, act_75 = 32, act_25th = 28, act_75th = 32,
  tuition_in_state = 8799, tuition_out_state = 32847, tuition_out_of_state = 32847,
  enrollment = 26000, type = 'public', setting = 'suburban', region = 'South'
WHERE name = 'NC State University';

UPDATE colleges SET
  acceptance_rate = 12.5,
  sat_25 = 1310, sat_75 = 1490, sat_25th = 1310, sat_75th = 1490,
  act_25 = 29, act_75 = 34, act_25th = 29, act_75th = 34,
  tuition_in_state = 15070, tuition_out_state = 38250, tuition_out_of_state = 38250,
  enrollment = 53000, type = 'public', setting = 'urban', region = 'South'
WHERE name IN ('University of Texas at Austin', 'UT Austin');


-- ══════════════════════════════════════════════════════════════════════════════
-- PART 4 · FIX SPECIFIC DEADLINE BUGS IN MIGRATION 002 DATA
-- ══════════════════════════════════════════════════════════════════════════════

-- Georgetown Decision date was entered as 2027-12-15 (typo; should be 2026-12-15)
UPDATE deadlines SET date = '2026-12-15'
WHERE college_id = 'b0000002-0000-0000-0000-000000000007'
  AND type = 'Decision' AND date = '2027-12-15';

-- USC dropped Early Decision; only EA exists now.
-- Remove the ED1 row and correct EA to Oct 15 (the actual EA deadline).
DELETE FROM deadlines
WHERE college_id = 'b0000002-0000-0000-0000-000000000010'
  AND type = 'ED1';

UPDATE deadlines SET date = '2026-10-15'
WHERE college_id = 'b0000002-0000-0000-0000-000000000010'
  AND type = 'EA';

-- Georgetown EA is Nov 15 (not Nov 1 as seeded in migration 002)
UPDATE deadlines SET date = '2026-11-15'
WHERE college_id = 'b0000002-0000-0000-0000-000000000007'
  AND type = 'EA' AND date = '2026-11-01';

-- Stanford RD is Jan 5 (not Jan 2 as seeded in migration 002)
UPDATE deadlines SET date = '2027-01-05'
WHERE college_id = 'b0000002-0000-0000-0000-000000000002'
  AND type = 'RD' AND date = '2027-01-02';

-- UVA added ED in 2024-25; update EA deadline note
UPDATE deadlines SET notes = 'Early Action (in-state priority)'
WHERE college_id = 'd0000004-0000-0000-0000-000000000006'
  AND type = 'EA';


-- ══════════════════════════════════════════════════════════════════════════════
-- PART 5 · REMOVE STALE 2025-DATED DEADLINES FOR THE 50 CORE SCHOOLS
-- These schools already have correct 2026-27 deadlines from migration 002.
-- Migration 006 attached extra rows with 2025 dates to the same IDs.
-- ══════════════════════════════════════════════════════════════════════════════

DELETE FROM deadlines
WHERE date < '2026-09-01'
  AND college_id IN (
    'a0000001-0000-0000-0000-000000000001',
    'a0000001-0000-0000-0000-000000000002',
    'a0000001-0000-0000-0000-000000000003',
    'a0000001-0000-0000-0000-000000000004',
    'a0000001-0000-0000-0000-000000000005',
    'a0000001-0000-0000-0000-000000000006',
    'a0000001-0000-0000-0000-000000000007',
    'a0000001-0000-0000-0000-000000000008',
    'b0000002-0000-0000-0000-000000000001',
    'b0000002-0000-0000-0000-000000000002',
    'b0000002-0000-0000-0000-000000000003',
    'b0000002-0000-0000-0000-000000000004',
    'b0000002-0000-0000-0000-000000000005',
    'b0000002-0000-0000-0000-000000000006',
    'b0000002-0000-0000-0000-000000000007',
    'b0000002-0000-0000-0000-000000000008',
    'b0000002-0000-0000-0000-000000000009',
    'b0000002-0000-0000-0000-000000000010',
    'b0000002-0000-0000-0000-000000000011',
    'b0000002-0000-0000-0000-000000000012',
    'c0000003-0000-0000-0000-000000000001',
    'c0000003-0000-0000-0000-000000000002',
    'c0000003-0000-0000-0000-000000000003',
    'c0000003-0000-0000-0000-000000000004',
    'c0000003-0000-0000-0000-000000000005',
    'd0000004-0000-0000-0000-000000000001',
    'd0000004-0000-0000-0000-000000000002',
    'd0000004-0000-0000-0000-000000000003',
    'd0000004-0000-0000-0000-000000000004',
    'd0000004-0000-0000-0000-000000000005',
    'd0000004-0000-0000-0000-000000000006',
    'd0000004-0000-0000-0000-000000000007',
    'd0000004-0000-0000-0000-000000000008',
    'd0000004-0000-0000-0000-000000000009',
    'd0000004-0000-0000-0000-000000000010',
    'd0000004-0000-0000-0000-000000000011',
    'd0000004-0000-0000-0000-000000000012',
    'd0000004-0000-0000-0000-000000000013',
    'd0000004-0000-0000-0000-000000000014',
    'd0000004-0000-0000-0000-000000000015',
    'e0000005-0000-0000-0000-000000000001',
    'e0000005-0000-0000-0000-000000000002',
    'e0000005-0000-0000-0000-000000000003',
    'e0000005-0000-0000-0000-000000000004',
    'e0000005-0000-0000-0000-000000000005',
    'e0000005-0000-0000-0000-000000000006',
    'e0000005-0000-0000-0000-000000000007',
    'e0000005-0000-0000-0000-000000000008',
    'e0000005-0000-0000-0000-000000000009',
    'e0000005-0000-0000-0000-000000000010'
  );


-- ══════════════════════════════════════════════════════════════════════════════
-- PART 6 · SHIFT ALL REMAINING STALE DEADLINE DATES +1 YEAR
-- Any deadline still dated before 2026-09-01 belongs to the 2025-26 cycle.
-- Adding 1 year moves EA/ED1 (2025-11-01 → 2026-11-01) and RD/ED2
-- (2026-01-15 → 2027-01-15) to the correct 2026-27 slots.
-- Dates already ≥ 2026-09-01 (from migration 002) are untouched.
-- ══════════════════════════════════════════════════════════════════════════════

UPDATE deadlines
SET date = date + INTERVAL '1 year'
WHERE date < '2026-09-01';


-- ══════════════════════════════════════════════════════════════════════════════
-- PART 7 · SANITY CHECK — view updated acceptance rates for key schools
-- Uncomment to verify before committing (run separately if needed)
-- ══════════════════════════════════════════════════════════════════════════════
-- SELECT name, acceptance_rate, sat_25th, sat_75th, enrollment
-- FROM colleges
-- WHERE name IN (
--   'Stanford University','Harvard University','Yale University',
--   'MIT','Duke University','University of Michigan',
--   'UCLA','UC Berkeley','Ohio State University'
-- )
-- ORDER BY acceptance_rate;


COMMIT;
