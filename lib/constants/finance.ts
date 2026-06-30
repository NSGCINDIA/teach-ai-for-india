import type { TravelMode, ReimbursementStatus } from '@/types/database'

export const TRAVEL_MODE_META: Record<TravelMode, { label: string }> = {
  auto:        { label: 'Auto-rickshaw' },
  bus:         { label: 'Bus' },
  cab:         { label: 'Cab / Taxi' },
  train:       { label: 'Train' },
  own_vehicle: { label: 'Own vehicle' },
  other:       { label: 'Other' },
}

export const TRAVEL_MODES = Object.keys(TRAVEL_MODE_META) as TravelMode[]

/**
 * Legal reimbursement transitions — MUST mirror enforce_reimbursement_rules()
 * in 0010_lifecycles_and_rules.sql. The DB is the real enforcement; it also
 * auto-routes a submission to 'under_review' when any anomaly fires.
 */
export const REIMBURSEMENT_TRANSITIONS: Record<ReimbursementStatus, ReimbursementStatus[]> = {
  draft:        ['submitted'],
  submitted:    ['under_review', 'approved', 'rejected'],
  under_review: ['approved', 'rejected'],
  rejected:     ['draft'],
  approved:     ['paid'],
  paid:         [],
}

/** Anomaly flags raised by the DB on submit (PRD §7.6 / §10.2). */
export const ANOMALY_META: Record<string, { label: string; detail: string }> = {
  high_auto_fare:      { label: 'High auto fare',    detail: 'Auto-rickshaw claim over ₹500.' },
  frequent_claimant:   { label: 'Frequent claimant', detail: '3 or more claims in the same week.' },
  no_approved_report:  { label: 'No approved report', detail: 'Linked session has no campus-approved report yet.' },
  claimant_not_present:{ label: 'Not in attendance', detail: 'Claimant is not marked present at the session.' },
}

export function anomalyLabel(flag: string): string {
  return ANOMALY_META[flag]?.label ?? flag.replace(/_/g, ' ')
}
