-- 0048_school_pincode_lead_source.sql
-- Adds pincode field to the schools table.

ALTER TABLE schools
  ADD COLUMN IF NOT EXISTS pincode text;

COMMENT ON COLUMN schools.pincode IS '6-digit Indian PIN code for the school location.';
