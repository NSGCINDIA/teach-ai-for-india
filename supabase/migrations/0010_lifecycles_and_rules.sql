-- ═══════════════════════════════════════════════════════════════════════════
-- Teach AI for India — 0010 Business logic: lifecycles, dedup, finance rules
--
-- Implements PRD prose that the schema only had columns for:
--   • §7.3 fuzzy school dedup via Levenshtein ≤ 3 (was trigram ≥ 0.4, advisory)
--   • §10.3 session state machine + "Reported requires …" evidence gate
--   • §10.2 reimbursement state machine
--   • §7.6 reimbursement eligibility + automated anomaly flags
--
-- Enforcement is via BEFORE triggers so even direct SQL/UPDATEs are governed.
-- Trusted server-side contexts (auth.uid() IS NULL — service role, SQL seeds)
-- bypass the role checks, consistent with 0009.
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── §7.3 School duplicate detection (Levenshtein ≤ 3, same district) ─────────
create extension if not exists fuzzystrmatch;

-- Advisory search used by the create-school form (warn before proceeding).
-- Drop the old trigram-similarity overload (real threshold) so the 2-arg call
-- isn't ambiguous against the new Levenshtein signature.
drop function if exists public.find_similar_schools(text, text, real);
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

-- Stamp is_duplicate_flagged whenever a same-district near-name school exists.
create or replace function public.flag_duplicate_school()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  new.is_duplicate_flagged := exists (
    select 1 from schools s
    where s.id <> new.id
      and lower(s.district) = lower(new.district)
      and levenshtein(lower(s.name), lower(new.name)) <= 3
  );
  return new;
end;
$$;

drop trigger if exists trg_flag_duplicate_school on schools;
create trigger trg_flag_duplicate_school
  before insert or update of name, district on schools
  for each row execute function public.flag_duplicate_school();

-- ─── §10.3 Session lifecycle state machine ───────────────────────────────────
create or replace function public.enforce_session_transition()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  actor uuid := auth.uid();
  actor_role user_role;
  ok boolean;
  n_photos int;
  n_docs int;
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

  -- "Reported" gate: counts, topic, ≥1 photo, ≥1 attendance document.
  if new.status = 'reported' then
    if coalesce(new.student_count,0) <= 0
       or coalesce(new.volunteer_count,0) <= 0
       or coalesce(nullif(trim(new.topic),''), null) is null then
      raise exception 'Cannot report session: student count, volunteer count and topic are required'
        using errcode = '23514';
    end if;
    select count(*) filter (where file_type = 'photo'),
           count(*) filter (where file_type = 'document')
      into n_photos, n_docs
      from media_assets
      where session_id = new.id and deleted_at is null;
    if n_photos < 1 or n_docs < 1 then
      raise exception 'Cannot report session: at least 1 photo and 1 attendance document are required'
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

drop trigger if exists trg_session_transition on sessions;
create trigger trg_session_transition
  before update on sessions
  for each row execute function public.enforce_session_transition();

-- ─── §7.6 Reimbursement: configurable claim window ───────────────────────────
create or replace function public.reimbursement_window_days()
returns int language sql stable security definer set search_path = public as $$
  select coalesce(
    (select (content->>'claim_window_days')::int from content_blocks where block_key = 'finance_config'),
    14);
$$;

-- ─── §10.2 / §7.6 Reimbursement state machine + eligibility + anomaly engine ──
create or replace function public.enforce_reimbursement_rules()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  actor uuid := auth.uid();
  actor_role user_role;
  ok boolean;
  s_date date;
  s_status session_status;
  window_days int := public.reimbursement_window_days();
  flags text[] := '{}';
  week_claims int;
  present boolean;
  submitting boolean;
begin
  if actor is not null then
    select role into actor_role from public.users where id = actor;
  end if;

  -- Detect a draft → submitted move (or a direct insert as submitted).
  submitting := (tg_op = 'INSERT' and new.status in ('submitted','under_review'))
             or (tg_op = 'UPDATE' and old.status = 'draft' and new.status = 'submitted');

  if tg_op = 'UPDATE' and new.status is distinct from old.status then
    ok := case old.status
      when 'draft'        then new.status in ('submitted')
      when 'submitted'    then new.status in ('under_review','approved','rejected')
      when 'under_review' then new.status in ('approved','rejected')
      when 'rejected'     then new.status in ('draft')
      when 'approved'     then new.status in ('paid')
      when 'paid'         then false   -- terminal
      else false
    end;
    if not ok then
      raise exception 'Illegal reimbursement transition % → %', old.status, new.status using errcode='42501';
    end if;
    -- Changing anything once Paid requires Super Admin.
    if old.status = 'paid' and actor is not null and actor_role <> 'super_admin' then
      raise exception 'Paid claims can only be modified by a Super Admin' using errcode='42501';
    end if;
    if new.status in ('under_review','approved','rejected') and actor is not null then
      new.reviewed_by := actor; new.reviewed_at := now();
    end if;
    if new.status = 'paid' and new.payment_date is null then
      new.payment_date := current_date;
    end if;
  end if;

  if submitting then
    -- Eligibility (hard rules).
    if new.session_id is null then
      raise exception 'A reimbursement claim must be linked to a session' using errcode='23514';
    end if;
    select date, status into s_date, s_status from sessions where id = new.session_id;
    if s_date is null then
      raise exception 'Linked session not found' using errcode='23503';
    end if;
    if current_date > s_date + window_days then
      raise exception 'Claim window of % days has passed for this session', window_days using errcode='23514';
    end if;

    -- Anomaly flags (route to Under Review, do not block).
    if new.amount > 500 and new.travel_mode = 'auto' then
      flags := array_append(flags, 'high_auto_fare');
    end if;
    select count(*) into week_claims from reimbursements
      where claimant_id = new.claimant_id
        and date_trunc('week', claim_date) = date_trunc('week', new.claim_date)
        and (tg_op = 'INSERT' or id <> new.id);
    if week_claims >= 3 then
      flags := array_append(flags, 'frequent_claimant');
    end if;
    if s_status not in ('campus_approved','verified') then
      flags := array_append(flags, 'no_approved_report');
    end if;
    select exists (
      select 1 from attendance_records
      where session_id = new.session_id and user_id = new.claimant_id
        and status in ('present','late','left_early')
    ) into present;
    if not present then
      flags := array_append(flags, 'claimant_not_present');
    end if;

    new.anomaly_flags := flags;
    if array_length(flags,1) is not null then
      new.status := 'under_review';   -- auto-route on any anomaly (PRD §10.2)
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_reimbursement_rules on reimbursements;
create trigger trg_reimbursement_rules
  before insert or update on reimbursements
  for each row execute function public.enforce_reimbursement_rules();
