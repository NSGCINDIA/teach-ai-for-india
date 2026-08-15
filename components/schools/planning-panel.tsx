'use client'

import { useActionState, useState } from 'react'
import { CheckCircle2, Loader2, AlertCircle, Pencil, Eye, ShieldCheck } from 'lucide-react'
import { approvePlan, savePlan, type PlanActionState } from '@/actions/plans'
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

import { validateSchoolOnboardingReadiness } from '@/lib/validations/readiness-gate'
import { Badge } from '@/components/ui/badge'

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

export function PlanningPanel({ schoolId, schoolStatus, schoolDetail, plan, hasPriorSession, canEdit, canApprove }: PlanningPanelProps) {
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
      <div className="rounded-lg border border-brand/30 bg-brand/5 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold text-brand flex items-center gap-2">
              <CheckCircle2 className="size-4" /> Outreach Approved!
            </h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              Outreach visit request fully approved. Initiate school onboarding to move to Registered and begin collecting logistics details.
            </p>
          </div>
          {canEdit && <InitiateOnboardingBtn schoolId={schoolId} />}
        </div>
      </div>
    )
  }

  if (plan && plan.status === 'draft') {
    return (
      <div className="space-y-4">
        {/* Onboarding Readiness Gate Card */}
        {readiness && (
          <div className={`rounded-lg p-4 border space-y-3 ${readiness.ready ? 'bg-success/5 border-success/30' : 'bg-warning/5 border-warning/30'}`}>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  {readiness.ready ? (
                    <CheckCircle2 className="size-4 text-success" />
                  ) : (
                    <AlertCircle className="size-4 text-warning" />
                  )}
                  Onboarding Readiness
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {readiness.completed} / {readiness.total} requirements completed
                </p>
              </div>
              <Badge variant="outline" className={readiness.ready ? 'border-success/30 bg-success/10 text-success font-bold' : 'border-warning/30 bg-warning/10 text-warning font-bold'}>
                {readiness.ready ? 'READY FOR ACTIVATION' : 'INCOMPLETE'}
              </Badge>
            </div>

            {/* Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
              {readiness.items.map((item) => (
                <div key={item.key} className="flex items-center gap-1.5">
                  {item.satisfied ? (
                    <CheckCircle2 className="size-3.5 text-success shrink-0" />
                  ) : (
                    <AlertCircle className="size-3.5 text-destructive shrink-0" />
                  )}
                  <span className={item.satisfied ? 'text-foreground font-medium' : 'text-destructive font-semibold'}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>

            {!readiness.ready && (
              <p className="text-xs text-destructive font-medium border-t border-warning/20 pt-2">
                Missing: {readiness.missing.join(', ')}. Complete missing fields below before activation.
              </p>
            )}
          </div>
        )}

        <div className="space-y-4 rounded-xl border border-border p-5 bg-card">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
            <h3 className="font-semibold text-base tracking-tight">
              {isEditing || !plan.coordinator_name ? 'Fill / Edit Deployment & Onboarding Details' : 'Deployment Overview'}
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
                  <>
                    <Eye className="size-3.5" /> View Summary
                  </>
                ) : (
                  <>
                    <Pencil className="size-3.5" /> Edit Onboarding Details
                  </>
                )}
              </Button>
            )}
          </div>

          {canEdit && (isEditing || !plan.coordinator_name) ? (
            <PlanForm schoolId={schoolId} plan={plan} schoolStatus={schoolStatus} />
          ) : (
            <OnboardingSummary plan={plan} />
          )}
        </div>

        {canApprove ? (
          <div className="rounded-xl border border-brand/40 bg-brand/5 p-4 space-y-3">
            <div>
              <h4 className="text-sm font-bold text-brand flex items-center gap-2">
                <ShieldCheck className="size-4" /> Campus Lead Verification &amp; Activation
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Review the onboarding &amp; deployment details submitted by the Outreach Lead. Verify that the official approval letter is valid to activate this school.
              </p>
            </div>
            <ApproveForm schoolId={schoolId} planId={plan.id} isReady={readiness?.ready ?? false} />
          </div>
        ) : (
          <div className="rounded-lg border border-border bg-muted/20 p-3 text-xs text-muted-foreground flex items-center gap-2">
            <ShieldCheck className="size-4 text-muted-foreground shrink-0" />
            <span>Submitted for Campus Lead verification &amp; approval. Only the assigned Campus Lead can approve onboarding and activate the school.</span>
          </div>
        )}
      </div>
    )
  }

  if (plan && plan.status === 'approved') {
    return (
      <div className="space-y-4">
        <div className="rounded-lg bg-success/10 p-4 border border-success/20">
          <p className="text-sm font-medium text-success flex items-center gap-1.5">
            <CheckCircle2 className="size-4 shrink-0" /> Onboarding approved. School is Active!
          </p>
        </div>

        {/* Approval is not the end of edits. Coordinators change, a projector
            arrives, fellow counts get revised — an active school still needs its
            deployment details corrected. This branch previously rendered the
            summary alone, with no edit control anywhere, which left the details
            permanently read-only once a Campus Lead approved onboarding.
            Saving here keeps the plan approved (see savePlan). */}
        <div className="space-y-4 rounded-xl border border-border p-5 bg-card">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
            <h3 className="font-semibold text-base tracking-tight">
              {isEditing ? 'Edit Deployment & Onboarding Details' : 'Deployment Overview'}
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
                  <>
                    <Eye className="size-3.5" /> View Summary
                  </>
                ) : (
                  <>
                    <Pencil className="size-3.5" /> Edit Onboarding Details
                  </>
                )}
              </Button>
            )}
          </div>

          {canEdit && isEditing ? (
            <PlanForm schoolId={schoolId} plan={plan} schoolStatus={schoolStatus} />
          ) : (
            <OnboardingSummary plan={plan} />
          )}
        </div>
      </div>
    )
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

      <Section title="School Scale">
        <Field label="Student strength" full>
          <Input type="number" min={0} name="student_strength" defaultValue={fieldValue(state, 'student_strength', numVal(plan?.student_strength))} placeholder="e.g. 450" />
        </Field>

        <div className="col-span-2 space-y-2">
          <Label>Classes Covered</Label>
          <div className="flex flex-wrap gap-3 rounded-lg border border-border bg-card p-3">
            {AVAILABLE_CLASSES.map((cls) => (
              <label key={cls} className="flex items-center gap-2 text-sm cursor-pointer select-none">
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
              <label key={day} className="flex items-center gap-2 text-sm cursor-pointer select-none">
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
            className={SELECT_CLASS}
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
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">Infrastructure Checklist</Label>
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
      <div className="rounded-xl border border-brand/20 bg-brand/5 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-brand">Deployment Recommendation</h4>
          <span className="text-xs text-muted-foreground">Rule: Digital Classrooms × 2</span>
        </div>
        <div className="grid grid-cols-2 gap-4 items-center">
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
        <Field label="Approval letter (storage path)" full>
          <Input name="approval_letter_path" defaultValue={fieldValue(state, 'approval_letter_path', plan?.approval_letter_path ?? '')} placeholder="Paste the uploaded letter path (optional)" />
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

function OnboardingSummary({ plan }: { plan: SessionPlanRow }) {
  const classesList = plan.classes_covered && Array.isArray(plan.classes_covered) ? plan.classes_covered : []

  return (
    <div className="rounded-xl border border-border p-5 space-y-5 bg-card text-sm shadow-2xs">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <h3 className="font-semibold text-base tracking-tight">Deployment Overview</h3>
        <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-brand/10 text-brand">
          Operational Planning
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div>
          <dt className="text-xs uppercase tracking-wide text-muted-foreground">Coordinator Name</dt>
          <dd className="mt-0.5 font-medium">{plan.coordinator_name || '—'}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-muted-foreground">Coordinator Phone</dt>
          <dd className="mt-0.5 font-medium">{plan.coordinator_phone || '—'}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-muted-foreground">Designation</dt>
          <dd className="mt-0.5 font-medium">{plan.coordinator_designation || '—'}</dd>
        </div>
      </div>

      {/* Scale & Classes */}
      <div className="border-t border-border pt-3 space-y-2">
        <dt className="text-xs uppercase tracking-wide text-muted-foreground">Scale & Coverage</dt>
        <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-2">
          <div className="rounded-lg border border-border p-2.5 bg-muted/20">
            <span className="text-muted-foreground block text-[10px] uppercase">Student Strength</span>
            <span className="text-sm font-semibold text-foreground">{plan.student_strength ?? '—'}</span>
          </div>
          <div className="rounded-lg border border-border p-2.5 bg-muted/20">
            <span className="text-muted-foreground block text-[10px] uppercase">Digital Classrooms</span>
            <span className="text-sm font-semibold text-foreground">{plan.digital_classrooms ?? 1}</span>
          </div>
        </div>

        <div>
          <span className="text-xs text-muted-foreground block mb-1">Classes Covered:</span>
          <div className="flex flex-wrap gap-1.5">
            {classesList.length > 0 ? (
              classesList.map((cls) => (
                <span key={cls} className="rounded-md border border-border bg-muted/50 px-2 py-0.5 text-xs font-medium">
                  {cls}
                </span>
              ))
            ) : (
              <span className="text-xs text-muted-foreground italic">None specified</span>
            )}
          </div>
        </div>
      </div>

      {/* Training Preferences */}
      <div className="border-t border-border pt-3 space-y-2">
        <dt className="text-xs uppercase tracking-wide text-muted-foreground">Training Schedule Preferences</dt>
        <div className="grid grid-cols-1 gap-2 text-xs sm:grid-cols-2">
          <div>
            <span className="text-xs text-muted-foreground block mb-1">Preferred Days:</span>
            <div className="flex flex-wrap gap-1.5">
              {plan.preferred_training_days && Array.isArray(plan.preferred_training_days) && plan.preferred_training_days.length > 0 ? (
                plan.preferred_training_days.map((day) => (
                  <span key={day} className="rounded-md border border-brand/20 bg-brand/10 text-brand px-2 py-0.5 text-xs font-medium">
                    {day}
                  </span>
                ))
              ) : (
                <span className="text-xs text-muted-foreground italic">None selected</span>
              )}
            </div>
          </div>
          <div>
            <span className="text-xs text-muted-foreground block mb-1">Preferred Time Slot:</span>
            <span className="inline-block rounded-md border border-border bg-muted/50 px-2.5 py-0.5 text-xs font-medium">
              {plan.preferred_time_slot || 'Not specified'}
            </span>
          </div>
        </div>
      </div>

      {/* Deployment & Fellow Recommendation */}
      <div className="border-t border-border pt-3">
        <dt className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Fellow Deployment</dt>
        <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-2">
          <div className="rounded-lg border border-brand/30 bg-brand/5 p-3">
            <span className="text-muted-foreground block text-[10px] uppercase font-medium">Recommended Fellows</span>
            <span className="text-lg font-bold text-brand">{plan.recommended_fellows ?? ((plan.digital_classrooms ?? 1) * 2)}</span>
            <span className="text-[10px] text-muted-foreground block">({plan.digital_classrooms ?? 1} rooms × 2)</span>
          </div>
          <div className="rounded-lg border border-border bg-card p-3">
            <span className="text-muted-foreground block text-[10px] uppercase font-medium">Assigned Fellows</span>
            <span className="text-lg font-bold text-foreground">{plan.assigned_fellows ?? plan.recommended_fellows ?? 2}</span>
            <span className="text-[10px] text-muted-foreground block">Operations Assigned</span>
          </div>
        </div>
      </div>

      {/* Infrastructure Checklist */}
      <div className="border-t border-border pt-3 space-y-2">
        <dt className="text-xs uppercase tracking-wide text-muted-foreground">Infrastructure Summary</dt>
        <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
          <InfraBadge label="Computer Lab" available={plan.has_lab} />
          <InfraBadge label="Internet" available={plan.has_internet} />
          <InfraBadge label="Projector" available={plan.has_projector} />
          <InfraBadge label="Smart TV" available={plan.smart_tv} />
          <InfraBadge label="UPS / Power Backup" available={plan.ups_backup} />
        </div>
      </div>

      {plan.approval_letter_path && (
        <div className="border-t border-border pt-3">
          <dt className="text-xs uppercase tracking-wide text-muted-foreground">Approval Letter Path</dt>
          <dd className="mt-0.5 font-mono text-xs text-muted-foreground truncate">{plan.approval_letter_path}</dd>
        </div>
      )}

      {plan.logistics_notes && (
        <div className="border-t border-border pt-3">
          <dt className="text-xs uppercase tracking-wide text-muted-foreground">Logistics Notes</dt>
          <dd className="mt-0.5 text-muted-foreground whitespace-pre-line italic">“{plan.logistics_notes}”</dd>
        </div>
      )}
    </div>
  )
}

function InfraBadge({ label, available }: { label: string; available?: boolean }) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-border p-2 bg-muted/20">
      <span className={`size-2 rounded-full ${available ? 'bg-success' : 'bg-muted-foreground/30'}`} />
      <span className="font-medium text-xs">{label}: <strong>{available ? 'Yes' : 'No'}</strong></span>
    </div>
  )
}

function ApproveForm({ schoolId, planId, isReady = true }: { schoolId: string; planId: string; isReady?: boolean }) {
  const [state, action, pending] = useActionState<PlanActionState, FormData>(approvePlan, {})

  return (
    <form action={action} className="space-y-2">
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

      <Button type="submit" size="sm" className="bg-brand text-white hover:bg-brand/90" disabled={pending || !isReady}>
        {pending ? <Loader2 className="size-4 animate-spin" /> : null}
        Verify, Approve & Activate School
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
    if (res.error) setError(res.error)
  }

  return (
    <div className="space-y-1">
      {error && <p className="text-xs text-error">{error}</p>}
      <Button
        type="button"
        size="sm"
        disabled={pending}
        onClick={handleInitiate}
        className="bg-brand text-white hover:bg-brand/90"
      >
        {pending ? <Loader2 className="size-3.5 animate-spin mr-1" /> : null}
        Initiate School Onboarding
      </Button>
    </div>
  )
}

