-- ═══════════════════════════════════════════════════════════════════════════
-- Teach AI for India — 0002 Functions & Triggers
-- Auth bridge, RLS helper functions, auto-increment, audit, state-machine RPCs.
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── RLS helper functions ─────────────────────────────────────────────────────
-- SECURITY DEFINER so they read public.users WITHOUT triggering users-table RLS
-- (prevents infinite recursion in policies). STABLE: safe to cache per statement.

create or replace function public.auth_role()
returns user_role language sql stable security definer set search_path = public as $$
  select role from public.users where id = auth.uid();
$$;

create or replace function public.auth_campus()
returns uuid language sql stable security definer set search_path = public as $$
  select campus_id from public.users where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(public.auth_role() in ('super_admin','mgmt_admin'), false);
$$;

create or replace function public.is_super_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(public.auth_role() = 'super_admin', false);
$$;

-- Campus Lead or above (super/mgmt admin, or campus lead of the given campus).
create or replace function public.is_campus_lead_plus(target_campus uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select public.is_admin()
      or (public.auth_role() = 'campus_lead' and public.auth_campus() = target_campus);
$$;

-- ─── Auth → profile bridge ────────────────────────────────────────────────────
-- When Supabase Auth creates a user (invite or signup), mirror into public.users.
-- Role/campus/full_name come from the invite metadata (set by the admin invite action).

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.users (id, email, full_name, role, campus_id, invited_at)
  values (
    new.id,
    new.email,
    coalesce(nullif(new.raw_user_meta_data->>'full_name',''), split_part(new.email,'@',1)),
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'volunteer'),
    nullif(new.raw_user_meta_data->>'campus_id','')::uuid,
    now()
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─── updated_at maintenance ───────────────────────────────────────────────────

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_users_updated         before update on users         for each row execute function public.touch_updated_at();
create trigger trg_campuses_updated      before update on campuses      for each row execute function public.touch_updated_at();
create trigger trg_schools_updated       before update on schools       for each row execute function public.touch_updated_at();
create trigger trg_sessions_updated      before update on sessions      for each row execute function public.touch_updated_at();
create trigger trg_reimb_updated         before update on reimbursements for each row execute function public.touch_updated_at();

-- ─── Session number auto-increment (per school) ──────────────────────────────

create or replace function public.set_session_number()
returns trigger language plpgsql as $$
begin
  if new.session_number is null or new.session_number = 0 then
    select coalesce(max(session_number), 0) + 1
      into new.session_number
      from sessions where school_id = new.school_id;
  end if;
  if new.campus_id is null then
    select campus_id into new.campus_id from schools where id = new.school_id;
  end if;
  return new;
end;
$$;

create trigger trg_session_number
  before insert on sessions
  for each row execute function public.set_session_number();

-- ─── Reimbursement reference number (REIMB-YYYY-NNNNN) ────────────────────────

create sequence if not exists reimbursement_ref_seq;

create or replace function public.set_reimbursement_reference()
returns trigger language plpgsql as $$
begin
  if new.reference_number is null or new.reference_number = '' then
    new.reference_number :=
      'REIMB-' || to_char(coalesce(new.claim_date, current_date), 'YYYY')
      || '-' || lpad(nextval('reimbursement_ref_seq')::text, 5, '0');
  end if;
  return new;
end;
$$;

create trigger trg_reimbursement_reference
  before insert on reimbursements
  for each row execute function public.set_reimbursement_reference();

-- ─── Keep school rollup counters fresh when a session is verified ────────────

create or replace function public.recompute_school_rollups(p_school_id uuid)
returns void language sql security definer set search_path = public as $$
  update schools s set
    total_sessions = (select count(*) from sessions where school_id = p_school_id and status = 'verified'),
    total_students = (select coalesce(sum(student_count),0) from sessions where school_id = p_school_id and status = 'verified')
  where s.id = p_school_id;
$$;

create or replace function public.on_session_change()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform public.recompute_school_rollups(coalesce(new.school_id, old.school_id));
  return coalesce(new, old);
end;
$$;

create trigger trg_session_rollups
  after insert or update of status, student_count or delete on sessions
  for each row execute function public.on_session_change();

-- ─── State-machine RPC: change a school's status (atomic + audited) ──────────
-- Writes the status, the immutable history row, and the audit entry in one call.

create or replace function public.change_school_status(
  p_school_id uuid,
  p_new_status school_status,
  p_note text default null
)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_prev school_status;
begin
  select status into v_prev from schools where id = p_school_id for update;
  if v_prev is null then
    raise exception 'School % not found', p_school_id;
  end if;

  -- Archiving requires a mandatory reason (PRD §10.1 transition rules).
  if p_new_status = 'archived' and coalesce(trim(p_note),'') = '' then
    raise exception 'Archiving a school requires a reason note';
  end if;

  update schools set status = p_new_status where id = p_school_id;

  insert into school_status_history (school_id, previous_status, new_status, changed_by, note)
  values (p_school_id, v_prev::text, p_new_status::text, auth.uid(), p_note);

  insert into audit_log (actor_id, action, entity_type, entity_id, detail)
  values (auth.uid(), 'status_change', 'school', p_school_id,
          jsonb_build_object('from', v_prev, 'to', p_new_status, 'note', p_note));
end;
$$;

-- ─── CRM conflict detection: fuzzy match by district + similar name ──────────
-- PRD §7.3: same district + similar name (trigram similarity ~ Levenshtein proxy).

create or replace function public.find_similar_schools(
  p_name text,
  p_district text,
  p_threshold real default 0.4
)
returns table (id uuid, name text, district text, campus_id uuid, status school_status, similarity real)
language sql stable security definer set search_path = public as $$
  select s.id, s.name, s.district, s.campus_id, s.status,
         similarity(lower(s.name), lower(p_name)) as similarity
  from schools s
  where lower(s.district) = lower(p_district)
    and similarity(lower(s.name), lower(p_name)) >= p_threshold
  order by similarity desc
  limit 5;
$$;

-- ─── Notification helper (used by triggers/edge functions) ──────────────────

create or replace function public.notify_user(
  p_recipient uuid, p_type text, p_title text, p_body text default null,
  p_action_url text default null, p_entity_type text default null, p_entity_id uuid default null
)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_id uuid;
begin
  insert into notifications (recipient_id, type, title, body, action_url, entity_type, entity_id)
  values (p_recipient, p_type, p_title, p_body, p_action_url, p_entity_type, p_entity_id)
  returning id into v_id;
  return v_id;
end;
$$;
