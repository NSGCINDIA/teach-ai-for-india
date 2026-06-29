-- ═══════════════════════════════════════════════════════════════════════════
-- Teach AI for India — 0005 Analytics Views
-- Public aggregate views (anon-safe, definer) + scoped operational views
-- (security_invoker so RLS applies per the viewer's role).
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── Public impact counters (PRD §7.1 Impact bar — anon readable) ────────────
-- Aggregates only, no PII. Runs as owner (bypasses RLS) — safe: counts only.
create or replace view public_impact_stats as
select
  (select count(*) from schools where total_sessions > 0)                       as schools_reached,
  (select coalesce(sum(student_count),0) from sessions where status = 'verified') as students_impacted,
  (select count(*) from sessions where status = 'verified')                      as sessions_completed,
  (select count(*) from campuses where is_active)                               as active_campuses,
  (select count(distinct state) from campuses)                                  as states_count;

comment on view public_impact_stats is 'Live counters for the public homepage. Anon-readable aggregates (PRD §7.1).';

-- ─── Public campus cards (PRD §7.1 Campuses grid + detail) ───────────────────
create or replace view public_campus_cards as
select
  c.id, c.name, c.slug, c.university_name, c.city, c.state,
  c.description, c.hero_image_url,
  u.full_name  as lead_name,
  u.avatar_url as lead_avatar_url,
  (select count(*) from schools s where s.campus_id = c.id and s.total_sessions > 0) as schools_reached,
  (select coalesce(sum(se.student_count),0) from sessions se
     where se.campus_id = c.id and se.status = 'verified')                          as students_impacted,
  (select count(*) from sessions se where se.campus_id = c.id and se.status = 'verified') as sessions_completed
from campuses c
left join users u on u.id = c.lead_user_id
where c.is_active;

comment on view public_campus_cards is 'Per-campus public summary for /campuses and /campuses/[slug] (PRD §7.1).';

grant select on public_impact_stats, public_campus_cards to anon, authenticated;

-- ─── Operational campus rollups (scoped by RLS via security_invoker) ─────────
create or replace view campus_rollups
with (security_invoker = on) as
select
  c.id as campus_id, c.name, c.slug,
  c.target_schools, c.target_students, c.target_sessions, c.quarter,
  (select count(*) from schools s where s.campus_id = c.id)                                  as schools_total,
  (select count(*) from schools s where s.campus_id = c.id and s.total_sessions > 0)         as schools_reached,
  (select count(*) from sessions se where se.campus_id = c.id and se.status = 'verified')    as sessions_completed,
  (select coalesce(sum(se.student_count),0) from sessions se
     where se.campus_id = c.id and se.status = 'verified')                                   as students_impacted,
  (select count(*) from users u where u.campus_id = c.id and u.is_active)                    as volunteers,
  (select max(se.date) from sessions se where se.campus_id = c.id)                           as last_session_date
from campuses c;

comment on view campus_rollups is 'Campus performance vs target (PRD §7.8 Tier 2 / US-ANLT-02). RLS-scoped.';

-- ─── Finance views (PRD §7.6) — RLS-scoped to viewer (admin all / lead campus) ─
create or replace view finance_campus_spend
with (security_invoker = on) as
select
  campus_id,
  count(*) filter (where status in ('submitted','under_review'))                     as pending_count,
  coalesce(sum(amount) filter (where status in ('approved','paid')),0)               as approved_total,
  coalesce(sum(amount) filter (where status = 'paid'),0)                             as paid_total,
  coalesce(sum(amount) filter (where status = 'approved'),0)                         as unpaid_liabilities,
  coalesce(sum(amount) filter (where status in ('approved','paid')
            and date_trunc('month', claim_date) = date_trunc('month', current_date)),0) as month_to_date
from reimbursements
group by campus_id;

comment on view finance_campus_spend is 'Approved/paid/pending spend per campus (PRD §7.6 Finance dashboard).';

create or replace view finance_monthly_trend
with (security_invoker = on) as
select
  date_trunc('month', claim_date)::date as month,
  coalesce(sum(amount) filter (where status in ('approved','paid')),0) as approved_total
from reimbursements
group by 1 order by 1;

comment on view finance_monthly_trend is 'Approved spend per month — bar chart source (PRD §7.6).';
