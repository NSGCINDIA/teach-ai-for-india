# Bootstrapping the first Super Admin

The platform needs at least one `super_admin` before anyone can log in and invite
the rest of the team. PRD §19.1 requires **at least two** super admins in
production at all times.

Migration `supabase/migrations/0007_seed_admin.sql` no longer ships a default
password. Earlier revisions of that file hardcoded one, which meant any reader of
this repository held super-admin credentials for every environment where the
migration had run and the password was never rotated. The password is now
supplied by the operator at run time and never committed.

## Option A — Supabase Dashboard (recommended)

1. **Authentication → Users → Add user.** Use a real address you control and a
   strong, unique password. Tick *Auto Confirm User*.
2. In **SQL Editor**, promote the account:

   ```sql
   update public.users
      set role = 'super_admin', is_active = true
    where email = 'you@example.org';
   ```

3. Sign in and invite the second super admin from **Admin → Volunteers**.

This route never puts a password into a file, a shell history, or a server log.

## Option B — Run the bootstrap migration with a supplied password

Only useful for a brand-new environment where you want everything applied in one
pass. Run this in the **SQL Editor**, in a single execution so the `set local`
stays in scope:

```sql
begin;
set local app.bootstrap_admin_email    = 'you@example.org';   -- optional
set local app.bootstrap_admin_password = '<strong unique password>';
-- paste the body of supabase/migrations/0007_seed_admin.sql here
commit;
```

Behaviour:

- No `app.bootstrap_admin_password` set → the block is a **documented no-op**, so
  `supabase db push` stays safe to run unattended.
- Password shorter than 12 characters → raises an exception rather than creating
  a weak super admin.
- The account already exists → skips, so the migration stays idempotent.
- The password is **never** echoed into the Postgres log.

## After bootstrapping

1. Sign in and confirm the account shows as **Super Admin**.
2. Create the **second** super admin (PRD §19.1).
3. Rotate the bootstrap password if it was ever typed into a shared terminal.

## If you are auditing an existing environment

Environments migrated before this change may still carry the old default
credential. Check whether `ChangeMe!2026` still authenticates
`admin@teachaiforindia.org`; if it does, rotate it immediately and audit
`public.audit_log` for unexpected sessions.
