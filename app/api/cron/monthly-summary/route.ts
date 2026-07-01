import { NextResponse } from 'next/server'
import { sendMonthlySummary } from '@/lib/email/monthly-summary'

/**
 * Monthly management-summary email (PRD §7.8). Schedule with a cron (e.g. a
 * Vercel cron hitting this route on the 1st of each month) and set CRON_SECRET.
 * Auth: `Authorization: Bearer <CRON_SECRET>` or `?secret=<CRON_SECRET>`.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET
  if (!secret) return new NextResponse('CRON_SECRET not configured', { status: 500 })

  const url = new URL(request.url)
  const provided = request.headers.get('authorization')?.replace('Bearer ', '') ?? url.searchParams.get('secret')
  if (provided !== secret) return new NextResponse('Unauthorized', { status: 401 })

  const result = await sendMonthlySummary()
  return NextResponse.json(result)
}
