import type { SchoolDetail } from '@/lib/data/schools'
import type { SessionPlanRow } from '@/types/database'

export type GateKind = 'onboarding' | 'team' | 'execution' | 'session' | 'completion' | 'finance_execution' | 'finance_session'

export interface ReadinessItem {
  key: string
  label: string
  satisfied: boolean
  description?: string
}

export interface GateResult {
  kind: GateKind
  ready: boolean
  completed: number
  total: number
  missing: string[]
  items: ReadinessItem[]
}

/**
 * Centralized Onboarding Readiness Validator (Phase 1 Task 2 & 9).
 * Single source of truth for onboarding completeness. Used by UI and backend.
 */
export function validateSchoolOnboardingReadiness(
  school: SchoolDetail,
  plan: SessionPlanRow | null,
): GateResult {
  const items: ReadinessItem[] = [
    {
      key: 'dise_code',
      label: 'DISE Code',
      satisfied: !!school.dise_code && school.dise_code.trim().length > 0,
      description: 'Official DISE code recorded for school',
    },
    {
      key: 'campus',
      label: 'Assigned Campus',
      satisfied: !!school.campus_id,
      description: 'School assigned to a university campus',
    },
    {
      key: 'coordinator',
      label: 'School Coordinator / Contact',
      satisfied: !!(plan?.coordinator_name?.trim() && plan?.coordinator_phone?.trim()),
      description: 'Point of contact name and phone recorded',
    },
    {
      key: 'student_strength',
      label: 'Student Strength',
      satisfied: typeof plan?.student_strength === 'number' && plan.student_strength > 0,
      description: 'Expected student strength specified',
    },
    {
      key: 'classrooms',
      label: 'Classrooms / Digital Classrooms',
      satisfied: (typeof plan?.num_classrooms === 'number' && plan.num_classrooms > 0) || (typeof plan?.digital_classrooms === 'number' && plan.digital_classrooms > 0),
      description: 'Number of classrooms or digital classrooms specified',
    },
    {
      key: 'preferred_time',
      label: 'Preferred Time Slot',
      satisfied: !!plan?.preferred_time_slot,
      description: 'Preferred training time slot (Morning, Afternoon, Full Day)',
    },
    {
      key: 'preferred_days',
      label: 'Preferred Training Days',
      satisfied: Array.isArray(plan?.preferred_training_days) && plan.preferred_training_days.length > 0,
      description: 'At least one preferred training day selected',
    },
    {
      key: 'approval_letter',
      label: 'Official Approval Letter',
      satisfied: !!(plan?.approval_letter_path && plan.approval_letter_path.trim().length > 0),
      description: 'School approval letter uploaded to evidence bucket',
    },
    {
      key: 'recommended_fellows',
      label: 'Volunteer Fellow Recommendation',
      satisfied: typeof plan?.recommended_fellows === 'number' && plan.recommended_fellows > 0,
      description: 'Volunteer requirement computed or specified',
    },
  ]

  const completed = items.filter((i) => i.satisfied).length
  const total = items.length
  const missing = items.filter((i) => !i.satisfied).map((i) => i.label)
  const ready = completed === total

  return {
    kind: 'onboarding',
    ready,
    completed,
    total,
    missing,
    items,
  }
}
