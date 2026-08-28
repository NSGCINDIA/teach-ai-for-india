# Supabase — Database & Backend

This folder is the **source of truth for the database** (PRD §9, §10, §13.3). Every
table maps 1:1 to the PRD data model and carries a descriptive `COMMENT` (PRD §19.4).

## Apply the migrations

Run them **in order** against your Supabase project.

### Option A — Supabase SQL Editor (fastest to start)
Open each file in order and run it:

```
0001_schema.sql            enums, tables, indexes
0002_functions_triggers.sql  auth bridge, RLS helpers, auto-increment, RPCs
0003_rls.sql               Row Level Security for every table (role matrix §7.2)
0004_storage.sql           evidence + public-assets buckets & policies
0005_views.sql             public + operational analytics views
0006_seed.sql              9 campuses + CMS content blocks
0007_seed_admin.sql        bootstrap super admin (no-op unless you supply a
                           password — see docs/ADMIN_BOOTSTRAP.md)
```

### Option B — Supabase CLI
```bash
supabase link --project-ref <your-ref>
supabase db push        # applies supabase/migrations/*
```

## After applying

1. **Set env vars** — copy `.env.example` → `.env.local` and fill in
   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
   `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`.
2. **Bootstrap the first super admin** — follow
   [`docs/ADMIN_BOOTSTRAP.md`](../docs/ADMIN_BOOTSTRAP.md). `0007` deliberately
   creates nothing on its own; no default password ships in this repository.
3. **Create a 2nd super admin** (PRD §19.1 requires ≥2 at all times).

## Design notes

- `public.users.id == auth.users.id`. A trigger (`handle_new_user`) mirrors every
  Supabase Auth user into `public.users`, reading `full_name` / `role` / `campus_id`
  from the invite metadata.
- RLS helper functions (`auth_role()`, `auth_campus()`, `is_admin()`, …) are
  `SECURITY DEFINER` to avoid policy recursion on the `users` table.
- State-machine transitions that must be atomic + audited (e.g. school status) are
  exposed as RPCs (`change_school_status`) rather than raw updates.
- Append-only tables (`school_status_history`, `audit_log`) deliberately have **no**
  update/delete policies (PRD §13.3).

## Auth session policy (PRD §7.2)

- **JWT 8h / refresh 30d**: set in `config.toml` (`[auth] jwt_expiry = 28800`,
  `[auth.sessions] timebox = "720h"`). config.toml only applies to the Supabase
  **CLI**; for the **hosted** project set the same values in the dashboard under
  *Authentication → Sessions* (Time-box = 30 days) and *→ JWT* (Expiry = 28800s).
  This is the one remaining step that cannot be done from code.
- **Force-logout on role change / deactivation** is enforced in code, not via
  token revocation:
  - Authorization never trusts JWT claims — `middleware`/`getSessionUser` read
    the role **fresh from `public.users` on every request**, so a role change
    takes effect on the very next request (no stale-permission window).
  - **Deactivation** (`is_active = false`) signs the user out on their next
    request — enforced in both the proxy middleware and `requireUser()`
    (defense-in-depth, so server actions also reject inactive users).

## Duplicate version numbers — read before adding a migration

Five version numbers were each used twice:

| Version | Files, in the order a filename sort applies them |
| --- | --- |
| `0035` | `0035_drop_deprecated_role_enum_values.sql`, then `0035_signup_requests_phone.sql` |
| `0041` | `0041_gate_outreach_visit_request_by_school_status.sql`, then `0041_outreach_visit_request_drives_pipeline.sql` |
| `0042` | `0042_retire_outreach_requests.sql`, then `0042_self_heal_stale_outreach_visit_requests.sql` |
| `0061` | `0061_fix_school_execution_plans_total_budget.sql`, then `0061_visit_request_notify_campus_lead_admin_mgmt.sql` |
| `0066` | `0066_finance_lead_school_read_access.sql`, then `0066_fix_session_delivery_and_verification.sql` |

**They are deliberately not renamed.** These versions are already recorded in
`supabase_migrations.schema_migrations` in every environment that has run them.
Renaming a file changes the version the CLI derives from it, so the new name
looks like an unapplied migration and the old one looks like a migration that
vanished — turning a cosmetic problem into a real one.

`supabase db push` orders by filename, which is deterministic, so a fresh
environment applies each pair in the order above and reproduces production.
The residual risk is only for environments where these files were pasted into
the SQL Editor by hand in a different order; if you maintain one, verify the
objects each pair touches before trusting it.

**When adding a new migration, take the next free version number** — check the
highest existing one first. Do not reuse.
