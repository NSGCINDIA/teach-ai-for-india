-- ═══════════════════════════════════════════════════════════════════════════
-- Teach AI for India — 0039 Drop exec_lead from outreach_requests/school_visits
-- read access
--
-- 0037 gave exec_lead SELECT visibility on both new tables, matching the
-- "campus leads" role bucket used elsewhere — but exec_lead has no write role
-- anywhere in this feature (outreachRequestAccess/canLogSchoolVisit never
-- include it) and EXEC_LEAD_SCHOOL_STATUSES (lib/constants/status.ts) starts
-- at 'registered', after both these tables' stages are done. Sibling tables
-- (outreach_visit_requests, budget_increase_requests) don't grant exec_lead
-- read access either — this brings the new tables in line with that
-- precedent instead of leaving stray read-only visibility into a pipeline
-- stage exec_lead has no part in.
-- ═══════════════════════════════════════════════════════════════════════════

drop policy outreach_requests_select on outreach_requests;
create policy outreach_requests_select on outreach_requests for select to authenticated
  using (
    is_admin()
    or (auth_role() in ('campus_lead','outreach_lead','campus_mgmt_admin') and campus_id = auth_campus())
    or created_by = auth.uid()
  );

drop policy school_visits_select on school_visits;
create policy school_visits_select on school_visits for select to authenticated
  using (
    is_admin()
    or (auth_role() in ('campus_lead','outreach_lead','campus_mgmt_admin') and campus_id = auth_campus())
    or created_by = auth.uid()
  );
