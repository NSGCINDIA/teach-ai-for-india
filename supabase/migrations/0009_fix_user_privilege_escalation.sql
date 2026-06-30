-- ═══════════════════════════════════════════════════════════════════════════
-- Teach AI for India — 0009 Fix: user privilege-escalation
--
-- The 0003 `users_update` policy allows `id = auth.uid()`, so a user could
-- update their OWN row — including the `role` column — and self-escalate to
-- super_admin. RLS WITH CHECK can't compare OLD vs NEW or restrict columns, so
-- we guard the privileged columns (role, campus_id, is_active) with a trigger.
--
-- PRD §7.2 "Manage user roles": Super Admin ✅, Management Admin ❌,
-- Campus Lead ✅ (own campus only), everyone else ❌.
-- ═══════════════════════════════════════════════════════════════════════════

create or replace function public.enforce_user_privileged_changes()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  actor uuid := auth.uid();
  actor_role user_role;
  actor_campus uuid;
begin
  -- Only police updates that actually touch a privileged column.
  if new.role is not distinct from old.role
     and new.campus_id is not distinct from old.campus_id
     and new.is_active is not distinct from old.is_active then
    return new;
  end if;

  -- No authenticated end-user in context → trusted server-side path
  -- (service-role API calls, SQL migrations/seeds run as postgres). Allow.
  if actor is null then
    return new;
  end if;

  select role, campus_id into actor_role, actor_campus
    from public.users where id = actor;

  -- Super Admin may change any of these on anyone.
  if actor_role = 'super_admin' then
    return new;
  end if;

  -- Campus Lead may manage users within their OWN campus, but may not move a
  -- user to a different campus nor grant an admin role.
  if actor_role = 'campus_lead'
     and actor_campus is not null
     and old.campus_id is not distinct from actor_campus
     and new.campus_id is not distinct from old.campus_id then
    if new.role in ('super_admin', 'mgmt_admin') then
      raise exception 'Campus leads cannot assign admin roles' using errcode = '42501';
    end if;
    return new;
  end if;

  raise exception 'Insufficient privilege to change role, campus, or active status'
    using errcode = '42501';
end;
$$;

drop trigger if exists trg_users_privileged on public.users;
create trigger trg_users_privileged
  before update on public.users
  for each row execute function public.enforce_user_privileged_changes();
