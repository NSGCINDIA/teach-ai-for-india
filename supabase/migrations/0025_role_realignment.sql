-- ═══════════════════════════════════════════════════════════════════════════
-- Teach AI for India — 0025 Role realignment (Operational Workflow Spec v2.0)
--
-- Aligns the role model with the new spec:
--   • outreach_head → outreach_lead (rename only, same people/rows)
--   • + campus_mgmt_admin — campus-scoped "Campus Management Admin" (monitors
--     one campus: reports, finance, analytics — no operational writes). Not to
--     be confused with the existing org-wide mgmt_admin, which is unaffected.
--   • + finance_lead — campus-scoped finance role. Its real review/approve
--     workflow isn't wired yet (Phase 5); this migration only grants it
--     read-only campus-scoped visibility so later phases have a foundation.
--
-- ALTER TYPE ... RENAME VALUE only relabels the existing pg_enum row (same
-- OID) — no "commit before use" restriction like ADD VALUE has, so it's safe
-- to combine with the object recreation below in one migration. ADD VALUE
-- statements are still each their own statement, per the proven pattern in
-- 0015_volunteer_lead_role.sql.
-- ═══════════════════════════════════════════════════════════════════════════

alter type user_role rename value 'outreach_head' to 'outreach_lead';

alter type user_role add value if not exists 'campus_mgmt_admin';
alter type user_role add value if not exists 'finance_lead';

-- ─── Recreate every live object that embeds the old literal ──────────────────
-- Only the current live definition of each object is recreated (later
-- migrations already supersede earlier ones for sessions_select and
-- change_school_status) — no other logic changes.

drop policy if exists schools_insert on schools;
create policy schools_insert on schools for insert to authenticated
  with check (
    is_admin()
    or (auth_role() in ('campus_lead','outreach_lead') and campus_id = auth_campus())
  );

drop policy if exists schools_update on schools;
create policy schools_update on schools for update to authenticated
  using (
    is_admin()
    or (auth_role() in ('campus_lead','outreach_lead') and campus_id = auth_campus())
  )
  with check (
    is_admin()
    or (auth_role() in ('campus_lead','outreach_lead') and campus_id = auth_campus())
  );

drop policy if exists school_contacts_write on school_contacts;
create policy school_contacts_write on school_contacts for all to authenticated
  using ( exists (select 1 from schools s where s.id = school_id
            and (is_admin() or (auth_role() in ('campus_lead','outreach_lead') and s.campus_id = auth_campus()))) )
  with check ( exists (select 1 from schools s where s.id = school_id
            and (is_admin() or (auth_role() in ('campus_lead','outreach_lead') and s.campus_id = auth_campus()))) );

drop policy if exists ssh_insert on school_status_history;
create policy ssh_insert on school_status_history for insert to authenticated
  with check ( exists (select 1 from schools s where s.id = school_id
            and (is_admin() or (auth_role() in ('campus_lead','outreach_lead') and s.campus_id = auth_campus()))) );

drop policy if exists reimb_insert on reimbursements;
create policy reimb_insert on reimbursements for insert to authenticated
  with check (
    claimant_id = auth.uid()
    and auth_role() in ('super_admin','outreach_lead','exec_lead','volunteer')
  );

-- sessions_select — live version is 0022's; also add read access for the two
-- new roles so campus_rollups (an invoker-security view) has something to
-- count for them once Phase 5 builds their dashboard.
drop policy if exists sessions_select on sessions;
create policy sessions_select on sessions for select to authenticated
  using (
    is_admin()
    or (auth_role() in ('campus_lead','outreach_lead','exec_lead','volunteer_lead','campus_mgmt_admin','finance_lead')
        and campus_id = auth_campus())
    or auth.uid() = any(team_members_present)
    or created_by = auth.uid()
    or exists (select 1 from session_assignments sa
        where sa.session_id = sessions.id and sa.volunteer_id = auth.uid())
  );

-- reimb_select — live version is 0015's; add the two new roles, read-only.
drop policy if exists reimb_select on reimbursements;
create policy reimb_select on reimbursements for select to authenticated
  using (
    claimant_id = auth.uid()
    or is_admin()
    or (auth_role() in ('campus_lead','volunteer_lead','campus_mgmt_admin','finance_lead') and campus_id = auth_campus())
  );

drop policy if exists session_plans_select on session_plans;
create policy session_plans_select on session_plans for select to authenticated
  using (
    is_admin()
    or (auth_role() in ('campus_lead','outreach_lead','exec_lead','volunteer_lead')
        and campus_id = auth_campus())
    or created_by = auth.uid()
  );

drop policy if exists session_plans_write on session_plans;
create policy session_plans_write on session_plans for all to authenticated
  using (
    is_admin()
    or (auth_role() in ('campus_lead','outreach_lead') and campus_id = auth_campus())
  )
  with check (
    is_admin()
    or (auth_role() in ('campus_lead','outreach_lead') and campus_id = auth_campus())
  );

drop policy if exists session_assignments_select on session_assignments;
create policy session_assignments_select on session_assignments for select to authenticated
  using (
    is_admin()
    or volunteer_id = auth.uid()
    or (auth_role() in ('campus_lead','outreach_lead','exec_lead','volunteer_lead')
        and campus_id = auth_campus())
  );

drop policy if exists announcements_write on announcements;
create policy announcements_write on announcements for all to authenticated
  using (
    is_admin()
    or (auth_role() in ('campus_lead','outreach_lead','exec_lead','volunteer_lead')
        and campus_id = auth_campus())
  )
  with check (
    is_admin()
    or (auth_role() in ('campus_lead','outreach_lead','exec_lead','volunteer_lead')
        and campus_id is not null and campus_id = auth_campus())
  );

create or replace view public_campus_team as
select
  u.id,
  u.campus_id,
  u.full_name,
  u.role,
  u.avatar_url
from users u
where u.is_active
  and u.role in ('campus_lead', 'outreach_lead', 'exec_lead', 'volunteer');

comment on view public_campus_team is 'Active team members per campus for the public team section (PRD §7.1). Name/role/avatar only — no contact PII.';

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
      actor_role in ('super_admin','mgmt_admin')
      or (actor_role in ('campus_lead','outreach_lead')
          and v_school.campus_id is not distinct from actor_campus)
    ) then
      raise exception 'You do not have permission to approve this planning record' using errcode = '42501';
    end if;
  end if;

  if v_school.status <> 'approval_received' then
    raise exception 'The school must be in Approval Received before planning can be approved'
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
    v_plan.school_id, 'session_scheduled',
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
  exec_stages   school_status[] := array['approval_received','session_scheduled','session_in_progress','completed'];
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
      actor_role in ('super_admin','mgmt_admin')
      or (actor_role in ('campus_lead','outreach_lead') and v_campus is not distinct from actor_campus)
      or (actor_role = 'exec_lead' and v_campus is not distinct from actor_campus
          and v_prev = any(exec_stages) and p_new_status = any(exec_stages))
    ) then
      raise exception 'You do not have permission to change this school''s status' using errcode = '42501';
    end if;
    if v_prev = 'archived' and actor_role not in ('super_admin','mgmt_admin') then
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

-- ─── signup_requests.requested_role — independent text-column drift ──────────
-- This column is plain text with its own CHECK, NOT the user_role enum, so the
-- rename above does nothing to it. Fix the constraint + backfill any pending
-- request that still says 'outreach_head' so approval doesn't hit a stale value.
alter table signup_requests
  drop constraint if exists signup_requests_requested_role_check;
update signup_requests set requested_role = 'outreach_lead' where requested_role = 'outreach_head';
alter table signup_requests
  add constraint signup_requests_requested_role_check
  check (requested_role in ('volunteer', 'volunteer_lead', 'exec_lead', 'outreach_lead', 'campus_lead'));
