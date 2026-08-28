# Teach AI for India

The digital operating system for India's student-led AI-literacy movement —
outreach CRM, session delivery, reimbursements, evidence vault and management
analytics in one role-aware platform, plus the public marketing site.

Student volunteers from university campuses across Telangana and Andhra Pradesh
run AI-literacy sessions in government schools. This platform manages that
operation end to end: finding schools, dual-approving visits and budgets,
planning and delivering sessions, capturing attendance and photo evidence,
reimbursing travel, and reporting impact.

> Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4 · shadcn/ui ·
> Framer Motion + GSAP/Lenis · Supabase (Auth/DB/Storage/RLS) · Resend · Vercel

## Getting started

This project uses **pnpm**. `pnpm-lock.yaml` is the lockfile Vercel resolves;
there is deliberately no `package-lock.json`.

```bash
pnpm install
cp .env.example .env.local   # fill in Supabase + Resend keys
pnpm dev                     # http://localhost:3000
```

The public site renders **without** Supabase configured — impact numbers fall
back to last-known-good values and auth/middleware no-op. The dashboards need a
real project.

### Scripts

| Script | What it does |
| --- | --- |
| `pnpm dev` | Development server |
| `pnpm build` | Production build. Type errors fail the build. |
| `pnpm start` | Serve the production build |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm lint` | ESLint (flat config, Next.js rules) |
| `pnpm test` | `node --test` over `lib/**/*.test.ts` |

CI runs all five on every push and pull request — see
[`.github/workflows/ci.yml`](.github/workflows/ci.yml).

### Backend setup

Apply the SQL migrations in order — see
**[`supabase/README.md`](supabase/README.md)**. They create every table, enum,
index, trigger, RLS policy, view and seed row (9 campuses, CMS blocks).

The first super admin is **not** seeded automatically and no default password
ships in this repository. Follow
[`docs/ADMIN_BOOTSTRAP.md`](docs/ADMIN_BOOTSTRAP.md).

### Environment variables (`.env.local`)

See [`.env.example`](.env.example) for the annotated template.

| Var | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | for auth | Browser + server clients (RLS-protected) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | for auth | Legacy anon key |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | optional | Newer key naming; takes precedence over the anon key when set |
| `SUPABASE_SERVICE_ROLE_KEY` | for invites | Server-only privileged ops. Never `NEXT_PUBLIC_` |
| `RESEND_API_KEY` | for email | Transactional email |
| `EMAIL_FROM` | for email | Sender identity |
| `ADMIN_NOTIFICATION_EMAIL` | optional | Where contact/volunteer form notifications go |
| `NEXT_PUBLIC_SITE_URL` | yes | Invite/reset link base and SEO `metadataBase` |
| `CRON_SECRET` | for cron | Shared secret for the scheduled job route, compared with `timingSafeEqual` |

## Architecture

Route → guard → data → presentation → action → database. The **database is the
enforcement layer** and the app mirrors it; `lib/auth/rbac.ts` is
defence-in-depth for UI and route gating, not the security boundary.

```
Route (server component)
  └─ requireAccess(path)     lib/auth/user.ts   → redirect /login or /403
  └─ lib/data/*.ts           reads via the RLS-scoped Supabase server client
  └─ components/*            presentation ('use client' pushed to leaves)
        └─ actions/*.ts      'use server' → requireUser() → zod → RPC/insert
              └─ Postgres    RLS + SECURITY DEFINER RPCs = real enforcement
```

```
app/                App Router routes
  (public)/         Public website (ISR) — home, about, impact, campuses, gallery, …
  login, signup, forgot-password, reset-password, accept-invite, auth/callback
  dashboard/        Team dashboard (role-guarded)
  admin/            Admin panel (super_admin only)
  api/              Route handlers (cron)
  error.tsx, global-error.tsx, not-found.tsx
actions/            Server actions — one file per domain
components/
  marketing/        Public-site sections
  dashboard/        App chrome (shell, overviews, page header)
  schools/ sessions/ finance/ evidence/ …   Feature panels
  shared/           Cross-app components (StatusBadge, MetricCard, states, …)
  ui/               shadcn primitives (brand-tokenized)
lib/
  supabase/         client · server · admin · middleware · env
  auth/             rbac (8-role matrix) · user helpers
  data/             read layer
  validations/      zod schemas + readiness gates
  security/         rate limiting, sanitizers
  email/            Resend
  constants/        status metadata
types/              database.ts (Database type)
supabase/           migrations/*.sql + README + runbooks
scripts/            test resolver hooks
proxy.ts            Session refresh + route protection + role routing
instrumentation.ts  Server-boot IPv4 fix for Supabase connections
```

`proxy.ts` is Next 16's middleware convention — the framework loads it by
filename. It is the entire route-protection layer.

## Roles

Eight roles, defined by the `user_role` enum in Postgres and mirrored in
`lib/auth/rbac.ts`:

`super_admin` · `campus_lead` · `outreach_lead` · `exec_lead` ·
`volunteer_lead` · `volunteer` · `campus_mgmt_admin` · `finance_lead`

Enforced in **Supabase RLS** (source of truth) and mirrored in `lib/auth/rbac.ts`
for UI and route gating.

**Accounts can be created two ways**: an admin invite, or public self-signup at
`/signup`, which creates a `signup_requests` row that an admin must approve
before the account can log in.

## The core journey

`lead → impact`. An Outreach Lead registers a school and files an Outreach Visit
Request. A Campus Lead **and** a Finance Lead both approve it. The school clears
an onboarding readiness gate, a team is confirmed, an execution plan is
submitted and dual-approved, then sessions are delivered with attendance and
photo evidence until the school is completed.

Dual approval is deliberate: the role that submits an execution plan
(`exec_lead`) can never approve it, and the campus and finance approval legs
always land on different roles. `lib/auth/__tests__/rbac.test.ts` asserts this.

## Verify

```bash
pnpm typecheck && pnpm lint && pnpm test && pnpm build
```
