-- ═══════════════════════════════════════════════════════════════════════════
-- Teach AI for India — 0014 Self-signup requests (admin-approval gated)
--
-- Public /signup lets NIAT students request an account. NOTHING lands in the
-- app tables (public.users) until an admin approves — the request sits in
-- signup_requests, admins get notified, and only on approval is the profile
-- materialised. Credentials live in Supabase Auth the whole time.
--
-- The auth.users row is created up-front (so the applicant sets their own
-- password), but handle_new_user() is patched below to SKIP mirroring it into
-- public.users while the 'pending_approval' metadata flag is set. Approval
-- inserts the profile; rejection deletes the inert auth user.
-- ═══════════════════════════════════════════════════════════════════════════

-- Students carry their NIAT student ID onto their profile.
alter table users add column if not exists niat_id text;
comment on column users.niat_id is 'NIAT student ID captured at self-signup (PRD §7.2 self-registration).';

create table signup_requests (
  id           uuid primary key default gen_random_uuid(),
  auth_user_id uuid,                                   -- inert auth.users id, promoted on approval
  full_name    text not null,
  niat_id      text not null,
  email        text not null,
  campus_id    uuid references campuses(id) on delete set null,
  status       text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reviewed_by  uuid references users(id) on delete set null,
  reviewed_at  timestamptz,
  created_at   timestamptz not null default now()
);
comment on table signup_requests is 'Public /signup account requests. admin approves → public.users profile is created (PRD §7.2).';

-- One live request per email; approved/rejected rows don't block a re-apply.
create unique index idx_signup_requests_pending_email on signup_requests (lower(email)) where status = 'pending';
create index idx_signup_requests_status on signup_requests (status, created_at desc);

-- RLS: applicants submit (via trusted server action / anon), admins manage.
alter table signup_requests enable row level security;

grant insert on signup_requests to anon, authenticated;
grant select, update, delete on signup_requests to authenticated;

create policy signup_requests_insert on signup_requests for insert to anon, authenticated with check ( true );
create policy signup_requests_read   on signup_requests for select to authenticated using ( is_admin() );
create policy signup_requests_manage on signup_requests for update to authenticated using ( is_admin() ) with check ( is_admin() );

-- ─── Patch: don't auto-mirror pending self-signups into public.users ─────────
-- Invited users (no flag) still mirror immediately as before.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  -- Self-signups awaiting admin approval stay OUT of public.users until approved.
  if coalesce(new.raw_user_meta_data->>'pending_approval', '') = 'true' then
    return new;
  end if;

  insert into public.users (id, email, full_name, role, campus_id, invited_at)
  values (
    new.id,
    new.email,
    coalesce(nullif(new.raw_user_meta_data->>'full_name',''), split_part(new.email,'@',1)),
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'volunteer'),
    nullif(new.raw_user_meta_data->>'campus_id','')::uuid,
    now()
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
