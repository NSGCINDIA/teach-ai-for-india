-- 0052_deployment_planning_fields.sql
-- Enhances session_plans with deployment planning fields for Operations:
-- classes_covered, digital_classrooms, recommended_fellows, assigned_fellows, smart_tv, ups_backup

ALTER TABLE session_plans
  ADD COLUMN IF NOT EXISTS classes_covered text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS digital_classrooms integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS recommended_fellows integer NOT NULL DEFAULT 2,
  ADD COLUMN IF NOT EXISTS assigned_fellows integer NOT NULL DEFAULT 2,
  ADD COLUMN IF NOT EXISTS smart_tv boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS ups_backup boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN session_plans.classes_covered IS 'Array of classes covered (e.g. Class 6, Class 7)';
COMMENT ON COLUMN session_plans.digital_classrooms IS 'Number of digital classrooms in the school';
COMMENT ON COLUMN session_plans.recommended_fellows IS 'Auto-calculated fellow recommendation (digital_classrooms * 2)';
COMMENT ON COLUMN session_plans.assigned_fellows IS 'Operations assigned fellow count';
COMMENT ON COLUMN session_plans.smart_tv IS 'Availability of Smart TV infrastructure';
COMMENT ON COLUMN session_plans.ups_backup IS 'Availability of UPS / Power Backup';
