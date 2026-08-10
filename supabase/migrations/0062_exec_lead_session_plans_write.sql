-- Migration: 0062_exec_lead_session_plans_write.sql
-- Description: Allow Execution Lead / Operations Lead (exec_lead) to write and update session_plans for onboarding & deployment planning.

ALTER POLICY session_plans_write ON public.session_plans
  USING (
    is_admin()
    OR (
      auth_role() IN ('campus_lead', 'outreach_lead', 'exec_lead', 'campus_mgmt_admin')
      AND (campus_id = auth_campus() OR auth_campus() IS NULL)
    )
  )
  WITH CHECK (
    is_admin()
    OR (
      auth_role() IN ('campus_lead', 'outreach_lead', 'exec_lead', 'campus_mgmt_admin')
      AND (campus_id = auth_campus() OR auth_campus() IS NULL)
    )
  );
