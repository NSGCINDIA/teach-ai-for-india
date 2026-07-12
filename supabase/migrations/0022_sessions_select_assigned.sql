-- ═══════════════════════════════════════════════════════════════════════════
-- Teach AI for India — 0022 sessions_select: visible once assigned
--
-- sessions_select only granted a volunteer READ once they were in
-- team_members_present (i.e. after attendance was marked) or were the
-- session's creator. A volunteer who has just been assigned via the
-- assignment engine (0017) — and hasn't accepted/attended yet — had no
-- grant at all, so the nested `session` embed on their own
-- session_assignments row resolved to null (RLS silently drops embedded
-- rows the caller can't SELECT). Their "My assignments" incoming-request
-- card showed no session details and had nowhere to click through to.
-- ═══════════════════════════════════════════════════════════════════════════

drop policy if exists sessions_select on sessions;
create policy sessions_select on sessions for select to authenticated
  using (
    is_admin()
    or (auth_role() in ('campus_lead','outreach_head','exec_lead','volunteer_lead') and campus_id = auth_campus())
    or auth.uid() = any(team_members_present)
    or created_by = auth.uid()
    or exists (select 1 from session_assignments sa
        where sa.session_id = sessions.id and sa.volunteer_id = auth.uid())
  );
