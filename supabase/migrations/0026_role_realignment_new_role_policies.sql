-- ═══════════════════════════════════════════════════════════════════════════
-- Teach AI for India — 0025b Grant campus_mgmt_admin / finance_lead read access
--
-- Split out of 0025_role_realignment.sql: Postgres forbids using a value
-- added by ALTER TYPE ... ADD VALUE in the same transaction that added it
-- (SQLSTATE 55P04 "unsafe use of new value"). 0025 adds 'campus_mgmt_admin'
-- and 'finance_lead' and commits; this migration runs after and can safely
-- reference them.
-- ═══════════════════════════════════════════════════════════════════════════

-- sessions_select — live version is 0022's; also add read access for the two
-- new roles so campus_rollups (an invoker-security view) has something to
-- count for them once Phase 5 builds their dashboard.
drop policy if exists sessions_select on sessions;
create policy sessions_select on sessions for select to authenticated
  using (
    is_admin()
    or (auth_role() in ('campus_lead','outreach_lead','exec_lead','volunteer_lead','campus_mgmt_admin','finance_lead')
        and campus_id = auth_campus())
    or auth.uid() = any(team_members_present)
    or created_by = auth.uid()
    or exists (select 1 from session_assignments sa
        where sa.session_id = sessions.id and sa.volunteer_id = auth.uid())
  );

-- reimb_select — live version is 0015's; add the two new roles, read-only.
drop policy if exists reimb_select on reimbursements;
create policy reimb_select on reimbursements for select to authenticated
  using (
    claimant_id = auth.uid()
    or is_admin()
    or (auth_role() in ('campus_lead','volunteer_lead','campus_mgmt_admin','finance_lead') and campus_id = auth_campus())
  );
