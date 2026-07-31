'use client'

import { CheckCircle2, Circle, Clock, Users, Wrench, Calendar, Award } from 'lucide-react'
import type { OperationalPhase, SchoolStatus } from '@/types/database'
import { getOperationalProgress, OPERATIONAL_PHASE_META } from '@/lib/constants/operational-phases'

interface OperationalProgressProps {
  status: SchoolStatus
  operationalPhase: OperationalPhase | null
  requiredVolunteers?: number
  confirmedVolunteers?: number
}

const STAGES = [
  { key: 'team', label: '1. Volunteer Team', icon: Users },
  { key: 'execution', label: '2. Execution Plan', icon: Wrench },
  { key: 'session_1', label: '3. Session 1', icon: Calendar },
  { key: 'session_2', label: '4. Session 2', icon: Calendar },
  { key: 'session_3', label: '5. Session 3', icon: Calendar },
  { key: 'session_4', label: '6. Session 4', icon: Calendar },
]

export function OperationalProgress({
  status,
  operationalPhase,
  requiredVolunteers = 0,
  confirmedVolunteers = 0,
}: OperationalProgressProps) {
  if (status !== 'sessions_active' && status !== 'completed') {
    return null
  }

  const { percent, label, currentStep } = getOperationalProgress(operationalPhase)
  const isCompleted = status === 'completed'

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider font-semibold text-brand">
              Execution Workflow
            </span>
            <span className="rounded-full bg-brand/10 px-2 py-0.5 text-xs font-medium text-brand">
              {isCompleted ? 'Program Complete' : label}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {isCompleted
              ? 'All 4 sessions successfully delivered and verified!'
              : operationalPhase ? OPERATIONAL_PHASE_META[operationalPhase]?.description : 'Initial setup'}
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-medium">
          {requiredVolunteers > 0 && (
            <span className="flex items-center gap-1 rounded-md bg-muted px-2.5 py-1 text-muted-foreground">
              <Users className="size-3.5" /> Team: {confirmedVolunteers}/{requiredVolunteers}
            </span>
          )}
          <span className="text-sm font-bold text-foreground">{isCompleted ? 100 : percent}%</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full bg-brand transition-all duration-500 rounded-full"
          style={{ width: `${isCompleted ? 100 : percent}%` }}
        />
      </div>

      {/* Milestone Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 pt-1">
        {STAGES.map((s, idx) => {
          const stepNum = idx + 1
          const isDone = isCompleted || (currentStep > stepNum)
          const isCurrent = !isCompleted && currentStep === stepNum
          const Icon = s.icon

          return (
            <div
              key={s.key}
              className={`flex items-center gap-2 p-2 rounded-lg border text-xs font-medium transition-all ${
                isDone
                  ? 'border-success/30 bg-success/5 text-success'
                  : isCurrent
                    ? 'border-brand bg-brand/5 text-brand ring-1 ring-brand/20'
                    : 'border-border bg-muted/20 text-muted-foreground/60'
              }`}
            >
              {isDone ? (
                <CheckCircle2 className="size-3.5 shrink-0 text-success" />
              ) : isCurrent ? (
                <Clock className="size-3.5 shrink-0 animate-pulse text-brand" />
              ) : (
                <Circle className="size-3.5 shrink-0 text-muted-foreground/40" />
              )}
              <span className="truncate">{s.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
