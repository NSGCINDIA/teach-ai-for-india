-- 0053_preferred_training_schedule.sql
-- Adds preferred_training_days and preferred_time_slot columns to session_plans

ALTER TABLE session_plans
  ADD COLUMN IF NOT EXISTS preferred_training_days text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS preferred_time_slot text CHECK (preferred_time_slot IN ('Morning', 'Afternoon', 'Full Day'));

COMMENT ON COLUMN session_plans.preferred_training_days IS 'Preferred training days of the week (e.g. Monday, Wednesday)';
COMMENT ON COLUMN session_plans.preferred_time_slot IS 'Preferred time slot: Morning, Afternoon, or Full Day';
