'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { AlertCircle, ArrowRight, CalendarClock, CheckCircle2, Loader2 } from 'lucide-react'
import { savePlan, approvePlan, type PlanActionState } from '@/actions/plans'
import { SESSION_TYPE_META } from '@/lib/constants/sessions'
import type { SessionPlanRow, SessionType, SchoolStatus } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

const SELECT_CLASS =
  'border-input h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] dark:bg-input/30'

const SESSION_TYPES = Object.entries(SESSION_TYPE_META) as [SessionType, { label: string }][]

interface PlanningPanelProps {
  schoolId: string
  schoolStatus: SchoolStatus
  plan: SessionPlanRow | null
  /** Campus-scoped edit right (campus_lead / outreach_head / admin). */
  canEdit: boolean
  /** Where the created session lives, for the read-only "approved" view. */
  basePath: string
}

export function PlanningPanel({ schoolId, schoolStatus, plan, canEdit, basePath }: PlanningPanelProps) {
  // Approved plans are locked — show the handoff summary + link to the session.
  if (plan?.status === 'approved') {
    return (
      <div className="space-y-3">
        <p className="flex items-center gap-2 rounded-lg bg-success/10 px-3 py-2 text-sm text-success">
          <CheckCircle2 className="size-4 shrink-0" /> Planning approved — the session has been created and the team notified.
        </p>
        {plan.session_id && (
          <Button asChild variant="outline" size="sm">
            <Link href={`${basePath.replace('/schools', '/sessions')}/${plan.session_id}`}>
              <CalendarClock className="size-4" /> View scheduled session
            </Link>
          </Button>
        )}
      </div>
    )
  }

  if (!canEdit) {
    return <p className="text-sm text-muted-foreground">You have read-only access to this school’s planning.</p>
  }

  return (
    <div className="space-y-5">
      <PlanForm schoolId={schoolId} plan={plan} />
      {plan && <ApproveForm schoolId={schoolId} planId={plan.id} schoolStatus={schoolStatus} />}
    </div>
  )
}

function PlanForm({ schoolId, plan }: { schoolId: string; plan: SessionPlanRow | null }) {
  const [state, action, pending] = useActionState<PlanActionState, FormData>(savePlan, {})

  return (
    <form action={action} className="space-y-5" noValidate>
      <input type="hidden" name="school_id" value={schoolId} />

      {state.error && (
        <p role="alert" className="flex items-start gap-2 rounded-lg bg-error/10 px-3 py-2 text-sm text-error">
          <AlertCircle className="mt-0.5 size-4 shrink-0" /> {state.error}
        </p>
      )}
      {state.ok && state.message && (
        <p role="status" className="rounded-lg bg-success/10 px-3 py-2 text-sm text-success">{state.message}</p>
      )}

      <Section title="School coordinator">
        <Field label="Name">
          <Input name="coordinator_name" defaultValue={plan?.coordinator_name ?? ''} placeholder="Point of contact" />
        </Field>
        <Field label="Phone">
          <Input name="coordinator_phone" defaultValue={plan?.coordinator_phone ?? ''} placeholder="+91…" />
        </Field>
        <Field label="Designation">
          <Input name="coordinator_designation" defaultValue={plan?.coordinator_designation ?? ''} placeholder="e.g. Head Teacher" />
        </Field>
      </Section>

      <Section title="Scale">
        <Field label="Student strength">
          <Input type="number" min={0} name="student_strength" defaultValue={numVal(plan?.student_strength)} />
        </Field>
        <Field label="Classes">
          <Input type="number" min={0} name="num_classes" defaultValue={numVal(plan?.num_classes)} />
        </Field>
        <Field label="Sections">
          <Input type="number" min={0} name="num_sections" defaultValue={numVal(plan?.num_sections)} />
        </Field>
        <Field label="Classrooms">
          <Input type="number" min={0} name="num_classrooms" defaultValue={numVal(plan?.num_classrooms)} />
        </Field>
      </Section>

      <Section title="On-site infrastructure">
        <Check name="has_lab" label="Computer lab" defaultChecked={plan?.has_lab} />
        <Check name="has_projector" label="Projector" defaultChecked={plan?.has_projector} />
        <Check name="has_internet" label="Internet" defaultChecked={plan?.has_internet} />
      </Section>

      <Section title="Scheduling">
        <Field label="Session type">
          <select name="session_type" defaultValue={plan?.session_type ?? 'awareness'} className={SELECT_CLASS}>
            {SESSION_TYPES.map(([value, meta]) => (
              <option key={value} value={value}>{meta.label}</option>
            ))}
          </select>
        </Field>
        <Field label="Topic">
          <Input name="topic" defaultValue={plan?.topic ?? ''} placeholder="Session focus" />
        </Field>
        <Field label="Planned date">
          <Input type="date" name="planned_date" defaultValue={plan?.planned_date ?? ''} />
        </Field>
        <Field label="Backup date">
          <Input type="date" name="backup_date" defaultValue={plan?.backup_date ?? ''} />
        </Field>
        <Field label="Start time">
          <Input type="time" name="start_time" defaultValue={plan?.start_time?.slice(0, 5) ?? ''} />
        </Field>
        <Field label="End time">
          <Input type="time" name="end_time" defaultValue={plan?.end_time?.slice(0, 5) ?? ''} />
        </Field>
      </Section>

      <Section title="Documents">
        <Field label="Approval letter (storage path)" full>
          <Input name="approval_letter_path" defaultValue={plan?.approval_letter_path ?? ''} placeholder="Paste the uploaded letter path (optional)" />
        </Field>
      </Section>

      <div className="space-y-1.5">
        <Label htmlFor="logistics_notes">Logistics notes</Label>
        <Textarea id="logistics_notes" name="logistics_notes" rows={3} defaultValue={plan?.logistics_notes ?? ''} placeholder="Directions, permissions, equipment to carry…" />
      </div>

      <Button type="submit" size="sm" variant="outline" disabled={pending}>
        {pending ? <Loader2 className="size-4 animate-spin" /> : null}
        {plan ? 'Save planning' : 'Start planning'}
      </Button>
    </form>
  )
}

function ApproveForm({ schoolId, planId, schoolStatus }: { schoolId: string; planId: string; schoolStatus: SchoolStatus }) {
  const [state, action, pending] = useActionState<PlanActionState, FormData>(approvePlan, {})
  const ready = schoolStatus === 'approval_received'

  return (
    <form action={action} className="space-y-2 border-t border-border pt-4">
      <input type="hidden" name="school_id" value={schoolId} />
      <input type="hidden" name="plan_id" value={planId} />

      {state.error && (
        <p role="alert" className="flex items-start gap-2 rounded-lg bg-error/10 px-3 py-2 text-sm text-error">
          <AlertCircle className="mt-0.5 size-4 shrink-0" /> {state.error}
        </p>
      )}
      {!ready && (
        <p className="text-xs text-muted-foreground">
          Approving planning creates the session and notifies the Execution &amp; Volunteer Leads. Available once the school reaches <strong>Approval Received</strong>.
        </p>
      )}
      <Button type="submit" size="sm" disabled={pending || !ready}>
        {pending ? <Loader2 className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}
        Approve planning
      </Button>
    </form>
  )
}

function numVal(n: number | null | undefined): string {
  return n === null || n === undefined ? '' : String(n)
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-3">
      <legend className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{title}</legend>
      <div className="grid grid-cols-2 gap-3">{children}</div>
    </fieldset>
  )
}

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div className={`space-y-1.5 ${full ? 'col-span-2' : ''}`}>
      <Label>{label}</Label>
      {children}
    </div>
  )
}

function Check({ name, label, defaultChecked }: { name: string; label: string; defaultChecked?: boolean }) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="size-4 rounded border-input accent-brand" />
      {label}
    </label>
  )
}
