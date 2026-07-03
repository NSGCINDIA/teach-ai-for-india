-- ═══════════════════════════════════════════════════════════════════════════
-- Teach AI for India — 0021 Signup rate limiting (issue #9)
--
-- Throttles the public, unauthenticated /signup endpoint to 5 attempts per IP
-- per rolling 24h. Every attempt (including ones that fail validation) is
-- logged here BEFORE any auth user / signup_requests row is created, so the
-- limit can't be bypassed by intentionally failing validation. Only the
-- service role (which bypasses RLS) reads/writes this table from the server
-- action — RLS is enabled with no policies so anon/authenticated cannot touch
-- it directly.
-- ═══════════════════════════════════════════════════════════════════════════

create table if not exists signup_attempts (
  id          bigint generated always as identity primary key,
  ip_address  text not null,
  created_at  timestamptz not null default now()
);

-- Window queries filter by ip + recent created_at.
create index if not exists signup_attempts_ip_time_idx
  on signup_attempts (ip_address, created_at desc);

alter table signup_attempts enable row level security;
-- No policies on purpose: only the service-role client (server action) uses it.
