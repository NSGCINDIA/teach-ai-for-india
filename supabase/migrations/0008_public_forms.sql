-- ═══════════════════════════════════════════════════════════════════════════
-- Teach AI for India — 0008 Public forms
-- Volunteer applications (/join → DB) and contact messages (/contact).
-- Anyone (anon) may INSERT; only admins may read/manage (PRD §7.1).
-- ═══════════════════════════════════════════════════════════════════════════

create type application_status as enum ('new', 'reviewing', 'invited', 'rejected');

create table volunteer_applications (
  id           uuid primary key default gen_random_uuid(),
  full_name    text not null,
  email        text not null,
  phone        text,
  campus_slug  text,                                   -- preferred campus (free text / slug)
  motivation   text,
  status       application_status not null default 'new',
  reviewed_by  uuid references users(id) on delete set null,
  created_at   timestamptz not null default now()
);
comment on table volunteer_applications is 'Public /join volunteer applications. anon insert; admin read (PRD §7.1).';

create table contact_messages (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text not null,
  subject    text,
  message    text not null,
  is_handled boolean not null default false,
  created_at timestamptz not null default now()
);
comment on table contact_messages is 'Public /contact form submissions. anon insert; admin read (PRD §7.1).';

create index idx_applications_status on volunteer_applications (status, created_at desc);

-- RLS: public can submit, admins manage.
alter table volunteer_applications enable row level security;
alter table contact_messages       enable row level security;

grant insert on volunteer_applications, contact_messages to anon, authenticated;
grant select, update, delete on volunteer_applications, contact_messages to authenticated;

create policy applications_insert on volunteer_applications for insert to anon, authenticated with check ( true );
create policy applications_read   on volunteer_applications for select to authenticated using ( is_admin() or auth_role() = 'campus_lead' );
create policy applications_manage on volunteer_applications for update to authenticated using ( is_admin() or auth_role() = 'campus_lead' ) with check ( is_admin() or auth_role() = 'campus_lead' );

create policy contact_insert on contact_messages for insert to anon, authenticated with check ( true );
create policy contact_read   on contact_messages for select to authenticated using ( is_admin() );
create policy contact_manage on contact_messages for update to authenticated using ( is_admin() ) with check ( is_admin() );
