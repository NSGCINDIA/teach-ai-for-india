-- ─────────────────────────────────────────────────────────────────────────────
-- Teach AI for India — 0072 Campus Management Admin can read applications
--
-- The Campus Management Admin monitors one campus. Let them read that campus's
-- volunteer applications, read-only, like the Campus Lead. Writes are unchanged:
-- only the Volunteer Lead's RPCs and super_admin can modify a row.
-- ─────────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS applications_read ON public.volunteer_applications;
CREATE POLICY applications_read ON public.volunteer_applications
  FOR SELECT TO authenticated
  USING (
    (select is_admin())
    OR (
      (select auth_role()) IN ('campus_lead', 'volunteer_lead', 'campus_mgmt_admin')
      AND campus_id IS NOT NULL
      AND campus_id = (select auth_campus())
    )
  );
