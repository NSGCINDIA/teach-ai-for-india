-- ═══════════════════════════════════════════════════════════════════════════
-- Teach AI for India — 0044 Enforce one active Campus Lead per campus
--
-- A campus should have exactly one Campus Lead at a time. This guards every
-- path that can grant the role — admin role change (changeUserRole, an
-- UPDATE), self-signup approval (approveSignup, an INSERT), and invite
-- acceptance (handle_new_user's INSERT) — with a single BEFORE INSERT OR
-- UPDATE trigger on public.users, so the app-side actions don't each need
-- their own duplicate check.
-- ═══════════════════════════════════════════════════════════════════════════

create or replace function public.enforce_single_campus_lead()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.role = 'campus_lead' and new.campus_id is not null and new.is_active then
    if exists (
      select 1 from public.users
       where role = 'campus_lead'
         and campus_id = new.campus_id
         and is_active
         and id <> new.id
    ) then
      raise exception 'For 1 campus there should be only 1 campus_lead' using errcode = '23514';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_users_single_campus_lead on public.users;
create trigger trg_users_single_campus_lead
  before insert or update on public.users
  for each row
  when (new.role = 'campus_lead')
  execute function enforce_single_campus_lead();
