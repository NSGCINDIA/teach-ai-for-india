import type { GateResult, ReadinessItem } from '@/lib/validations/readiness-gate'

export function validateExecutionFinanceReadiness(
  campusAvailable: number,
  requestedAmount: number,
  isCampusApproved: boolean,
  isFinanceApproved: boolean,
): GateResult {
  const items: ReadinessItem[] = [
    {
      key: 'campus_budget_available',
      label: 'Campus Budget Available',
      satisfied: campusAvailable >= requestedAmount,
      description: `Available campus funds (₹${campusAvailable}) cover request (₹${requestedAmount})`,
    },
    {
      key: 'campus_approval',
      label: 'Campus Lead Operational Approval',
      satisfied: isCampusApproved,
      description: 'Campus Lead reviewed and approved operational plan',
    },
    {
      key: 'finance_approval',
      label: 'Finance Lead Budget Approval',
      satisfied: isFinanceApproved,
      description: 'Finance Lead reviewed and approved budget allocation',
    },
  ]

  const completed = items.filter((i) => i.satisfied).length
  const total = items.length
  const ready = items.every((i) => i.satisfied)
  const missing = items.filter((i) => !i.satisfied).map((i) => i.label)

  return {
    kind: 'finance_execution',
    ready,
    completed,
    total,
    missing,
    items,
  }
}

export function validateSessionFinanceReadiness(
  approvedBudget: number,
  actualSpend: number,
  totalExpenses: number,
  verifiedBillsCount: number,
): GateResult {
  const isWithinBudget = actualSpend <= approvedBudget
  const allBillsVerified = totalExpenses > 0 && verifiedBillsCount >= totalExpenses

  const items: ReadinessItem[] = [
    {
      key: 'budget_allocated',
      label: 'Budget Allocated',
      satisfied: approvedBudget > 0,
      description: `Session has an approved expected budget allocation (₹${approvedBudget})`,
    },
    {
      key: 'expenses_recorded',
      label: 'Expenses Recorded',
      satisfied: totalExpenses > 0,
      description: `${totalExpenses} operational expenses recorded`,
    },
    {
      key: 'bills_verified',
      label: 'Bills Attached & Verified',
      satisfied: allBillsVerified,
      description: `${verifiedBillsCount} / ${totalExpenses} receipts verified by Finance Lead`,
    },
    {
      key: 'within_budget',
      label: 'Within Approved Budget',
      satisfied: isWithinBudget,
      description: isWithinBudget
        ? `Actual spend (₹${actualSpend}) is within approved budget (₹${approvedBudget})`
        : `Over budget by ₹${actualSpend - approvedBudget}`,
    },
  ]

  const completed = items.filter((i) => i.satisfied).length
  const total = items.length
  const ready = items.every((i) => i.satisfied)
  const missing = items.filter((i) => !i.satisfied).map((i) => i.label)

  return {
    kind: 'finance_session',
    ready,
    completed,
    total,
    missing,
    items,
  }
}
