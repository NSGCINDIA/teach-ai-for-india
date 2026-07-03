/**
 * Lightweight, dependency-free rate limiting (issue #10).
 *
 * Best-effort by design: state lives in-process, so it is NOT shared across
 * serverless/edge instances and resets on cold start. It blunts scripted abuse
 * (credential stuffing, signup spam, request bursts) cheaply and without an
 * external store. For true volumetric DDoS protection, front the deployment
 * with a hosting-level WAF / rate limiter (e.g. Vercel's) — see SECURITY.md.
 */

// ─── Fixed-window request limiter ────────────────────────────────────────────
type Bucket = { count: number; resetAt: number }
const buckets = new Map<string, Bucket>()

export type RateVerdict = { allowed: boolean; remaining: number; retryAfterSec: number }

let opsSinceSweep = 0
function maybeSweep(now: number): void {
  if (++opsSinceSweep < 5000) return
  opsSinceSweep = 0
  for (const [k, b] of buckets) if (now >= b.resetAt) buckets.delete(k)
}

/** Count one hit against `key`; deny once `limit` hits occur within `windowMs`. */
export function rateLimit(key: string, limit: number, windowMs: number, now: number = Date.now()): RateVerdict {
  maybeSweep(now)
  const b = buckets.get(key)
  if (!b || now >= b.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: limit - 1, retryAfterSec: Math.ceil(windowMs / 1000) }
  }
  b.count++
  return {
    allowed: b.count <= limit,
    remaining: Math.max(0, limit - b.count),
    retryAfterSec: Math.ceil((b.resetAt - now) / 1000),
  }
}

// ─── Failure-only limiter (login brute-force) ────────────────────────────────
// Tracks timestamps of FAILED attempts so successful traffic is never throttled.
const failures = new Map<string, number[]>()

/** Number of failures recorded for `key` within the trailing `windowMs`. */
export function failureCount(key: string, windowMs: number, now: number = Date.now()): number {
  const recent = (failures.get(key) ?? []).filter((t) => now - t < windowMs)
  if (recent.length) failures.set(key, recent)
  else failures.delete(key)
  return recent.length
}

/** Record one failure against `key`. */
export function recordFailure(key: string, now: number = Date.now()): void {
  const arr = failures.get(key) ?? []
  arr.push(now)
  failures.set(key, arr)
}

/** Clear a key's failures (call on a successful attempt). */
export function clearFailures(key: string): void {
  failures.delete(key)
}

// ─── IP extraction (behind the deployment proxy) ─────────────────────────────
export function clientIp(headers: Headers): string {
  const fwd = headers.get('x-forwarded-for')
  if (fwd) return fwd.split(',')[0].trim() || 'unknown'
  return headers.get('x-real-ip')?.trim() || 'unknown'
}
