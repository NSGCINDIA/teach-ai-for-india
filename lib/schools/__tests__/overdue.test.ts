import { test } from 'node:test'
import assert from 'node:assert'
import type { SchoolStatus } from '@/types/database'
import { isOverdue, todayIso } from '@/lib/schools/overdue'

/**
 * These pin the rule that four call sites previously disagreed about. The
 * timezone case is the one that motivated the change: it is the reason a row
 * could say "· Overdue" while the KPI above it reported a different count.
 */

const school = (next_action_date: string | null, status: SchoolStatus = 'registered') => ({
  next_action_date,
  status,
})

test('a follow-up date in the past is overdue', () => {
  assert.ok(isOverdue(school('2026-08-01'), '2026-08-28'))
})

test('a follow-up dated today is due, not late', () => {
  // Strictly less-than: someone still has the whole working day to do it.
  assert.ok(!isOverdue(school('2026-08-28'), '2026-08-28'))
})

test('a future follow-up is not overdue', () => {
  assert.ok(!isOverdue(school('2026-09-15'), '2026-08-28'))
})

test('no follow-up date is never overdue', () => {
  assert.ok(!isOverdue(school(null), '2026-08-28'))
})

test('completed and archived schools are never overdue', () => {
  // They are finished or shelved, so there is no next action to be late for.
  // The table cell used to paint these red with no way to clear the warning.
  assert.ok(!isOverdue(school('2026-01-01', 'completed'), '2026-08-28'))
  assert.ok(!isOverdue(school('2026-01-01', 'archived'), '2026-08-28'))
})

test('every live pipeline status can be overdue', () => {
  const live: SchoolStatus[] = [
    'lead_identified', 'outreach_requested', 'outreach_approved',
    'registered', 'sessions_active',
  ]
  for (const status of live) {
    assert.ok(isOverdue(school('2026-01-01', status), '2026-08-28'), status)
  }
})

test('todayIso reads the Indian calendar day, not the runtime\'s', () => {
  // The whole bug in one assertion. At this instant it is 19:00 on the 28th in
  // UTC but already 00:30 on the 29th in Kolkata. The KPI runs in a server
  // component (UTC on Vercel) and the table cell runs in the browser (IST), so
  // anything derived from "local time" gives those two callers different
  // answers for the same school. Pinning the zone makes them agree.
  const instant = new Date('2026-08-28T19:00:00Z')

  assert.strictEqual(todayIso(instant), '2026-08-29', 'Asia/Kolkata')
  assert.strictEqual(todayIso(instant, 'UTC'), '2026-08-28', 'the old, wrong answer')
})

test('todayIso is stable regardless of the machine timezone', () => {
  // Guards the regression where someone swaps Intl for getFullYear()/getMonth(),
  // which silently reintroduces the server-vs-client split.
  const instant = new Date('2026-01-01T02:00:00Z')
  assert.strictEqual(todayIso(instant), '2026-01-01')
  assert.match(todayIso(), /^\d{4}-\d{2}-\d{2}$/)
})

test('a follow-up dated the 28th is overdue once Kolkata reaches the 29th', () => {
  // The 5.5-hour window every day in which the page used to contradict itself:
  // the row said "· Overdue" while the KPI did not count it, or vice versa.
  const instant = new Date('2026-08-28T19:00:00Z')
  assert.ok(isOverdue(school('2026-08-28'), todayIso(instant)))
})

test('dates compare correctly across a year boundary', () => {
  // Lexicographic compare on YYYY-MM-DD is chronological compare. This is why
  // the module never parses these strings into Date objects — `new Date('...')`
  // on a bare date is UTC midnight, which reintroduces a zone bug of its own.
  assert.ok(isOverdue(school('2025-12-31'), '2026-01-01'))
  assert.ok(!isOverdue(school('2026-01-01'), '2025-12-31'))
})
