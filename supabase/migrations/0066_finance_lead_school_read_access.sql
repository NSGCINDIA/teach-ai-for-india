-- ═══════════════════════════════════════════════════════════════════════════
-- Teach AI for India — 0061 Finance Lead school read access
--
-- Problem: When finance_lead navigates to /dashboard/schools/[id] to approve
-- a school's execution & budget plan, the page crashes ("This page couldn't
-- load") because:
--
--   1. school_contacts — no SELECT policy for finance_lead exists; the join
--      in getSchool() causes PostgREST to fail, making the page crash.
--
--   2. school_status_history — only has an INSERT policy (ssh_insert); no
--      SELECT policy exists for finance_lead, causing the same join failure.
--
--   3. audit_log — audit_select restricts to super_admin only; the
--      getSchoolActivityTimeline() call in the school detail page triggers a
--      permissions error that crashes the server component rendering in
--      certain Next.js/React cache() contexts.
--
--   4. session_plans — session_plans_select does not include finance_lead;
--      the school detail page joins the current onboarding plan which fails.
--
-- Fix: Add campus-scoped SELECT access for finance_lead to all four tables
-- so the school detail page renders correctly and budget approval works.
-- ═══════════════════════════════════════════════════════════════════════════

-- 1. school_contacts — finance_lead needs read access (same campus) so the
--    school detail page's joined SELECT doesn't fail.
DROP POLICY IF EXISTS school_contacts_select ON public.school_contacts;
CREATE POLICY school_contacts_select ON public.school_contacts FOR SELECT TO authenticated
  USING (
    (select is_admin())
    OR (
      (select auth_role()) = ANY (ARRAY[
        'campus_lead'::user_role, 'outreach_lead'::user_role,
        'exec_lead'::user_role, 'finance_lead'::user_role,
        'campus_mgmt_admin'::user_role, 'volunteer_lead'::user_role
      ])
      AND EXISTS (
        SELECT 1 FROM public.schools s
        WHERE s.id = school_contacts.school_id
          AND s.campus_id = (select auth_campus())
      )
    )
    OR (
      -- Any volunteer on this school's team may also see contact info
      EXISTS (
        SELECT 1 FROM public.school_team_members stm
        WHERE stm.school_id = school_contacts.school_id
          AND stm.volunteer_id = (select auth.uid())
          AND stm.is_active
      )
    )
  );

-- 2. school_status_history — add SELECT policy for finance_lead (campus-scoped).
--    The existing ssh_insert policy only governed INSERT; SELECT was absent.
DROP POLICY IF EXISTS ssh_select ON public.school_status_history;
CREATE POLICY ssh_select ON public.school_status_history FOR SELECT TO authenticated
  USING (
    (select is_admin())
    OR (
      (select auth_role()) = ANY (ARRAY[
        'campus_lead'::user_role, 'outreach_lead'::user_role,
        'exec_lead'::user_role, 'finance_lead'::user_role,
        'campus_mgmt_admin'::user_role, 'volunteer_lead'::user_role
      ])
      AND EXISTS (
        SELECT 1 FROM public.schools s
        WHERE s.id = school_status_history.school_id
          AND s.campus_id = (select auth_campus())
      )
    )
  );

-- 3. audit_log — extend audit_select so finance_lead and campus_mgmt_admin
--    can read audit events for their own campus (actor scoped).
--    super_admin retains full unrestricted access.
DROP POLICY IF EXISTS audit_select ON public.audit_log;
CREATE POLICY audit_select ON public.audit_log FOR SELECT TO authenticated
  USING (
    (select is_super_admin())
    OR (
      (select auth_role()) = ANY (ARRAY[
        'campus_lead'::user_role, 'finance_lead'::user_role,
        'campus_mgmt_admin'::user_role
      ])
      AND actor_id IN (
        SELECT id FROM public.users
        WHERE campus_id = (select auth_campus())
      )
    )
  );

-- 4. session_plans — extend session_plans_select to include finance_lead so
--    the school detail page can read the current onboarding plan for context.
DROP POLICY IF EXISTS session_plans_select ON public.session_plans;
CREATE POLICY session_plans_select ON public.session_plans FOR SELECT TO authenticated
  USING (
    (select is_admin())
    OR (
      (select auth_role()) = ANY (ARRAY[
        'campus_lead'::user_role, 'outreach_lead'::user_role,
        'exec_lead'::user_role, 'volunteer_lead'::user_role,
        'finance_lead'::user_role, 'campus_mgmt_admin'::user_role
      ])
      AND (campus_id = (select auth_campus()))
    )
    OR (created_by = (select auth.uid()))
  );

NOTIFY pgrst, 'reload schema';
