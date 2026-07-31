'use client'

import { useActionState, useState, useMemo } from 'react'
import { AlertCircle, Check, Lock, Loader2, ArrowRight, X } from 'lucide-react'
import { changeSchoolStatus, type SchoolActionState } from '@/actions/schools'
import { fieldValue } from '@/lib/actions/form-values'
import {
  SCHOOL_STATUS_META,
  SCHOOL_TRANSITIONS,
  SCHOOL_PIPELINE,
  schoolTransitionNeedsNote,
} from '@/lib/constants/status'
import type { SchoolStatus } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface StatusControlProps {
  schoolId: string
  current: SchoolStatus
  /** Whether the signed-in user may move this school (campus-scoped). */
  canEdit: boolean
  /** Restrict which target stages this user may pick (e.g. exec_lead's execution-only scope). Omit for unrestricted. */
  restrictTo?: SchoolStatus[]
  /** True if the signed in user is a super_admin — bypasses role-specific scopes. */
  isAdmin?: boolean
}

export function StatusControl({ schoolId, current, canEdit, restrictTo, isAdmin = false }: StatusControlProps) {
  const [state, action, pending] = useActionState<SchoolActionState, FormData>(async (prev, formData) => {
    const res = await changeSchoolStatus(prev, formData)
    if (res.ok) {
      setTarget('') // Reset selection on success
    }
    return res
  }, {})

  const [target, setTarget] = useState<SchoolStatus | ''>('')
  const needsNote = target ? schoolTransitionNeedsNote(current, target) : false

  // Manual stage override is Super Admin ONLY (Phase 1 Task 5)
  const options = useMemo(() => {
    if (!isAdmin || current === 'completed') return []
    return (SCHOOL_TRANSITIONS[current] ?? [])
  }, [current, isAdmin])

  const currentIndex = SCHOOL_PIPELINE.indexOf(current)

  const handleStepClick = (step: SchoolStatus) => {
    if (!isAdmin || !options.includes(step)) return
    setTarget(target === step ? '' : step)
  }

  return (
    <div className="space-y-4">
      {/* Informative banner for normal users */}
      {!isAdmin && (
        <div className="rounded-lg border border-border bg-muted/20 p-2.5 text-xs text-muted-foreground flex items-center justify-between">
          <span>
            ℹ️ Lifecycle stages update automatically as business actions (Outreach Approval, Onboarding, Team Confirmation, Execution Approval, Sessions) succeed.
          </span>
        </div>
      )}

      {/* Box Stepper Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
        {SCHOOL_PIPELINE.map((step, idx) => {
          const isCompleted = currentIndex >= 0 && idx < currentIndex
          const isCurrent = step === current
          const isClickable = isAdmin && options.includes(step)
          const isLocked = !isCurrent && !isCompleted && !isClickable

          let boxStyle = 'border-muted bg-muted/20 text-muted-foreground/50 cursor-default'
          let labelStyle = 'text-muted-foreground/60'
          let numberStyle = 'bg-muted/40 text-muted-foreground/60'
          let statusIcon = <Lock className="size-3.5 text-muted-foreground/30" />

          if (isCompleted) {
            boxStyle = 'border-success/30 bg-success/5 text-success cursor-default'
            labelStyle = 'text-success/90 font-medium'
            numberStyle = 'bg-success/20 text-success font-semibold'
            statusIcon = <Check className="size-3.5 text-success" />
          } else if (isCurrent) {
            boxStyle = 'border-brand bg-brand text-white shadow-soft ring-2 ring-brand/10 cursor-default'
            labelStyle = 'text-white font-semibold'
            numberStyle = 'bg-white/20 text-white font-bold'
            statusIcon = (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
              </span>
            )
          } else if (isClickable) {
            boxStyle = 'border-dashed border-brand/50 bg-background hover:bg-brand/5 hover:border-brand cursor-pointer text-brand transition-all'
            labelStyle = 'text-brand/90 font-medium'
            numberStyle = 'bg-brand/10 text-brand font-semibold'
            statusIcon = <ArrowRight className="size-3.5 text-brand" />
          }

          return (
            <button
              key={step}
              type="button"
              disabled={!isClickable}
              onClick={() => handleStepClick(step)}
              className={`flex flex-col items-start p-3 rounded-xl border text-left font-display transition-all relative ${boxStyle}`}
              title={isClickable ? `Admin Override to ${SCHOOL_STATUS_META[step].label}` : SCHOOL_STATUS_META[step].label}
            >
              <div className="flex w-full items-center justify-between gap-1 mb-2">
                <span className={`text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-md ${numberStyle}`}>
                  Step {idx + 1}
                </span>
                {statusIcon}
              </div>
              <span className={`text-xs ${labelStyle} leading-tight`}>
                {SCHOOL_STATUS_META[step].label}
              </span>
              {/* Active Selection Indicator */}
              {target === step && (
                <span className="absolute bottom-1 right-1 size-1.5 rounded-full bg-brand" />
              )}
            </button>
          )
        })}
      </div>

      {/* Super Admin Override Control Bar */}
      {isAdmin && !target && (
        <div className="flex justify-end pt-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setTarget(options[0] ?? 'archived')}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Super Admin: Manual Stage Override
          </Button>
        </div>
      )}

      {/* Action Confirmation Panel */}
      {target && (
        <div className="border border-brand/20 bg-brand/5 p-4 rounded-xl space-y-4">
          <form action={action} className="space-y-4">
            <input type="hidden" name="school_id" value={schoolId} />
            <input type="hidden" name="new_status" value={target} />

            <div className="flex items-center justify-between">
              <p className="text-sm">
                Super Admin Override: Transitioning from <strong className="text-muted-foreground">{SCHOOL_STATUS_META[current].label}</strong> to <strong className="text-brand">{SCHOOL_STATUS_META[target].label}</strong>.
              </p>
              <button
                type="button"
                onClick={() => setTarget('')}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Cancel transition"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="note" className="text-xs font-semibold">
                Mandatory Reason Note <span className="text-error">*</span>
              </Label>
              <Textarea
                id="note"
                name="note"
                rows={2}
                required
                defaultValue={fieldValue(state, 'note', '')}
                placeholder="Reason for manual super-admin status override..."
                className="bg-background text-sm"
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit" size="sm" disabled={pending} className="bg-brand text-white hover:bg-brand/90 flex items-center gap-1">
                {pending ? <Loader2 className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}
                Confirm Admin Override
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => setTarget('')} disabled={pending}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Error state */}
      {state.error && (
        <p role="alert" className="flex items-center gap-2 rounded-lg bg-error/10 px-3 py-2 text-sm text-error">
          <AlertCircle className="size-4 shrink-0" /> {state.error}
        </p>
      )}
      {state.ok && (
        <p role="status" className="rounded-lg bg-success/10 px-3 py-2 text-sm text-success">{state.message}</p>
      )}
    </div>
  )
}
