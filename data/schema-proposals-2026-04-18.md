# due.college — Schema Improvement Proposals
**Date:** 2026-04-18  
**Status:** PROPOSED — not yet applied. Discuss before implementing.

---

## Problem 1 · Dual SAT Column Families

### Current state
The `colleges` table has **two parallel sets of identical columns**:

| Migration 005 columns | Migration 007 columns | Both mean the same thing |
|----------------------|----------------------|--------------------------|
| `sat_25` | `sat_25th` | SAT 25th percentile |
| `sat_75` | `sat_75th` | SAT 75th percentile |
| `act_25` | `act_25th` | ACT 25th percentile |
| `act_75` | `act_75th` | ACT 75th percentile |
| `tuition_out_state` | `tuition_out_of_state` | Out-of-state tuition |

The `src/app/school/[id]/page.tsx` reads `sat_25`/`sat_75`.  
The `src/app/discover/college/[id]/page.tsx` reads `sat_25th`/`sat_75th`.

Both are populated with identical values by `fix-colleges-2026-04-18.sql` as a workaround, but this wastes space and creates drift risk.

### Proposed fix
```sql
-- 1. Migrate any pages still on the old columns (update page.tsx first)
-- 2. Drop the old column family
ALTER TABLE colleges
  DROP COLUMN IF EXISTS sat_25,
  DROP COLUMN IF EXISTS sat_75,
  DROP COLUMN IF EXISTS act_25,
  DROP COLUMN IF EXISTS act_75,
  DROP COLUMN IF EXISTS tuition_out_state;
```

**Effort:** Medium — requires updating `src/app/school/[id]/page.tsx` and any API queries that reference the old column names, then a migration.

---

## Problem 2 · Test Policy Column Missing

### Current state
The `colleges` table has no column for a school's test policy (required / recommended / optional / blind). This matters because:
- 6 UC campuses are **test-blind** — showing NULL for SAT range is confusing without context
- Dozens of schools remain **test-optional** through 2026-27
- A few schools (MIT, Dartmouth, Yale, Georgetown, Brown...) **reinstated test-required**

### Proposed fix
```sql
ALTER TABLE colleges
  ADD COLUMN IF NOT EXISTS test_policy TEXT
    CHECK (test_policy IN ('required','optional','recommended','blind'))
    DEFAULT 'optional';
```

**Seed values:**
- `'blind'` → all UC campuses (UCLA, UCB, UCSD, UCD, UCSB, UCI, UCSC, UCR)
- `'required'` → MIT, Dartmouth, Yale, Georgetown, Brown, Rice, Notre Dame, Carnegie Mellon, UVA, Georgia Tech, Caltech, Johns Hopkins
- `'optional'` → all others for now (most schools through 2026-27)

**Frontend impact:** The detail page could show a "Test Policy" badge. The search/filter could let users filter by test policy instead of entering SAT scores that won't apply to test-blind schools.

**Effort:** Low — one migration, one seed UPDATE, small UI tweak.

---

## Problem 3 · `acceptance_rate` Column Type Mismatch

### Current state
- Migration 005 defined `acceptance_rate NUMERIC(5,2)` — correct for percentages up to 100.00
- Migration 008 tried to store decimal fractions (0.03) in this column — the `NUMERIC(5,2)` type silently rounds/truncates but does not reject values < 1
- This caused the "50% bug" when 0.50 × 100 was displayed

### Proposed fix
No type change needed now that all values are stored as percentages. However, add a check constraint to prevent future decimal-format writes:

```sql
ALTER TABLE colleges
  ADD CONSTRAINT acceptance_rate_is_percent
    CHECK (acceptance_rate IS NULL OR (acceptance_rate >= 0 AND acceptance_rate <= 100));
```

**Effort:** Trivial — one ALTER TABLE.

---

## Problem 4 · Deadline `type` Enum Not Enforced

### Current state
The `deadlines` table stores `type TEXT` with values like `'ED1'`, `'ED2'`, `'EA'`, `'REA'`, `'RD'`, `'Decision'`. There's no constraint so typos are silent.

### Proposed fix
```sql
-- Convert column to enum or add CHECK:
ALTER TABLE deadlines
  ADD CONSTRAINT deadline_type_valid
    CHECK (type IN ('ED1','ED2','EA','REA','RD','Decision','Priority'));
```

**Effort:** Trivial — one ALTER TABLE.

---

## Problem 5 · Missing `updated_at` Timestamps

### Current state
Both `colleges` and `deadlines` have `created_at` but no `updated_at`. This makes it impossible to tell when data was last refreshed.

### Proposed fix
```sql
ALTER TABLE colleges  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE deadlines ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Auto-update on row change:
CREATE OR REPLACE FUNCTION set_updated_at()
  RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$;

CREATE TRIGGER colleges_updated_at  BEFORE UPDATE ON colleges  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER deadlines_updated_at BEFORE UPDATE ON deadlines FOR EACH ROW EXECUTE FUNCTION set_updated_at();
```

**Effort:** Low — one migration. Very useful for future annual data refresh cycles.

---

## Recommendation Priority

| Priority | Proposal | Risk | Effort |
|----------|-----------|------|--------|
| 🔴 High | Add `acceptance_rate` check constraint (Problem 3) | None | Trivial |
| 🔴 High | Add `deadline.type` check constraint (Problem 4) | None | Trivial |
| 🟡 Medium | Add `test_policy` column + seed (Problem 2) | Low | Low |
| 🟡 Medium | Add `updated_at` timestamps (Problem 5) | None | Low |
| 🟢 Low | Drop duplicate SAT column family (Problem 1) | Medium — requires updating 2 pages | Medium |

**Suggested order:** Do 3 + 4 in a single migration immediately (they're just CHECK constraints, pure safety). Do 2 + 5 together as the next migration. Do 1 last, after updating both page.tsx files to use a single column family.
