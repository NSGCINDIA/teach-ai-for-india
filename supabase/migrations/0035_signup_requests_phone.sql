-- ═══════════════════════════════════════════════════════════════════════════
-- Teach AI for India — 0035 Add phone to signup requests
--
-- The signup form now collects a phone number so admins/leads can reach an
-- applicant directly. users.phone already exists (0001_schema.sql) and is
-- nullable with no format constraint — signup_requests.phone mirrors that.
-- ═══════════════════════════════════════════════════════════════════════════

alter table signup_requests add column phone text;
