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
0007_seed_admin.sql        bootstrap super admin (CHANGE THE PASSWORD)
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
2. **Log in** with the seeded admin (`admin@teachaiforindia.org`) and change the password.
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
