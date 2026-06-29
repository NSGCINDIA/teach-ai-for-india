-- ═══════════════════════════════════════════════════════════════════════════
-- Teach AI for India — 0003 Row Level Security
-- Encodes the role matrix from PRD §7.2. Every table has RLS ENABLED.
-- Public-readable tables (campuses, content_blocks, approved public media) are
-- the ONLY ones reachable by anon. Everything else is authenticated + scoped.
-- ═══════════════════════════════════════════════════════════════════════════

-- Default privileges: Supabase grants these to anon/authenticated; restate for
-- portability. RLS policies below do the real filtering.
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant select on all tables in schema public to anon;
grant usage, select on all sequences in schema public to authenticated;

alter table users                  enable row level security;
alter table campuses               enable row level security;
alter table schools                enable row level security;
alter table school_contacts        enable row level security;
alter table school_status_history  enable row level security;
alter table sessions               enable row level security;
alter table attendance_records     enable row level security;
alter table reimbursements         enable row level security;
alter table media_assets           enable row level security;
alter table notifications          enable row level security;
alter table content_blocks         enable row level security;
alter table audit_log              enable row level security;

-- ─── users ────────────────────────────────────────────────────────────────────
create policy users_select on users for select to authenticated
  using ( id = auth.uid() or is_admin() or campus_id = auth_campus() );

create policy users_insert on users for insert to authenticated
  with check ( is_admin() );

create policy users_update on users for update to authenticated
  using ( id = auth.uid() or is_admin() or (auth_role() = 'campus_lead' and campus_id = auth_campus()) )
  with check ( id = auth.uid() or is_admin() or (auth_role() = 'campus_lead' and campus_id = auth_campus()) );

create policy users_delete on users for delete to authenticated
  using ( is_super_admin() );

-- ─── campuses (public-readable for the public website) ───────────────────────
create policy campuses_select on campuses for select to anon, authenticated
  using ( true );
create policy campuses_write on campuses for all to authenticated
  using ( is_admin() ) with check ( is_admin() );

-- ─── schools (authenticated can search ALL; edit scoped to campus) ───────────
create policy schools_select on schools for select to authenticated
  using ( true );  -- US-CRM-03: cross-campus search for everyone signed in

create policy schools_insert on schools for insert to authenticated
  with check (
    is_admin()
    or (auth_role() in ('campus_lead','outreach_head') and campus_id = auth_campus())
  );

create policy schools_update on schools for update to authenticated
  using (
    is_admin()
    or (auth_role() in ('campus_lead','outreach_head') and campus_id = auth_campus())
  )
  with check (
    is_admin()
    or (auth_role() in ('campus_lead','outreach_head') and campus_id = auth_campus())
  );

create policy schools_delete on schools for delete to authenticated
  using ( is_admin() );

-- ─── school_contacts (mirror parent-school edit rights) ──────────────────────
create policy school_contacts_select on school_contacts for select to authenticated using ( true );
create policy school_contacts_write on school_contacts for all to authenticated
  using ( exists (select 1 from schools s where s.id = school_id
            and (is_admin() or (auth_role() in ('campus_lead','outreach_head') and s.campus_id = auth_campus()))) )
  with check ( exists (select 1 from schools s where s.id = school_id
            and (is_admin() or (auth_role() in ('campus_lead','outreach_head') and s.campus_id = auth_campus()))) );

-- ─── school_status_history (append-only: select + insert, NO update/delete) ───
create policy ssh_select on school_status_history for select to authenticated using ( true );
create policy ssh_insert on school_status_history for insert to authenticated
  with check ( exists (select 1 from schools s where s.id = school_id
            and (is_admin() or (auth_role() in ('campus_lead','outreach_head') and s.campus_id = auth_campus()))) );

-- ─── sessions ─────────────────────────────────────────────────────────────────
create policy sessions_select on sessions for select to authenticated
  using (
    is_admin()
    or (auth_role() in ('campus_lead','outreach_head','exec_lead') and campus_id = auth_campus())
    or auth.uid() = any(team_members_present)         -- volunteers: assigned only (US-AUTH-02)
    or created_by = auth.uid()
  );

create policy sessions_insert on sessions for insert to authenticated
  with check (
    is_admin()
    or (auth_role() in ('campus_lead','exec_lead') and campus_id = auth_campus())
  );

create policy sessions_update on sessions for update to authenticated
  using (
    is_admin()
    or (auth_role() in ('campus_lead','exec_lead') and campus_id = auth_campus())
    or created_by = auth.uid()
  )
  with check (
    is_admin()
    or (auth_role() in ('campus_lead','exec_lead') and campus_id = auth_campus())
    or created_by = auth.uid()
  );

create policy sessions_delete on sessions for delete to authenticated using ( is_admin() );

-- ─── attendance_records ───────────────────────────────────────────────────────
create policy attendance_select on attendance_records for select to authenticated
  using (
    user_id = auth.uid()
    or exists (select 1 from sessions s where s.id = session_id
        and (is_admin() or (auth_role() in ('campus_lead','exec_lead') and s.campus_id = auth_campus())))
  );
create policy attendance_write on attendance_records for all to authenticated
  using ( exists (select 1 from sessions s where s.id = session_id
        and (is_admin() or (auth_role() in ('campus_lead','exec_lead') and s.campus_id = auth_campus()))) )
  with check ( exists (select 1 from sessions s where s.id = session_id
        and (is_admin() or (auth_role() in ('campus_lead','exec_lead') and s.campus_id = auth_campus()))) );

-- ─── reimbursements (claimant sees own; admins manage; campus lead reads campus) ─
create policy reimb_select on reimbursements for select to authenticated
  using (
    claimant_id = auth.uid()
    or is_admin()
    or (auth_role() = 'campus_lead' and campus_id = auth_campus())
  );

create policy reimb_insert on reimbursements for insert to authenticated
  with check (
    claimant_id = auth.uid()
    and auth_role() in ('super_admin','outreach_head','exec_lead','volunteer')
  );

create policy reimb_update on reimbursements for update to authenticated
  using ( is_admin() or (claimant_id = auth.uid() and status in ('draft','rejected')) )
  with check ( is_admin() or (claimant_id = auth.uid() and status in ('draft','submitted')) );

create policy reimb_delete on reimbursements for delete to authenticated using ( is_super_admin() );

-- ─── media_assets (evidence vault) ───────────────────────────────────────────
create policy media_select on media_assets for select to anon, authenticated
  using (
    (is_public and approval_status = 'approved' and deleted_at is null)   -- public gallery (anon ok)
    or is_admin()
    or (deleted_at is null and (campus_id = auth_campus() or auth_role() = 'campus_lead'))
  );

create policy media_insert on media_assets for insert to authenticated
  with check ( uploaded_by = auth.uid() );   -- all team members can upload

create policy media_update on media_assets for update to authenticated
  using ( is_admin() or is_campus_lead_plus(campus_id) or uploaded_by = auth.uid() )
  with check ( is_admin() or is_campus_lead_plus(campus_id) or uploaded_by = auth.uid() );

-- Hard delete is Super Admin only; everyone else soft-deletes via update(deleted_at).
create policy media_delete on media_assets for delete to authenticated using ( is_super_admin() );

-- ─── notifications (own only) ────────────────────────────────────────────────
create policy notif_select on notifications for select to authenticated using ( recipient_id = auth.uid() );
create policy notif_update on notifications for update to authenticated
  using ( recipient_id = auth.uid() ) with check ( recipient_id = auth.uid() );
create policy notif_insert on notifications for insert to authenticated with check ( true );
create policy notif_delete on notifications for delete to authenticated using ( recipient_id = auth.uid() );

-- ─── content_blocks (public-readable; admin-writable) ────────────────────────
create policy content_select on content_blocks for select to anon, authenticated using ( true );
create policy content_write on content_blocks for all to authenticated
  using ( is_admin() ) with check ( is_admin() );

-- ─── audit_log (super admin reads; append-only; never updated/deleted) ───────
create policy audit_select on audit_log for select to authenticated using ( is_super_admin() );
create policy audit_insert on audit_log for insert to authenticated with check ( true );
