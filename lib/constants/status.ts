import type {
  SchoolStatus,
  SessionStatus,
  ReimbursementStatus,
  ApprovalStatus,
  AssignmentStatus,
} from '@/types/database'

/**
 * Status metadata — labels, tones, and ordering. Shared by StatusBadge,
 * pipeline boards, and timelines so a status is described identically everywhere.
 * Tones map to Tailwind utility groups; never rely on color alone (PRD §12.2/§13.2).
 */
export type StatusTone =
  | 'neutral' | 'info' | 'pending' | 'progress' | 'success' | 'danger' | 'muted'

export const TONE_CLASS: Record<StatusTone, string> = {
  neutral:  'bg-status-lead/15 text-status-lead ring-1 ring-status-lead/30',
  info:     'bg-status-contacted/15 text-status-contacted ring-1 ring-status-contacted/30',
  pending:  'bg-status-pending/20 text-warning ring-1 ring-status-pending/40',
  progress: 'bg-status-completed/15 text-status-completed ring-1 ring-status-completed/30',
  success:  'bg-success/15 text-success ring-1 ring-success/30',
  danger:   'bg-error/15 text-error ring-1 ring-error/30',
  muted:    'bg-muted text-muted-foreground ring-1 ring-border',
}

export const SCHOOL_STATUS_META: Record<SchoolStatus, { label: string; tone: StatusTone }> = {
  lead_identified:    { label: 'Lead Identified',    tone: 'neutral' },
  contacted:          { label: 'Contacted',          tone: 'info' },
  followup_pending:   { label: 'Follow-up Pending',  tone: 'pending' },
  approval_requested: { label: 'Approval Requested', tone: 'pending' },
  approval_received:  { label: 'Approval Received',  tone: 'success' },
  session_scheduled:  { label: 'Session Scheduled',  tone: 'progress' },
  session_in_progress:{ label: 'Session In Progress',tone: 'progress' },
  completed:          { label: 'Completed',          tone: 'success' },
  archived:           { label: 'Archived',           tone: 'muted' },
}

/** Ordered pipeline for the CRM board (excludes the terminal 'archived'). */
export const SCHOOL_PIPELINE: SchoolStatus[] = [
  'lead_identified', 'contacted', 'followup_pending', 'approval_requested',
  'approval_received', 'session_scheduled', 'session_in_progress', 'completed',
]

/**
 * Legal status transitions — MUST mirror school_transition_allowed() in
 * 0011_school_state_machine.sql. The UI uses this to offer only valid next
 * states; the DB is the real enforcement (PRD §13.3). 'archived' → reopen is
 * admin-only and surfaced separately.
 */
export const SCHOOL_TRANSITIONS: Record<SchoolStatus, SchoolStatus[]> = {
  lead_identified:     ['contacted', 'archived'],
  contacted:           ['followup_pending', 'approval_requested', 'lead_identified', 'archived'],
  followup_pending:    ['contacted', 'approval_requested', 'archived'],
  approval_requested:  ['approval_received', 'followup_pending', 'archived'],
  approval_received:   ['session_scheduled', 'approval_requested', 'archived'],
  session_scheduled:   ['session_in_progress', 'approval_received', 'archived'],
  session_in_progress: ['completed', 'session_scheduled', 'archived'],
  completed:           ['archived'],
  archived:            ['lead_identified'],
}

/** Transitions that always require a reason note (archive + every backward step). */
export function schoolTransitionNeedsNote(from: SchoolStatus, to: SchoolStatus): boolean {
  if (to === 'archived') return true
  return SCHOOL_PIPELINE.indexOf(to) < SCHOOL_PIPELINE.indexOf(from)
}

/**
 * Execution-stage statuses exec_lead may move a school between (own campus
 * only) — session delivery once a school is approved, not the earlier
 * outreach/approval stages. MUST mirror change_school_status() in
 * 0024_exec_lead_school_status.sql.
 */
export const EXEC_LEAD_SCHOOL_STATUSES: SchoolStatus[] = [
  'approval_received', 'session_scheduled', 'session_in_progress', 'completed',
]

export const SESSION_STATUS_META: Record<SessionStatus, { label: string; tone: StatusTone }> = {
  planned:        { label: 'Planned',         tone: 'neutral' },
  in_progress:    { label: 'In Progress',     tone: 'progress' },
  reported:       { label: 'Reported',        tone: 'info' },
  campus_approved:{ label: 'Campus Approved',  tone: 'progress' },
  verified:       { label: 'Verified',        tone: 'success' },
  cancelled:      { label: 'Cancelled',       tone: 'danger' },
}

/**
 * Legal session transitions — MUST mirror enforce_session_transition() in
 * 0010_lifecycles_and_rules.sql. Cancellation is reachable from any non-terminal
 * state (Campus Lead+ only, with a reason). The DB is the real enforcement.
 */
export const SESSION_TRANSITIONS: Record<SessionStatus, SessionStatus[]> = {
  planned:         ['in_progress', 'cancelled'],
  in_progress:     ['reported', 'cancelled'],
  reported:        ['campus_approved', 'in_progress', 'cancelled'],
  campus_approved: ['verified', 'reported', 'cancelled'],
  verified:        ['cancelled'],
  cancelled:       [],
}

export const REIMBURSEMENT_STATUS_META: Record<ReimbursementStatus, { label: string; tone: StatusTone }> = {
  draft:        { label: 'Draft',        tone: 'neutral' },
  submitted:    { label: 'Submitted',    tone: 'info' },
  under_review: { label: 'Under Review',  tone: 'pending' },
  approved:     { label: 'Approved',     tone: 'progress' },
  rejected:     { label: 'Rejected',     tone: 'danger' },
  paid:         { label: 'Paid',         tone: 'success' },
}

export const APPROVAL_STATUS_META: Record<ApprovalStatus, { label: string; tone: StatusTone }> = {
  pending:  { label: 'Pending Review', tone: 'pending' },
  approved: { label: 'Approved',       tone: 'success' },
  rejected: { label: 'Rejected',       tone: 'danger' },
}

export const ASSIGNMENT_STATUS_META: Record<AssignmentStatus, { label: string; tone: StatusTone }> = {
  assigned:              { label: 'Awaiting reply',  tone: 'pending' },
  accepted:              { label: 'Accepted',        tone: 'success' },
  declined:              { label: 'Declined',        tone: 'danger' },
  replacement_requested: { label: 'Needs swap',      tone: 'pending' },
  cancelled:             { label: 'Cancelled',       tone: 'muted' },
}
