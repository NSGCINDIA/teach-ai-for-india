-- ═══════════════════════════════════════════════════════════════════════════
-- Teach AI for India — 0004 Storage buckets & policies
-- Two buckets:
--   • evidence      (private)  — all uploads. Path: {campus_id}/{school_id}/{session_id}/{type}/{file}
--   • public-assets (public)   — approved public images, campus hero images, CMS media
-- ═══════════════════════════════════════════════════════════════════════════

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('evidence', 'evidence', false, 209715200,  -- 200MB (video cap per PRD §7.7)
    array['image/jpeg','image/png','image/heic','image/webp','video/mp4','video/quicktime',
          'application/pdf','application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.openxmlformats-officedocument.presentationml.presentation']),
  ('public-assets', 'public-assets', true, 26214400, -- 25MB
    array['image/jpeg','image/png','image/webp','image/svg+xml'])
on conflict (id) do nothing;

-- ─── evidence bucket policies ────────────────────────────────────────────────
-- folder[1] is the campus_id. Members read/write within their own campus;
-- campus leads + admins read across campuses; super admin deletes.

create policy "evidence read"   on storage.objects for select to authenticated
  using (
    bucket_id = 'evidence' and (
      is_admin()
      or auth_role() = 'campus_lead'
      or (storage.foldername(name))[1] = auth_campus()::text
    )
  );

create policy "evidence insert" on storage.objects for insert to authenticated
  with check ( bucket_id = 'evidence' );  -- all team members can upload (PRD §7.7)

create policy "evidence update" on storage.objects for update to authenticated
  using ( bucket_id = 'evidence' and (is_admin() or auth_role() = 'campus_lead'
          or (storage.foldername(name))[1] = auth_campus()::text) );

create policy "evidence delete" on storage.objects for delete to authenticated
  using ( bucket_id = 'evidence' and (is_admin() or auth_role() = 'campus_lead') );

-- ─── public-assets bucket policies ───────────────────────────────────────────
create policy "public read" on storage.objects for select to anon, authenticated
  using ( bucket_id = 'public-assets' );

create policy "public write" on storage.objects for insert to authenticated
  with check ( bucket_id = 'public-assets' and (is_admin() or auth_role() = 'campus_lead') );

create policy "public update" on storage.objects for update to authenticated
  using ( bucket_id = 'public-assets' and (is_admin() or auth_role() = 'campus_lead') );

create policy "public delete" on storage.objects for delete to authenticated
  using ( bucket_id = 'public-assets' and is_admin() );
