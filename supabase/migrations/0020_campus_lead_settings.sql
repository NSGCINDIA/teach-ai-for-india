-- ═══════════════════════════════════════════════════════════════════════════
-- Teach AI for India — 0020 Campus Lead self-service settings
--
-- /dashboard/settings (Team Dashboard PRD follow-up) lets a Campus Lead edit
-- their own campus's public-facing profile copy (description, hero image).
-- Everything else on `campuses` (name, slug, targets, lead assignment,
-- is_active) stays admin-only via the existing `campuses_write` policy.
--
-- RLS `with check` can't diff OLD vs NEW or restrict individual columns, so —
-- same shape as 0009's `enforce_user_privileged_changes` — we add a policy
-- that lets a campus_lead UPDATE their own campus row, and a trigger that
-- rejects the update unless only `description`/`hero_image_url` changed.
-- ═══════════════════════════════════════════════════════════════════════════

create policy campuses_lead_update on campuses for update to authenticated
  using ( auth_role() = 'campus_lead' and id = auth_campus() )
  with check ( auth_role() = 'campus_lead' and id = auth_campus() );

create or replace function public.enforce_campus_lead_settings_scope()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  actor uuid := auth.uid();
begin
  -- No authenticated end-user in context → trusted server-side path. Allow.
  if actor is null or public.is_admin() then
    return new;
  end if;

  if new.name is distinct from old.name
     or new.university_name is distinct from old.university_name
     or new.city is distinct from old.city
     or new.state is distinct from old.state
     or new.slug is distinct from old.slug
     or new.lead_user_id is distinct from old.lead_user_id
     or new.is_active is distinct from old.is_active
     or new.target_schools is distinct from old.target_schools
     or new.target_students is distinct from old.target_students
     or new.target_sessions is distinct from old.target_sessions
     or new.quarter is distinct from old.quarter
  then
    raise exception 'Campus leads may only edit the description and hero image'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_campuses_lead_settings_scope on public.campuses;
create trigger trg_campuses_lead_settings_scope
  before update on public.campuses
  for each row execute function public.enforce_campus_lead_settings_scope();
