import type {
  SchoolStatus,
  SessionStatus,
  ReimbursementStatus,
  ApprovalStatus,
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

export const SESSION_STATUS_META: Record<SessionStatus, { label: string; tone: StatusTone }> = {
  planned:        { label: 'Planned',         tone: 'neutral' },
  in_progress:    { label: 'In Progress',     tone: 'progress' },
  reported:       { label: 'Reported',        tone: 'info' },
  campus_approved:{ label: 'Campus Approved',  tone: 'progress' },
  verified:       { label: 'Verified',        tone: 'success' },
  cancelled:      { label: 'Cancelled',       tone: 'danger' },
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
