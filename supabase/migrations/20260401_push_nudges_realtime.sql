-- ═══════════════════════════════════════════════════════════════════
-- Migration: Push Notifications + Nudges + Realtime
-- Date: 2026-04-01
-- ═══════════════════════════════════════════════════════════════════

-- 1. Push Subscriptions table
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id     text NOT NULL,
  endpoint      text NOT NULL UNIQUE,
  p256dh        text NOT NULL,
  auth          text NOT NULL,
  user_agent    text,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_push_subs_member ON push_subscriptions(member_id);

-- 2. Nudges table
CREATE TABLE IF NOT EXISTS nudges (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  from_member     text NOT NULL,
  to_member       text NOT NULL,
  task_id         text NOT NULL,
  task_name       text NOT NULL DEFAULT '',
  message         text,
  read            boolean DEFAULT false,
  created_at      timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_nudges_to_member ON nudges(to_member, read);
CREATE INDEX IF NOT EXISTS idx_nudges_task ON nudges(task_id);

-- 3. Enable Realtime on all relevant tables
ALTER PUBLICATION supabase_realtime ADD TABLE home_task_instances;
ALTER PUBLICATION supabase_realtime ADD TABLE home_recurring_tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE meals;
ALTER PUBLICATION supabase_realtime ADD TABLE fin_expenses;
ALTER PUBLICATION supabase_realtime ADD TABLE fin_goals;
ALTER PUBLICATION supabase_realtime ADD TABLE fin_goal_contributions;
ALTER PUBLICATION supabase_realtime ADD TABLE fin_budgets;
ALTER PUBLICATION supabase_realtime ADD TABLE nudges;
ALTER PUBLICATION supabase_realtime ADD TABLE push_subscriptions;

-- 4. RLS policies (using anon key - family app, no per-user auth)
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "push_subs_all" ON push_subscriptions FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE nudges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "nudges_all" ON nudges FOR ALL USING (true) WITH CHECK (true);
