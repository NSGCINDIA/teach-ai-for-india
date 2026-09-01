'use client'

import { useActionState, useRef, useState } from 'react'
import { CheckCircle2, Loader2, AlertCircle, Pencil, Eye, ShieldCheck } from 'lucide-react'
import { approvePlan, savePlan, type PlanActionState } from '@/actions/plans'
import { fieldValue, fieldChecked } from '@/lib/actions/form-values'
import type { SessionPlanRow, SchoolStatus } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

import { validateSchoolOnboardingReadiness } from '@/lib/validations/readiness-gate'
import { ReadinessStrip } from '@/components/schools/readiness-strip'
import { useFormSuccess } from '@/hooks/use-form-success'
import { selectClass } from '@/components/ui/native-select'
import { toast } from 'sonner'

interface PlanningPanelProps {
  schoolId: string
  schoolStatus: SchoolStatus
  schoolDetail?: any
  /** The current OPEN (draft) plan, if one is in progress — null between sessions. */
  plan: SessionPlanRow | null
  /** Whether this school has already run at least one session — labels the
   *  empty-state form as "Plan next session" instead of "Start planning". */
  hasPriorSession: boolean
  /** Campus-scoped edit right (campus_lead / outreach_lead / admin). */
  canEdit: boolean
  /** Campus-scoped approval right (campus_lead / super_admin). */
  canApprove: boolean
}

export function PlanningPanel({ schoolId, schoolStatus, schoolDetail, plan, canEdit, canApprove }: PlanningPanelProps) {
  const mockSchool = schoolDetail ?? { id: schoolId, status: schoolStatus, dise_code: 'EXAMP123', campus_id: 'campus-1' }
  const readiness = plan ? validateSchoolOnboardingReadiness(mockSchool, plan) : null
  // An approved school opens on the summary — its details are already complete,
  // so dropping straight into a form would be noise. A draft still opens in the
  // form when requirements are outstanding, so they're visibly fillable.
  const [isEditing, setIsEditing] = useState<boolean>(
    plan?.status === 'approved' ? false : !readiness?.ready,
  )

  if (!canEdit && !canApprove) {
    return <p className="text-sm text-muted-foreground">You do not have permission to view this school’s onboarding.</p>
  }

  // Task 4: If school is at outreach_approved and onboarding hasn't been initiated yet, render Initiate Onboarding Banner
  if (schoolStatus === 'outreach_approved' && !plan) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-brand/30 bg-brand/5 p-4">
        <div>
          <h4 className="flex items-center gap-2 text-sm font-semibold text-brand">
            <CheckCircle2 className="size-4" /> Outreach approved
          </h4>
          <p className="mt-0.5 text-xs text-muted-foreground">
            The visit request is fully approved. Initiate onboarding to move this school to
            Registered and start collecting logistics details.
          </p>
        </div>
        {canEdit && <InitiateOnboardingBtn schoolId={schoolId} />}
      </div>
    )
  }

  const isDraft = plan?.status === 'draft'
  const isApproved = plan?.status === 'approved'

  if (plan && (isDraft || isApproved)) {
    return (
      <div className="space-y-5">
        {isApproved ? (
          <p className="flex items-center gap-1.5 rounded-xl border border-success/30 bg-success/10 px-3 py-2.5 text-sm font-medium text-ink-green">
            <CheckCircle2 className="size-4 shrink-0" /> Onboarding approved. School is active.
          </p>
        ) : (
          readiness && <ReadinessStrip title="Onboarding readiness" gate={readiness} />
        )}

        {/* One heading, one border. This section used to render a bordered
            "Deployment Overview" wrapper whose summary child was itself a
            bordered card with the same heading — the title appeared twice,
            nested, on every approved school. */}
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
            <h3 className="text-base font-semibold tracking-tight">
              {canEdit && (isEditing || !plan.coordinator_name)
                ? 'Deployment & onboarding details'
                : 'Deployment overview'}
            </h3>
            {canEdit && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsEditing((prev) => !prev)}
                className="h-8 gap-1.5 text-xs font-semibold"
              >
                {isEditing ? (
                  <><Eye className="size-3.5" /> View summary</>
                ) : (
                  <><Pencil className="size-3.5" /> Edit details</>
                )}
              </Button>
            )}
          </div>

          {canEdit && (isEditing || !plan.coordinator_name) ? (
            <PlanForm schoolId={schoolId} plan={plan} schoolStatus={schoolStatus} />
          ) : (
            <OnboardingSummary plan={plan} />
          )}
        </section>

        {isDraft && (
          canApprove ? (
            <div className="space-y-3 rounded-xl border border-brand/40 bg-brand/5 p-4">
              <div>
                <h4 className="flex items-center gap-2 text-sm font-bold text-brand">
                  <ShieldCheck className="size-4" /> Campus Lead verification &amp; activation
                </h4>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Review the onboarding &amp; deployment details submitted by the Outreach Lead.
                  Verify that the official approval letter is valid to activate this school.
                </p>
              </div>
              <ApproveForm schoolId={schoolId} planId={plan.id} isReady={readiness?.ready ?? false} />
            </div>
          ) : (
            <p className="flex items-center gap-2 rounded-lg border border-border bg-muted/20 p-3 text-xs text-muted-foreground">
              <ShieldCheck className="size-4 shrink-0" />
              Submitted for Campus Lead verification &amp; approval. Only the assigned Campus Lead
              can approve onboarding and activate the school.
            </p>
          )
        )}
      </div>
    )
  }

  return <PlanForm schoolId={schoolId} plan={plan} schoolStatus={schoolStatus} />
}

function PlanForm({
  schoolId, plan, schoolStatus,
}: { schoolId: string; plan: SessionPlanRow | null; schoolStatus: SchoolStatus }) {
  const [state, action, pending] = useActionState<PlanActionState, FormData>(savePlan, {})
  useFormSuccess(state)

  // Classes Covered state (Class 6..10)
  const defaultClasses = plan?.classes_covered && Array.isArray(plan.classes_covered) ? plan.classes_covered : []
  const [selectedClasses, setSelectedClasses] = useState<string[]>(defaultClasses)

  // Digital Classrooms state & live recommendation (Digital Classrooms * 2)
  const defaultDigitalClassrooms = plan?.digital_classrooms ?? 1
  const [digitalClassrooms, setDigitalClassrooms] = useState<number>(defaultDigitalClassrooms)

  // Assigned Fellows state (defaults to recommended count unless overridden)
  const defaultAssignedFellows = plan?.assigned_fellows ?? (defaultDigitalClassrooms * 2)
  const [assignedFellows, setAssignedFellows] = useState<number>(defaultAssignedFellows)
  const [hasCustomAssigned, setHasCustomAssigned] = useState<boolean>(!!plan?.assigned_fellows)

  const recommendedFellows = Math.max(0, digitalClassrooms * 2)

  const handleDigitalClassroomsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.max(1, parseInt(e.target.value || '1', 10))
    setDigitalClassrooms(val)
    if (!hasCustomAssigned) {
      setAssignedFellows(val * 2)
    }
  }

  const handleAssignedFellowsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.max(0, parseInt(e.target.value || '0', 10))
    setAssignedFellows(val)
    setHasCustomAssigned(true)
  }

  const toggleClass = (cls: string) => {
    setSelectedClasses(prev =>
      prev.includes(cls) ? prev.filter(c => c !== cls) : [...prev, cls]
    )
  }

  const AVAILABLE_CLASSES = ['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10']

  // Preferred Training Days state (Monday..Saturday)
  const defaultDays = plan?.preferred_training_days && Array.isArray(plan.preferred_training_days) ? plan.preferred_training_days : []
  const [selectedDays, setSelectedDays] = useState<string[]>(defaultDays)

  const toggleDay = (day: string) => {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    )
  }

  const WEEK_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

  return (
    <form action={action} className="space-y-6" noValidate>
      <input type="hidden" name="school_id" value={schoolId} />
      {/* Pin the save to the plan this form was rendered from, so an approved
          plan and a newer draft can't be confused for one another. */}
      {plan?.id && <input type="hidden" name="plan_id" value={plan.id} />}
      <input type="hidden" name="classes_covered" value={JSON.stringify(selectedClasses)} />
      <input type="hidden" name="preferred_training_days" value={JSON.stringify(selectedDays)} />
      <input type="hidden" name="recommended_fellows" value={recommendedFellows} />

      {state.error && (
        <p role="alert" className="flex items-start gap-2 rounded-lg bg-error/10 px-3 py-2 text-sm text-error">
          <AlertCircle className="mt-0.5 size-4 shrink-0" /> {state.error}
        </p>
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

      <Section title="School Scale">
        <Field label="Student strength" full>
          <Input type="number" min={0} name="student_strength" defaultValue={fieldValue(state, 'student_strength', numVal(plan?.student_strength))} placeholder="e.g. 450" />
        </Field>

        <div className="col-span-2 space-y-2">
          <Label>Classes Covered</Label>
          <div className="flex flex-wrap gap-3 rounded-lg border border-border bg-card p-3">
            {AVAILABLE_CLASSES.map((cls) => (
              <label key={cls} className="flex cursor-pointer select-none items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={selectedClasses.includes(cls)}
                  onChange={() => toggleClass(cls)}
                  className="size-4 rounded border-input accent-brand"
                />
                <span className="font-medium">{cls}</span>
              </label>
            ))}
          </div>
        </div>
      </Section>

      <Section title="Training Preferences">
        <div className="col-span-2 space-y-2">
          <Label>Preferred Training Days</Label>
          <div className="flex flex-wrap gap-3 rounded-lg border border-border bg-card p-3">
            {WEEK_DAYS.map((day) => (
              <label key={day} className="flex cursor-pointer select-none items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={selectedDays.includes(day)}
                  onChange={() => toggleDay(day)}
                  className="size-4 rounded border-input accent-brand"
                />
                <span className="font-medium">{day}</span>
              </label>
            ))}
          </div>
        </div>

        <Field label="Preferred Time Slot" full>
          <select
            name="preferred_time_slot"
            defaultValue={fieldValue(state, 'preferred_time_slot', plan?.preferred_time_slot ?? '')}
            className={selectClass}
          >
            <option value="">-- Select Time Slot --</option>
            <option value="Morning">Morning</option>
            <option value="Afternoon">Afternoon</option>
            <option value="Full Day">Full Day</option>
          </select>
        </Field>
      </Section>

      <Section title="Infrastructure">
        <Field label="Number of Digital Classrooms" full>
          <Input
            type="number"
            min={1}
            name="digital_classrooms"
            value={digitalClassrooms}
            onChange={handleDigitalClassroomsChange}
            placeholder="e.g. 3"
            required
          />
        </Field>

        <div className="col-span-2 space-y-2.5">
          <Label className="field-label">Infrastructure Checklist</Label>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Check name="has_lab" label="Computer lab" defaultChecked={fieldChecked(state, 'has_lab', plan?.has_lab)} />
            <Check name="has_internet" label="Internet" defaultChecked={fieldChecked(state, 'has_internet', plan?.has_internet)} />
            <Check name="has_projector" label="Projector" defaultChecked={fieldChecked(state, 'has_projector', plan?.has_projector)} />
            <Check name="smart_tv" label="Smart TV" defaultChecked={fieldChecked(state, 'smart_tv', plan?.smart_tv)} />
            <Check name="ups_backup" label="UPS / Power Backup" defaultChecked={fieldChecked(state, 'ups_backup', plan?.ups_backup)} />
          </div>
        </div>
      </Section>

      {/* Auto-calculated Recommendation Card */}
      <div className="space-y-3 rounded-xl border border-brand/20 bg-brand/5 p-4">
        <div className="flex items-center justify-between">
          <h4 className="field-label text-brand">Deployment Recommendation</h4>
          <span className="text-xs text-muted-foreground">Rule: Digital Classrooms × 2</span>
        </div>
        <div className="grid grid-cols-2 items-center gap-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Recommended Fellows</p>
            <p className="text-2xl font-bold text-foreground">{recommendedFellows}</p>
          </div>
          <Field label="Assigned Fellows">
            <Input
              type="number"
              min={0}
              name="assigned_fellows"
              value={assignedFellows}
              onChange={handleAssignedFellowsChange}
              placeholder="e.g. 6"
            />
          </Field>
        </div>
      </div>

      <input type="hidden" name="session_type" value="awareness" />

      <Section title="Documents">
        <Field label="Approval letter (storage path)" required full>
          <Input
            name="approval_letter_path"
            required
            defaultValue={fieldValue(state, 'approval_letter_path', plan?.approval_letter_path ?? '')}
            placeholder="Paste the uploaded letter path"
          />
        </Field>
      </Section>

      <div className="space-y-1.5">
        <Label htmlFor="logistics_notes">Logistics notes</Label>
        <Textarea id="logistics_notes" name="logistics_notes" rows={3} defaultValue={fieldValue(state, 'logistics_notes', plan?.logistics_notes ?? '')} placeholder="Directions, permissions, equipment to carry…" />
      </div>

      <Button type="submit" size="sm" disabled={pending}>
        {pending ? <Loader2 className="size-4 animate-spin" /> : null}
        {schoolStatus === 'registered'
          ? 'Submit Onboarding Details'
          : 'Update Onboarding Details'}
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
      <legend className="field-label">{title}</legend>
      <div className="grid grid-cols-2 gap-3">{children}</div>
    </fieldset>
  )
}

function Field({ label, children, full, required }: { label: string; children: React.ReactNode; full?: boolean; required?: boolean }) {
  return (
    <div className={`space-y-1.5 ${full ? 'col-span-2' : ''}`}>
      <Label>
        {label}
        {required && <span className="text-error"> *</span>}
      </Label>
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

/**
 * The read-only view of the onboarding record. It no longer draws its own card
 * or repeats the section heading — the section above provides both.
 */
function OnboardingSummary({ plan }: { plan: SessionPlanRow }) {
  const classesList = plan.classes_covered && Array.isArray(plan.classes_covered) ? plan.classes_covered : []
  const trainingDays =
    plan.preferred_training_days && Array.isArray(plan.preferred_training_days)
      ? plan.preferred_training_days
      : []

  return (
    <div className="space-y-5 text-sm">
      <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <SummaryField label="Coordinator" value={plan.coordinator_name} />
        <SummaryField label="Phone" value={plan.coordinator_phone} />
        <SummaryField label="Designation" value={plan.coordinator_designation} />
        <SummaryField label="Student strength" value={plan.student_strength} />
        <SummaryField label="Digital classrooms" value={plan.digital_classrooms ?? 1} />
        <SummaryField label="Preferred time slot" value={plan.preferred_time_slot} />
        <SummaryField
          label="Recommended fellows"
          value={`${plan.recommended_fellows ?? ((plan.digital_classrooms ?? 1) * 2)} (${plan.digital_classrooms ?? 1} rooms × 2)`}
        />
        <SummaryField
          label="Assigned fellows"
          value={plan.assigned_fellows ?? plan.recommended_fellows ?? 2}
        />
      </dl>

      <div className="grid gap-4 border-t border-border/60 pt-4 sm:grid-cols-2">
        <ChipRow label="Classes covered" values={classesList} empty="None specified" />
        <ChipRow label="Preferred training days" values={trainingDays} empty="None selected" tone="brand" />
      </div>

      <div className="space-y-2 border-t border-border/60 pt-4">
        <dt className="field-label">Infrastructure</dt>
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs">
          <Infra label="Computer lab" available={plan.has_lab} />
          <Infra label="Internet" available={plan.has_internet} />
          <Infra label="Projector" available={plan.has_projector} />
          <Infra label="Smart TV" available={plan.smart_tv} />
          <Infra label="UPS / power backup" available={plan.ups_backup} />
        </div>
      </div>

      {(plan.approval_letter_path || plan.logistics_notes) && (
        <div className="space-y-3 border-t border-border/60 pt-4">
          {plan.approval_letter_path && (
            <div>
              <dt className="field-label">Approval letter</dt>
              <dd className="mt-0.5 truncate font-mono text-xs text-muted-foreground">{plan.approval_letter_path}</dd>
            </div>
          )}
          {plan.logistics_notes && (
            <div>
              <dt className="field-label">Logistics notes</dt>
              <dd className="mt-0.5 whitespace-pre-line text-muted-foreground">{plan.logistics_notes}</dd>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function SummaryField({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div>
      <dt className="field-label">{label}</dt>
      <dd className="mt-0.5 font-medium">{value === null || value === undefined || value === '' ? '—' : value}</dd>
    </div>
  )
}

function ChipRow({
  label, values, empty, tone,
}: { label: string; values: string[]; empty: string; tone?: 'brand' }) {
  return (
    <div>
      <dt className="field-label">{label}</dt>
      <dd className="mt-1.5 flex flex-wrap gap-1.5">
        {values.length > 0 ? (
          values.map((v) => (
            <span
              key={v}
              className={
                tone === 'brand'
                  ? 'rounded-md border border-brand/20 bg-brand/10 px-2 py-0.5 text-xs font-medium text-brand'
                  : 'rounded-md border border-border bg-muted/50 px-2 py-0.5 text-xs font-medium'
              }
            >
              {v}
            </span>
          ))
        ) : (
          <span className="text-xs italic text-muted-foreground">{empty}</span>
        )}
      </dd>
    </div>
  )
}

function Infra({ label, available }: { label: string; available?: boolean }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={`size-2 rounded-full ${available ? 'bg-success' : 'bg-muted-foreground/30'}`} />
      <span className="font-medium">{label}</span>
      <span className="text-muted-foreground">{available ? 'Yes' : 'No'}</span>
    </span>
  )
}

function ApproveForm({ schoolId, planId, isReady = true }: { schoolId: string; planId: string; isReady?: boolean }) {
  const [state, action, pending] = useActionState<PlanActionState, FormData>(approvePlan, {})
  const formRef = useRef<HTMLFormElement>(null)
  useFormSuccess(state, { formRef })

  return (
    <form ref={formRef} action={action} className="space-y-2">
      <input type="hidden" name="school_id" value={schoolId} />
      <input type="hidden" name="plan_id" value={planId} />

      <label className="flex items-start gap-2 rounded-lg border border-border bg-muted/20 p-3 text-sm">
        <input
          type="checkbox"
          name="approval_letter_verified"
          value="true"
          required
          className="mt-0.5 size-4 accent-brand"
        />
        <span>I have verified that the official approval letter is valid for this school and session.</span>
      </label>

      {state.error && (
        <p role="alert" className="flex items-center gap-2 rounded-lg bg-error/10 px-3 py-2 text-sm text-error">
          <AlertCircle className="size-4 shrink-0" /> {state.error}
        </p>
      )}

      <Button type="submit" size="sm" disabled={pending || !isReady}>
        {pending ? <Loader2 className="size-4 animate-spin" /> : null}
        Verify, approve &amp; activate school
      </Button>
    </form>
  )
}

function InitiateOnboardingBtn({ schoolId }: { schoolId: string }) {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleInitiate = async () => {
    setPending(true)
    setError(null)
    const { initiateSchoolOnboarding } = await import('@/actions/schools')
    const res = await initiateSchoolOnboarding(schoolId)
    setPending(false)
    if (res.error) {
      setError(res.error)
      return
    }
    toast.success(res.message ?? 'School onboarding initiated successfully')
  }

  return (
    <div className="space-y-1">
      {error && <p className="text-xs text-error">{error}</p>}
      <Button type="button" size="sm" disabled={pending} onClick={handleInitiate}>
        {pending ? <Loader2 className="size-3.5 animate-spin" /> : null}
        Initiate school onboarding
      </Button>
    </div>
  )
}
