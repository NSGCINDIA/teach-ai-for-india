'use client'

import { useActionState } from 'react'
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import { savePlan, type PlanActionState } from '@/actions/plans'
import { fieldValue, fieldChecked } from '@/lib/actions/form-values'
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
  /** The current OPEN (draft) plan, if one is in progress — null between sessions. */
  plan: SessionPlanRow | null
  /** Whether this school has already run at least one session — labels the
   *  empty-state form as "Plan next session" instead of "Start planning". */
  hasPriorSession: boolean
  /** Campus-scoped edit right (campus_lead / outreach_lead / admin). */
  canEdit: boolean
}

export function PlanningPanel({ schoolId, schoolStatus, plan, hasPriorSession, canEdit }: PlanningPanelProps) {
  if (!canEdit) {
    return <p className="text-sm text-muted-foreground">You have read-only access to this school’s onboarding.</p>
  }

  return (
    <div className="space-y-5">
      <PlanForm schoolId={schoolId} plan={plan} schoolStatus={schoolStatus} />
    </div>
  )
}

function PlanForm({
  schoolId, plan, schoolStatus,
}: { schoolId: string; plan: SessionPlanRow | null; schoolStatus: SchoolStatus }) {
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
          <Input name="coordinator_name" defaultValue={fieldValue(state, 'coordinator_name', plan?.coordinator_name ?? '')} placeholder="Point of contact" />
        </Field>
        <Field label="Phone">
          <Input name="coordinator_phone" defaultValue={fieldValue(state, 'coordinator_phone', plan?.coordinator_phone ?? '')} placeholder="+91…" />
        </Field>
        <Field label="Designation">
          <Input name="coordinator_designation" defaultValue={fieldValue(state, 'coordinator_designation', plan?.coordinator_designation ?? '')} placeholder="e.g. Head Teacher" />
        </Field>
      </Section>

      <Section title="Scale">
        <Field label="Student strength">
          <Input type="number" min={0} name="student_strength" defaultValue={fieldValue(state, 'student_strength', numVal(plan?.student_strength))} />
        </Field>
        <Field label="Classes">
          <Input type="number" min={0} name="num_classes" defaultValue={fieldValue(state, 'num_classes', numVal(plan?.num_classes))} />
        </Field>
        <Field label="Sections">
          <Input type="number" min={0} name="num_sections" defaultValue={fieldValue(state, 'num_sections', numVal(plan?.num_sections))} />
        </Field>
        <Field label="Classrooms">
          <Input type="number" min={0} name="num_classrooms" defaultValue={fieldValue(state, 'num_classrooms', numVal(plan?.num_classrooms))} />
        </Field>
      </Section>

      <Section title="On-site infrastructure">
        <Check name="has_lab" label="Computer lab" defaultChecked={fieldChecked(state, 'has_lab', plan?.has_lab)} />
        <Check name="has_projector" label="Projector" defaultChecked={fieldChecked(state, 'has_projector', plan?.has_projector)} />
        <Check name="has_internet" label="Internet" defaultChecked={fieldChecked(state, 'has_internet', plan?.has_internet)} />
      </Section>

      <input type="hidden" name="session_type" value="awareness" />

      <Section title="Documents">
        <Field label="Approval letter (storage path)" full>
          <Input name="approval_letter_path" defaultValue={fieldValue(state, 'approval_letter_path', plan?.approval_letter_path ?? '')} placeholder="Paste the uploaded letter path (optional)" />
        </Field>
      </Section>

      <div className="space-y-1.5">
        <Label htmlFor="logistics_notes">Logistics notes</Label>
        <Textarea id="logistics_notes" name="logistics_notes" rows={3} defaultValue={fieldValue(state, 'logistics_notes', plan?.logistics_notes ?? '')} placeholder="Directions, permissions, equipment to carry…" />
      </div>

      <Button type="submit" size="sm" variant="outline" disabled={pending}>
        {pending ? <Loader2 className="size-4 animate-spin" /> : null}
        {schoolStatus === 'registered' ? 'Save & Onboard School' : 'Save Onboarding Details'}
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
