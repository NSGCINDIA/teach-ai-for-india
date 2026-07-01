-- ═══════════════════════════════════════════════════════════════════════════
-- Teach AI for India — 0015 Volunteer Lead role (Team Dashboard PRD)
--
-- Adds the fourth campus leadership role. Volunteer Lead manages PEOPLE
-- (recruit, assign, coordinate volunteers) — not schools, not reports. Per the
-- Team Dashboard permission matrix they get campus-wide READ on sessions,
-- attendance, and reimbursements, plus (later) volunteer assignment writes.
-- Schools/users/evidence are already campus-readable via existing policies.
-- ═══════════════════════════════════════════════════════════════════════════

-- New enum value (committed before the policies below reference it — psql runs
-- each statement in its own autocommit transaction with -f).
alter type user_role add value if not exists 'volunteer_lead';

-- ─── sessions: campus-wide read for Volunteer Lead ───────────────────────────
drop policy if exists sessions_select on sessions;
create policy sessions_select on sessions for select to authenticated
  using (
    is_admin()
    or (auth_role() in ('campus_lead','outreach_head','exec_lead','volunteer_lead') and campus_id = auth_campus())
    or auth.uid() = any(team_members_present)         -- volunteers: assigned only (US-AUTH-02)
    or created_by = auth.uid()
  );

-- ─── attendance: campus-wide READ (not write) for Volunteer Lead ─────────────
drop policy if exists attendance_select on attendance_records;
create policy attendance_select on attendance_records for select to authenticated
  using (
    user_id = auth.uid()
    or exists (select 1 from sessions s where s.id = session_id
        and (is_admin() or (auth_role() in ('campus_lead','exec_lead','volunteer_lead') and s.campus_id = auth_campus())))
  );

-- ─── reimbursements: campus-wide READ for Volunteer Lead (matrix: View) ──────
drop policy if exists reimb_select on reimbursements;
create policy reimb_select on reimbursements for select to authenticated
  using (
    claimant_id = auth.uid()
    or is_admin()
    or (auth_role() in ('campus_lead','volunteer_lead') and campus_id = auth_campus())
  );
