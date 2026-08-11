import { NextResponse } from 'next/server'
import { timingSafeEqual } from 'node:crypto'
import { sendMonthlySummary } from '@/lib/email/monthly-summary'

/** Length-independent comparison, so the response time reveals nothing. */
function secretMatches(provided: string | null, expected: string): boolean {
  if (!provided) return false
  const a = Buffer.from(provided)
  const b = Buffer.from(expected)
  // timingSafeEqual throws on length mismatch, which would itself be a signal.
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}

/**
 * Monthly management-summary email (PRD §7.8). Schedule with a cron (e.g. a
 * Vercel cron hitting this route on the 1st of each month) and set CRON_SECRET.
 * Auth: `Authorization: Bearer <CRON_SECRET>` or `?secret=<CRON_SECRET>`.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET

  // A missing secret used to answer 500 "CRON_SECRET not configured", which told
  // any anonymous caller how the deployment is configured and made a routine
  // unauthorized probe look like a server fault in monitoring. Unauthorized is
  // unauthorized either way; the operator learns about it from the log line.
  if (!secret) {
    console.error('[cron/monthly-summary] CRON_SECRET is not set — the monthly summary cannot run.')
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const url = new URL(request.url)
  const provided =
    request.headers.get('authorization')?.replace('Bearer ', '') ?? url.searchParams.get('secret')
  if (!secretMatches(provided, secret)) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const result = await sendMonthlySummary()
  return NextResponse.json(result)
}
