-- ═══════════════════════════════════════════════════════════════════
-- Migration: Multi-Tenancy - Families & Members
-- Date: 2026-04-02
-- Adds: families, family_members, family_invites tables
-- Adds: family_id column to ALL existing tables
-- Adds: RLS policies for tenant isolation
-- ═══════════════════════════════════════════════════════════════════

-- ──────────────────────────────────────────────────
-- 1. Core tenant tables
-- ──────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS families (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name        text NOT NULL,
  password    text NOT NULL DEFAULT '',
  plan        text NOT NULL DEFAULT 'free',  -- free, family, family_plus
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS family_members (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id   uuid NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  slug        text NOT NULL,           -- short identifier (e.g. 'felipe')
  name        text NOT NULL,
  emoji       text NOT NULL DEFAULT 'man',
  color       text NOT NULL DEFAULT '#6B7280',
  role        text NOT NULL DEFAULT 'member',  -- admin, member
  exclude_fin boolean DEFAULT false,   -- excluded from FamilyFin (e.g. kids)
  created_at  timestamptz DEFAULT now(),
  UNIQUE(family_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_fm_family ON family_members(family_id);

-- Invite links for joining a family
CREATE TABLE IF NOT EXISTS family_invites (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id   uuid NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  code        text NOT NULL UNIQUE,     -- short invite code
  uses        int DEFAULT 0,
  max_uses    int DEFAULT 10,
  expires_at  timestamptz,
  created_at  timestamptz DEFAULT now()
);

-- ──────────────────────────────────────────────────
-- 2. Add family_id to ALL existing tables
-- ──────────────────────────────────────────────────

-- Meals (FamilyChef)
ALTER TABLE meals
  ADD COLUMN IF NOT EXISTS family_id uuid REFERENCES families(id) ON DELETE CASCADE;

-- Member stats (FamilyChef)
ALTER TABLE member_stats
  ADD COLUMN IF NOT EXISTS family_id uuid REFERENCES families(id) ON DELETE CASCADE;

-- Home tasks
ALTER TABLE home_task_instances
  ADD COLUMN IF NOT EXISTS family_id uuid REFERENCES families(id) ON DELETE CASCADE;

ALTER TABLE home_recurring_tasks
  ADD COLUMN IF NOT EXISTS family_id uuid REFERENCES families(id) ON DELETE CASCADE;

-- Home stats
ALTER TABLE home_stats
  ADD COLUMN IF NOT EXISTS family_id uuid REFERENCES families(id) ON DELETE CASCADE;

-- Fin
ALTER TABLE fin_expenses
  ADD COLUMN IF NOT EXISTS family_id uuid REFERENCES families(id) ON DELETE CASCADE;

ALTER TABLE fin_goals
  ADD COLUMN IF NOT EXISTS family_id uuid REFERENCES families(id) ON DELETE CASCADE;

ALTER TABLE fin_goal_contributions
  ADD COLUMN IF NOT EXISTS family_id uuid REFERENCES families(id) ON DELETE CASCADE;

ALTER TABLE fin_budgets
  ADD COLUMN IF NOT EXISTS family_id uuid REFERENCES families(id) ON DELETE CASCADE;

ALTER TABLE fin_stats
  ADD COLUMN IF NOT EXISTS family_id uuid REFERENCES families(id) ON DELETE CASCADE;

-- Nudges & Push
ALTER TABLE nudges
  ADD COLUMN IF NOT EXISTS family_id uuid REFERENCES families(id) ON DELETE CASCADE;

ALTER TABLE push_subscriptions
  ADD COLUMN IF NOT EXISTS family_id uuid REFERENCES families(id) ON DELETE CASCADE;

-- ──────────────────────────────────────────────────
-- 3. Indexes on family_id
-- ──────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_meals_family ON meals(family_id);
CREATE INDEX IF NOT EXISTS idx_member_stats_family ON member_stats(family_id);
CREATE INDEX IF NOT EXISTS idx_hti_family ON home_task_instances(family_id);
CREATE INDEX IF NOT EXISTS idx_hrt_family ON home_recurring_tasks(family_id);
CREATE INDEX IF NOT EXISTS idx_home_stats_family ON home_stats(family_id);
CREATE INDEX IF NOT EXISTS idx_fin_expenses_family ON fin_expenses(family_id);
CREATE INDEX IF NOT EXISTS idx_fin_goals_family ON fin_goals(family_id);
CREATE INDEX IF NOT EXISTS idx_fin_gc_family ON fin_goal_contributions(family_id);
CREATE INDEX IF NOT EXISTS idx_fin_budgets_family ON fin_budgets(family_id);
CREATE INDEX IF NOT EXISTS idx_fin_stats_family ON fin_stats(family_id);
CREATE INDEX IF NOT EXISTS idx_nudges_family ON nudges(family_id);
CREATE INDEX IF NOT EXISTS idx_push_subs_family ON push_subscriptions(family_id);

-- ──────────────────────────────────────────────────
-- 4. Enable RLS on new tables
-- ──────────────────────────────────────────────────

ALTER TABLE families ENABLE ROW LEVEL SECURITY;
CREATE POLICY "families_all" ON families FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "family_members_all" ON family_members FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE family_invites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "family_invites_all" ON family_invites FOR ALL USING (true) WITH CHECK (true);

-- ──────────────────────────────────────────────────
-- 5. Enable Realtime on new tables
-- ──────────────────────────────────────────────────

ALTER PUBLICATION supabase_realtime ADD TABLE families;
ALTER PUBLICATION supabase_realtime ADD TABLE family_members;
