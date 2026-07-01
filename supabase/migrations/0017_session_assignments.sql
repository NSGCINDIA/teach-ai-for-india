-- ═══════════════════════════════════════════════════════════════════════════
-- Teach AI for India — 0017 Volunteer assignment engine (Team Dashboard PRD Phase 3)
--
-- Until now a session's "team" was the whole campus (sessions.team_members_present,
-- populated only after attendance). This adds an explicit assignment layer:
--   • Volunteer Lead / Campus Lead assigns N volunteers to a scheduled session.
--   • Each assigned volunteer accepts, declines, or requests a replacement.
--   • Every state change fans a notification out via notify_user() (0002).
--
-- Assignment ≠ attendance: assignments are the commitment BEFORE the visit;
-- attendance_records still record who actually showed up.
-- ═══════════════════════════════════════════════════════════════════════════

create type assignment_status as enum (
  'assigned', 'accepted', 'declined', 'replacement_requested', 'cancelled'
);

create table session_assignments (
  id            uuid primary key default gen_random_uuid(),
  session_id    uuid not null references sessions(id) on delete cascade,
  volunteer_id  uuid not null references users(id)    on delete cascade,
  campus_id     uuid references campuses(id) on delete set null,
  status        assignment_status not null default 'assigned',
  note          text,                                  -- decline / replacement reason
  assigned_by   uuid references users(id) on delete set null,
  assigned_at   timestamptz not null default now(),
  responded_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (session_id, volunteer_id)
);
comment on table session_assignments is 'Explicit volunteer→session assignments with accept/decline (Team Dashboard PRD Phase 3).';

create index session_assignments_session_idx   on session_assignments (session_id);
create index session_assignments_volunteer_idx on session_assignments (volunteer_id);
create index session_assignments_campus_idx    on session_assignments (campus_id);

create trigger trg_session_assignments_updated
  before update on session_assignments for each row execute function public.touch_updated_at();

-- Keep campus_id in sync with the session so RLS + notifications resolve.
create or replace function public.set_assignment_campus()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.campus_id is null then
    select campus_id into new.campus_id from sessions where id = new.session_id;
  end if;
  return new;
end;
$$;

create trigger trg_assignment_campus
  before insert or update on session_assignments
  for each row execute function public.set_assignment_campus();

-- ─── RLS ─────────────────────────────────────────────────────────────────────
alter table session_assignments enable row level security;

-- Read: admins; campus leadership on their own campus; the volunteer themself.
create policy session_assignments_select on session_assignments for select to authenticated
  using (
    is_admin()
    or volunteer_id = auth.uid()
    or (auth_role() in ('campus_lead','outreach_head','exec_lead','volunteer_lead')
        and campus_id = auth_campus())
  );

-- Volunteer may update their OWN row (accept/decline/request replacement). The
-- respond_to_assignment() fn is the intended path but this keeps RLS honest.
create policy session_assignments_respond on session_assignments for update to authenticated
  using (volunteer_id = auth.uid())
  with check (volunteer_id = auth.uid());

-- Assigners (Campus Lead / Volunteer Lead of the campus + admins) manage rows.
create policy session_assignments_manage on session_assignments for all to authenticated
  using (
    is_admin()
    or (auth_role() in ('campus_lead','volunteer_lead') and campus_id = auth_campus())
  )
  with check (
    is_admin()
    or (auth_role() in ('campus_lead','volunteer_lead') and campus_id = auth_campus())
  );

-- ─── assign_volunteers() — bulk assign + notify each volunteer ───────────────
-- Role-gated to the people who hold assign_volunteers (Campus Lead / Volunteer
-- Lead of the campus + admins). Skips already-assigned volunteers. Trusted
-- contexts (auth.uid() IS NULL) bypass the role gate, per 0009/0010/0011/0016.
create or replace function public.assign_volunteers(p_session_id uuid, p_volunteer_ids uuid[])
returns int language plpgsql security definer set search_path = public as $$
declare
  v_session     sessions;
  v_school_name text;
  actor         uuid := auth.uid();
  actor_role    user_role;
  actor_campus  uuid;
  v_new_id      uuid;
  v_count       int := 0;
  vid           uuid;
begin
  select * into v_session from sessions where id = p_session_id;
  if not found then
    raise exception 'Session % not found', p_session_id;
  end if;

  if actor is not null then
    select role, campus_id into actor_role, actor_campus from public.users where id = actor;
    if not (
      actor_role in ('super_admin','mgmt_admin')
      or (actor_role in ('campus_lead','volunteer_lead')
          and v_session.campus_id is not distinct from actor_campus)
    ) then
      raise exception 'You do not have permission to assign volunteers for this session'
        using errcode = '42501';
    end if;
  end if;

  select name into v_school_name from schools where id = v_session.school_id;

  foreach vid in array coalesce(p_volunteer_ids, '{}')
  loop
    insert into session_assignments (session_id, volunteer_id, assigned_by, status)
    values (p_session_id, vid, actor, 'assigned')
    on conflict (session_id, volunteer_id) do nothing
    returning id into v_new_id;

    -- Only notify on a genuinely new assignment.
    if v_new_id is not null then
      v_count := v_count + 1;
      perform notify_user(
        vid,
        'session_assigned',
        'You''ve been assigned to a session',
        coalesce(v_school_name, 'A school') || ' on ' || to_char(v_session.date, 'DD Mon YYYY')
          || '. Please confirm your availability.',
        '/dashboard/assignments',
        'session',
        p_session_id
      );
      v_new_id := null;
    end if;
  end loop;

  return v_count;
end;
$$;

comment on function public.assign_volunteers(uuid, uuid[]) is
  'Assign volunteers to a session + notify each (Team Dashboard PRD Phase 3).';

-- ─── respond_to_assignment() — volunteer accept/decline/request replacement ──
-- The volunteer acts on their OWN assignment; the assigner + campus Volunteer
-- Leads are notified of the response.
create or replace function public.respond_to_assignment(
  p_assignment_id uuid,
  p_status assignment_status,
  p_note text default null
)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_assign      session_assignments;
  v_session     sessions;
  v_school_name text;
  v_actor_name  text;
  actor         uuid := auth.uid();
  rec           record;
begin
  if p_status not in ('accepted','declined','replacement_requested') then
    raise exception 'A volunteer response must be accept, decline, or request replacement'
      using errcode = '22023';
  end if;

  select * into v_assign from session_assignments where id = p_assignment_id for update;
  if not found then
    raise exception 'Assignment % not found', p_assignment_id;
  end if;

  -- Only the assigned volunteer may respond (trusted contexts skip).
  if actor is not null and v_assign.volunteer_id <> actor then
    raise exception 'You can only respond to your own assignment' using errcode = '42501';
  end if;

  if (p_status = 'declined' or p_status = 'replacement_requested')
     and coalesce(trim(p_note), '') = '' then
    raise exception 'A reason is required when declining or requesting a replacement'
      using errcode = '23514';
  end if;

  update session_assignments
     set status = p_status, note = nullif(trim(p_note), ''), responded_at = now()
   where id = p_assignment_id;

  select * into v_session from sessions where id = v_assign.session_id;
  select name into v_school_name from schools where id = v_session.school_id;
  select full_name into v_actor_name from public.users where id = v_assign.volunteer_id;

  -- Notify the assigner + every campus Volunteer Lead (dedup via distinct set).
  for rec in
    select distinct u.id
      from public.users u
     where u.is_active
       and (
         u.id = v_assign.assigned_by
         or (u.role = 'volunteer_lead' and u.campus_id is not distinct from v_assign.campus_id)
       )
  loop
    perform notify_user(
      rec.id,
      'assignment_' || p_status,
      coalesce(v_actor_name, 'A volunteer') || ' '
        || case p_status
             when 'accepted' then 'accepted'
             when 'declined' then 'declined'
             else 'requested a replacement for'
           end
        || ' a session',
      coalesce(v_school_name, 'A school') || ' on ' || to_char(v_session.date, 'DD Mon YYYY')
        || case when p_note is not null and trim(p_note) <> '' then ' — “' || trim(p_note) || '”' else '' end,
      '/dashboard/sessions/' || v_assign.session_id,
      'session',
      v_assign.session_id
    );
  end loop;
end;
$$;

comment on function public.respond_to_assignment(uuid, assignment_status, text) is
  'Volunteer accept/decline/request-replacement on their assignment + notify the assigner (Team Dashboard PRD Phase 3).';

grant execute on function public.assign_volunteers(uuid, uuid[]) to authenticated;
grant execute on function public.respond_to_assignment(uuid, assignment_status, text) to authenticated;
