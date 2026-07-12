-- ═══════════════════════════════════════════════════════════════════════════
-- Teach AI for India — 0043 School visit: exactly one per school, editable
--
-- school_visits previously allowed logging a visit repeatedly (a "follow-up
-- visit" without erroring). Per product decision, a school only ever gets
-- ONE visit record — logging it a second time should edit the existing one,
-- not create another. This adds a uniqueness constraint (so a duplicate
-- insert attempt fails with a clear error the app can humanize) and a new
-- update_school_visit() RPC — same role gate as logging it (Campus
-- Lead/Outreach Lead, own campus, + admin) — so the record can be corrected
-- afterward. Editing doesn't touch schools.status: the pipeline advance
-- already happened when the visit was first logged.
-- ═══════════════════════════════════════════════════════════════════════════

alter table school_visits add constraint school_visits_school_id_key unique (school_id);

create or replace function public.log_school_visit(
  p_school_id uuid,
  p_visited_at timestamptz,
  p_notes text default null,
  p_team_member_ids uuid[] default '{}'
)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_school     schools;
  v_id         uuid;
  actor        uuid := auth.uid();
  actor_role   user_role;
  actor_campus uuid;
  rec          record;
begin
  select * into v_school from schools where id = p_school_id;
  if not found then
    raise exception 'School % not found', p_school_id;
  end if;

  if actor is not null then
    select role, campus_id into actor_role, actor_campus from public.users where id = actor;
    if not (
      actor_role in ('super_admin')
      or (actor_role in ('campus_lead','outreach_lead')
          and v_school.campus_id is not distinct from actor_campus)
    ) then
      raise exception 'You do not have permission to log a visit for this school' using errcode = '42501';
    end if;
  end if;

  if v_school.status not in ('outreach_approved', 'visit_completed') then
    raise exception 'The outreach request must be approved before a visit can be logged'
      using errcode = '23514';
  end if;

  if p_visited_at is null then
    raise exception 'A visit date/time is required' using errcode = '23514';
  end if;

  -- One visit per school, ever — a second attempt hits school_visits_school_id_key
  -- and is humanized app-side into "edit the existing visit instead."
  insert into school_visits (school_id, visited_by, team_member_ids, visited_at, notes, created_by)
  values (p_school_id, coalesce(actor, v_school.created_by), coalesce(p_team_member_ids, '{}'),
          p_visited_at, nullif(trim(p_notes), ''), actor)
  returning id into v_id;

  perform change_school_status(p_school_id, 'visit_completed', 'Visit logged on ' || p_visited_at::date);

  insert into audit_log (actor_id, action, entity_type, entity_id, detail)
  values (actor, 'school_visit_log', 'school_visit', v_id,
          jsonb_build_object('school_id', p_school_id, 'visited_at', p_visited_at));

  for rec in
    select id from public.users
     where is_active and role in ('campus_lead','outreach_lead') and campus_id is not distinct from v_school.campus_id
  loop
    perform notify_user(
      rec.id,
      'school_visit_logged',
      'Visit logged: ' || v_school.name,
      'The school is ready for Registration.',
      '/dashboard/schools/' || p_school_id,
      'school',
      p_school_id
    );
  end loop;

  return v_id;
end;
$$;

create or replace function public.update_school_visit(
  p_visit_id uuid,
  p_visited_at timestamptz,
  p_notes text default null,
  p_team_member_ids uuid[] default '{}'
)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_visit      school_visits;
  v_school     schools;
  actor        uuid := auth.uid();
  actor_role   user_role;
  actor_campus uuid;
begin
  select * into v_visit from school_visits where id = p_visit_id;
  if not found then
    raise exception 'Visit record % not found', p_visit_id;
  end if;

  select * into v_school from schools where id = v_visit.school_id;

  if actor is not null then
    select role, campus_id into actor_role, actor_campus from public.users where id = actor;
    if not (
      actor_role in ('super_admin')
      or (actor_role in ('campus_lead','outreach_lead')
          and v_school.campus_id is not distinct from actor_campus)
    ) then
      raise exception 'You do not have permission to edit this school''s visit record' using errcode = '42501';
    end if;
  end if;

  if p_visited_at is null then
    raise exception 'A visit date/time is required' using errcode = '23514';
  end if;

  update school_visits
     set visited_at = p_visited_at,
         notes = nullif(trim(p_notes), ''),
         team_member_ids = coalesce(p_team_member_ids, '{}')
   where id = p_visit_id;

  insert into audit_log (actor_id, action, entity_type, entity_id, detail)
  values (actor, 'school_visit_update', 'school_visit', p_visit_id,
          jsonb_build_object('school_id', v_visit.school_id, 'visited_at', p_visited_at));
end;
$$;

comment on function public.update_school_visit(uuid, timestamptz, text, uuid[]) is
  'Edits the one existing visit record for a school (same role gate as logging it). Does not touch schools.status — the pipeline advance already happened when the visit was first logged.';

grant execute on function public.update_school_visit(uuid, timestamptz, text, uuid[]) to authenticated;
