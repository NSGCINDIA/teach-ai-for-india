-- ═══════════════════════════════════════════════════════════════════════════
-- Teach AI for India — 0035 Drop mgmt_admin/school_poc/viewer from user_role
--
-- 0033 removed every application-layer reference to these 3 roles but left
-- them dormant in the enum (Postgres has no ALTER TYPE ... DROP VALUE). The
-- Supabase Studio table editor still lists them in the role dropdown, which
-- is confusing when picking a role for a user — so this migration actually
-- rebuilds the enum without them.
--
-- Removing enum values requires: rename the old type out of the way, create
-- a new user_role with the values we want, repoint every dependent object at
-- it, then drop the old type. The two RLS helper functions (auth_role(),
-- is_admin()) and every RLS policy that calls them are dependents — dropping
-- auth_role() to rebuild its return type cascades through all of them. Rather
-- than hand-transcribe ~50 policies (a transcription slip here is a security
-- hole), this migration captures every affected policy's exact definition
-- from pg_policies, drops them, does the type swap, then replays them
-- verbatim from the capture. Function/view grants aren't restated: Supabase's
-- default privileges on the public schema (see pg_default_acl) reapply the
-- same anon/authenticated/service_role grants automatically on CREATE.
--
-- Verified against the live database before writing this migration: exactly
-- one column (users.role) and one view (public_campus_team) reference the
-- enum type directly, and 52 policies across public + storage.objects call
-- auth_role()/is_admin(). Zero users currently hold any of the 3 roles being
-- removed (also enforced below as a runtime guard).
-- ═══════════════════════════════════════════════════════════════════════════

begin;

do $$
begin
  if exists (
    select 1 from public.users where role::text in ('mgmt_admin', 'school_poc', 'viewer')
  ) then
    raise exception 'Cannot drop deprecated role values: at least one user still holds one of them';
  end if;
end $$;

-- ─── Capture every policy that depends on auth_role()/is_admin() ───────────
-- (auth_role()'s return type must be rebuilt; is_admin() calls it, so
-- dropping auth_role() cascades through every policy that calls either.)

create temporary table _role_migration_policies as
select schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
from pg_policies
where schemaname in ('public', 'storage')
  and (
    coalesce(qual, '') ilike '%auth_role%' or coalesce(qual, '') ilike '%is_admin%'
    or coalesce(with_check, '') ilike '%auth_role%' or coalesce(with_check, '') ilike '%is_admin%'
  );

do $$
declare
  pol record;
begin
  for pol in select * from _role_migration_policies loop
    execute format('drop policy %I on %I.%I', pol.policyname, pol.schemaname, pol.tablename);
  end loop;
end $$;

-- ─── Drop the one view that references the enum directly ───────────────────

drop view public.public_campus_team;

-- ─── Drop auth_role() — cascades to is_admin(), its only remaining dependent ─

drop function public.auth_role() cascade;

-- ─── Rebuild the enum without mgmt_admin/school_poc/viewer ─────────────────

alter type public.user_role rename to user_role_old;

create type public.user_role as enum (
  'super_admin', 'campus_lead', 'outreach_lead', 'exec_lead',
  'volunteer', 'volunteer_lead', 'campus_mgmt_admin', 'finance_lead'
);

alter table public.users alter column role drop default;
alter table public.users
  alter column role type public.user_role using role::text::public.user_role;
alter table public.users alter column role set default 'volunteer'::public.user_role;

drop type public.user_role_old;

-- ─── Recreate the two RLS helper functions, byte-for-byte, now bound to the
-- rebuilt enum ────────────────────────────────────────────────────────────

create or replace function public.auth_role()
returns user_role language sql stable security definer set search_path = public as $$
  select role from public.users where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(public.auth_role() = 'super_admin', false);
$$;

-- ─── Recreate the view ──────────────────────────────────────────────────────

create view public.public_campus_team as
select id, campus_id, full_name, role, avatar_url
from public.users u
where is_active
  and role = any (array['campus_lead', 'outreach_lead', 'exec_lead', 'volunteer']::user_role[]);

-- ─── Replay every captured policy verbatim ─────────────────────────────────

do $$
declare
  pol  record;
  stmt text;
begin
  for pol in select * from _role_migration_policies loop
    stmt := format(
      'create policy %I on %I.%I as %s for %s to %s',
      pol.policyname, pol.schemaname, pol.tablename,
      pol.permissive, pol.cmd, array_to_string(pol.roles, ', ')
    );
    if pol.qual is not null then
      stmt := stmt || format(' using (%s)', pol.qual);
    end if;
    if pol.with_check is not null then
      stmt := stmt || format(' with check (%s)', pol.with_check);
    end if;
    execute stmt;
  end loop;
end $$;

drop table _role_migration_policies;

commit;
