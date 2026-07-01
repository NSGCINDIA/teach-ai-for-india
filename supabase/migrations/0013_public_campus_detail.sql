-- ═══════════════════════════════════════════════════════════════════════════
-- Teach AI for India — 0013 Public campus-detail views (PRD §7.1, M7)
-- Powers the campus detail page's session timeline + team roster. Both are
-- SECURITY DEFINER (owner-run) so anon can read them — the underlying `sessions`
-- and `users` tables are RLS-locked to authenticated roles. They expose ONLY
-- non-PII, celebration-worthy fields (no email/phone; verified sessions only).
-- Mirrors the public_campus_cards precedent (0005).
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── Recent verified sessions per campus (public timeline) ───────────────────
create or replace view public_campus_sessions as
select
  s.id,
  s.campus_id,
  s.topic,
  s.session_type,
  s.date,
  s.student_count,
  sc.name     as school_name,
  sc.district as school_district
from sessions s
join schools sc on sc.id = s.school_id
where s.status = 'verified'
order by s.date desc;

comment on view public_campus_sessions is 'Verified sessions per campus for the public timeline (PRD §7.1). Anon-readable; no PII.';

-- ─── Campus team roster (public) ─────────────────────────────────────────────
create or replace view public_campus_team as
select
  u.id,
  u.campus_id,
  u.full_name,
  u.role,
  u.avatar_url
from users u
where u.is_active
  and u.role in ('campus_lead', 'outreach_head', 'exec_lead', 'volunteer');

comment on view public_campus_team is 'Active team members per campus for the public team section (PRD §7.1). Name/role/avatar only — no contact PII.';

grant select on public_campus_sessions, public_campus_team to anon, authenticated;
