# Security

Baseline defense-in-depth for the Teach AI for India platform. These controls
are enforced in code; the guidelines below are mandatory for any contribution.

## Database access — no raw SQL (MANDATORY)

**All database access MUST go through the Supabase client's parameterized
methods** — `.from(...).select/insert/update/delete(...)`, `.rpc(...)`, and the
query-builder filters (`.eq`, `.ilike`, `.in`, `.gte`, …). These bind values as
parameters, so user input can never be interpreted as SQL.

**Never** build SQL by string concatenation or interpolation of user input. In
particular, do not:

- concatenate/interpolate request data into a SQL string,
- pass user input into `.rpc()` arguments that a SQL function then `EXECUTE`s
  dynamically without `quote_ident` / `quote_literal`,
- add a raw-SQL escape hatch (e.g. a `sql`-template helper) fed by user input.

Row-Level Security (RLS) is enabled on every table and is the authoritative
authorization boundary — the client methods above respect it. Server-only
privileged work uses the service-role client (`lib/supabase/admin.ts`), which
**bypasses RLS**; it must never be imported into client code and must scope its
own filters explicitly.

**Code-review checklist item:** reject any PR that introduces raw/concatenated
SQL or an unparameterized query path. New DB access must use the Supabase client
methods.

## HTTP security headers

Set for every route in `next.config.mjs` (`async headers()`):

| Header | Value |
| --- | --- |
| `Content-Security-Policy` | `default-src 'self'`; scripts/styles allow `'unsafe-inline'` (Next.js runtime), `connect-src` scoped to Supabase; `frame-ancestors 'none'`, `object-src 'none'`, `base-uri`/`form-action 'self'` |
| `X-Frame-Options` | `DENY` (clickjacking) |
| `X-Content-Type-Options` | `nosniff` (MIME sniffing) |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | camera/microphone/geolocation/browsing-topics disabled |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` |

## Rate limiting & abuse protection

Implemented in `lib/security/rate-limit.ts` (best-effort, in-process):

- **Middleware (`lib/supabase/middleware.ts`)** — per-IP caps applied before
  rendering: a broad cap on all mutating (`POST`) requests (server actions / API
  routes) and a tighter cap on unauthenticated auth endpoints (`/login`,
  `/admin-login`, `/signup`, `/forgot-password`, `/reset-password`). Excess
  requests get `429` with `Retry-After`.
- **Login brute-force (`actions/auth.ts › signIn`)** — throttles *failed*
  attempts per account and per IP; successful logins never count.
- **Signup (`actions/auth.ts › requestSignup`)** — capped per IP per rolling 24h
  (see issue #9).

> The in-process limiter is not shared across serverless/edge instances and
> resets on cold start. For true volumetric DDoS protection, front the
> deployment with a hosting-level WAF / rate limiter (e.g. Vercel's).

## Open-redirect protection

Post-login redirects only honor same-origin relative paths. `safeNextPath` in
`actions/auth.ts` rejects protocol-relative (`//host`), backslash, and absolute
URLs so the `next` param cannot redirect users off-site.

## Reporting

Found a vulnerability? Email the maintainers privately rather than opening a
public issue.
