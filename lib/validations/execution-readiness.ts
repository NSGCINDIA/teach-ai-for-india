import type { GateResult, ReadinessItem } from '@/lib/validations/readiness-gate'
import type { SchoolExecutionPlanRow } from '@/types/database'

/**
 * Centralized Execution Readiness Gate Validator (Phase 3).
 * Evaluates whether a school execution plan is complete and fully approved to enable session delivery.
 */
export function validateSchoolExecutionReadiness(
  plan: SchoolExecutionPlanRow | null,
  teamConfirmed: boolean,
): GateResult {
  const items: ReadinessItem[] = [
    {
      key: 'team_confirmed',
      label: 'Volunteer Team Confirmed',
      satisfied: teamConfirmed,
      description: 'School volunteer team is fully confirmed by Volunteer Lead',
    },
    {
      key: 'plan_submitted',
      label: 'Execution Plan Submitted',
      satisfied: !!plan && plan.status !== 'draft',
      description: 'Equipment, travel logistics, and budget allocation submitted',
    },
    {
      key: 'campus_approved',
      label: 'Campus Lead Approval',
      satisfied: !!plan && (plan.status === 'campus_approved' || plan.status === 'approved'),
      description: 'Logistics and equipment plan reviewed and approved by Campus Lead',
    },
    {
      key: 'finance_approved',
      label: 'Finance Lead Approval',
      satisfied: !!plan && plan.status === 'approved',
      description: 'Budget allocation reviewed and approved by Finance Lead',
    },
  ]

  const completed = items.filter((i) => i.satisfied).length
  const total = items.length
  const ready = !!plan && plan.status === 'approved' && teamConfirmed
  const missing = items.filter((i) => !i.satisfied).map((i) => i.label)

  return {
    kind: 'execution',
    ready,
    completed,
    total,
    missing,
    items,
  }
}
