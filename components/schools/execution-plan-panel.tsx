'use client'

import { useActionState, useState } from 'react'
import {
  Wrench,
  Laptop,
  CheckCircle2,
  AlertCircle,
  Clock,
  Send,
  Loader2,
  Truck,
  FileCheck,
  DollarSign,
} from 'lucide-react'
import type { SchoolExecutionPlanDetail } from '@/lib/data/school-execution-plans'
import type { ExecutionPlanAccess } from '@/lib/auth/rbac'
import {
  submitSchoolExecutionPlan,
  reviewSchoolExecutionPlanCampus,
  reviewSchoolExecutionPlanFinance,
  type SchoolExecutionPlanActionState,
} from '@/actions/school-execution-plans'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'

import { validateSchoolExecutionReadiness } from '@/lib/validations/execution-readiness'
import { resubmitSchoolExecutionPlan } from '@/actions/school-execution-plans'

interface ExecutionPlanPanelProps {
  schoolId: string
  plan: SchoolExecutionPlanDetail | null
  onboardingPlan?: any
  teamConfirmed?: boolean
  access: ExecutionPlanAccess
  schoolStatus?: string
  operationalPhase?: string | null
}

export function ExecutionPlanPanel({
  schoolId,
  plan,
  onboardingPlan,
  teamConfirmed = false,
  access,
  schoolStatus,
  operationalPhase,
}: ExecutionPlanPanelProps) {
  const [subState, subAction, subPending] = useActionState<SchoolExecutionPlanActionState, FormData>(
    plan?.status === 'campus_changes_requested' || plan?.status === 'finance_changes_requested'
      ? resubmitSchoolExecutionPlan
      : submitSchoolExecutionPlan,
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

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [campusComments, setCampusComments] = useState('')
  const [financeComments, setFinanceComments] = useState('')

  const isTeamReady = teamConfirmed || (!!operationalPhase && operationalPhase !== 'team_preparation')

  // Execution Readiness Gate Evaluation (Phase 3)
  const execReadiness = validateSchoolExecutionReadiness(plan, isTeamReady)

  // Pre-fill equipment values derived from onboarding session_plans
  const defaultProjectors = onboardingPlan?.has_projector ? 0 : 1
  const defaultLaptops = onboardingPlan?.digital_classrooms ? Math.max(1, onboardingPlan.digital_classrooms * 2) : 2

  const statusMeta = {
    draft: { label: 'Draft', style: 'border-border text-muted-foreground', icon: Clock },
    submitted: { label: 'Awaiting Campus Review', style: 'border-warning/30 bg-warning/10 text-warning', icon: Clock },
    campus_changes_requested: { label: 'Campus Lead Changes Requested', style: 'border-destructive/30 bg-destructive/10 text-destructive', icon: AlertCircle },
    campus_approved: { label: 'Awaiting Finance Review', style: 'border-brand/30 bg-brand/10 text-brand', icon: Clock },
    finance_changes_requested: { label: 'Finance Lead Changes Requested', style: 'border-destructive/30 bg-destructive/10 text-destructive', icon: AlertCircle },
    approved: { label: 'Execution Plan Approved', style: 'border-success/30 bg-success/10 text-success', icon: CheckCircle2 },
  }[plan?.status ?? 'draft'] ?? { label: plan?.status ?? 'Draft', style: 'border-border text-muted-foreground', icon: Clock }

  const StatusIcon = statusMeta.icon

  const totalBudget = plan ? (
    plan.total_budget ?? (
      (plan.transport_budget ?? 0) +
      (plan.materials_budget ?? 0) +
      (plan.equipment_budget ?? 0) +
      (plan.other_budget ?? 0)
    )
  ) : 0

  return (
    <div className="space-y-6">
      {/* Execution Readiness Gate Card */}
      <div className={`rounded-xl p-4 border space-y-3 ${execReadiness.ready ? 'bg-success/5 border-success/30' : 'bg-warning/5 border-warning/30'}`}>
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold flex items-center gap-2">
              {execReadiness.ready ? (
                <CheckCircle2 className="size-4 text-success" />
              ) : (
                <AlertCircle className="size-4 text-warning" />
              )}
              Execution Readiness Gate
            </h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              {execReadiness.completed} / {execReadiness.total} requirements satisfied
            </p>
          </div>

          <Badge
            variant="outline"
            className={
              execReadiness.ready
                ? 'border-success/30 bg-success/10 text-success font-bold'
                : 'border-warning/30 bg-warning/10 text-warning font-bold'
            }
          >
            {execReadiness.ready ? 'EXECUTION READY' : 'BLOCKED'}
          </Badge>
        </div>

        {/* Checklist Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
          {execReadiness.items.map((item) => (
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
      </div>
      {/* Active Plan Header */}
      {plan ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-muted/20 p-4">
            <div className="flex items-center gap-3">
              <Wrench className="size-5 text-brand" />
              <div>
                <h4 className="text-sm font-semibold">School Execution & Budget Plan</h4>
                <p className="text-xs text-muted-foreground">
                  Submitted by {plan.submitted_by_user?.full_name ?? 'Execution Lead'}
                </p>
              </div>
            </div>

            <Badge variant="outline" className={`flex items-center gap-1 ${statusMeta.style}`}>
              <StatusIcon className="size-3.5" /> {statusMeta.label}
            </Badge>
          </div>

          {/* Plan Breakdown */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Equipment Breakdown */}
            <div className="rounded-lg border border-border p-3 space-y-2 bg-card">
              <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Laptop className="size-3.5 text-brand" /> Campus Equipment
              </h5>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>Laptops: <strong className="font-medium">{plan.laptops_count}</strong></div>
                <div>Projectors: <strong className="font-medium">{plan.projectors_count}</strong></div>
                <div>HDMI Cables: <strong className="font-medium">{plan.hdmi_cables_count}</strong></div>
                <div>Extension Boards: <strong className="font-medium">{plan.extension_boards_count}</strong></div>
                <div>Teaching Kits: <strong className="font-medium">{plan.teaching_kits_count}</strong></div>
                <div>Speakers: <strong className="font-medium">{plan.speakers_count}</strong></div>
              </div>
              {plan.other_equipment && (
                <p className="text-xs text-muted-foreground pt-1 border-t border-border/50">
                  Other: {plan.other_equipment}
                </p>
              )}
            </div>

            {/* Travel & Logistics Breakdown */}
            <div className="rounded-lg border border-border p-3 space-y-2 bg-card">
              <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Truck className="size-3.5 text-brand" /> Travel & Logistics
              </h5>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>Distance: <strong className="font-medium">{plan.distance_km ?? '—'} km</strong></div>
                <div>Mode: <strong className="font-medium">{plan.transport_mode ?? '—'}</strong></div>
                <div className="col-span-2">Estimated Travel Cost: <strong className="font-medium">₹{plan.estimated_travel_cost}</strong></div>
              </div>
            </div>
          </div>

          {/* Notes & Comments */}
          {(plan.meeting_departure_notes || plan.campus_comments || plan.finance_comments) && (
            <div className="rounded-lg border border-border p-3 space-y-2 text-xs bg-muted/20">
              {plan.meeting_departure_notes && (
                <div>
                  <strong className="text-foreground">Logistics & Departure Notes:</strong>
                  <p className="text-muted-foreground mt-0.5">{plan.meeting_departure_notes}</p>
                </div>
              )}
              {plan.campus_comments && (
                <div>
                  <strong className="text-foreground">Campus Lead Comments ({plan.campus_reviewer?.full_name}):</strong>
                  <p className="text-muted-foreground mt-0.5">{plan.campus_comments}</p>
                </div>
              )}
              {plan.finance_comments && (
                <div>
                  <strong className="text-foreground">Finance Lead Comments ({plan.finance_reviewer?.full_name}):</strong>
                  <p className="text-muted-foreground mt-0.5">{plan.finance_comments}</p>
                </div>
              )}
            </div>
          )}

          {/* Campus Lead Review Controls */}
          {access.canReviewCampus && plan.status === 'submitted' && (
            <div className="rounded-lg border border-brand/30 bg-brand/5 p-4 space-y-3">
              <h4 className="text-sm font-semibold text-brand flex items-center gap-2">
                <FileCheck className="size-4" /> Campus Lead Review
              </h4>
              {campState.ok ? (
                <div className="bg-success/10 border border-success/30 rounded-lg p-3">
                  <p className="text-sm text-success font-medium flex items-center gap-1.5">
                    <CheckCircle2 className="size-4" />
                    {campState.message}
                  </p>
                </div>
              ) : (
                <form action={campAction} className="space-y-3">
                  <input type="hidden" name="plan_id" value={plan.id} />
                  <div>
                    <Label htmlFor="campus_comments" className="text-xs">
                      Comments / Feedback (Required if requesting changes)
                    </Label>
                    <Textarea
                      id="campus_comments"
                      name="comments"
                      rows={2}
                      placeholder="Enter review comments..."
                      value={campusComments}
                      onChange={(e) => setCampusComments(e.target.value)}
                      className="mt-1 text-sm bg-background"
                    />
                  </div>
                  {campState.error && <p className="text-xs text-error">{campState.error}</p>}
                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      name="decision"
                      value="approved"
                      size="sm"
                      disabled={campPending}
                      className="bg-brand text-white"
                    >
                      {campPending ? <Loader2 className="size-3.5 animate-spin mr-1" /> : <CheckCircle2 className="size-3.5 mr-1" />}
                      Approve & Forward to Finance
                    </Button>
                    <Button
                      type="submit"
                      name="decision"
                      value="changes_requested"
                      variant="outline"
                      size="sm"
                      disabled={campPending}
                      className="border-error/30 text-error hover:bg-error/10"
                    >
                      Request Changes
                    </Button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Finance Lead Review Controls */}
          {access.canReviewFinance && plan.status === 'campus_approved' && (
            <div className="rounded-lg border border-brand/30 bg-brand/5 p-4 space-y-3">
              <h4 className="text-sm font-semibold text-brand flex items-center gap-2">
                <DollarSign className="size-4" /> Finance Lead Budget Review
              </h4>
              <p className="text-xs text-muted-foreground">
                Total Budget Requested: <strong>₹{totalBudget.toLocaleString('en-IN')}</strong>
              </p>
              {finState.ok ? (
                <div className="bg-success/10 border border-success/30 rounded-lg p-3">
                  <p className="text-sm text-success font-medium flex items-center gap-1.5">
                    <CheckCircle2 className="size-4" />
                    {finState.message}
                  </p>
                </div>
              ) : (
                <form action={finAction} className="space-y-3">
                  <input type="hidden" name="plan_id" value={plan.id} />
                  <div>
                    <Label htmlFor="finance_comments" className="text-xs">
                      Budget Comments (Required if requesting changes)
                    </Label>
                    <Textarea
                      id="finance_comments"
                      name="comments"
                      rows={2}
                      placeholder="Enter budget review comments..."
                      value={financeComments}
                      onChange={(e) => setFinanceComments(e.target.value)}
                      className="mt-1 text-sm bg-background"
                    />
                  </div>
                  {finState.error && <p className="text-xs text-error">{finState.error}</p>}
                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      name="decision"
                      value="approved"
                      size="sm"
                      disabled={finPending}
                      className="bg-brand text-white"
                    >
                      {finPending ? <Loader2 className="size-3.5 animate-spin mr-1" /> : <CheckCircle2 className="size-3.5 mr-1" />}
                      Approve Budget (₹{totalBudget.toLocaleString('en-IN')})
                    </Button>
                    <Button
                      type="submit"
                      name="decision"
                      value="changes_requested"
                      variant="outline"
                      size="sm"
                      disabled={finPending}
                      className="border-error/30 text-error hover:bg-error/10"
                    >
                      Request Changes
                    </Button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      ) : (
        /* No plan submitted yet */
        !isFormOpen && (
          <div className="rounded-lg border border-dashed p-6 text-center space-y-3">
            <Wrench className="size-8 text-muted-foreground mx-auto" />
            <div>
              <h4 className="text-sm font-semibold">No Execution Plan Submitted</h4>
              <p className="text-xs text-muted-foreground max-w-md mx-auto mt-1">
                The Execution Lead creates a school-level plan detailing equipment needs, travel logistics, and budget allocation for dual approval.
              </p>
            </div>

            {access.canSubmit && (
              isTeamReady ? (
                <Button size="sm" onClick={() => setIsFormOpen(true)}>
                  Create School Execution Plan
                </Button>
              ) : (
                <div className="space-y-2 pt-1">
                  <Button size="sm" disabled>
                    Create School Execution Plan
                  </Button>
                  <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                    ⚠️ School team must be confirmed by the Volunteer Lead before creating an execution plan.
                  </p>
                </div>
              )
            )}
          </div>
        )
      )}

      {/* Submission / Edit Form */}
      {access.canSubmit && (isFormOpen || plan?.status === 'campus_changes_requested' || plan?.status === 'finance_changes_requested') && (
        <div className="rounded-lg border border-border p-4 bg-muted/10 space-y-4">
          <h4 className="text-sm font-semibold flex items-center gap-2">
            <Send className="size-4 text-brand" /> Submit School Execution Plan
          </h4>

          <form action={subAction} className="space-y-4">
            <input type="hidden" name="school_id" value={schoolId} />

            {/* Equipment Section */}
            <div className="space-y-2">
              <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Equipment Needed
              </h5>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <Label htmlFor="laptops_count" className="text-xs">Laptops</Label>
                  <Input id="laptops_count" name="laptops_count" type="number" min={0} defaultValue={plan?.laptops_count ?? defaultLaptops} className="mt-1 text-sm" />
                </div>
                <div>
                  <Label htmlFor="projectors_count" className="text-xs">Projectors</Label>
                  <Input id="projectors_count" name="projectors_count" type="number" min={0} defaultValue={plan?.projectors_count ?? defaultProjectors} className="mt-1 text-sm" />
                </div>
                <div>
                  <Label htmlFor="hdmi_cables_count" className="text-xs">HDMI Cables</Label>
                  <Input id="hdmi_cables_count" name="hdmi_cables_count" type="number" min={0} defaultValue={plan?.hdmi_cables_count ?? 1} className="mt-1 text-sm" />
                </div>
                <div>
                  <Label htmlFor="extension_boards_count" className="text-xs">Extension Boards</Label>
                  <Input id="extension_boards_count" name="extension_boards_count" type="number" min={0} defaultValue={plan?.extension_boards_count ?? 1} className="mt-1 text-sm" />
                </div>
                <div>
                  <Label htmlFor="teaching_kits_count" className="text-xs">Teaching Kits</Label>
                  <Input id="teaching_kits_count" name="teaching_kits_count" type="number" min={0} defaultValue={plan?.teaching_kits_count ?? 1} className="mt-1 text-sm" />
                </div>
                <div>
                  <Label htmlFor="speakers_count" className="text-xs">Speakers</Label>
                  <Input id="speakers_count" name="speakers_count" type="number" min={0} defaultValue={plan?.speakers_count ?? 1} className="mt-1 text-sm" />
                </div>
              </div>
              <div>
                <Label htmlFor="other_equipment" className="text-xs">Other Equipment Notes</Label>
                <Input id="other_equipment" name="other_equipment" placeholder="Any extra devices or supplies" defaultValue={plan?.other_equipment ?? ''} className="mt-1 text-sm" />
              </div>
            </div>

            {/* Travel Section */}
            <div className="space-y-2 pt-2 border-t border-border">
              <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Travel & Logistics
              </h5>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <Label htmlFor="distance_km" className="text-xs">Distance (km)</Label>
                  <Input id="distance_km" name="distance_km" type="number" step="0.1" min={0} defaultValue={plan?.distance_km ?? ''} className="mt-1 text-sm" />
                </div>
                <div>
                  <Label htmlFor="transport_mode" className="text-xs">Transport Mode</Label>
                  <Input id="transport_mode" name="transport_mode" placeholder="Auto / Bus / Cab" defaultValue={plan?.transport_mode ?? ''} className="mt-1 text-sm" />
                </div>
                <div>
                  <Label htmlFor="estimated_travel_cost" className="text-xs">Estimated Travel Cost (₹)</Label>
                  <Input id="estimated_travel_cost" name="estimated_travel_cost" type="number" min={0} defaultValue={plan?.estimated_travel_cost ?? 200} className="mt-1 text-sm" />
                </div>
              </div>
              <div>
                <Label htmlFor="meeting_departure_notes" className="text-xs">Meeting & Departure Notes</Label>
                <Textarea id="meeting_departure_notes" name="meeting_departure_notes" rows={2} placeholder="Departure place, meetup time, contact details" defaultValue={plan?.meeting_departure_notes ?? ''} className="mt-1 text-sm" />
              </div>
            </div>

            {/* Budget Breakdown Section */}
            <div className="space-y-2 pt-2 border-t border-border">
              <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Budget Allocation (₹)
              </h5>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <Label htmlFor="transport_budget" className="text-xs">Transport Budget (₹)</Label>
                  <Input id="transport_budget" name="transport_budget" type="number" min={0} defaultValue={plan?.transport_budget ?? plan?.estimated_travel_cost ?? 200} className="mt-1 text-sm" />
                </div>
                <div>
                  <Label htmlFor="materials_budget" className="text-xs">Materials Budget (₹)</Label>
                  <Input id="materials_budget" name="materials_budget" type="number" min={0} defaultValue={plan?.materials_budget ?? 0} className="mt-1 text-sm" />
                </div>
                <div>
                  <Label htmlFor="equipment_budget" className="text-xs">Equipment Budget (₹)</Label>
                  <Input id="equipment_budget" name="equipment_budget" type="number" min={0} defaultValue={plan?.equipment_budget ?? 0} className="mt-1 text-sm" />
                </div>
                <div>
                  <Label htmlFor="other_budget" className="text-xs">Other Budget (₹)</Label>
                  <Input id="other_budget" name="other_budget" type="number" min={0} defaultValue={plan?.other_budget ?? 0} className="mt-1 text-sm" />
                </div>
              </div>
            </div>

            {subState.error && <p className="text-xs text-error">{subState.error}</p>}
            {subState.ok && <p className="text-xs text-success">{subState.message}</p>}

            <div className="flex gap-2 pt-2">
              <Button type="submit" size="sm" disabled={subPending}>
                {subPending ? <Loader2 className="size-4 animate-spin mr-1" /> : <Send className="size-4 mr-1" />}
                Submit Execution Plan
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => setIsFormOpen(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
