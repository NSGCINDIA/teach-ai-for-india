# Teach AI for India — PRD Implementation Audit & Phase 2 Plan

_Audit date: 2026-06-30. Verified against **PRD v2.0** (`Teach AI for India PRD.pdf`, 44pp)._

## 1. Where the build stands

This repo is a deliberate **Phase 1**: the public website, authentication, and the
database/RBAC foundation are built; the entire authenticated **operational app**
(§7.3–7.10) is scaffolded in the DB but has no routes, UI, or server actions.
`lib/navigation.ts` marks every `/dashboard/*` and `/admin/*` sub-route `soon: true`,
and `app/admin/page.tsx` states those modules "land in Phase 2."

| PRD area | Status |
|---|---|
| §7.1 Public Website | ✅ Implemented (all §8 public routes, ISR, graceful degradation, entrance animations) |
| §7.2 Auth & roles | ✅ Implemented (email+password, invite-only signup, reset) — **with gaps below** |
| §9 Data model | ✅ All tables + enums present (one omission: no `approvals` table; modeled inline) |
| §10 Lifecycles | ⚠️ Tables only — state machines **not enforced** in SQL |
| §7.3 School CRM | ❌ No UI/routes/actions |
| §7.4 Sessions | ❌ |
| §7.5 Attendance | ❌ |
| §7.6 Reimbursement/Finance | ❌ (+ eligibility & anomaly engine absent even in DB) |
| §7.7 Evidence Vault | ❌ UI (bucket + RLS exist) |
| §7.8 Analytics | ❌ |
| §7.9 Admin Panel | ❌ (stub overview only) |
| §7.10 CMS editor | ❌ (data layer read-only by public site) |

## 2. Must-fix issues in the EXISTING build (do before/with Phase 2)

1. **🔴 Privilege escalation in RLS.** `0003_rls.sql` `users_update` policy
   (`id = auth.uid() OR is_admin() OR campus_lead…`) lets **any user update their own
   `role` column**, and lets **mgmt_admin** change roles (PRD forbids). Needs
   column-restricted policy / `role`-change gated to super_admin (+ campus_lead for own campus).
2. **🔴 Auth service down.** GoTrue currently has no DB connection (see prior session) —
   restart the Supabase project before any authenticated feature can be tested.
3. **🟠 Session & reimbursement state machines not enforced** (§10.2/§10.3). Only an enum
   column exists; transition validity and "Reported requires student/volunteer count +
   topic + ≥1 photo + ≥1 attendance doc" are unimplemented.
4. **🟠 Reimbursement eligibility + anomaly engine missing** (§7.6). `anomaly_flags`
   column is dormant; no link to attendance, no 14-day window, no auto-flags.
5. **🟠 Analytics-view & export permissions enforced only in app code**, not RLS
   (contradicts §13.3). 
6. **🟡 School dedup is trigram ≥0.4, advisory only** — PRD asks for Levenshtein ≤3 and a
   blocking warning; never sets `is_duplicate_flagged`.
7. **🟡 JWT 8h / refresh 30d** + **force-logout-on-role-change** (§7.2) not configured.
8. **🟡 Public gaps:** campus detail page partial (no session timeline / gallery /
   featured story / team), gallery not filterable by campus/date, login missing from footer.

## 3. Phase 2 milestones (prioritized, dependency-ordered)

Each milestone delivers: DB logic/migrations → Zod validations → RLS-aware server actions →
UI (dashboard + admin) → RLS enforcement → tests.

### M0 — Foundation hardening (unblocks everything)
- Restart Supabase / restore GoTrue; configure JWT 8h + refresh 30d; force-logout-on-role-change.
- Fix the `users_update` RLS privilege-escalation; move analytics/export gating into RLS.
- Shared data-access layer (`lib/data/*` per entity), server-action conventions, form patterns,
  optimistic TanStack Query setup. App shell + RBAC route-gating already exist.

### M1 — School Outreach CRM (§7.3) — *the spine; build first*
- `/dashboard/schools`, `/dashboard/schools/[id]`, `/admin/schools`, `/admin/schools/[id]`.
- School create/edit (3-layer record), status-pipeline UI backed by a **proper state machine**
  (legal transitions, role rules) extending `change_school_status`.
- Fuzzy-dedup warning on create (upgrade to Levenshtein ≤3; surface match before insert).
- Immutable visit-log timeline (already append-only in DB).

### M2 — Session Execution + Attendance (§7.4, §7.5)
- `/dashboard/sessions`, `/dashboard/sessions/[id]`, `/admin/sessions`.
- Session create→draft→report→campus-approve→verify flow with **DB state machine** + the
  "Reported requires…" gate. Session-type conditional fields.
- Volunteer attendance (roster tick, late/early flags) + student attendance (counts, splits).

### M3 — Evidence Vault (§7.7)
- Upload with `{campus}/{school}/{session}/{type}/{file}` path, HEIC→JPG, type/size validation.
- Browse/search/filter (campus, school, date, type, session, filename). `/dashboard/evidence`,
  `/admin/evidence`. Wire approve-to-public → fixes the public Gallery filtering gap too.

### M4 — Reimbursement & Finance (§7.6)
- Claim flow (Draft→Submitted→Under Review→Approved/Rejected→Paid) as a **DB state machine**.
- **Eligibility engine + anomaly flags** (link-to-session, present-in-attendance, 14-day window,
  >₹500 auto, >3/week, no approved report). `/dashboard/reimbursements`, `/admin/finance`,
  `/admin/finance/claims/[id]` + the 7 finance views.

### M5 — Analytics (§7.8)
- Tier 1 (mgmt summary <2s), Tier 2 (campus), Tier 3 (operational). CSV export all views,
  PDF management summary, monthly campus PDF auto-email (Resend). `/admin/analytics`.

### M6 — Admin Panel completion + CMS editor (§7.9, §7.10)
- Wire all 11 admin tabs + the always-on **alert feed** (6 alert types).
- Settings: roles, **invite management** (invite action exists), campus config, thresholds.
- CMS form editor for every block → triggers ISR revalidation. `/admin/content`, `/admin/settings`.

### M7 — Public-site completion + NFR pass (§7.1, §13)
- Campus detail page (session timeline, per-campus gallery, featured story, team).
- Gallery filters; footer login link.
- §13.1 performance budget verification (FCP <1.5s/4G), §13.2 WCAG 2.1 AA audit.

## 4. Sizing & sequencing notes
- M1 is the highest-value first module (PRD calls the CRM "the most critical operational module").
- M2–M4 are tightly coupled (sessions ⇽ attendance ⇽ reimbursement ⇽ evidence) and should be a
  continuous block. M5–M6 depend on M1–M4 data existing. M7 can run in parallel anytime.
- This is multi-week scope. Recommend building one milestone at a time, each shippable, behind the
  existing role-gated nav (flip `soon: false` per module as it lands).
