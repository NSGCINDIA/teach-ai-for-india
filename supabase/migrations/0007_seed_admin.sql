-- ═══════════════════════════════════════════════════════════════════════════
-- Teach AI for India — 0007 Seed: bootstrap Super Admin
--
-- ⚠ PRD §19.1 requires at least 2 Super Admins in production. This seeds ONE
--   bootstrap account so you can log in and invite the rest.
--
-- ⚠ CHANGE THE PASSWORD IMMEDIATELY after first login. The default below is a
--   placeholder. Prefer creating the first admin via the Supabase Dashboard
--   (Authentication → Add user) if you'd rather not run this.
--
-- This relies on GoTrue's auth.users / auth.identities layout. If your Supabase
-- version differs and this errors, create the user in the Dashboard instead and
-- then run:  update public.users set role='super_admin' where email='...';
-- ═══════════════════════════════════════════════════════════════════════════

do $$
declare
  v_uid uuid := gen_random_uuid();
  v_email text := 'admin@teachaiforindia.org';
  v_password text := 'ChangeMe!2026';   -- ⚠ change after first login
begin
  if exists (select 1 from auth.users where email = v_email) then
    raise notice 'Admin % already exists — skipping.', v_email;
    return;
  end if;

  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
    -- GoTrue scans these token columns into non-nullable Go strings; a NULL
    -- here makes password login 500 with "Database error querying schema".
    -- Seed them as '' so a hand-crafted row logs in cleanly.
    confirmation_token, recovery_token, email_change, email_change_token_new
  ) values (
    '00000000-0000-0000-0000-000000000000', v_uid, 'authenticated', 'authenticated',
    v_email, crypt(v_password, gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name','Platform Admin','role','super_admin'),
    now(), now(),
    '', '', '', ''
  );

  insert into auth.identities (
    id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at
  ) values (
    gen_random_uuid(), v_uid, v_uid::text,
    jsonb_build_object('sub', v_uid::text, 'email', v_email),
    'email', now(), now(), now()
  );

  -- handle_new_user() already inserted the profile from metadata; enforce role.
  update public.users set role = 'super_admin', full_name = 'Platform Admin', is_active = true
  where id = v_uid;

  raise notice 'Seeded super admin % (password: %). CHANGE IT NOW.', v_email, v_password;
end $$;
