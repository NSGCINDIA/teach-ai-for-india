-- ═══════════════════════════════════════════════════════════════════════════
-- Teach AI for India — 0012 Analytics Views (PRD §7.8, M5)
-- Three-tier analytics for the management panel:
--   Tier 1  program_summary      — org-wide KPIs (mgmt summary, <2s)
--   Tier 2  campus_performance   — per-campus rollup vs target
--   Tier 3  session_funnel, school_pipeline, monthly_activity — operational
--
-- These are SECURITY DEFINER (owner-run) aggregate views: they expose COUNTS
-- and SUMS only — no PII — exactly like public_impact_stats (0005). Access is
-- gated at the route layer (/admin/analytics → super_admin, mgmt_admin, viewer;
-- PRD §7.2 view_analytics_all). Definer is required because the `viewer` role
-- has no row-level SELECT on sessions/schools/reimbursements, so a
-- security_invoker view would return zeros for it (campus_rollups in 0005 is
-- invoker-scoped and intentionally kept for per-campus operational use).
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── Tier 1 · Program summary (US-ANLT-01 — management summary) ───────────────
create or replace view program_summary as
select
  (select count(*) from schools)                                                    as schools_total,
  (select count(*) from schools where total_sessions > 0)                           as schools_reached,
  (select count(*) from sessions where status = 'verified')                         as sessions_completed,
  (select coalesce(sum(student_count),0) from sessions where status = 'verified')   as students_impacted,
  (select count(*) from users
     where is_active and role not in ('school_poc','viewer'))                       as active_volunteers,
  (select count(*) from campuses where is_active)                                   as active_campuses,
  (select count(distinct state) from campuses)                                      as states_count,
  (select coalesce(sum(amount),0) from reimbursements
     where status in ('approved','paid'))                                           as approved_spend,
  (select count(*) from reimbursements
     where status in ('submitted','under_review'))                                  as pending_claims,
  (select coalesce(sum(target_students),0) from campuses where is_active)           as target_students,
  (select coalesce(sum(target_sessions),0) from campuses where is_active)           as target_sessions,
  (select coalesce(sum(target_schools),0) from campuses where is_active)            as target_schools;

comment on view program_summary is 'Org-wide KPIs for the management analytics summary (PRD §7.8 Tier 1 / US-ANLT-01). Aggregates only.';

-- ─── Tier 2 · Campus performance vs target (US-ANLT-02) ───────────────────────
create or replace view campus_performance as
select
  c.id as campus_id, c.name, c.slug,
  c.target_schools, c.target_students, c.target_sessions, c.quarter,
  (select count(*) from schools s where s.campus_id = c.id)                                  as schools_total,
  (select count(*) from schools s where s.campus_id = c.id and s.total_sessions > 0)         as schools_reached,
  (select count(*) from sessions se where se.campus_id = c.id and se.status = 'verified')    as sessions_completed,
  (select coalesce(sum(se.student_count),0) from sessions se
     where se.campus_id = c.id and se.status = 'verified')                                   as students_impacted,
  (select count(*) from users u where u.campus_id = c.id and u.is_active
     and u.role not in ('school_poc','viewer'))                                              as volunteers,
  (select coalesce(sum(r.amount),0) from reimbursements r
     where r.campus_id = c.id and r.status in ('approved','paid'))                           as approved_spend,
  (select max(se.date) from sessions se where se.campus_id = c.id)                           as last_session_date
from campuses c
where c.is_active;

comment on view campus_performance is 'Per-campus rollup vs target for analytics Tier 2 (PRD §7.8 / US-ANLT-02). Aggregates only; readable by every analytics role.';

-- ─── Tier 3 · Session funnel (status breakdown) ──────────────────────────────
create or replace view session_funnel as
select status::text as status, count(*) as count
from sessions
group by status;

comment on view session_funnel is 'Session count by lifecycle status (PRD §7.8 Tier 3 operational).';

-- ─── Tier 3 · School pipeline (status breakdown) ─────────────────────────────
create or replace view school_pipeline as
select status::text as status, count(*) as count
from schools
group by status;

comment on view school_pipeline is 'School count by CRM pipeline status (PRD §7.8 Tier 3 operational).';

-- ─── Tier 3 · Monthly activity trend (verified sessions) ─────────────────────
create or replace view monthly_activity as
select
  date_trunc('month', date)::date              as month,
  count(*) filter (where status = 'verified')  as sessions_completed,
  coalesce(sum(student_count) filter (where status = 'verified'),0) as students_impacted
from sessions
group by 1
order by 1;

comment on view monthly_activity is 'Verified sessions + students per month — trend chart source (PRD §7.8).';

grant select on program_summary, campus_performance, session_funnel, school_pipeline, monthly_activity
  to authenticated;
