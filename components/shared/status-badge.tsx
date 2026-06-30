import { cn } from '@/lib/utils'
import {
  TONE_CLASS,
  SCHOOL_STATUS_META,
  SESSION_STATUS_META,
  REIMBURSEMENT_STATUS_META,
  APPROVAL_STATUS_META,
  type StatusTone,
} from '@/lib/constants/status'
import type {
  SchoolStatus,
  SessionStatus,
  ReimbursementStatus,
  ApprovalStatus,
} from '@/types/database'

type StatusBadgeProps =
  | { kind: 'school'; status: SchoolStatus; className?: string }
  | { kind: 'session'; status: SessionStatus; className?: string }
  | { kind: 'reimbursement'; status: ReimbursementStatus; className?: string }
  | { kind: 'approval'; status: ApprovalStatus; className?: string }
  | { kind?: undefined; label: string; tone: StatusTone; className?: string }

function resolve(props: StatusBadgeProps): { label: string; tone: StatusTone } {
  switch (props.kind) {
    case 'school': return SCHOOL_STATUS_META[props.status]
    case 'session': return SESSION_STATUS_META[props.status]
    case 'reimbursement': return REIMBURSEMENT_STATUS_META[props.status]
    case 'approval': return APPROVAL_STATUS_META[props.status]
    default: return { label: props.label, tone: props.tone }
  }
}

/**
 * StatusBadge (PRD §12.3) — a colored pill for any status. Always renders the
 * text label (never color-only — WCAG, PRD §13.2) plus a tone dot.
 */
export function StatusBadge(props: StatusBadgeProps) {
  const { label, tone } = resolve(props)
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap',
        TONE_CLASS[tone],
        props.className,
      )}
    >
      <span className="size-1.5 rounded-full bg-current opacity-70" aria-hidden />
      {label}
    </span>
  )
}
