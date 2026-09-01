'use client'

import { useActionState, useRef, useState } from 'react'
import {
  Wrench,
  CheckCircle2,
  AlertCircle,
  Clock,
  Send,
  Loader2,
  FileCheck,
  DollarSign,
} from 'lucide-react'
import type { SchoolExecutionPlanDetail } from '@/lib/data/school-execution-plans'
import type { ExecutionPlanAccess } from '@/lib/auth/rbac'
import {
  submitSchoolExecutionPlan,
  reviewSchoolExecutionPlanCampus,
  reviewSchoolExecutionPlanFinance,
  resubmitSchoolExecutionPlan,
  type SchoolExecutionPlanActionState,
} from '@/actions/school-execution-plans'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle,
} from '@/components/ui/sheet'
import { ReadinessStrip } from '@/components/schools/readiness-strip'

import { validateSchoolExecutionReadiness } from '@/lib/validations/execution-readiness'
import { useFormSuccess } from '@/hooks/use-form-success'

interface ExecutionPlanPanelProps {
  schoolId: string
  plan: SchoolExecutionPlanDetail | null
  onboardingPlan?: any
  teamConfirmed?: boolean
  access: ExecutionPlanAccess
  schoolStatus?: string
  operationalPhase?: string | null
}

const STATUS_META = {
  draft: { label: 'Draft', style: 'border-border text-muted-foreground', icon: Clock },
  submitted: { label: 'Awaiting Campus Review', style: 'border-warning/30 bg-warning/10 text-ink-orange', icon: Clock },
  campus_changes_requested: { label: 'Campus Lead Changes Requested', style: 'border-error/30 bg-error/10 text-ink-red', icon: AlertCircle },
  campus_approved: { label: 'Awaiting Finance Review', style: 'border-brand/30 bg-brand/10 text-brand', icon: Clock },
  finance_changes_requested: { label: 'Finance Lead Changes Requested', style: 'border-error/30 bg-error/10 text-ink-red', icon: AlertCircle },
  approved: { label: 'Execution Plan Approved', style: 'border-success/30 bg-success/10 text-ink-green', icon: CheckCircle2 },
} as const

const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`

export function ExecutionPlanPanel({
  schoolId,
  plan,
  onboardingPlan,
  teamConfirmed = false,
  access,
  operationalPhase,
}: ExecutionPlanPanelProps) {
  const needsResubmit =
    plan?.status === 'campus_changes_requested' || plan?.status === 'finance_changes_requested'

  const [subState, subAction, subPending] = useActionState<SchoolExecutionPlanActionState, FormData>(
    needsResubmit ? resubmitSchoolExecutionPlan : submitSchoolExecutionPlan,
    {},
  )
  const [campState, campAction, campPending] = useActionState<SchoolExecutionPlanActionState, FormData>(
    reviewSchoolExecutionPlanCampus,
    {},
  )
  const [finState, finAction, finPending] = useActionState<SchoolExecutionPlanActionState, FormData>(
    reviewSchoolExecutionPlanFinance,
    {},
  )

  const submitFormRef = useRef<HTMLFormElement>(null)
  const campusFormRef = useRef<HTMLFormElement>(null)
  const financeFormRef = useRef<HTMLFormElement>(null)

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [campusComments, setCampusComments] = useState('')
  const [financeComments, setFinanceComments] = useState('')

  // Travel cost and transport budget are kept in sync: the transport line of the
  // budget mirrors the travel estimate until the submitter deliberately changes
  // it. Previously both fields were uncontrolled with a hardcoded ₹200 default,
  // so raising the travel estimate left the transport budget at 200 — the number
  // Finance actually reviews — and the plan came back as changes-requested.
  const [travelCost, setTravelCost] = useState(
    plan?.estimated_travel_cost != null ? String(plan.estimated_travel_cost) : '',
  )
  const [transportBudget, setTransportBudget] = useState(
    plan?.transport_budget != null
      ? String(plan.transport_budget)
      : plan?.estimated_travel_cost != null
        ? String(plan.estimated_travel_cost)
        : '',
  )
  // An existing plan whose transport budget already differs from the estimate is
  // a deliberate allocation — never overwrite it.
  const [transportEdited, setTransportEdited] = useState(
    plan?.transport_budget != null &&
      Number(plan.transport_budget) !== Number(plan.estimated_travel_cost ?? 0),
  )

  function onTravelCostChange(value: string) {
    setTravelCost(value)
    if (!transportEdited) setTransportBudget(value)
  }

  const transportShortfall = Number(transportBudget || 0) < Number(travelCost || 0)

  useFormSuccess(subState, {
    formRef: submitFormRef,
    onSuccess: () => {
      setIsFormOpen(false)
      setTransportEdited(false)
    },
  })
  useFormSuccess(campState, { formRef: campusFormRef, onSuccess: () => setCampusComments('') })
  useFormSuccess(finState, { formRef: financeFormRef, onSuccess: () => setFinanceComments('') })

  const isTeamReady = teamConfirmed || (!!operationalPhase && operationalPhase !== 'team_preparation')
  const execReadiness = validateSchoolExecutionReadiness(plan, isTeamReady)

  // Pre-fill equipment values derived from onboarding session_plans
  const defaultProjectors = onboardingPlan?.has_projector ? 0 : 1
  const defaultLaptops = onboardingPlan?.digital_classrooms ? Math.max(1, onboardingPlan.digital_classrooms * 2) : 2

  const statusMeta = STATUS_META[(plan?.status ?? 'draft') as keyof typeof STATUS_META]
    ?? { label: plan?.status ?? 'Draft', style: 'border-border text-muted-foreground', icon: Clock }
  const StatusIcon = statusMeta.icon

  // Number() everywhere: PostgREST can return numerics as strings, and `a + b`
  // on strings concatenates instead of adding. Recomputed from the four lines
  // rather than trusting total_budget, so the total always matches the
  // breakdown shown beside it.
  const budgetLines = plan
    ? [
        { label: 'Transport', value: Number(plan.transport_budget ?? 0) },
        { label: 'Materials', value: Number(plan.materials_budget ?? 0) },
        { label: 'Equipment', value: Number(plan.equipment_budget ?? 0) },
        { label: 'Other', value: Number(plan.other_budget ?? 0) },
      ]
    : []
  const totalBudget = budgetLines.reduce((sum, line) => sum + line.value, 0)

  return (
    <div className="space-y-5">
      <ReadinessStrip title="Execution readiness" gate={execReadiness} />

      {plan ? (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-semibold">School execution &amp; budget plan</h4>
              <p className="text-xs text-muted-foreground">
                Submitted by {plan.submitted_by_user?.full_name ?? 'Execution Lead'}
              </p>
            </div>

            <Badge variant="outline" className={`flex items-center gap-1 ${statusMeta.style}`}>
              <StatusIcon className="size-3.5" /> {statusMeta.label}
            </Badge>
          </div>

          {/* One bordered container with three groups, where there used to be
              three nested cards inside a fourth. */}
          <div className="divide-y divide-border/60 rounded-xl border border-border/60 bg-paper">
            <div className="p-3">
              <h5 className="field-label">
                Campus equipment
              </h5>
              <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs sm:grid-cols-3">
                <Stat label="Laptops" value={plan.laptops_count} />
                <Stat label="Projectors" value={plan.projectors_count} />
                <Stat label="HDMI cables" value={plan.hdmi_cables_count} />
                <Stat label="Extension boards" value={plan.extension_boards_count} />
                <Stat label="Teaching kits" value={plan.teaching_kits_count} />
                <Stat label="Speakers" value={plan.speakers_count} />
              </dl>
              {plan.other_equipment && (
                <p className="mt-2 text-xs text-muted-foreground">Other: {plan.other_equipment}</p>
              )}
            </div>

            <div className="p-3">
              <h5 className="field-label">
                Travel &amp; logistics
              </h5>
              <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs sm:grid-cols-3">
                <Stat label="Distance" value={`${plan.distance_km ?? '—'} km`} />
                <Stat label="Mode" value={plan.transport_mode ?? '—'} />
                <Stat label="Estimated travel cost" value={inr(Number(plan.estimated_travel_cost ?? 0))} />
              </dl>
            </div>

            {/* Budget the reviewers act on: the total they approve AND every
                category it is made of. Showing only the total was what made a
                part-filled allocation look like a transport-only figure. */}
            <div className="p-3">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h5 className="field-label">
                  Budget allocation
                </h5>
                <p className="text-sm">
                  <span className="text-xs text-muted-foreground">Total requested </span>
                  <strong className="font-display text-base font-bold text-brand tabular-nums">{inr(totalBudget)}</strong>
                </p>
              </div>
              <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs sm:grid-cols-4">
                {budgetLines.map((line) => (
                  <Stat key={line.label} label={line.label} value={inr(line.value)} />
                ))}
              </dl>
              {Number(plan.transport_budget ?? 0) < Number(plan.estimated_travel_cost ?? 0) && (
                <p className="mt-2 text-[11px] font-medium text-ink-orange">
                  Transport budget is below the {inr(Number(plan.estimated_travel_cost ?? 0))} travel
                  estimate — confirm this is intended before approving.
                </p>
              )}
            </div>

            {(plan.meeting_departure_notes || plan.campus_comments || plan.finance_comments) && (
              <div className="space-y-2 p-3 text-xs">
                {plan.meeting_departure_notes && (
                  <div>
                    <strong className="text-foreground">Logistics &amp; departure notes:</strong>
                    <p className="mt-0.5 text-muted-foreground">{plan.meeting_departure_notes}</p>
                  </div>
                )}
                {plan.campus_comments && (
                  <div>
                    <strong className="text-foreground">
                      Campus Lead comments ({plan.campus_reviewer?.full_name}):
                    </strong>
                    <p className="mt-0.5 text-muted-foreground">{plan.campus_comments}</p>
                  </div>
                )}
                {plan.finance_comments && (
                  <div>
                    <strong className="text-foreground">
                      Finance Lead comments ({plan.finance_reviewer?.full_name}):
                    </strong>
                    <p className="mt-0.5 text-muted-foreground">{plan.finance_comments}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {access.canSubmit && needsResubmit && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-error/30 bg-error/5 p-3">
              <p className="text-sm">
                <strong className="font-semibold text-ink-red">Changes requested.</strong>{' '}
                <span className="text-muted-foreground">
                  Address the reviewer comments above and send the plan back.
                </span>
              </p>
              <Button size="sm" onClick={() => setIsFormOpen(true)}>
                <Send className="size-4" /> Revise &amp; resubmit
              </Button>
            </div>
          )}

          {/* Review controls stay inline: a reviewer opened this tab to make
              exactly this decision, so it should not be behind another click. */}
          {access.canReviewCampus && plan.status === 'submitted' && (
            <ReviewBlock
              title="Campus Lead review"
              icon={FileCheck}
              formRef={campusFormRef}
              action={campAction}
              planId={plan.id}
              pending={campPending}
              state={campState}
              comments={campusComments}
              setComments={setCampusComments}
              commentLabel="Comments / feedback (required if requesting changes)"
              approveLabel="Approve & forward to Finance"
            />
          )}

          {access.canReviewFinance && plan.status === 'campus_approved' && (
            <ReviewBlock
              title="Finance Lead budget review"
              icon={DollarSign}
              formRef={financeFormRef}
              action={finAction}
              planId={plan.id}
              pending={finPending}
              state={finState}
              comments={financeComments}
              setComments={setFinanceComments}
              commentLabel="Budget comments (required if requesting changes)"
              approveLabel={`Approve budget (${inr(totalBudget)})`}
              note={`Total budget requested: ${inr(totalBudget)}`}
            />
          )}
        </div>
      ) : (
        <div className="space-y-3 rounded-xl border border-dashed border-border bg-paper/60 p-6 text-center">
          <Wrench aria-hidden className="mx-auto size-8 text-muted-foreground" />
          <div>
            <h4 className="text-sm font-semibold">No execution plan submitted</h4>
            <p className="mx-auto mt-1 max-w-md text-xs text-muted-foreground">
              The Execution Lead creates a school-level plan detailing equipment needs, travel
              logistics, and budget allocation for dual approval.
            </p>
          </div>

          {access.canSubmit && (
            isTeamReady ? (
              <Button size="sm" onClick={() => setIsFormOpen(true)}>
                Create school execution plan
              </Button>
            ) : (
              <div className="space-y-2 pt-1">
                <Button size="sm" disabled>Create school execution plan</Button>
                <p className="text-xs font-medium text-ink-orange">
                  The school team must be confirmed by the Volunteer Lead before creating an
                  execution plan.
                </p>
              </div>
            )
          )}
        </div>
      )}

      {/* The form itself — a 20-field, three-section entry form that used to sit
          expanded in the page. It belongs in a drawer over the plan it edits. */}
      {access.canSubmit && (
      <Sheet open={isFormOpen} onOpenChange={setIsFormOpen}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
          <SheetHeader>
            <SheetTitle>
              {needsResubmit ? 'Resubmit execution plan' : 'Submit school execution plan'}
            </SheetTitle>
            <SheetDescription>
              Equipment, travel and budget go to the Campus Lead first, then the Finance Lead.
            </SheetDescription>
          </SheetHeader>

          <form ref={submitFormRef} action={subAction} className="space-y-5 px-4 pb-6">
            <input type="hidden" name="school_id" value={schoolId} />
            {/* Required by resubmitSchoolExecutionPlan when the plan is in a
                *_changes_requested state — without it the action posts an empty
                string to the RPC's uuid parameter. */}
            {plan?.id && <input type="hidden" name="plan_id" value={plan.id} />}

            <fieldset className="space-y-2">
              <legend className="field-label">
                Equipment needed
              </legend>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <NumField id="laptops_count" label="Laptops" defaultValue={plan?.laptops_count ?? defaultLaptops} />
                <NumField id="projectors_count" label="Projectors" defaultValue={plan?.projectors_count ?? defaultProjectors} />
                <NumField id="hdmi_cables_count" label="HDMI cables" defaultValue={plan?.hdmi_cables_count ?? 1} />
                <NumField id="extension_boards_count" label="Extension boards" defaultValue={plan?.extension_boards_count ?? 1} />
                <NumField id="teaching_kits_count" label="Teaching kits" defaultValue={plan?.teaching_kits_count ?? 1} />
                <NumField id="speakers_count" label="Speakers" defaultValue={plan?.speakers_count ?? 1} />
              </div>
              <div>
                <Label htmlFor="other_equipment" className="text-xs">Other equipment notes</Label>
                <Input id="other_equipment" name="other_equipment" placeholder="Any extra devices or supplies" defaultValue={plan?.other_equipment ?? ''} className="mt-1 text-sm" />
              </div>
            </fieldset>

            <fieldset className="space-y-2 border-t border-border pt-4">
              <legend className="field-label">
                Travel &amp; logistics
              </legend>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div>
                  <Label htmlFor="distance_km" className="text-xs">Distance (km)</Label>
                  <Input id="distance_km" name="distance_km" type="number" step="0.1" min={0} defaultValue={plan?.distance_km ?? ''} className="mt-1 text-sm" />
                </div>
                <div>
                  <Label htmlFor="transport_mode" className="text-xs">Transport mode</Label>
                  <Input id="transport_mode" name="transport_mode" placeholder="Auto / Bus / Cab" defaultValue={plan?.transport_mode ?? ''} className="mt-1 text-sm" />
                </div>
                <div>
                  <Label htmlFor="estimated_travel_cost" className="text-xs">Estimated travel cost (₹)</Label>
                  <Input id="estimated_travel_cost" name="estimated_travel_cost" type="number" min={0} value={travelCost} onChange={(e) => onTravelCostChange(e.target.value)} className="mt-1 text-sm" />
                </div>
              </div>
              <div>
                <Label htmlFor="meeting_departure_notes" className="text-xs">Meeting &amp; departure notes</Label>
                <Textarea id="meeting_departure_notes" name="meeting_departure_notes" rows={2} placeholder="Departure place, meetup time, contact details" defaultValue={plan?.meeting_departure_notes ?? ''} className="mt-1 text-sm" />
              </div>
            </fieldset>

            <fieldset className="space-y-2 border-t border-border pt-4">
              <legend className="field-label">
                Budget allocation (₹)
              </legend>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div>
                  <Label htmlFor="transport_budget" className="text-xs">Transport</Label>
                  <Input
                    id="transport_budget"
                    name="transport_budget"
                    type="number"
                    min={0}
                    value={transportBudget}
                    onChange={(e) => { setTransportEdited(true); setTransportBudget(e.target.value) }}
                    className="mt-1 text-sm"
                  />
                  {transportShortfall && (
                    <p className="mt-1 text-xs text-ink-orange">
                      Below the ₹{Number(travelCost || 0)} travel estimate — Finance reviews this figure.
                    </p>
                  )}
                </div>
                <NumField id="materials_budget" label="Materials" defaultValue={plan?.materials_budget ?? 0} />
                <NumField id="equipment_budget" label="Equipment" defaultValue={plan?.equipment_budget ?? 0} />
                <NumField id="other_budget" label="Other" defaultValue={plan?.other_budget ?? 0} />
              </div>
            </fieldset>

            {subState.error && <p className="text-xs text-error">{subState.error}</p>}

            <div className="flex gap-2 pt-1">
              <Button type="submit" size="sm" disabled={subPending}>
                {subPending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                Submit execution plan
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => setIsFormOpen(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
      )}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline gap-1.5">
      <dt className="text-muted-foreground">{label}:</dt>
      <dd className="font-semibold text-foreground tabular-nums">{value}</dd>
    </div>
  )
}

function NumField({ id, label, defaultValue }: { id: string; label: string; defaultValue: number }) {
  return (
    <div>
      <Label htmlFor={id} className="text-xs">{label}</Label>
      <Input id={id} name={id} type="number" min={0} defaultValue={defaultValue} className="mt-1 text-sm" />
    </div>
  )
}

/**
 * The two review legs are the same form with different labels and a different
 * action — they were duplicated ~60 lines apart before.
 */
function ReviewBlock({
  title, icon: Icon, formRef, action, planId, pending, state,
  comments, setComments, commentLabel, approveLabel, note,
}: {
  title: string
  icon: typeof FileCheck
  formRef: React.RefObject<HTMLFormElement | null>
  action: (formData: FormData) => void
  planId: string
  pending: boolean
  state: SchoolExecutionPlanActionState
  comments: string
  setComments: (v: string) => void
  commentLabel: string
  approveLabel: string
  note?: string
}) {
  return (
    <div className="space-y-3 rounded-xl border border-brand/30 bg-brand/5 p-4">
      <h4 className="flex items-center gap-2 text-sm font-semibold text-brand">
        <Icon className="size-4" /> {title}
      </h4>
      {note && <p className="text-xs text-muted-foreground">{note}</p>}

      {state.ok ? (
        <p className="flex items-center gap-1.5 rounded-lg border border-success/30 bg-success/10 p-3 text-sm font-medium text-ink-green">
          <CheckCircle2 className="size-4" /> {state.message}
        </p>
      ) : (
        <form ref={formRef} action={action} className="space-y-3">
          <input type="hidden" name="plan_id" value={planId} />
          <div>
            <Label htmlFor={`${planId}-comments`} className="text-xs">{commentLabel}</Label>
            <Textarea
              id={`${planId}-comments`}
              name="comments"
              rows={2}
              placeholder="Enter review comments..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              className="mt-1 bg-background text-sm"
            />
          </div>
          {state.error && <p className="text-xs text-error">{state.error}</p>}
          <div className="flex flex-wrap gap-2">
            <Button type="submit" name="decision" value="approved" size="sm" disabled={pending}>
              {pending ? <Loader2 className="size-3.5 animate-spin" /> : <CheckCircle2 className="size-3.5" />}
              {approveLabel}
            </Button>
            <Button
              type="submit"
              name="decision"
              value="changes_requested"
              variant="outline"
              size="sm"
              disabled={pending}
              className="border-error/30 text-error hover:bg-error/10"
            >
              Request changes
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
