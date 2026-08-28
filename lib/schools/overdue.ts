import type { SchoolStatus } from '@/types/database'

/**
 * The single definition of "this school needs following up".
 *
 * Before this, the same question was answered four different ways and they
 * disagreed with each other:
 *
 *   - the /dashboard/schools KPI compared ISO strings against UTC today and
 *     excluded `archived`;
 *   - the Next action cell in the table compared Date objects against *local*
 *     midnight and excluded nothing;
 *   - the admin alert feed used UTC today and excluded `completed` and
 *     `archived`.
 *
 * Two consequences, both user-visible. A row could render "· Overdue" while the
 * KPI above it did not count that row, because for an IST audience (UTC+05:30)
 * "UTC today" is still yesterday between 00:00 and 05:30 local — a 5.5-hour
 * window every single day in which the page contradicted itself. And an
 * archived school showed a red "Overdue" it could never clear.
 */

/**
 * A school in one of these states is finished or shelved, so it cannot be late:
 * there is no next action to be overdue for. This is the admin feed's rule,
 * which was the strictest of the four and the only one that excluded
 * `completed`.
 */
export const OVERDUE_EXEMPT_STATUSES: readonly SchoolStatus[] = ['completed', 'archived']

/**
 * Every date in this product is an Indian calendar date — the schools, the
 * sessions and the people are all in Telangana and Andhra Pradesh.
 */
export const ORG_TIME_ZONE = 'Asia/Kolkata'

/**
 * Today as `YYYY-MM-DD` in the organisation's timezone.
 *
 * Pinning the zone is the whole point. The two callers run in different places:
 * the KPI is computed in a server component (UTC on Vercel) and the table cell
 * renders in the browser (IST for the actual users). Using "local time" would
 * therefore give two different answers for the same school, which is the bug
 * this module exists to remove — just relocated from UTC-vs-IST to
 * server-vs-client. A fixed zone makes them agree by construction.
 *
 * `en-CA` formats as ISO `YYYY-MM-DD`. `now` is injectable so the rule is
 * testable without mutating `process.env.TZ`.
 */
export function todayIso(now: Date = new Date(), timeZone: string = ORG_TIME_ZONE): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now)
}

/** The fields `isOverdue` needs — narrow, so callers can pass a partial row. */
export interface OverdueCandidate {
  next_action_date: string | null
  status: SchoolStatus
}

/**
 * True when a school's follow-up date has already passed.
 *
 * A follow-up dated *today* is due, not late, so the comparison is strictly
 * less-than. Both values are `YYYY-MM-DD`, which sorts lexicographically, so no
 * Date parsing is involved.
 *
 * `today` is injectable so callers that already computed it (a list rendering
 * hundreds of rows) do not recompute per row, and so tests can pin a date.
 */
export function isOverdue(school: OverdueCandidate, today: string = todayIso()): boolean {
  if (!school.next_action_date) return false
  if (OVERDUE_EXEMPT_STATUSES.includes(school.status)) return false
  return school.next_action_date < today
}

/**
 * How many of these schools need chasing.
 *
 * `today` is computed once and threaded through: `Intl.DateTimeFormat`
 * construction is not free, and this runs over a list capped at 500 rows.
 */
export function countOverdue(schools: OverdueCandidate[], today: string = todayIso()): number {
  return schools.reduce((n, school) => n + (isOverdue(school, today) ? 1 : 0), 0)
}
