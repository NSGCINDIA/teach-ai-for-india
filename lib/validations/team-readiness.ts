import type { GateResult, ReadinessItem } from '@/lib/validations/readiness-gate'
import type { SchoolTeamMemberRow } from '@/types/database'

/**
 * Centralized Team Readiness Gate Validator (Phase 2 Task 9 & 27).
 * Evaluates whether a school team has met all requirements to advance to `team_ready`.
 */
export function validateSchoolTeamReadiness(
  requiredVolunteers: number,
  teamMembers: SchoolTeamMemberRow[],
): GateResult {
  const reqCount = requiredVolunteers || 2
  const confirmed = teamMembers.filter((m) => m.status === 'confirmed').length
  const available = teamMembers.filter((m) => m.status === 'available' || m.status === 'confirmed').length
  const requested = teamMembers.length
  const unavailable = teamMembers.filter((m) => m.status === 'unavailable').length

  const items: ReadinessItem[] = [
    {
      key: 'requirement_defined',
      label: 'Volunteer Requirement Specified',
      satisfied: reqCount > 0,
      description: `${reqCount} volunteers required for this school`,
    },
    {
      key: 'availability_requested',
      label: 'Availability Requests Sent',
      satisfied: requested >= reqCount,
      description: `${requested} / ${reqCount} volunteer candidate requests sent`,
    },
    {
      key: 'enough_available',
      label: 'Sufficient Available Responders',
      satisfied: available >= reqCount,
      description: `${available} / ${reqCount} volunteers responded Available`,
    },
    {
      key: 'team_confirmed',
      label: 'Final Team Confirmed',
      satisfied: confirmed >= reqCount,
      description: `${confirmed} / ${reqCount} final volunteers confirmed`,
    },
  ]

  const completed = items.filter((i) => i.satisfied).length
  const total = items.length
  const ready = confirmed >= reqCount
  const missing: string[] = []

  if (confirmed < reqCount) {
    missing.push(`${reqCount - confirmed} more confirmed volunteer${reqCount - confirmed > 1 ? 's' : ''} required`)
  }

  return {
    kind: 'team',
    ready,
    completed,
    total,
    missing,
    items,
  }
}
