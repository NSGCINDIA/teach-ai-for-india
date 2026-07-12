-- ═══════════════════════════════════════════════════════════════════════════
-- Teach AI for India — 0042 Self-heal outreach visit requests filed before 0041
--
-- 0041 made filing an outreach visit request advance lead_identified→
-- outreach_requested, and both-legs-approved advance outreach_requested→
-- outreach_approved. Requests filed BEFORE 0041 existed never got that
-- file-time advance, so they're still sitting at lead_identified — if both
-- legs are approved now, the old guard (only fires from exactly
-- outreach_requested) would leave them stuck there forever. Broaden it to
-- fire from lead_identified too, recording the school's actual previous
-- status rather than a hardcoded one, so old pre-0041 requests catch up
-- instead of staying permanently stuck.
-- ═══════════════════════════════════════════════════════════════════════════

create or replace function public.recompute_outreach_visit_request_status(p_id uuid)
returns approval_status language plpgsql security definer set search_path = public as $$
declare
  v_campus         approval_status;
  v_finance        approval_status;
  v_new            approval_status;
  v_school_id      uuid;
  v_school_status  school_status;
begin
  select campus_lead_review, finance_lead_review, school_id into v_campus, v_finance, v_school_id
    from outreach_visit_requests where id = p_id;

  v_new := case
    when v_campus = 'rejected' or v_finance = 'rejected' then 'rejected'
    when v_campus = 'approved' and v_finance = 'approved' then 'approved'
    else 'pending'
  end;

  update outreach_visit_requests set status = v_new where id = p_id;

  -- Both legs approved: advance the pipeline — bypassing change_school_status()
  -- deliberately (see 0041's header) since either reviewer role can be the one
  -- that completes this, and finance_lead isn't allowed to call it directly.
  -- Fires from lead_identified (self-healing a pre-0041 request that never got
  -- the file-time advance) or outreach_requested (the normal case).
  if v_new = 'approved' then
    select status into v_school_status from schools where id = v_school_id;
    if v_school_status in ('lead_identified', 'outreach_requested') then
      update schools set status = 'outreach_approved' where id = v_school_id;
      insert into school_status_history (school_id, previous_status, new_status, changed_by, note)
      values (v_school_id, v_school_status::text, 'outreach_approved', auth.uid(),
              'Outreach visit request fully approved');
      insert into audit_log (actor_id, action, entity_type, entity_id, detail)
      values (auth.uid(), 'status_change', 'school', v_school_id,
              jsonb_build_object('from', v_school_status, 'to', 'outreach_approved',
                                  'note', 'Outreach visit request fully approved',
                                  'source', 'outreach_visit_request_dual_approval'));
    end if;
  end if;

  return v_new;
end;
$$;
