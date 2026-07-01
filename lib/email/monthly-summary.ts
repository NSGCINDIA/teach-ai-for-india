import { createAdminClient } from '@/lib/supabase/admin'
import { sendEmail } from '@/lib/email/resend'
import { formatCurrency, formatNumber } from '@/lib/format'
import type { ProgramSummary, CampusPerformance } from '@/types/database'

const num = (v: unknown) => Number(v ?? 0)

/**
 * Builds + sends the monthly management summary to all active admins (PRD §7.8).
 * Runs with the service-role client so it works from a cron with no user
 * session. Delivers a rich HTML report; a print-to-PDF one-pager lives at
 * /admin/analytics/summary. Returns a small result for the caller to surface.
 */
export async function sendMonthlySummary(): Promise<{ sent: number; skipped?: true; error?: string }> {
  const admin = createAdminClient()

  const [{ data: summaryRow }, { data: campusRows }, { data: recipients }] = await Promise.all([
    admin.from('program_summary').select('*').single(),
    admin.from('campus_performance').select('*').order('students_impacted', { ascending: false }),
    admin.from('users').select('email').in('role', ['super_admin', 'mgmt_admin']).eq('is_active', true),
  ])

  const emails = (recipients as { email: string }[] | null)?.map((r) => r.email).filter(Boolean) ?? []
  if (emails.length === 0) return { sent: 0, error: 'No active admin recipients.' }

  const s = (summaryRow ?? {}) as Partial<ProgramSummary>
  const campuses = (campusRows as CampusPerformance[] | null) ?? []
  const html = renderEmail(s, campuses)

  const res = await sendEmail({ to: emails, subject: 'Teach AI for India — Monthly summary', html })
  if ('skipped' in res && res.skipped) return { sent: 0, skipped: true }
  if ('error' in res && res.error) return { sent: 0, error: 'Email provider error.' }
  return { sent: emails.length }
}

function renderEmail(s: Partial<ProgramSummary>, campuses: CampusPerformance[]): string {
  const kpi = (label: string, value: string) =>
    `<td style="padding:12px 16px;border:1px solid #e5e7eb;border-radius:8px">
       <div style="font-size:12px;color:#6b7280">${label}</div>
       <div style="font-size:22px;font-weight:700;color:#0f172a">${value}</div>
     </td>`

  const rows = campuses
    .map(
      (c) => `<tr>
        <td style="padding:8px;border-bottom:1px solid #eee;font-weight:600">${c.name}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">${formatNumber(num(c.schools_reached))}/${formatNumber(num(c.target_schools))}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">${formatNumber(num(c.sessions_completed))}/${formatNumber(num(c.target_sessions))}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">${formatNumber(num(c.students_impacted))}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">${formatCurrency(num(c.approved_spend))}</td>
      </tr>`,
    )
    .join('')

  return `<div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;max-width:640px;margin:0 auto;color:#0f172a">
    <h1 style="font-size:20px">Monthly summary</h1>
    <p style="color:#6b7280;margin-top:-8px">Teach AI for India</p>
    <table style="border-collapse:separate;border-spacing:8px 8px;width:100%"><tr>
      ${kpi('Schools reached', formatNumber(num(s.schools_reached)))}
      ${kpi('Sessions verified', formatNumber(num(s.sessions_completed)))}
      ${kpi('Students impacted', formatNumber(num(s.students_impacted)))}
    </tr><tr>
      ${kpi('Active volunteers', formatNumber(num(s.active_volunteers)))}
      ${kpi('Approved spend', formatCurrency(num(s.approved_spend)))}
      ${kpi('Pending claims', formatNumber(num(s.pending_claims)))}
    </tr></table>
    <h2 style="font-size:16px;margin-top:24px">Campus performance</h2>
    <table style="width:100%;border-collapse:collapse;font-size:14px">
      <tr style="text-align:left;color:#6b7280;font-size:12px">
        <th style="padding:8px">Campus</th><th style="padding:8px;text-align:right">Schools</th>
        <th style="padding:8px;text-align:right">Sessions</th><th style="padding:8px;text-align:right">Students</th>
        <th style="padding:8px;text-align:right">Spend</th>
      </tr>
      ${rows}
    </table>
    <p style="color:#6b7280;font-size:12px;margin-top:24px">
      This is an automated monthly report. Open the dashboard for live analytics and a printable PDF summary.
    </p>
  </div>`
}
