-- ═══════════════════════════════════════════════════════════════════════════
-- Teach AI for India — 0018 Team workspace (Team Dashboard PRD Phase 4)
--
-- The remaining campus-workspace surfaces:
--   • Announcements  — leads broadcast to their campus (or admins, org-wide).
--   • Availability   — volunteers mark which dates they can help; leads read it
--                      to inform assignment (Phase 3).
--   • Certificates   — leads issue recognition to volunteers; issuing notifies
--                      the volunteer via notify_user().
--
-- The Calendar surface needs no new table — it reads scheduled `sessions`.
-- ═══════════════════════════════════════════════════════════════════════════

create type availability_status as enum ('available', 'unavailable', 'tentative');
create type certificate_kind    as enum ('participation', 'milestone', 'excellence', 'completion');

-- ─── announcements ───────────────────────────────────────────────────────────
create table announcements (
  id         uuid primary key default gen_random_uuid(),
  campus_id  uuid references campuses(id) on delete cascade,   -- NULL = org-wide
  title      text not null,
  body       text not null,
  pinned     boolean not null default false,
  posted_by  uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
comment on table announcements is 'Campus / org-wide broadcasts to the team (Team Dashboard PRD Phase 4).';
create index announcements_campus_idx on announcements (campus_id);

create trigger trg_announcements_updated
  before update on announcements for each row execute function public.touch_updated_at();

-- ─── volunteer_availability ──────────────────────────────────────────────────
create table volunteer_availability (
  id           uuid primary key default gen_random_uuid(),
  volunteer_id uuid not null references users(id) on delete cascade,
  campus_id    uuid references campuses(id) on delete set null,
  date         date not null,
  status       availability_status not null default 'available',
  note         text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (volunteer_id, date)
);
comment on table volunteer_availability is 'Per-date volunteer availability; informs assignment (Team Dashboard PRD Phase 4).';
create index volunteer_availability_campus_date_idx on volunteer_availability (campus_id, date);

create trigger trg_availability_updated
  before update on volunteer_availability for each row execute function public.touch_updated_at();

-- Stamp campus_id from the volunteer's profile so leads' campus reads resolve.
create or replace function public.set_availability_campus()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.campus_id is null then
    select campus_id into new.campus_id from users where id = new.volunteer_id;
  end if;
  return new;
end;
$$;

create trigger trg_availability_campus
  before insert or update on volunteer_availability
  for each row execute function public.set_availability_campus();

-- ─── certificates ────────────────────────────────────────────────────────────
create sequence if not exists certificate_serial_seq;

create table certificates (
  id             uuid primary key default gen_random_uuid(),
  volunteer_id   uuid not null references users(id) on delete cascade,
  campus_id      uuid references campuses(id) on delete set null,
  kind           certificate_kind not null default 'participation',
  title          text not null,
  description    text,
  sessions_count int,
  serial         text unique,                    -- CERT-2026-00001 (trigger)
  issued_by      uuid references users(id) on delete set null,
  issued_at      timestamptz not null default now(),
  created_at     timestamptz not null default now()
);
comment on table certificates is 'Recognition issued to volunteers; printable (Team Dashboard PRD Phase 4).';
create index certificates_volunteer_idx on certificates (volunteer_id);
create index certificates_campus_idx    on certificates (campus_id);

-- Serial number + campus stamp on insert.
create or replace function public.set_certificate_defaults()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.serial is null then
    new.serial := 'CERT-' || to_char(coalesce(new.issued_at, now()), 'YYYY') || '-'
                  || lpad(nextval('certificate_serial_seq')::text, 5, '0');
  end if;
  if new.campus_id is null then
    select campus_id into new.campus_id from users where id = new.volunteer_id;
  end if;
  return new;
end;
$$;

create trigger trg_certificate_defaults
  before insert on certificates for each row execute function public.set_certificate_defaults();

-- Notify the volunteer when a certificate is issued (reuses notify_user, 0002).
create or replace function public.notify_certificate_issued()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform notify_user(
    new.volunteer_id,
    'certificate_issued',
    'You''ve earned a certificate: ' || new.title,
    'A ' || replace(new.kind::text, '_', ' ') || ' certificate has been issued to you.',
    '/dashboard/certificates',
    'certificate',
    new.id
  );
  return new;
end;
$$;

create trigger trg_certificate_notify
  after insert on certificates for each row execute function public.notify_certificate_issued();

-- ─── RLS ─────────────────────────────────────────────────────────────────────
alter table announcements           enable row level security;
alter table volunteer_availability  enable row level security;
alter table certificates            enable row level security;

-- Announcements: everyone sees org-wide + their campus; leads post to their own
-- campus; only admins post org-wide (campus_id NULL).
create policy announcements_select on announcements for select to authenticated
  using (campus_id is null or is_admin() or campus_id = auth_campus());

create policy announcements_write on announcements for all to authenticated
  using (
    is_admin()
    or (auth_role() in ('campus_lead','outreach_head','exec_lead','volunteer_lead')
        and campus_id = auth_campus())
  )
  with check (
    is_admin()
    or (auth_role() in ('campus_lead','outreach_head','exec_lead','volunteer_lead')
        and campus_id is not null and campus_id = auth_campus())
  );

-- Availability: the volunteer owns their rows; campus leadership reads the campus.
create policy availability_select on volunteer_availability for select to authenticated
  using (
    volunteer_id = auth.uid()
    or is_admin()
    or (auth_role() in ('campus_lead','volunteer_lead','exec_lead') and campus_id = auth_campus())
  );

create policy availability_write on volunteer_availability for all to authenticated
  using (volunteer_id = auth.uid() or is_admin())
  with check (volunteer_id = auth.uid() or is_admin());

-- Certificates: the volunteer reads their own; campus leadership reads + issues.
create policy certificates_select on certificates for select to authenticated
  using (
    volunteer_id = auth.uid()
    or is_admin()
    or (auth_role() in ('campus_lead','volunteer_lead','exec_lead') and campus_id = auth_campus())
  );

create policy certificates_write on certificates for all to authenticated
  using (
    is_admin()
    or (auth_role() in ('campus_lead','volunteer_lead') and campus_id = auth_campus())
  )
  with check (
    is_admin()
    or (auth_role() in ('campus_lead','volunteer_lead') and campus_id = auth_campus())
  );
