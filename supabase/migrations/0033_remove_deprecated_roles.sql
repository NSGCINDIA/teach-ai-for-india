-- ═══════════════════════════════════════════════════════════════════════════
-- Teach AI for India — 0033 Remove deprecated roles: mgmt_admin, school_poc,
-- viewer
--
-- Soft removal: zero live users or pending signups hold any of these three
-- roles (verified before writing this migration), so every application-layer
-- reference is deleted here — RLS (via is_admin()), every RPC/trigger that
-- inlined its own 'mgmt_admin' role check, and the two analytics views'
-- school_poc/viewer exclusions. The 3 enum values stay dormant in the
-- user_role/type (Postgres has no DROP VALUE; recreating the type would
-- cascade through every dependent object for no practical benefit once
-- nothing can ever be assigned these roles again).
--
-- Every function below is a byte-for-byte copy of its current live body with
-- ONLY 'mgmt_admin' removed from a role-list literal — nothing else changed.
-- campus_mgmt_admin (a separate, unaffected role from Phase 1) is never
-- touched — every edit here matches the exact quoted literal 'mgmt_admin',
-- never a bare substring.
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── is_admin() — drop the mgmt_admin branch; cascades to every RLS policy
-- that calls it (the majority of the schema) ──────────────────────────────
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(public.auth_role() = 'super_admin', false);
$$;

-- ─── Every RPC/trigger that inlined its own 'mgmt_admin' check ──────────────

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
      actor_role in ('super_admin')
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


create or replace function public.create_outreach_visit_request(
  p_school_id uuid,
  p_purpose text,
  p_proposed_visit_date date,
  p_estimated_travel_cost numeric,
  p_team_member_ids uuid[]
)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_school      schools;
  v_id          uuid;
  actor         uuid := auth.uid();
  actor_role    user_role;
  actor_campus  uuid;
  rec           record;
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
      raise exception 'You do not have permission to file a visit request for this school'
        using errcode = '42501';
    end if;
  end if;

  if coalesce(trim(p_purpose), '') = '' then
    raise exception 'Purpose of visit is required' using errcode = '23514';
  end if;
  if p_estimated_travel_cost is null or p_estimated_travel_cost <= 0 then
    raise exception 'Estimated travel cost must be greater than zero' using errcode = '23514';
  end if;
  if coalesce(array_length(p_team_member_ids, 1), 0) = 0 then
    raise exception 'Select at least one outreach team member' using errcode = '23514';
  end if;

  insert into outreach_visit_requests
    (school_id, campus_id, purpose, proposed_visit_date, estimated_travel_cost, team_member_ids, created_by)
  values
    (p_school_id, v_school.campus_id, trim(p_purpose), p_proposed_visit_date, p_estimated_travel_cost,
     p_team_member_ids, actor)
  returning id into v_id;

  insert into audit_log (actor_id, action, entity_type, entity_id, detail)
  values (actor, 'outreach_visit_request_create', 'outreach_visit_request', v_id,
          jsonb_build_object('school_id', p_school_id, 'estimated_travel_cost', p_estimated_travel_cost,
                              'proposed_visit_date', p_proposed_visit_date));

  for rec in
    select id from public.users
     where is_active
       and role in ('campus_lead','finance_lead')
       and campus_id is not distinct from v_school.campus_id
  loop
    perform notify_user(
      rec.id,
      'outreach_visit_request_created',
      'New outreach visit request: ' || v_school.name,
      trim(p_purpose) || ' — proposed for ' || to_char(p_proposed_visit_date, 'DD Mon YYYY')
        || ', est. ₹' || p_estimated_travel_cost || '.',
      '/dashboard/schools/' || p_school_id,
      'school',
      p_school_id
    );
  end loop;

  return v_id;
end;
$$;


create or replace function public.review_outreach_visit_request_campus(
  p_request_id uuid,
  p_decision approval_status,
  p_note text default null
)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_req        outreach_visit_requests;
  v_school     schools;
  actor        uuid := auth.uid();
  actor_role   user_role;
  actor_campus uuid;
  v_status     approval_status;
begin
  if p_decision not in ('approved','rejected') then
    raise exception 'A review decision must be approved or rejected' using errcode = '22023';
  end if;

  select * into v_req from outreach_visit_requests where id = p_request_id for update;
  if not found then
    raise exception 'Visit request % not found', p_request_id;
  end if;
  if v_req.campus_lead_review <> 'pending' then
    raise exception 'This request has already been reviewed by the Campus Lead' using errcode = '23514';
  end if;

  if actor is not null then
    select role, campus_id into actor_role, actor_campus from public.users where id = actor;
    if not (
      actor_role in ('super_admin')
      or (actor_role = 'campus_lead' and v_req.campus_id is not distinct from actor_campus)
    ) then
      raise exception 'You do not have permission to record the Campus Lead review' using errcode = '42501';
    end if;
  end if;

  if p_decision = 'rejected' and coalesce(trim(p_note), '') = '' then
    raise exception 'A reason is required when rejecting' using errcode = '23514';
  end if;

  update outreach_visit_requests
     set campus_lead_review = p_decision, campus_lead_reviewed_by = actor,
         campus_lead_reviewed_at = now(), campus_lead_note = nullif(trim(p_note), '')
   where id = p_request_id;

  v_status := recompute_outreach_visit_request_status(p_request_id);

  select * into v_school from schools where id = v_req.school_id;

  insert into audit_log (actor_id, action, entity_type, entity_id, detail)
  values (actor, 'outreach_visit_request_campus_review', 'outreach_visit_request', p_request_id,
          jsonb_build_object('decision', p_decision, 'note', p_note, 'resulting_status', v_status));

  if v_req.created_by is not null then
    perform notify_user(
      v_req.created_by,
      'outreach_visit_request_campus_' || p_decision,
      'Campus Lead ' || p_decision || ' your visit request: ' || coalesce(v_school.name, 'a school'),
      case
        when v_status = 'approved' then 'Both approvals are in — the visit may proceed.'
        when v_status = 'rejected' then coalesce('Reason: ' || p_note, 'No reason given.')
        else 'Still awaiting the Finance Lead''s review.'
      end,
      '/dashboard/schools/' || v_req.school_id,
      'school',
      v_req.school_id
    );
  end if;
end;
$$;


create or replace function public.review_outreach_visit_request_finance(
  p_request_id uuid,
  p_decision approval_status,
  p_note text default null
)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_req         outreach_visit_requests;
  v_school      schools;
  v_campus      campuses;
  v_budget      campus_budgets;
  v_available   numeric;
  actor         uuid := auth.uid();
  actor_role    user_role;
  actor_campus  uuid;
  v_status      approval_status;
begin
  if p_decision not in ('approved','rejected') then
    raise exception 'A review decision must be approved or rejected' using errcode = '22023';
  end if;

  select * into v_req from outreach_visit_requests where id = p_request_id for update;
  if not found then
    raise exception 'Visit request % not found', p_request_id;
  end if;
  if v_req.finance_lead_review <> 'pending' then
    raise exception 'This request has already been reviewed by the Finance Lead' using errcode = '23514';
  end if;

  select * into v_school from schools where id = v_req.school_id;

  if actor is not null then
    select role, campus_id into actor_role, actor_campus from public.users where id = actor;
    if not (
      actor_role in ('super_admin')
      or (actor_role = 'finance_lead' and v_req.campus_id is not distinct from actor_campus)
    ) then
      raise exception 'You do not have permission to record the Finance Lead review' using errcode = '42501';
    end if;
  end if;

  if p_decision = 'rejected' and coalesce(trim(p_note), '') = '' then
    raise exception 'A reason is required when rejecting' using errcode = '23514';
  end if;

  if p_decision = 'approved' then
    select * into v_campus from campuses where id = v_req.campus_id;
    if v_campus.id is null or coalesce(trim(v_campus.quarter), '') = '' then
      raise exception 'No active budget period is set for this campus' using errcode = '23514';
    end if;

    -- Lock taken here (not after the check) — this is what makes the
    -- check-and-reserve atomic across concurrent requests on this budget.
    select * into v_budget from campus_budgets
      where campus_id = v_req.campus_id and period = v_campus.quarter
      for update;

    if not found then
      raise exception 'No budget allocated for % in %; ask an admin to allocate one before approving',
        coalesce(v_school.name, 'this campus'), v_campus.quarter using errcode = '23514';
    end if;

    v_available := v_budget.allocated_amount - v_budget.reserved_amount;
    if v_available < v_req.estimated_travel_cost then
      raise exception 'Insufficient budget for %: ₹% available of ₹% allocated, ₹% requested',
        v_campus.quarter, v_available, v_budget.allocated_amount, v_req.estimated_travel_cost
        using errcode = '23514';
    end if;

    update campus_budgets set reserved_amount = reserved_amount + v_req.estimated_travel_cost
     where id = v_budget.id;
  end if;

  update outreach_visit_requests
     set finance_lead_review = p_decision, finance_lead_reviewed_by = actor,
         finance_lead_reviewed_at = now(), finance_lead_note = nullif(trim(p_note), '')
   where id = p_request_id;

  v_status := recompute_outreach_visit_request_status(p_request_id);

  insert into audit_log (actor_id, action, entity_type, entity_id, detail)
  values (actor, 'outreach_visit_request_finance_review', 'outreach_visit_request', p_request_id,
          jsonb_build_object('decision', p_decision, 'note', p_note, 'resulting_status', v_status,
                              'estimated_travel_cost', v_req.estimated_travel_cost));

  if v_req.created_by is not null then
    perform notify_user(
      v_req.created_by,
      'outreach_visit_request_finance_' || p_decision,
      'Finance Lead ' || p_decision || ' your visit request: ' || coalesce(v_school.name, 'a school'),
      case
        when v_status = 'approved' then 'Both approvals are in — the visit may proceed.'
        when v_status = 'rejected' then coalesce('Reason: ' || p_note, 'No reason given.')
        else 'Still awaiting the Campus Lead''s review.'
      end,
      '/dashboard/schools/' || v_req.school_id,
      'school',
      v_req.school_id
    );
  end if;
end;
$$;


create or replace function public.create_execution_plan(
  p_session_id uuid,
  p_logistics_notes text,
  p_has_laptop boolean,
  p_has_projector boolean,
  p_has_hdmi_cable boolean,
  p_has_extension_board boolean,
  p_has_speaker boolean,
  p_has_internet_device boolean,
  p_other_equipment text default null,
  p_teaching_resources text default null,
  p_estimated_transport_cost numeric default 0,
  p_session_ready boolean default false
)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_session     sessions;
  v_id          uuid;
  actor         uuid := auth.uid();
  actor_role    user_role;
  actor_campus  uuid;
  rec           record;
begin
  select * into v_session from sessions where id = p_session_id;
  if not found then
    raise exception 'Session % not found', p_session_id;
  end if;

  -- Role gate — exec_lead only (+ admins), deliberately NOT campus_lead: the
  -- submitter and the first-leg approver must be different people.
  if actor is not null then
    select role, campus_id into actor_role, actor_campus from public.users where id = actor;
    if not (
      actor_role in ('super_admin')
      or (actor_role = 'exec_lead' and v_session.campus_id is not distinct from actor_campus)
    ) then
      raise exception 'You do not have permission to submit an execution plan for this session'
        using errcode = '42501';
    end if;
  end if;

  if v_session.status <> 'planned' then
    raise exception 'Execution planning is only available while the session is Planned'
      using errcode = '42501';
  end if;

  if exists (select 1 from execution_plans where session_id = p_session_id and status = 'approved') then
    raise exception 'This session already has an approved execution plan' using errcode = '23514';
  end if;

  if coalesce(trim(p_logistics_notes), '') = '' then
    raise exception 'Logistics notes are required' using errcode = '23514';
  end if;
  if not p_session_ready then
    raise exception 'Confirm session readiness before submitting' using errcode = '23514';
  end if;

  insert into execution_plans
    (session_id, campus_id, logistics_notes,
     has_laptop, has_projector, has_hdmi_cable, has_extension_board, has_speaker, has_internet_device,
     other_equipment, teaching_resources, estimated_transport_cost, session_ready, created_by)
  values
    (p_session_id, v_session.campus_id, trim(p_logistics_notes),
     p_has_laptop, p_has_projector, p_has_hdmi_cable, p_has_extension_board, p_has_speaker, p_has_internet_device,
     nullif(trim(p_other_equipment), ''), nullif(trim(p_teaching_resources), ''),
     coalesce(p_estimated_transport_cost, 0), p_session_ready, actor)
  returning id into v_id;

  insert into audit_log (actor_id, action, entity_type, entity_id, detail)
  values (actor, 'execution_plan_create', 'execution_plan', v_id,
          jsonb_build_object('session_id', p_session_id, 'estimated_transport_cost', p_estimated_transport_cost));

  for rec in
    select id from public.users
     where is_active and role = 'campus_lead'
       and campus_id is not distinct from v_session.campus_id
  loop
    perform notify_user(
      rec.id,
      'execution_plan_created',
      'New execution plan: ' || v_session.topic,
      'An execution plan is ready for your review.',
      '/dashboard/sessions/' || p_session_id,
      'session',
      p_session_id
    );
  end loop;

  return v_id;
end;
$$;


create or replace function public.review_execution_plan_campus(
  p_plan_id uuid,
  p_decision approval_status,
  p_note text default null
)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_plan       execution_plans;
  v_session    sessions;
  actor        uuid := auth.uid();
  actor_role   user_role;
  actor_campus uuid;
  v_status     approval_status;
  rec          record;
begin
  if p_decision not in ('approved','rejected') then
    raise exception 'A review decision must be approved or rejected' using errcode = '22023';
  end if;

  select * into v_plan from execution_plans where id = p_plan_id for update;
  if not found then
    raise exception 'Execution plan % not found', p_plan_id;
  end if;
  if v_plan.campus_lead_review <> 'pending' then
    raise exception 'This plan has already been reviewed by the Campus Lead' using errcode = '23514';
  end if;

  if actor is not null then
    select role, campus_id into actor_role, actor_campus from public.users where id = actor;
    if not (
      actor_role in ('super_admin')
      or (actor_role = 'campus_lead' and v_plan.campus_id is not distinct from actor_campus)
    ) then
      raise exception 'You do not have permission to record the Campus Lead review' using errcode = '42501';
    end if;
  end if;

  if p_decision = 'rejected' and coalesce(trim(p_note), '') = '' then
    raise exception 'A reason is required when rejecting' using errcode = '23514';
  end if;

  update execution_plans
     set campus_lead_review = p_decision, campus_lead_reviewed_by = actor,
         campus_lead_reviewed_at = now(), campus_lead_note = nullif(trim(p_note), '')
   where id = p_plan_id;

  v_status := recompute_execution_plan_status(p_plan_id);

  select * into v_session from sessions where id = v_plan.session_id;

  insert into audit_log (actor_id, action, entity_type, entity_id, detail)
  values (actor, 'execution_plan_campus_review', 'execution_plan', p_plan_id,
          jsonb_build_object('decision', p_decision, 'note', p_note, 'resulting_status', v_status));

  if p_decision = 'approved' then
    -- Forwarded to Finance Lead — notify every Finance Lead of the campus.
    for rec in
      select id from public.users
       where is_active and role = 'finance_lead'
         and campus_id is not distinct from v_plan.campus_id
    loop
      perform notify_user(
        rec.id,
        'execution_plan_forwarded_to_finance',
        'Execution plan ready for finance review: ' || coalesce(v_session.topic, 'a session'),
        'The Campus Lead has approved this execution plan — it now needs your review.',
        '/dashboard/sessions/' || v_plan.session_id,
        'session',
        v_plan.session_id
      );
    end loop;
    if v_plan.created_by is not null then
      perform notify_user(
        v_plan.created_by,
        'execution_plan_campus_approved',
        'Campus Lead approved your execution plan: ' || coalesce(v_session.topic, 'a session'),
        'Forwarded to the Finance Lead for review.',
        '/dashboard/sessions/' || v_plan.session_id,
        'session',
        v_plan.session_id
      );
    end if;
  elsif v_plan.created_by is not null then
    perform notify_user(
      v_plan.created_by,
      'execution_plan_campus_rejected',
      'Campus Lead rejected your execution plan: ' || coalesce(v_session.topic, 'a session'),
      coalesce('Reason: ' || p_note, 'No reason given.'),
      '/dashboard/sessions/' || v_plan.session_id,
      'session',
      v_plan.session_id
    );
  end if;
end;
$$;


create or replace function public.review_execution_plan_finance(
  p_plan_id uuid,
  p_decision approval_status,
  p_note text default null
)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_plan        execution_plans;
  v_session     sessions;
  v_campus      campuses;
  v_budget      campus_budgets;
  v_available   numeric;
  actor         uuid := auth.uid();
  actor_role    user_role;
  actor_campus  uuid;
  v_status      approval_status;
begin
  if p_decision not in ('approved','rejected') then
    raise exception 'A review decision must be approved or rejected' using errcode = '22023';
  end if;

  select * into v_plan from execution_plans where id = p_plan_id for update;
  if not found then
    raise exception 'Execution plan % not found', p_plan_id;
  end if;
  if v_plan.finance_lead_review <> 'pending' then
    raise exception 'This plan has already been reviewed by the Finance Lead' using errcode = '23514';
  end if;

  select * into v_session from sessions where id = v_plan.session_id;

  if actor is not null then
    select role, campus_id into actor_role, actor_campus from public.users where id = actor;
    if not (
      actor_role in ('super_admin')
      or (actor_role = 'finance_lead' and v_plan.campus_id is not distinct from actor_campus)
    ) then
      raise exception 'You do not have permission to record the Finance Lead review' using errcode = '42501';
    end if;
  end if;

  if v_plan.campus_lead_review <> 'approved' then
    raise exception 'The Campus Lead must approve this execution plan before Finance can review'
      using errcode = '23514';
  end if;

  if p_decision = 'rejected' and coalesce(trim(p_note), '') = '' then
    raise exception 'A reason is required when rejecting' using errcode = '23514';
  end if;

  if p_decision = 'approved' then
    select * into v_campus from campuses where id = v_plan.campus_id;
    if v_campus.id is null or coalesce(trim(v_campus.quarter), '') = '' then
      raise exception 'No active budget period is set for this campus' using errcode = '23514';
    end if;

    select * into v_budget from campus_budgets
      where campus_id = v_plan.campus_id and period = v_campus.quarter
      for update;

    if not found then
      raise exception 'No budget allocated for % in %; ask an admin to allocate one before approving',
        coalesce(v_session.topic, 'this session'), v_campus.quarter using errcode = '23514';
    end if;

    v_available := v_budget.allocated_amount - v_budget.reserved_amount;
    if v_available < v_plan.estimated_transport_cost then
      raise exception 'Insufficient budget for %: ₹% available of ₹% allocated, ₹% requested',
        v_campus.quarter, v_available, v_budget.allocated_amount, v_plan.estimated_transport_cost
        using errcode = '23514';
    end if;

    update campus_budgets set reserved_amount = reserved_amount + v_plan.estimated_transport_cost
     where id = v_budget.id;
  end if;

  update execution_plans
     set finance_lead_review = p_decision, finance_lead_reviewed_by = actor,
         finance_lead_reviewed_at = now(), finance_lead_note = nullif(trim(p_note), '')
   where id = p_plan_id;

  v_status := recompute_execution_plan_status(p_plan_id);

  insert into audit_log (actor_id, action, entity_type, entity_id, detail)
  values (actor, 'execution_plan_finance_review', 'execution_plan', p_plan_id,
          jsonb_build_object('decision', p_decision, 'note', p_note, 'resulting_status', v_status,
                              'estimated_transport_cost', v_plan.estimated_transport_cost));

  if v_plan.created_by is not null then
    perform notify_user(
      v_plan.created_by,
      'execution_plan_finance_' || p_decision,
      'Finance Lead ' || p_decision || ' your execution plan: ' || coalesce(v_session.topic, 'a session'),
      case
        when v_status = 'approved' then 'Both approvals are in — the session may now move to In Progress.'
        when v_status = 'rejected' then coalesce('Reason: ' || p_note, 'No reason given.')
        else null
      end,
      '/dashboard/sessions/' || v_plan.session_id,
      'session',
      v_plan.session_id
    );
  end if;
end;
$$;


create or replace function public.set_campus_budget(
  p_campus_id uuid,
  p_period text,
  p_allocated_amount numeric,
  p_note text default null
)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_id       uuid;
  actor      uuid := auth.uid();
  actor_role user_role;
begin
  if actor is not null then
    select role into actor_role from public.users where id = actor;
    if actor_role not in ('super_admin') then
      raise exception 'Only management can set a campus budget' using errcode = '42501';
    end if;
  end if;

  insert into campus_budgets (campus_id, period, allocated_amount, created_by, notes)
  values (p_campus_id, p_period, p_allocated_amount, actor, p_note)
  on conflict (campus_id, period)
  do update set allocated_amount = excluded.allocated_amount, notes = excluded.notes
  returning id into v_id;

  insert into audit_log (actor_id, action, entity_type, entity_id, detail)
  values (actor, 'budget_allocate', 'campus_budget', v_id,
          jsonb_build_object('campus_id', p_campus_id, 'period', p_period,
                              'allocated_amount', p_allocated_amount, 'note', p_note));

  return v_id;
end;
$$;


create or replace function public.review_reimbursement_finance(
  p_reimbursement_id uuid,
  p_decision reimbursement_status,
  p_note text default null
)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_reimb      reimbursements;
  actor        uuid := auth.uid();
  actor_role   user_role;
  actor_campus uuid;
begin
  if p_decision not in ('under_review','approved','rejected') then
    raise exception 'A review decision must be under_review, approved or rejected' using errcode = '22023';
  end if;

  select * into v_reimb from reimbursements where id = p_reimbursement_id for update;
  if not found then
    raise exception 'Reimbursement claim % not found', p_reimbursement_id;
  end if;

  if actor is not null then
    select role, campus_id into actor_role, actor_campus from public.users where id = actor;
    if not (
      actor_role in ('super_admin')
      or (actor_role = 'finance_lead' and v_reimb.campus_id is not distinct from actor_campus)
    ) then
      raise exception 'You do not have permission to review this claim' using errcode = '42501';
    end if;
  end if;

  if p_decision = 'rejected' and coalesce(trim(p_note), '') = '' then
    raise exception 'A reason is required when rejecting' using errcode = '23514';
  end if;

  -- Transition legality + reviewed_by/reviewed_at stamping stays with
  -- trg_reimbursement_rules (0010) — deliberately not duplicated here.
  update reimbursements
     set status = p_decision, reviewer_note = coalesce(nullif(trim(p_note), ''), reviewer_note)
   where id = p_reimbursement_id;

  insert into audit_log (actor_id, action, entity_type, entity_id, detail)
  values (actor, 'reimbursement_finance_review', 'reimbursement', p_reimbursement_id,
          jsonb_build_object('decision', p_decision, 'note', p_note, 'amount', v_reimb.amount));

  perform notify_user(
    v_reimb.claimant_id,
    'reimbursement_' || p_decision,
    case p_decision
      when 'approved' then 'Your reimbursement claim was approved'
      when 'rejected' then 'Your reimbursement claim was rejected'
      else 'Your reimbursement claim is under review'
    end,
    case when p_note is not null and trim(p_note) <> '' then 'Note: ' || p_note else null end,
    '/dashboard/reimbursements/' || p_reimbursement_id,
    'reimbursement',
    p_reimbursement_id
  );
end;
$$;


create or replace function public.pay_reimbursement_finance(
  p_reimbursement_id uuid,
  p_payment_date date default null,
  p_payment_reference text default null,
  p_payment_method text default null
)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_reimb      reimbursements;
  actor        uuid := auth.uid();
  actor_role   user_role;
  actor_campus uuid;
begin
  select * into v_reimb from reimbursements where id = p_reimbursement_id for update;
  if not found then
    raise exception 'Reimbursement claim % not found', p_reimbursement_id;
  end if;

  if actor is not null then
    select role, campus_id into actor_role, actor_campus from public.users where id = actor;
    if not (
      actor_role in ('super_admin')
      or (actor_role = 'finance_lead' and v_reimb.campus_id is not distinct from actor_campus)
    ) then
      raise exception 'You do not have permission to mark this claim as paid' using errcode = '42501';
    end if;
  end if;

  if v_reimb.status <> 'approved' then
    raise exception 'Only approved claims can be marked as paid' using errcode = '23514';
  end if;

  update reimbursements
     set status = 'paid',
         payment_date = coalesce(p_payment_date, current_date),
         payment_reference = nullif(trim(p_payment_reference), ''),
         payment_method = nullif(trim(p_payment_method), '')
   where id = p_reimbursement_id;

  insert into audit_log (actor_id, action, entity_type, entity_id, detail)
  values (actor, 'reimbursement_finance_pay', 'reimbursement', p_reimbursement_id,
          jsonb_build_object('amount', v_reimb.amount, 'payment_reference', p_payment_reference,
                              'payment_method', p_payment_method));

  perform notify_user(
    v_reimb.claimant_id,
    'reimbursement_paid',
    'Your reimbursement claim was paid',
    'Payment of ₹' || v_reimb.amount || ' has been recorded.',
    '/dashboard/reimbursements/' || p_reimbursement_id,
    'reimbursement',
    p_reimbursement_id
  );
end;
$$;


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
    if actor is not null and not (actor_role in ('super_admin','campus_lead')) then
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


create or replace function public.enforce_user_privileged_changes()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  actor uuid := auth.uid();
  actor_role user_role;
  actor_campus uuid;
begin
  -- Only police updates that actually touch a privileged column.
  if new.role is not distinct from old.role
     and new.campus_id is not distinct from old.campus_id
     and new.is_active is not distinct from old.is_active then
    return new;
  end if;

  -- No authenticated end-user in context → trusted server-side path
  -- (service-role API calls, SQL migrations/seeds run as postgres). Allow.
  if actor is null then
    return new;
  end if;

  select role, campus_id into actor_role, actor_campus
    from public.users where id = actor;

  -- Super Admin may change any of these on anyone.
  if actor_role = 'super_admin' then
    return new;
  end if;

  -- Campus Lead may manage users within their OWN campus, but may not move a
  -- user to a different campus nor grant an admin role.
  if actor_role = 'campus_lead'
     and actor_campus is not null
     and old.campus_id is not distinct from actor_campus
     and new.campus_id is not distinct from old.campus_id then
    if new.role in ('super_admin') then
      raise exception 'Campus leads cannot assign admin roles' using errcode = '42501';
    end if;
    return new;
  end if;

  raise exception 'Insufficient privilege to change role, campus, or active status'
    using errcode = '42501';
end;
$$;

-- ─── Simplify the two analytics views — drop the now-permanently-dead
-- school_poc/viewer exclusions (they can never match a row again) ───────────

create or replace view program_summary as
select
  (select count(*) from schools)                                                    as schools_total,
  (select count(*) from schools where total_sessions > 0)                           as schools_reached,
  (select count(*) from sessions where status = 'verified')                         as sessions_completed,
  (select coalesce(sum(student_count),0) from sessions where status = 'verified')   as students_impacted,
  (select count(*) from users where is_active)                                     as active_volunteers,
  (select count(*) from campuses where is_active)                                   as active_campuses,
  (select count(distinct state) from campuses)                                      as states_count,
  (select coalesce(sum(amount),0) from reimbursements
     where status in ('approved','paid'))                                           as approved_spend,
  (select count(*) from reimbursements
     where status in ('submitted','under_review'))                                  as pending_claims,
  (select coalesce(sum(target_students),0) from campuses where is_active)           as target_students,
  (select coalesce(sum(target_sessions),0) from campuses where is_active)           as target_sessions,
  (select coalesce(sum(target_schools),0) from campuses where is_active)            as target_schools;

create or replace view campus_performance as
select
  c.id as campus_id, c.name, c.slug,
  c.target_schools, c.target_students, c.target_sessions, c.quarter,
  (select count(*) from schools s where s.campus_id = c.id)                                  as schools_total,
  (select count(*) from schools s where s.campus_id = c.id and s.total_sessions > 0)         as schools_reached,
  (select count(*) from sessions se where se.campus_id = c.id and se.status = 'verified')    as sessions_completed,
  (select coalesce(sum(se.student_count),0) from sessions se
     where se.campus_id = c.id and se.status = 'verified')                                   as students_impacted,
  (select count(*) from users u where u.campus_id = c.id and u.is_active)                    as volunteers,
  (select coalesce(sum(r.amount),0) from reimbursements r
     where r.campus_id = c.id and r.status in ('approved','paid'))                           as approved_spend,
  (select max(se.date) from sessions se where se.campus_id = c.id)                           as last_session_date
from campuses c
where c.is_active;
