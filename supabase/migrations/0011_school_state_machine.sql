-- ═══════════════════════════════════════════════════════════════════════════
-- Teach AI for India — 0011 School Outreach CRM state machine (PRD §10.1)
--
-- Extends change_school_status() (0002) with:
--   • Legal-transition enforcement (the §10.1 pipeline graph)
--   • Role gating (admins, or campus_lead/outreach_head of the school's campus)
--   • Mandatory reason on archive (already present) and on backward moves
--
-- Trusted server-side contexts (auth.uid() IS NULL — service role, SQL seeds)
-- bypass role + transition checks, consistent with 0009/0010.
-- ═══════════════════════════════════════════════════════════════════════════

-- Legal edges of the §10.1 outreach pipeline. Archive is reachable from any
-- live state (with a reason). Backward steps allow correcting a mis-advance.
create or replace function public.school_transition_allowed(
  p_from school_status,
  p_to   school_status
) returns boolean language sql immutable as $$
  select case p_from
    when 'lead_identified'     then p_to in ('contacted','archived')
    when 'contacted'           then p_to in ('followup_pending','approval_requested','lead_identified','archived')
    when 'followup_pending'    then p_to in ('contacted','approval_requested','archived')
    when 'approval_requested'  then p_to in ('approval_received','followup_pending','archived')
    when 'approval_received'   then p_to in ('session_scheduled','approval_requested','archived')
    when 'session_scheduled'   then p_to in ('session_in_progress','approval_received','archived')
    when 'session_in_progress' then p_to in ('completed','session_scheduled','archived')
    when 'completed'           then p_to in ('archived')
    when 'archived'            then p_to in ('lead_identified')  -- admin reopen only
    else false
  end;
$$;

create or replace function public.change_school_status(
  p_school_id uuid,
  p_new_status school_status,
  p_note text default null
)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_prev      school_status;
  v_campus    uuid;
  actor       uuid := auth.uid();
  actor_role  user_role;
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
    select role into actor_role from public.users where id = actor;
    if not (
      actor_role in ('super_admin','mgmt_admin')
      or (actor_role in ('campus_lead','outreach_head')
          and v_campus is not distinct from (select campus_id from public.users where id = actor))
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
