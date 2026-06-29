-- ═══════════════════════════════════════════════════════════════════════════
-- Teach AI for India — 0001 Schema
-- Enums, tables, indexes. Maps 1:1 to PRD §9 (Data Model and Schema).
--
-- Conventions
--   • public.users.id == auth.users.id (Supabase Auth is the identity source).
--   • Every table has a descriptive COMMENT (PRD §19.4 continuity requirement).
--   • RLS is enabled in 0003_rls.sql — NO table is left publicly accessible.
-- ═══════════════════════════════════════════════════════════════════════════

create extension if not exists "pgcrypto";   -- gen_random_uuid()
create extension if not exists "pg_trgm";     -- fuzzy school-name matching (CRM conflict detection)

-- ─── Enums ──────────────────────────────────────────────────────────────────

create type user_role as enum (
  'super_admin', 'mgmt_admin', 'campus_lead', 'outreach_head',
  'exec_lead', 'volunteer', 'school_poc', 'viewer'
);

create type school_type as enum ('government', 'government_aided', 'private');
create type board_type  as enum ('state', 'cbse', 'icse', 'other');

create type school_status as enum (
  'lead_identified', 'contacted', 'followup_pending', 'approval_requested',
  'approval_received', 'session_scheduled', 'session_in_progress',
  'completed', 'archived'
);

create type session_type as enum (
  'awareness', 'hands_on', 'prompt_writing', 'ethics_safety',
  'application_project', 'followup'
);

create type session_status as enum (
  'planned', 'in_progress', 'reported', 'campus_approved', 'verified', 'cancelled'
);

create type attendance_status as enum ('present', 'absent', 'late', 'left_early');

create type reimbursement_status as enum (
  'draft', 'submitted', 'under_review', 'approved', 'rejected', 'paid'
);

create type travel_mode as enum ('auto', 'bus', 'cab', 'train', 'own_vehicle', 'other');

create type media_file_type as enum (
  'photo', 'video', 'document', 'receipt', 'letter', 'presentation', 'other'
);

create type approval_status as enum ('pending', 'approved', 'rejected');
create type media_entity_type as enum ('session', 'school', 'campus', 'reimbursement');

-- ─── campuses ─────────────────────────────────────────────────────────────────

create table campuses (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,                         -- "GRIET"
  university_name text not null,                         -- "Gokaraju Rangaraju Institute"
  city            text not null,
  state           text not null,
  slug            text unique not null,                  -- /campuses/griet
  lead_user_id    uuid,                                  -- FK added after users exists
  is_active       boolean not null default true,
  target_schools  int not null default 0,
  target_students int not null default 0,
  target_sessions int not null default 0,
  quarter         text,                                  -- "Q3-2026"
  description     text,
  hero_image_url  text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
comment on table campuses is 'Participating universities (GRIET, CBIT, ...). Has many users and schools.';

-- ─── users (public profile mirrored from auth.users) ─────────────────────────

create table users (
  id            uuid primary key references auth.users(id) on delete cascade,
  email         text unique not null,
  full_name     text not null,
  phone         text,
  role          user_role not null default 'volunteer',
  campus_id     uuid references campuses(id) on delete set null,
  avatar_url    text,
  is_active     boolean not null default true,
  invited_by    uuid references users(id) on delete set null,
  invited_at    timestamptz,
  last_login_at timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
comment on table users is 'Team member profiles. id mirrors auth.users.id. Role drives RLS (PRD §7.2).';

alter table campuses
  add constraint campuses_lead_user_id_fkey
  foreign key (lead_user_id) references users(id) on delete set null;

-- ─── schools (the core CRM entity) ────────────────────────────────────────────

create table schools (
  id                   uuid primary key default gen_random_uuid(),
  name                 text not null,
  school_type          school_type not null default 'government',
  board                board_type not null default 'state',
  state                text not null,
  district             text not null,
  cluster              text,
  mandal               text,
  address              text,
  dise_code            text,
  campus_id            uuid references campuses(id) on delete set null,
  outreach_lead_id     uuid references users(id) on delete set null,
  status               school_status not null default 'lead_identified',
  next_action_date     date,
  notes                text,
  total_sessions       int not null default 0,
  total_students       int not null default 0,
  is_duplicate_flagged boolean not null default false,
  created_by           uuid references users(id) on delete set null,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);
comment on table schools is 'Government schools in the outreach CRM. Pipeline status per PRD §10.1.';

create table school_contacts (
  id          uuid primary key default gen_random_uuid(),
  school_id   uuid not null references schools(id) on delete cascade,
  name        text not null,
  designation text not null,                  -- "Principal"
  phone       text,
  email       text,
  whatsapp    text,
  is_primary  boolean not null default false,
  created_at  timestamptz not null default now()
);
comment on table school_contacts is 'Principal / office contacts for a school (PRD §7.3 Contact layer).';

create table school_status_history (
  id              uuid primary key default gen_random_uuid(),
  school_id       uuid not null references schools(id) on delete cascade,
  previous_status text,
  new_status      text not null,
  changed_by      uuid references users(id) on delete set null,
  note            text,
  created_at      timestamptz not null default now()
);
comment on table school_status_history is 'Immutable visit log of school status changes (PRD §7.3). Append-only via RLS.';

-- ─── sessions ─────────────────────────────────────────────────────────────────

create table sessions (
  id                  uuid primary key default gen_random_uuid(),
  school_id           uuid not null references schools(id) on delete cascade,
  campus_id           uuid references campuses(id) on delete set null,
  session_number      int not null,                       -- auto-incremented per school (trigger)
  session_type        session_type not null,
  date                date not null,
  start_time          time,
  end_time            time,
  duration_minutes    int,
  status              session_status not null default 'planned',
  topic               text not null,
  student_count       int,
  volunteer_count     int,
  team_members_present uuid[] default '{}',
  notes               text,
  challenges          text,
  next_steps          text,
  improvement_notes   text,
  -- type-specific payload (tools used, sample prompts, project desc, etc. — PRD §7.4)
  type_details        jsonb not null default '{}',
  previous_session_id uuid references sessions(id) on delete set null,
  created_by          uuid references users(id) on delete set null,
  reviewed_by         uuid references users(id) on delete set null,
  reviewed_at         timestamptz,
  verified_by         uuid references users(id) on delete set null,
  verified_at         timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  unique (school_id, session_number)
);
comment on table sessions is 'A team visit to a school. Lifecycle per PRD §10.3. session_number auto-incremented per school.';

create table attendance_records (
  id             uuid primary key default gen_random_uuid(),
  session_id     uuid not null references sessions(id) on delete cascade,
  user_id        uuid not null references users(id) on delete cascade,
  status         attendance_status not null default 'present',
  arrival_time   time,
  departure_time time,
  notes          text,
  marked_by      uuid references users(id) on delete set null,
  created_at     timestamptz not null default now(),
  unique (session_id, user_id)
);
comment on table attendance_records is 'Volunteer/team attendance per session — drives reimbursement eligibility (PRD §7.5).';

-- ─── reimbursements ───────────────────────────────────────────────────────────

create table reimbursements (
  id               uuid primary key default gen_random_uuid(),
  reference_number text unique not null,                  -- REIMB-2026-00042 (trigger)
  claimant_id      uuid not null references users(id) on delete cascade,
  session_id       uuid references sessions(id) on delete set null,
  campus_id        uuid references campuses(id) on delete set null,
  amount           numeric(10,2) not null check (amount >= 0),
  travel_mode      travel_mode not null default 'other',
  reason           text,
  claim_date       date not null,
  status           reimbursement_status not null default 'draft',
  reviewed_by      uuid references users(id) on delete set null,
  reviewed_at      timestamptz,
  reviewer_note    text,
  payment_date     date,
  payment_reference text,
  payment_method   text,
  anomaly_flags    text[] not null default '{}',
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
comment on table reimbursements is 'Volunteer travel claims. Lifecycle per PRD §10.2. Must link to a session.';

-- ─── media_assets (polymorphic evidence vault) ───────────────────────────────

create table media_assets (
  id              uuid primary key default gen_random_uuid(),
  storage_path    text not null,                          -- /{campus}/{school}/{session}/{type}/{file}
  file_name       text not null,
  file_type       media_file_type not null,
  mime_type       text,
  file_size_bytes bigint,
  entity_type     media_entity_type not null,
  entity_id       uuid not null,
  campus_id       uuid references campuses(id) on delete set null,
  school_id       uuid references schools(id) on delete set null,
  session_id      uuid references sessions(id) on delete set null,
  is_featured     boolean not null default false,
  is_public       boolean not null default false,         -- explicit admin action only (PRD §13.4)
  approval_status approval_status not null default 'pending',
  caption         text,
  uploaded_by     uuid references users(id) on delete set null,
  approved_by     uuid references users(id) on delete set null,
  deleted_at      timestamptz,                            -- soft delete (PRD §7.7)
  created_at      timestamptz not null default now()
);
comment on table media_assets is 'Evidence Vault: photos, videos, docs, receipts, letters. Polymorphic via entity_type/entity_id (PRD §7.7).';

-- ─── notifications ────────────────────────────────────────────────────────────

create table notifications (
  id           uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references users(id) on delete cascade,
  type         text not null,                             -- 'session_report_due', etc. (PRD §11)
  title        text not null,
  body         text,
  action_url   text,
  entity_type  text,
  entity_id    uuid,
  is_read      boolean not null default false,
  read_at      timestamptz,
  created_at   timestamptz not null default now()
);
comment on table notifications is 'In-app notification feed. Email fan-out handled by Resend (PRD §11).';

-- ─── content_blocks (CMS) ─────────────────────────────────────────────────────

create table content_blocks (
  id         uuid primary key default gen_random_uuid(),
  block_key  text unique not null,                        -- 'hero', 'mission', 'faq', ...
  content    jsonb not null default '{}',
  updated_by uuid references users(id) on delete set null,
  updated_at timestamptz not null default now()
);
comment on table content_blocks is 'CMS: one JSONB blob per public-site block (PRD §7.10). Editable from admin panel.';

-- ─── audit_log (append-only — PRD §13.3) ─────────────────────────────────────

create table audit_log (
  id          uuid primary key default gen_random_uuid(),
  actor_id    uuid references users(id) on delete set null,
  action      text not null,                              -- 'approve' | 'reject' | 'delete' | 'status_change' | ...
  entity_type text not null,
  entity_id   uuid,
  detail      jsonb not null default '{}',
  created_at  timestamptz not null default now()
);
comment on table audit_log is 'Append-only audit trail of approve/reject/delete/status actions (PRD §13.3). No update/delete allowed.';

-- ═══════════════════════════════════════════════════════════════════════════
-- Indexes — tuned for the hot paths (campus-scoped lists, CRM search, queues).
-- ═══════════════════════════════════════════════════════════════════════════

create index idx_users_campus            on users (campus_id);
create index idx_users_role              on users (role);

create index idx_schools_campus          on schools (campus_id);
create index idx_schools_status          on schools (status);
create index idx_schools_outreach_lead   on schools (outreach_lead_id);
create index idx_schools_district        on schools (district);
-- Fuzzy duplicate detection: same district + similar name (PRD §7.3 conflict prevention).
create index idx_schools_name_trgm       on schools using gin (lower(name) gin_trgm_ops);

create index idx_school_contacts_school  on school_contacts (school_id);
create index idx_school_history_school   on school_status_history (school_id, created_at desc);

create index idx_sessions_school         on sessions (school_id);
create index idx_sessions_campus         on sessions (campus_id);
create index idx_sessions_status         on sessions (status);
create index idx_sessions_date           on sessions (date desc);

create index idx_attendance_session      on attendance_records (session_id);
create index idx_attendance_user         on attendance_records (user_id);

create index idx_reimb_claimant          on reimbursements (claimant_id);
create index idx_reimb_campus            on reimbursements (campus_id);
create index idx_reimb_status            on reimbursements (status);
create index idx_reimb_session           on reimbursements (session_id);

create index idx_media_entity            on media_assets (entity_type, entity_id);
create index idx_media_campus            on media_assets (campus_id);
create index idx_media_public            on media_assets (is_public) where is_public = true;
create index idx_media_approval          on media_assets (approval_status);

create index idx_notif_recipient         on notifications (recipient_id, is_read, created_at desc);

create index idx_audit_entity            on audit_log (entity_type, entity_id);
create index idx_audit_actor             on audit_log (actor_id, created_at desc);
