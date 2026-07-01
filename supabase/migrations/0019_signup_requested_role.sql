-- ═══════════════════════════════════════════════════════════════════════════
-- Teach AI for India — 0019 Self-signup: requested role
--
-- Applicants on /signup now pick the role they're applying for. The choice is
-- captured on the request and used to materialise the profile on approval
-- (an admin still reviews, so this is a request, not a grant).
--
-- Constrained to non-privileged TEAM roles — admin/viewer/school_poc can never
-- be self-requested; those stay invite-only (PRD §7.2).
-- ═══════════════════════════════════════════════════════════════════════════

alter table signup_requests
  add column if not exists requested_role text not null default 'volunteer';

alter table signup_requests
  drop constraint if exists signup_requests_requested_role_check;
alter table signup_requests
  add constraint signup_requests_requested_role_check
  check (requested_role in ('volunteer', 'volunteer_lead', 'exec_lead', 'outreach_head', 'campus_lead'));

comment on column signup_requests.requested_role is 'Team role the applicant requested (admin confirms on approval). Non-privileged roles only.';
