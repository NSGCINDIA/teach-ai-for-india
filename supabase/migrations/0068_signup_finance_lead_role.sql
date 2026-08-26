-- ═══════════════════════════════════════════════════════════════════════════
-- Teach AI for India — 0068 Allow finance_lead on public self-signup
--
-- finance_lead was invite-only: the CHECK added in 0019 and rewritten in 0025
-- listed only ('volunteer','volunteer_lead','exec_lead','outreach_lead',
-- 'campus_lead'), so an applicant could never request it on /signup — the
-- option was absent from the form and any hand-crafted POST was rejected by
-- this constraint.
--
-- finance_lead is a campus-scoped team role (reviews budgets, processes
-- reimbursements), not a platform-privileged one, and every request still
-- passes through admin approval in approveSignup() before a profile exists.
-- campus_mgmt_admin deliberately stays out of this list — it remains
-- invite-only.
-- ═══════════════════════════════════════════════════════════════════════════

alter table signup_requests
  drop constraint if exists signup_requests_requested_role_check;

alter table signup_requests
  add constraint signup_requests_requested_role_check
  check (requested_role in (
    'volunteer', 'volunteer_lead', 'exec_lead', 'outreach_lead',
    'campus_lead', 'finance_lead'
  ));

comment on column signup_requests.requested_role is
  'Team role the applicant requested (admin confirms on approval). Self-requestable roles only — campus_mgmt_admin and super_admin stay invite-only.';
