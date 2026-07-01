import { NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth/user'
import { can } from '@/lib/auth/rbac'
import {
  listCampusPerformance,
  getSessionFunnel,
  getSchoolPipeline,
  getMonthlyActivity,
} from '@/lib/data/analytics'
import { SESSION_STATUS_META, SCHOOL_STATUS_META } from '@/lib/constants/status'
import type { SessionStatus, SchoolStatus } from '@/types/database'

/** CSV export of any analytics view (PRD §7.8 — "CSV export all views"). */
export async function GET(request: Request) {
  const user = await getSessionUser()
  if (!user) return new NextResponse('Unauthorized', { status: 401 })
  // Only analytics-permitted roles may export program-wide data (PRD §7.2).
  if (can(user.role, 'view_analytics_all') !== 'all' || can(user.role, 'export_data') === false) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  const view = new URL(request.url).searchParams.get('view') ?? 'campuses'
  let rows: Record<string, string | number>[] = []
  let filename = 'analytics'

  switch (view) {
    case 'campuses': {
      filename = 'campus-performance'
      rows = (await listCampusPerformance()).map((c) => ({
        campus: c.name,
        schools_reached: c.schools_reached,
        schools_target: c.target_schools,
        sessions_completed: c.sessions_completed,
        sessions_target: c.target_sessions,
        students_impacted: c.students_impacted,
        students_target: c.target_students,
        volunteers: c.volunteers,
        approved_spend_inr: c.approved_spend,
        last_session_date: c.last_session_date ?? '',
      }))
      break
    }
    case 'sessions': {
      filename = 'session-funnel'
      rows = (await getSessionFunnel()).map((r) => ({
        status: SESSION_STATUS_META[r.status as SessionStatus]?.label ?? r.status,
        count: r.count,
      }))
      break
    }
    case 'schools': {
      filename = 'school-pipeline'
      rows = (await getSchoolPipeline()).map((r) => ({
        status: SCHOOL_STATUS_META[r.status as SchoolStatus]?.label ?? r.status,
        count: r.count,
      }))
      break
    }
    case 'monthly': {
      filename = 'monthly-activity'
      rows = (await getMonthlyActivity()).map((r) => ({
        month: r.month,
        sessions_completed: r.sessions_completed,
        students_impacted: r.students_impacted,
      }))
      break
    }
    default:
      return new NextResponse('Unknown view', { status: 400 })
  }

  const csv = toCsv(rows)
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}.csv"`,
    },
  })
}

function toCsv(rows: Record<string, string | number>[]): string {
  if (rows.length === 0) return ''
  const headers = Object.keys(rows[0])
  const escape = (v: string | number) => {
    const s = String(v)
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  const lines = [headers.join(',')]
  for (const row of rows) lines.push(headers.map((h) => escape(row[h])).join(','))
  return lines.join('\n')
}
