-- ═══════════════════════════════════════════════════════════════════════════
-- Teach AI for India — 0036 School lifecycle v2
--
-- Replaces the school_status pipeline with:
--   lead_identified → outreach_requested → outreach_approved → visit_completed
--   → registered → sessions_active → completed → archived
--
-- and removes the single-session-per-school constraint so a school can plan
-- and approve an unbounded number of sessions while it sits at 'registered'/
-- 'sessions_active' — the old pipeline hard-gated approve_session_plan() on
-- one specific status value and session_plans had unique(school_id), making a
-- 2nd session physically impossible (see 0016's own "out of Phase 2 scope"
-- comment). Verified live: zero RLS policies and zero views reference
-- school_status (unlike user_role in 0035), so no policy capture/replay is
-- needed here — only the 3 functions whose signature mentions the type.
--
-- Old → new status mapping (schools.status, via USING CASE below):
--   lead_identified                          → lead_identified      (unchanged)
--   contacted, followup_pending,
--     approval_requested                     → outreach_requested   (collapsed;
--                                                per product decision to drop
--                                                these sub-stages rather than
--                                                preserve them)
--   approval_received                        → registered
--   session_scheduled, session_in_progress   → sessions_active      (collapsed;
--                                                per-session detail now lives
--                                                entirely on sessions.status)
--   completed                                → completed            (unchanged)
--   archived                                 → archived             (unchanged)
--
-- Live data note: one school is currently at 'session_scheduled' with zero
-- backing sessions/session_plans rows (set outside the normal approve_plan
-- path). It maps to 'sessions_active' here like any other row at that value —
-- flagging for a post-migration manual glance, not a migration blocker.
-- ═══════════════════════════════════════════════════════════════════════════

begin;

do $$
begin
  if exists (
    select 1 from public.schools
    where status::text not in (
      'lead_identified','contacted','followup_pending','approval_requested',
      'approval_received','session_scheduled','session_in_progress','completed','archived'
    )
  ) then
    raise exception 'Cannot rebuild school_status: a school has an unrecognized status value';
  end if;
end $$;

-- ─── Drop the 3 functions whose signature mentions school_status ───────────
-- (school_status_history.previous_status/new_status are plain text — 0001 —
-- so no cast is needed there and no function touches those columns' types.)

drop function public.change_school_status(uuid, school_status, text);
drop function public.school_transition_allowed(school_status, school_status);
drop function public.find_similar_schools(text, text, integer);

-- ─── Drop the one view that selects the status column (blocks ALTER COLUMN
-- TYPE regardless of enum dependency) — pure pass-through, no literal values ─

drop view public.school_pipeline;

-- ─── Rebuild the enum ───────────────────────────────────────────────────────

alter type public.school_status rename to school_status_old;

create type public.school_status as enum (
  'lead_identified', 'outreach_requested', 'outreach_approved', 'visit_completed',
  'registered', 'sessions_active', 'completed', 'archived'
);

alter table public.schools alter column status drop default;
alter table public.schools alter column status type public.school_status using (
  case status::text
    when 'lead_identified'     then 'lead_identified'
    when 'contacted'           then 'outreach_requested'
    when 'followup_pending'    then 'outreach_requested'
    when 'approval_requested'  then 'outreach_requested'
    when 'approval_received'   then 'registered'
    when 'session_scheduled'   then 'sessions_active'
    when 'session_in_progress' then 'sessions_active'
    when 'completed'           then 'completed'
    when 'archived'            then 'archived'
  end
)::public.school_status;
alter table public.schools alter column status set default 'lead_identified'::public.school_status;

drop type public.school_status_old;

-- ─── Recreate the pass-through view ─────────────────────────────────────────

create view public.school_pipeline as
select status::text as status, count(*) as count
from public.schools
group by status;

-- ─── Recreate find_similar_schools (body unchanged, pure pass-through) ──────

create or replace function public.find_similar_schools(
  p_name text, p_district text, p_max_distance int default 3
)
returns table (id uuid, name text, district text, campus_id uuid, status school_status, distance int)
language sql stable security definer set search_path = public as $$
  select s.id, s.name, s.district, s.campus_id, s.status,
         levenshtein(lower(s.name), lower(p_name)) as distance
  from schools s
  where lower(s.district) = lower(p_district)
    and levenshtein(lower(s.name), lower(p_name)) <= p_max_distance
  order by distance asc
  limit 5;
$$;

-- ─── New transition graph ───────────────────────────────────────────────────

create or replace function public.school_transition_allowed(
  p_from school_status,
  p_to   school_status
) returns boolean language sql immutable as $$
  select case p_from
    when 'lead_identified'    then p_to in ('outreach_requested','archived')
    when 'outreach_requested' then p_to in ('outreach_approved','lead_identified','archived')
    when 'outreach_approved'  then p_to in ('visit_completed','outreach_requested','archived')
    when 'visit_completed'    then p_to in ('registered','outreach_approved','archived')
    when 'registered'         then p_to in ('sessions_active','visit_completed','archived')
    when 'sessions_active'    then p_to in ('completed','registered','archived')
    when 'completed'          then p_to in ('sessions_active','archived')
    when 'archived'           then p_to in ('lead_identified')  -- admin reopen only
    else false
  end;
$$;

-- ─── change_school_status — same shape as the live copy (0033), only the
-- exec_lead subset and the illegal-transition error surface change (the error
-- message stays identical; only the legal graph behind it changed) ─────────

create or replace function public.change_school_status(
  p_school_id uuid,
  p_new_status school_status,
  p_note text default null
)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_prev        school_status;
  v_campus      uuid;
  actor         uuid := auth.uid();
  actor_role    user_role;
  actor_campus  uuid;
  exec_stages   school_status[] := array['registered','sessions_active','completed'];
begin
  select status, campus_id into v_prev, v_campus from schools where id = p_school_id for update;
  if v_prev is null then
    raise exception 'School % not found', p_school_id;
  end if;

  if p_new_status = v_prev then
    return;
  end if;

  if not school_transition_allowed(v_prev, p_new_status) then
    raise exception 'Illegal school transition % → %', v_prev, p_new_status using errcode = '42501';
  end if;

  if actor is not null then
    select role, campus_id into actor_role, actor_campus from public.users where id = actor;
    if not (
      actor_role in ('super_admin')
      or (actor_role in ('campus_lead','outreach_lead') and v_campus is not distinct from actor_campus)
      or (actor_role = 'exec_lead' and v_campus is not distinct from actor_campus
          and v_prev = any(exec_stages) and p_new_status = any(exec_stages))
    ) then
      raise exception 'You do not have permission to change this school''s status' using errcode = '42501';
    end if;
    if v_prev = 'archived' and actor_role not in ('super_admin') then
      raise exception 'Only an admin may reopen an archived school' using errcode = '42501';
    end if;
  end if;

  if p_new_status = 'archived' and coalesce(trim(p_note),'') = '' then
    raise exception 'Archiving a school requires a reason note' using errcode = '23514';
  end if;

  update schools set status = p_new_status where id = p_school_id;

  insert into school_status_history (school_id, previous_status, new_status, changed_by, note)
  values (p_school_id, v_prev::text, p_new_status::text, actor, p_note);

  insert into audit_log (actor_id, action, entity_type, entity_id, detail)
  values (actor, 'status_change', 'school', p_school_id,
          jsonb_build_object('from', v_prev, 'to', p_new_status, 'note', p_note));
end;
$$;

-- ─── approve_session_plan — re-gate on the new "school can accept a session"
-- window instead of the single 'approval_received' value, and advance to
-- 'sessions_active' instead of 'session_scheduled'. change_school_status's
-- own no-op guard means session 1 advances registered→sessions_active and
-- every later session's call is a harmless no-op on school status — this is
-- what lets sessions repeat indefinitely without any new "stage" machinery.
-- Byte-for-byte copy of the live body (0033) otherwise. ─────────────────────

create or replace function public.approve_session_plan(p_plan_id uuid)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_plan        session_plans;
  v_school      schools;
  actor         uuid := auth.uid();
  actor_role    user_role;
  actor_campus  uuid;
  v_session_id  uuid;
  v_topic       text;
  rec           record;
begin
  select * into v_plan from session_plans where id = p_plan_id for update;
  if not found then
    raise exception 'Planning record % not found', p_plan_id;
  end if;
  if v_plan.status = 'approved' then
    raise exception 'This planning record is already approved' using errcode = '23514';
  end if;

  select * into v_school from schools where id = v_plan.school_id;

  if actor is not null then
    select role, campus_id into actor_role, actor_campus from public.users where id = actor;
    if not (
      actor_role in ('super_admin')
      or (actor_role in ('campus_lead','outreach_lead')
          and v_school.campus_id is not distinct from actor_campus)
    ) then
      raise exception 'You do not have permission to approve this planning record' using errcode = '42501';
    end if;
  end if;

  if v_school.status not in ('registered', 'sessions_active') then
    raise exception 'The school must be Registered (or already running sessions) before planning can be approved'
      using errcode = '42501';
  end if;

  v_topic := coalesce(nullif(trim(v_plan.topic), ''), 'AI Literacy Session');

  insert into sessions (school_id, session_type, date, start_time, end_time, topic,
                        student_count, created_by)
  values (
    v_plan.school_id, v_plan.session_type,
    coalesce(v_plan.planned_date, current_date),
    v_plan.start_time, v_plan.end_time, v_topic,
    v_plan.student_strength, coalesce(actor, v_plan.created_by)
  )
  returning id into v_session_id;

  update session_plans
     set status = 'approved', session_id = v_session_id, approved_by = actor, approved_at = now()
   where id = p_plan_id;

  perform change_school_status(
    v_plan.school_id, 'sessions_active',
    'Planning approved — session scheduled for ' || coalesce(v_plan.planned_date::text, 'a date to be confirmed')
  );

  for rec in
    select id from public.users
     where is_active
       and role in ('exec_lead','volunteer_lead')
       and campus_id is not distinct from v_school.campus_id
  loop
    perform notify_user(
      rec.id,
      'session_scheduled',
      'Session scheduled: ' || v_school.name,
      'Planning was approved. A session has been created and needs a team assigned.',
      '/dashboard/sessions/' || v_session_id,
      'session',
      v_session_id
    );
  end loop;

  return v_session_id;
end;
$$;

-- ─── session_plans: allow more than one row per school (one per session
-- cycle) — only one *open* (draft) plan at a time; unlimited approved history ─

alter table public.session_plans drop constraint session_plans_school_id_key;

create unique index session_plans_one_draft_per_school
  on public.session_plans (school_id) where (status = 'draft');

commit;
