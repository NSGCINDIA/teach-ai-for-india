-- ═══════════════════════════════════════════════════════════════════════════
-- Teach AI for India — 0038 Fix outreach request re-filing after rejection
--
-- 0037's review_outreach_request() deliberately leaves schools.status at
-- outreach_requested on rejection (not reverted to lead_identified) so a
-- fresh request can be re-filed once the rejected row is no longer 'pending'.
-- But create_outreach_request()'s own guard only accepted status =
-- 'lead_identified', so re-filing after a rejection actually raised "Only a
-- school still at Lead Identified can have an outreach request filed" —
-- caught by an end-to-end smoke test. Fix: accept either status the school
-- can legitimately be at when a request is being (re-)filed. Byte-for-byte
-- copy of the live body (0037) otherwise.
-- ═══════════════════════════════════════════════════════════════════════════

create or replace function public.create_outreach_request(
  p_school_id uuid,
  p_reason text,
  p_proposed_approach text default null
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
      raise exception 'You do not have permission to file an outreach request for this school' using errcode = '42501';
    end if;
  end if;

  if v_school.status not in ('lead_identified', 'outreach_requested') then
    raise exception 'A school must be at Lead Identified (or re-filing after a rejected request) to have an outreach request filed'
      using errcode = '23514';
  end if;

  if coalesce(trim(p_reason), '') = '' then
    raise exception 'A reason is required' using errcode = '23514';
  end if;

  insert into outreach_requests (school_id, campus_id, reason, proposed_approach, created_by)
  values (p_school_id, v_school.campus_id, trim(p_reason), nullif(trim(p_proposed_approach), ''), actor)
  returning id into v_id;

  perform change_school_status(p_school_id, 'outreach_requested', 'Outreach request filed');

  insert into audit_log (actor_id, action, entity_type, entity_id, detail)
  values (actor, 'outreach_request_create', 'outreach_request', v_id,
          jsonb_build_object('school_id', p_school_id, 'reason', p_reason));

  for rec in
    select id from public.users
     where is_active and role = 'campus_lead' and campus_id is not distinct from v_school.campus_id
  loop
    perform notify_user(
      rec.id,
      'outreach_request_created',
      'New outreach request: ' || v_school.name,
      trim(p_reason),
      '/dashboard/schools/' || p_school_id,
      'school',
      p_school_id
    );
  end loop;

  return v_id;
end;
$$;

comment on function public.create_outreach_request(uuid, text, text) is
  'Outreach Lead/Campus Lead requests pursuing a school lead; notifies the campus Campus Lead(s); advances the school to outreach_requested. Callable again after a prior request was rejected.';
