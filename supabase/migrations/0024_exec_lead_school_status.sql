-- ═══════════════════════════════════════════════════════════════════════════
-- Teach AI for India — 0024 exec_lead gets partial school-pipeline access
--
-- exec_lead may now move a school through the *execution* stages only
-- (approval_received → session_scheduled → session_in_progress → completed,
-- and the matching backward steps), own campus only. The earlier
-- outreach/approval stages remain campus_lead/outreach_head/admin only.
-- Mirrors EXEC_LEAD_SCHOOL_STATUSES in lib/constants/status.ts.
-- ═══════════════════════════════════════════════════════════════════════════

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

  -- No-op guard.
  if p_new_status = v_prev then
    return;
  end if;

  -- Legal-transition gate (PRD §10.1).
  if not school_transition_allowed(v_prev, p_new_status) then
    raise exception 'Illegal school transition % → %', v_prev, p_new_status using errcode = '42501';
  end if;

  -- Role gate — only trusted contexts skip it.
  if actor is not null then
    select role, campus_id into actor_role, actor_campus from public.users where id = actor;
    if not (
      actor_role in ('super_admin','mgmt_admin')
      or (actor_role in ('campus_lead','outreach_head') and v_campus is not distinct from actor_campus)
      or (actor_role = 'exec_lead' and v_campus is not distinct from actor_campus
          and v_prev = any(exec_stages) and p_new_status = any(exec_stages))
    ) then
      raise exception 'You do not have permission to change this school''s status' using errcode = '42501';
    end if;
    -- Reopening an archived school is an admin-only action.
    if v_prev = 'archived' and actor_role not in ('super_admin','mgmt_admin') then
      raise exception 'Only an admin may reopen an archived school' using errcode = '42501';
    end if;
  end if;

  -- Archiving requires a mandatory reason (PRD §10.1).
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
