'use client'

import { useActionState, useRef, type ReactNode } from 'react'
import { CalendarClock, Check, HandHeart, Loader2, Mail, MailWarning, X } from 'lucide-react'
import {
  claimVolunteerApplication,
  recordInterviewResult,
  resendInterviewInvite,
  scheduleVolunteerInterview,
  sendDecisionEmail,
  type ApplicationActionState,
} from '@/actions/volunteer-applications'
import type { CampusVolunteerApplication } from '@/lib/data/volunteer-applications'
import { applicationStage, STAGE_META } from '@/lib/volunteer-applications/stage'
import { formatDate, formatDateTime } from '@/lib/format'
import { formatInterviewTime } from '@/lib/email/volunteer-application-emails'
import { useFormSuccess } from '@/hooks/use-form-success'
import { StatusBadge } from '@/components/shared/status-badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

type ActionFn = (prev: ApplicationActionState, formData: FormData) => Promise<ApplicationActionState>

function useAction(fn: ActionFn) {
  const [state, action, pending] = useActionState<ApplicationActionState, FormData>(fn, {})
  useFormSuccess(state)
  return { state, action, pending }
}

function FieldError({ state }: { state: ApplicationActionState }) {
  if (!state.error) return null
  return <p role="alert" className="text-xs text-error">{state.error}</p>
}

/** A one-button form that posts just the application id. */
function IdButton({
  id, fn, children, variant = 'default',
}: { id: string; fn: ActionFn; children: ReactNode; variant?: 'default' | 'outline' }) {
  const { state, action, pending } = useAction(fn)
  return (
    <form action={action} className="space-y-1">
      <input type="hidden" name="id" value={id} />
      <Button type="submit" size="sm" variant={variant} disabled={pending}>
        {pending ? <Loader2 className="size-3.5 animate-spin" /> : null}
        {children}
      </Button>
      <FieldError state={state} />
    </form>
  )
}

function ScheduleForm({ application, submitLabel }: { application: CampusVolunteerApplication; submitLabel: string }) {
  const { state, action, pending } = useAction(scheduleVolunteerInterview)
  const formRef = useRef<HTMLFormElement>(null)
  const id = `schedule-${application.id}`
  return (
    <form ref={formRef} action={action} className="grid gap-3 sm:grid-cols-3">
      <input type="hidden" name="id" value={application.id} />
      <div className="space-y-1.5">
        <Label htmlFor={`${id}-at`}>Date &amp; time (IST)</Label>
        <Input id={`${id}-at`} name="interview_at" type="datetime-local" required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={`${id}-who`}>Success coach</Label>
        <Input id={`${id}-who`} name="interviewer" required maxLength={120} defaultValue={application.interviewer_name ?? ''} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={`${id}-mode`}>Meeting link or place</Label>
        <Input id={`${id}-mode`} name="mode" required maxLength={300} defaultValue={application.interview_mode ?? ''} />
      </div>
      <div className="flex items-center gap-3 sm:col-span-3">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? <Loader2 className="size-3.5 animate-spin" /> : <Mail className="size-3.5" />}
          {submitLabel}
        </Button>
        <FieldError state={state} />
      </div>
    </form>
  )
}

function ResultForm({ application }: { application: CampusVolunteerApplication }) {
  const { state, action, pending } = useAction(recordInterviewResult)
  const id = `result-${application.id}`
  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="id" value={application.id} />
      <fieldset className="flex flex-wrap gap-4">
        <legend className="sr-only">Interview result</legend>
        <label className="flex items-center gap-2 text-sm">
          <input type="radio" name="result" value="selected" required defaultChecked={application.interview_result === 'selected'} />
          Selected
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="radio" name="result" value="rejected" defaultChecked={application.interview_result === 'rejected'} />
          Rejected
        </label>
      </fieldset>
      <div className="space-y-1.5">
        <Label htmlFor={`${id}-notes`}>Notes from the success coach (optional)</Label>
        <Textarea id={`${id}-notes`} name="notes" maxLength={1000} defaultValue={application.interview_notes ?? ''} />
      </div>
      <div className="flex items-center gap-3">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}
          Save result
        </Button>
        <FieldError state={state} />
      </div>
    </form>
  )
}

function Step({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mt-3 rounded-lg border border-border bg-background p-3">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</p>
      {children}
    </div>
  )
}

export function VolunteerApplicationCard({
  application,
  canAct,
  currentUserId,
}: {
  application: CampusVolunteerApplication
  /** True only for a volunteer_lead — the database refuses everyone else too. */
  canAct: boolean
  currentUserId: string
}) {
  const stage = applicationStage(application)
  const meta = STAGE_META[stage]
  const mine = canAct && application.claimed_by === currentUserId
  const inviteSent = !!application.interview_invite_sent_at

  return (
    <li className="rounded-xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-medium">{application.full_name}</p>
          <p className="text-xs text-muted-foreground">
            {application.email}
            {application.phone ? ` · ${application.phone}` : ''} · applied {formatDate(application.created_at)}
          </p>
        </div>
        <StatusBadge label={meta.label} tone={meta.tone} />
      </div>

      {application.motivation && (
        <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{application.motivation}</p>
      )}

      {application.claimer_name && !mine && stage !== 'applied' && (
        <p className="mt-2 text-xs text-muted-foreground">Picked up by {application.claimer_name}</p>
      )}

      {/* Step 5 — pick it up */}
      {stage === 'applied' && (
        <div className="mt-3">
          {canAct ? (
            <IdButton id={application.id} fn={claimVolunteerApplication}>
              <HandHeart className="size-3.5" /> Pick it up
            </IdButton>
          ) : (
            <p className="text-xs text-muted-foreground">Waiting for the Volunteer Lead to pick this up.</p>
          )}
        </div>
      )}

      {/* Step 6 — schedule the interview */}
      {mine && stage === 'picked_up' && (
        <Step title="Schedule the interview">
          <ScheduleForm application={application} submitLabel="Send interview invite" />
        </Step>
      )}

      {application.interview_at && stage !== 'applied' && stage !== 'picked_up' && (
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
          <span className="inline-flex items-center gap-1.5">
            <CalendarClock className="size-4 text-muted-foreground" />
            {formatInterviewTime(application.interview_at)}
          </span>
          <span className="text-muted-foreground">
            {application.interviewer_name} · {application.interview_mode}
          </span>
          {stage === 'interview_scheduled' && (
            <span className={inviteSent ? 'text-xs text-ink-green' : 'inline-flex items-center gap-1 text-xs text-error'}>
              {inviteSent
                ? `Invite sent ${formatDateTime(application.interview_invite_sent_at)}`
                : <><MailWarning className="size-3.5" /> Invite not sent yet</>}
            </span>
          )}
        </div>
      )}

      {mine && stage === 'interview_scheduled' && (
        <>
          {!inviteSent && (
            <div className="mt-3">
              <IdButton id={application.id} fn={resendInterviewInvite} variant="outline">
                <Mail className="size-3.5" /> Resend invite
              </IdButton>
            </div>
          )}
          {/* Step 7 — the result, entered after the success coach's interview */}
          <Step title="Interview result">
            <ResultForm application={application} />
          </Step>
          <details className="mt-3 text-sm">
            <summary className="cursor-pointer text-muted-foreground">Reschedule</summary>
            <div className="mt-2"><ScheduleForm application={application} submitLabel="Reschedule and resend invite" /></div>
          </details>
        </>
      )}

      {/* Step 8 — send the decision email */}
      {stage === 'interview_done' && (
        <div className="mt-3 space-y-3">
          <p className="text-sm">
            Result: <strong>{application.interview_result === 'selected' ? 'Selected' : 'Rejected'}</strong>
            {application.interview_notes ? <span className="text-muted-foreground"> — {application.interview_notes}</span> : null}
          </p>
          {mine && (
            <>
              <IdButton id={application.id} fn={sendDecisionEmail}>
                {application.interview_result === 'selected'
                  ? <><Check className="size-3.5" /> Send &ldquo;Selected&rdquo; email</>
                  : <><X className="size-3.5" /> Send &ldquo;Rejected&rdquo; email</>}
              </IdButton>
              <details className="text-sm">
                <summary className="cursor-pointer text-muted-foreground">Change the result</summary>
                <div className="mt-2"><ResultForm application={application} /></div>
              </details>
            </>
          )}
        </div>
      )}

      {(stage === 'selected' || stage === 'rejected') && application.decided_at && (
        <p className="mt-2 text-xs text-muted-foreground">
          {stage === 'selected' ? 'Selected' : 'Rejected'} on {formatDate(application.decided_at)} — email sent.
        </p>
      )}
    </li>
  )
}
