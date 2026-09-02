-- ═══════════════════════════════════════════════════════════════════════════
-- Teach AI for India — 0070 Fix Volunteer Session Visibility
--
-- Symptom: a volunteer assigned to a school sees an empty dashboard for that
-- school — "0 of 4 sessions verified", every session card "Locked", 0%
-- certificate progress — even once the program is fully complete and the
-- school card right above it correctly badges "COMPLETED".
--
-- Cause: sessions_select (RLS on public.sessions) only grants a volunteer
-- read access to a session row when their uid is in that row's
-- team_members_present array, or via the legacy session_assignments table.
-- Neither is populated by the current Session Hub flow (confirmed against
-- production: every session row for an affected school has
-- team_members_present = '{}' and created_by pointing to whoever ran the
-- Session Hub, never the assigned volunteers). So no ordinary team-member
-- volunteer can SELECT any of their assigned school's session rows — not
-- because the program completed, but because this grant was never wired to
-- school_team_members at all. getVolunteerJourney() (lib/data/volunteer-journey.ts)
-- reads sessions with the querying volunteer's own credentials, so RLS
-- silently filters the result to zero rows regardless of how many sessions
-- actually exist and were verified.
--
-- 0056 attempted exactly this fix (grant by school_team_members membership)
-- but never applied on this database: it referenced
-- session_participants.user_id, a column that doesn't exist under the schema
-- 0066 actually created (session_participants.volunteer_id), so CREATE POLICY
-- failed and the whole 0056 transaction rolled back silently. This migration
-- reapplies the fix against the schema as it actually exists today, and adds
-- 'completed' to the status allow-list — the exact status
-- complete_school_if_ready() (0067) sets on every team member once the
-- program finishes, which 0056's draft never covered either.
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

DROP POLICY IF EXISTS sessions_select ON public.sessions;

CREATE POLICY sessions_select ON public.sessions FOR SELECT TO authenticated USING (
  (select is_admin())
  OR (
    (select auth_role()) = ANY (ARRAY['campus_lead','outreach_lead','exec_lead','volunteer_lead','campus_mgmt_admin','finance_lead']::user_role[])
    AND campus_id = (select auth_campus())
  )
  OR (select auth.uid()) = ANY (team_members_present)
  OR created_by = (select auth.uid())
  OR EXISTS (
    SELECT 1 FROM session_assignments sa
     WHERE sa.session_id = sessions.id AND sa.volunteer_id = (select auth.uid())
  )
  OR EXISTS (
    SELECT 1 FROM school_team_members stm
     WHERE stm.school_id = sessions.school_id
       AND stm.volunteer_id = (select auth.uid())
       AND stm.status IN ('confirmed','available','requested','completed')
  )
);

COMMENT ON POLICY sessions_select ON public.sessions IS
  'Read access via role+campus, direct assignment (team_members_present / session_assignments legacy), or active/completed school_team_members membership. The last clause is 0070: volunteers were losing visibility into their own assigned school''s sessions entirely, worst of all once the program completed.';

COMMIT;
