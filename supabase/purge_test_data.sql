-- ═══════════════════════════════════════════════════════════════════════════
-- Teach AI for India — Purge Test Data Script
--
-- PURPOSE:
--   1. Retains all College/Campus master data (campuses table).
--   2. Retains Super Admin & Admin accounts in auth.users and public.users.
--   3. Removes test/volunteer users, pending signup requests, test reimbursements, and logs.
--   4. Preserves core Schools & Sessions structures.
--
-- HOW TO RUN:
--   Copy and execute this script in your Supabase SQL Editor (Dashboard → SQL Editor).
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

-- 1. Purge transient test requests & logs
DELETE FROM public.signup_requests;
DELETE FROM public.signup_rate_limit;
DELETE FROM public.reimbursements;
DELETE FROM public.budget_increase_requests;
DELETE FROM public.audit_log;
DELETE FROM public.notifications;

-- 2. Delete non-admin user accounts from auth.users (cascades to public.users & volunteer profiles)
DELETE FROM auth.users
WHERE id IN (
  SELECT id FROM public.users 
  WHERE role NOT IN ('super_admin', 'mgmt_admin')
);

-- 3. Remove any non-admin profiles from public.users if unlinked
DELETE FROM public.users
WHERE role NOT IN ('super_admin', 'mgmt_admin');

COMMIT;

-- 4. Verification summary query
SELECT 
  (SELECT COUNT(*) FROM campuses) AS active_colleges_count,
  (SELECT COUNT(*) FROM public.users WHERE role = 'super_admin') AS super_admins_count,
  (SELECT COUNT(*) FROM public.users WHERE role NOT IN ('super_admin', 'mgmt_admin')) AS non_admins_remaining,
  (SELECT COUNT(*) FROM schools) AS schools_count,
  (SELECT COUNT(*) FROM sessions) AS sessions_count;
