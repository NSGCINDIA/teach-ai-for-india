-- ═══════════════════════════════════════════════════════════════════════════
-- Teach AI for India — 0029 Mandatory Evidence Categories (Operational
-- Workflow Spec v2.0, Stage 7) + Curriculum Progress (spec §5)
--
-- Part A: 5 new media_file_type values for the spec's mandatory evidence
-- categories. The generic 2-count "reported" gate (≥1 photo, ≥1 document) is
-- REPLACED (not augmented) by a 5-category existence check — the old check
-- was only ever a rough proxy.
--
-- Part B: school_session_progress view for "Session N of 4" display, derived
-- from sessions.session_number (session_type itself is untouched).
-- ═══════════════════════════════════════════════════════════════════════════

alter type media_file_type add value if not exists 'team_photo';
alter type media_file_type add value if not exists 'principal_photo';
alter type media_file_type add value if not exists 'student_group_photo';
alter type media_file_type add value if not exists 'student_testimonial';
alter type media_file_type add value if not exists 'teacher_testimonial';

-- ─── enforce_session_transition() — swap the "reported" evidence gate ───────
-- Full redefinition: byte-for-byte copy of the current live body (0028), with
-- ONLY the declare block (n_photos/n_docs → v_missing) and the "reported"
-- gate's evidence block changed. Every other block (legal-edge check,
-- execution-plan gate, cancellation gate, approver/verifier stamping) is
-- reproduced verbatim.
create or replace function public.enforce_session_transition()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  actor uuid := auth.uid();
  actor_role user_role;
  ok boolean;
  v_missing media_file_type[];
begin
  if new.status is not distinct from old.status then
    return new;
  end if;

  -- Legal edges (PRD §10.3). Cancellation allowed from any non-terminal state.
  ok := case old.status
    when 'planned'         then new.status in ('in_progress','cancelled')
    when 'in_progress'     then new.status in ('reported','cancelled')
    when 'reported'        then new.status in ('campus_approved','in_progress','cancelled')
    when 'campus_approved' then new.status in ('verified','reported','cancelled')
    when 'verified'        then new.status in ('cancelled')
    when 'cancelled'       then false
    else false
  end;
  if not ok then
    raise exception 'Illegal session transition % → %', old.status, new.status using errcode = '42501';
  end if;

  if actor is not null then
    select role into actor_role from public.users where id = actor;
  end if;

  -- Execution plan gate (Operational Workflow Spec v2.0, Phase 3 Stage 6):
  -- a session may only start once its execution plan is approved.
  if new.status = 'in_progress' and old.status = 'planned' then
    if not exists (
      select 1 from execution_plans where session_id = new.id and status = 'approved'
    ) then
      raise exception 'Cannot start session: the execution plan must be approved first'
        using errcode = '23514';
    end if;
  end if;

  -- "Reported" gate: counts, topic, and all 5 mandatory evidence categories
  -- (Operational Workflow Spec v2.0, Stage 7) — replaces the old generic
  -- ≥1-photo/≥1-document proxy check entirely.
  if new.status = 'reported' then
    if coalesce(new.student_count,0) <= 0
       or coalesce(new.volunteer_count,0) <= 0
       or coalesce(nullif(trim(new.topic),''), null) is null then
      raise exception 'Cannot report session: student count, volunteer count and topic are required'
        using errcode = '23514';
    end if;

    select array_agg(cat) into v_missing
      from unnest(array[
        'team_photo','principal_photo','student_group_photo',
        'student_testimonial','teacher_testimonial'
      ]::media_file_type[]) as cat
      where not exists (
        select 1 from media_assets
         where session_id = new.id and deleted_at is null and file_type = cat
      );

    if v_missing is not null then
      raise exception 'Cannot report session: missing required evidence — %', array_to_string(v_missing, ', ')
        using errcode = '23514';
    end if;
  end if;

  -- Cancellation needs Campus Lead+ and a reason note.
  if new.status = 'cancelled' then
    if actor is not null and not (actor_role in ('super_admin','mgmt_admin','campus_lead')) then
      raise exception 'Only Campus Lead or above may cancel a session' using errcode = '42501';
    end if;
    if coalesce(nullif(trim(new.notes),''), null) is null then
      raise exception 'Cancellation requires a reason in notes' using errcode = '23514';
    end if;
  end if;

  -- Stamp approver/verifier on forward transitions.
  if new.status = 'campus_approved' and actor is not null then
    new.reviewed_by := actor; new.reviewed_at := now();
  elsif new.status = 'verified' and actor is not null then
    new.verified_by := actor; new.verified_at := now();
  end if;

  return new;
end;
$$;

-- ─── school_session_progress — "Session N of 4" (spec §5) ────────────────────
-- One row per school: its highest-numbered NON-CANCELLED session. Deliberately
-- NOT schools.total_sessions (that rollup only counts 'verified' sessions —
-- see recompute_school_rollups() in 0002 — and undercounts a school with an
-- in-flight planned/in_progress/reported session). security_invoker matches
-- campus_rollups (0005): RLS on `sessions` applies per viewer, so a
-- campus-scoped role simply sees no row for another campus's school (same
-- graceful degradation campus_rollups already relies on).
create or replace view school_session_progress
with (security_invoker = on) as
select distinct on (sessions.school_id)
  sessions.school_id,
  sessions.id             as latest_session_id,
  sessions.session_number as latest_session_number,
  sessions.status         as latest_session_status
from sessions
where sessions.status <> 'cancelled'
order by sessions.school_id, sessions.session_number desc;

comment on view school_session_progress is
  'Each school''s highest-numbered non-cancelled session — drives "Session N of 4" curriculum progress display (Operational Workflow Spec v2.0 §5). RLS-scoped via security_invoker, same convention as campus_rollups (0005).';
