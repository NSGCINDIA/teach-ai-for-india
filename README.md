# Teach AI for India

The digital operating system for India's student-led AI-literacy movement —
outreach CRM, session reporting, reimbursements, evidence vault, and management
analytics in one role-aware platform. Built strictly to **PRD v2.0**.

> Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4 · shadcn/ui ·
> Framer Motion · Supabase (Auth/DB/Storage/RLS) · TanStack Query · Resend · Vercel

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in Supabase + Resend keys
npm run dev                  # http://localhost:3000
```

The public site renders **without** Supabase configured (impact numbers fall back
to last-known-good values, auth/middleware no-op). Dashboards need a real project.

### Backend setup

Apply the SQL migrations in order — see **[`supabase/README.md`](supabase/README.md)**.
They create every table, enum, index, trigger, RLS policy, view, and seed data
(9 campuses, CMS blocks, a bootstrap super admin). Then set the env vars below.

### Environment variables (`.env.local`)

| Var | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser + server clients (RLS-protected) |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only privileged ops (invites). Never `NEXT_PUBLIC_` |
| `RESEND_API_KEY` / `EMAIL_FROM` | Transactional email (PRD §11) |
| `NEXT_PUBLIC_SITE_URL` | Invite / reset link base URL |

## Architecture (feature-first)

```
app/            App Router routes
  (public)/     Public website (ISR) — home, about, impact, campuses, gallery, …
  login, forgot-password, reset-password, accept-invite, auth/callback
  dashboard/    Team dashboard (role-guarded)
  admin/        Admin panel (admin/viewer-guarded)
actions/        Server actions (auth, …)
components/
  shared/       Cross-app components (StatusBadge, MetricCard, ProgressRing, …)
  marketing/    Public-site sections
  dashboard/    App chrome (sidebar, sign-out)
  ui/           shadcn primitives (brand-tokenized)
lib/
  supabase/     client · server · admin · middleware
  auth/         rbac (7-role matrix) · roles · user helpers
  data/         public data access (graceful degradation)
  email/        Resend
  constants/    status metadata
types/          database.ts (Database type) + domain types
supabase/       migrations/*.sql + README
middleware.ts   session refresh + route protection + role routing
```

## Roles (PRD §7.2)

`super_admin · mgmt_admin · campus_lead · outreach_head · exec_lead · volunteer ·
school_poc · viewer`. Enforced in **Supabase RLS** (source of truth) and mirrored
in `lib/auth/rbac.ts` for UI/route gating. No public self-registration — accounts
are invite-only.

## Build phases

- **Phase 1 ✅** — project structure, design system, auth + invite + role routing,
  full public website, complete database (schema/RLS/triggers/views/seed).
- **Phase 2** — School CRM, sessions, reimbursements, admin panel, notifications.
- **Phase 3** — Analytics tiers, CMS, evidence vault, audit logs, exports.
- **Phase 4+** — Scale, partner portal, PWA (PRD §14).

## Verify

```bash
npx tsc --noEmit
npm run build
```
