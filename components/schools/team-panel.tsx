'use client'

import { useActionState, useState } from 'react'
import {
  Users,
  UserPlus,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  Loader2,
  AlertCircle,
  ShieldCheck,
  Phone,
  Mail,
} from 'lucide-react'
import type { SchoolTeamMemberDetail } from '@/lib/data/school-team'
import type { TeamMember } from '@/lib/data/sessions'
import {
  requestSchoolTeamAvailability,
  setSchoolRequiredVolunteers,
  confirmSchoolTeam,
  replaceSchoolTeamMember,
  type SchoolTeamActionState,
} from '@/actions/school-team'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'

import { validateSchoolTeamReadiness } from '@/lib/validations/team-readiness'

interface TeamPanelProps {
  schoolId: string
  team: SchoolTeamMemberDetail[]
  roster: TeamMember[]
  requiredVolunteers: number
  canManage: boolean
  schoolStatus: string
}

export function TeamPanel({
  schoolId,
  team,
  roster,
  requiredVolunteers,
  canManage,
  schoolStatus,
}: TeamPanelProps) {
  const [reqState, reqAction, reqPending] = useActionState<SchoolTeamActionState, FormData>(
    requestSchoolTeamAvailability,
    {},
  )
  const [countState, countAction, countPending] = useActionState<SchoolTeamActionState, FormData>(
    setSchoolRequiredVolunteers,
    {},
  )
  const [confState, confAction, confPending] = useActionState<SchoolTeamActionState, FormData>(
    confirmSchoolTeam,
    {},
  )
  const [repState, repAction, repPending] = useActionState<SchoolTeamActionState, FormData>(
    replaceSchoolTeamMember,
    {},
  )

  const [selectedVolunteers, setSelectedVolunteers] = useState<string[]>([])
  const [reqVolCount, setReqVolCount] = useState<number>(requiredVolunteers || 2)
  const [replacingMemberId, setReplacingMemberId] = useState<string | null>(null)
  const [replacementVolunteerId, setReplacementVolunteerId] = useState<string>('')
  const [replacementReason, setReplacementReason] = useState<string>('')

  const activeMembers = team.filter((m) => m.is_active)
  // A member flips 'confirmed' → 'completed' when the school program closes
  // out; they are still a confirmed member of the delivered team.
  const confirmedMembers = activeMembers.filter((m) => m.status === 'confirmed' || m.status === 'completed')
  const availableMembers = activeMembers.filter((m) => m.status === 'available')
  const requestedMembers = activeMembers.filter((m) => m.status === 'requested')
  const unavailableMembers = activeMembers.filter((m) => m.status === 'unavailable')

  // Evaluate Team Readiness Gate (Phase 2 Task 9 & 27)
  const teamReadiness = validateSchoolTeamReadiness(requiredVolunteers || 2, activeMembers)
  const isOversized = confirmedMembers.length > (requiredVolunteers || 2)

  // Volunteers on roster not yet on the active team
  const activeVolIds = new Set(activeMembers.map((m) => m.volunteer_id))
  const availableRoster = roster.filter((r) => !activeVolIds.has(r.id))

  const toggleVolunteer = (id: string) => {
    setSelectedVolunteers((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id],
    )
  }

  return (
    <div className="space-y-6">
      {/* Team Readiness Gate Card (Task 27) */}
      <div className={`rounded-xl p-4 border space-y-3 ${teamReadiness.ready ? 'bg-success/5 border-success/30' : 'bg-warning/5 border-warning/30'}`}>
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold flex items-center gap-2">
              {teamReadiness.ready ? (
                <ShieldCheck className="size-4 text-success" />
              ) : (
                <AlertCircle className="size-4 text-warning" />
              )}
              Team Readiness Gate
            </h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              {confirmedMembers.length} / {requiredVolunteers || 2} volunteers confirmed
            </p>
          </div>

          <Badge
            variant="outline"
            className={
              teamReadiness.ready
                ? 'border-success/30 bg-success/10 text-success font-bold'
                : 'border-warning/30 bg-warning/10 text-warning font-bold'
            }
          >
            {teamReadiness.ready ? 'TEAM READY' : 'BLOCKED'}
          </Badge>
        </div>

        {/* Breakdown Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs pt-1">
          <div className="rounded border bg-background/50 p-1.5">
            <span className="block text-muted-foreground text-[10px]">Required</span>
            <strong className="font-bold">{requiredVolunteers || 2}</strong>
          </div>
          <div className="rounded border bg-success/10 text-success p-1.5">
            <span className="block text-[10px]">Confirmed</span>
            <strong className="font-bold">{confirmedMembers.length}</strong>
          </div>
          <div className="rounded border bg-brand/10 text-brand p-1.5">
            <span className="block text-[10px]">Available</span>
            <strong className="font-bold">{availableMembers.length}</strong>
          </div>
          <div className="rounded border bg-warning/10 text-warning p-1.5">
            <span className="block text-[10px]">Awaiting</span>
            <strong className="font-bold">{requestedMembers.length}</strong>
          </div>
          <div className="rounded border bg-destructive/10 text-destructive p-1.5">
            <span className="block text-[10px]">Unavailable</span>
            <strong className="font-bold">{unavailableMembers.length}</strong>
          </div>
        </div>

        {!teamReadiness.ready && (
          <p className="text-xs text-warning font-medium border-t border-warning/20 pt-2">
            Reason: {teamReadiness.missing.join(', ')}
          </p>
        )}

        {isOversized && (
          <div className="rounded bg-warning/10 border border-warning/20 p-2 text-xs text-warning flex items-center gap-1.5">
            <AlertCircle className="size-4 shrink-0" />
            <span>Warning: You have confirmed {confirmedMembers.length} volunteers ({confirmedMembers.length - (requiredVolunteers || 2)} above the required count of {requiredVolunteers || 2}).</span>
          </div>
        )}
      </div>

      {/* Active Team List */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Assigned Volunteers ({activeMembers.length})
        </h4>

        {activeMembers.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center border border-dashed rounded-lg">
            No volunteers assigned to this school team yet.
          </p>
        ) : (
          <div className="space-y-2">
            {activeMembers.map((m) => {
              const statusBadge = {
                requested: { label: 'Awaiting Response', style: 'border-warning/30 bg-warning/10 text-warning', icon: Clock },
                available: { label: 'Available', style: 'border-brand/30 bg-brand/10 text-brand', icon: CheckCircle2 },
                unavailable: { label: 'Unavailable', style: 'border-destructive/30 bg-destructive/10 text-destructive', icon: XCircle },
                confirmed: { label: 'Confirmed', style: 'border-success/30 bg-success/10 text-success', icon: ShieldCheck },
                replaced: { label: 'Replaced', style: 'border-border text-muted-foreground', icon: RefreshCw },
                completed: { label: 'Completed', style: 'border-success/30 bg-success/10 text-success', icon: CheckCircle2 },
              }[m.status]

              const Icon = statusBadge?.icon ?? Clock

              return (
                <div
                  key={m.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-3 bg-card"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-full bg-brand/10 text-brand font-semibold text-sm">
                      {m.volunteer?.full_name?.slice(0, 2).toUpperCase() ?? 'VO'}
                    </div>
                    <div>
                      <p className="text-sm font-medium leading-tight">
                        {m.volunteer?.full_name ?? 'Volunteer'}
                      </p>
                      <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
                        {m.volunteer?.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="size-3" /> {m.volunteer.phone}
                          </span>
                        )}
                        {m.volunteer?.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="size-3" /> {m.volunteer.email}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={`flex items-center gap-1 ${statusBadge?.style}`}>
                      <Icon className="size-3" /> {statusBadge?.label}
                    </Badge>

                    {canManage && m.status !== 'replaced' && m.status !== 'completed' && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setReplacingMemberId(replacingMemberId === m.id ? null : m.id)
                        }
                        className="text-xs text-muted-foreground hover:text-foreground"
                      >
                        <RefreshCw className="size-3 mr-1" /> Replace
                      </Button>
                    )}
                  </div>

                  {/* Inline Replacement Form */}
                  {replacingMemberId === m.id && (
                    <div className="w-full mt-2 pt-3 border-t border-border space-y-3 bg-muted/30 p-3 rounded-md">
                      <p className="text-xs font-semibold">
                        Replace {m.volunteer?.full_name} with another volunteer:
                      </p>
                      <form action={repAction} className="space-y-3">
                        <input type="hidden" name="member_id" value={m.id} />

                        <div>
                          <Label htmlFor="replacement_volunteer_id" className="text-xs">
                            Select Replacement
                          </Label>
                          <select
                            id="replacement_volunteer_id"
                            name="replacement_volunteer_id"
                            required
                            value={replacementVolunteerId}
                            onChange={(e) => setReplacementVolunteerId(e.target.value)}
                            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm"
                          >
                            <option value="">-- Choose Volunteer --</option>
                            {availableRoster.map((r) => (
                              <option key={r.id} value={r.id}>
                                {r.full_name} ({r.role})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <Label htmlFor="reason" className="text-xs">
                            Reason for Replacement
                          </Label>
                          <Input
                            id="reason"
                            name="reason"
                            required
                            placeholder="e.g. Schedule conflict, illness"
                            value={replacementReason}
                            onChange={(e) => setReplacementReason(e.target.value)}
                            className="mt-1 text-sm"
                          />
                        </div>

                        <div className="flex gap-2">
                          <Button type="submit" size="sm" disabled={repPending}>
                            {repPending && <Loader2 className="size-3.5 animate-spin mr-1" />}
                            Confirm Replacement
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setReplacingMemberId(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Confirm Team Action (if available members ready to confirm) */}
      {canManage && availableMembers.length > 0 && (
        <div className="rounded-lg border border-brand/30 bg-brand/5 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-semibold text-brand">Confirm Available Volunteers</h4>
              <p className="text-xs text-muted-foreground">
                {availableMembers.length} volunteer(s) responded Available and ready for team confirmation.
              </p>
            </div>
            <form action={confAction}>
              <input type="hidden" name="school_id" value={schoolId} />
              {availableMembers.map((m) => (
                <input key={m.id} type="hidden" name="member_ids" value={m.id} />
              ))}
              <Button type="submit" size="sm" disabled={confPending} className="bg-brand text-white">
                {confPending ? <Loader2 className="size-4 animate-spin mr-1" /> : <ShieldCheck className="size-4 mr-1" />}
                Confirm Team ({availableMembers.length})
              </Button>
            </form>
          </div>
          {confState.error && <p className="text-xs text-error">{confState.error}</p>}
          {confState.ok && <p className="text-xs text-success">{confState.message}</p>}
        </div>
      )}

      {/* Request Availability Form */}
      {canManage && (
        <div className="rounded-lg border border-border p-4 space-y-4 bg-muted/10">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <UserPlus className="size-4 text-brand" /> Request Volunteer Availability
            </h4>
          </div>

          {/* Target team size saves on its own. It used to be a field of the
              availability request below, which the database rejects unless at
              least one volunteer is also ticked — so the count could not be
              corrected by itself, and could not be corrected at all once every
              campus volunteer had already been requested. */}
          <form action={countAction} className="flex flex-wrap items-end gap-2">
            <input type="hidden" name="school_id" value={schoolId} />
            <div className="w-40">
              <Label htmlFor="required_volunteers" className="text-xs font-medium">
                Required Volunteers Count
              </Label>
              <Input
                id="required_volunteers"
                name="required_volunteers"
                type="number"
                min={1}
                value={reqVolCount}
                onChange={(e) => setReqVolCount(Number(e.target.value))}
                className="mt-1 text-sm"
              />
            </div>
            <Button type="submit" size="sm" variant="outline" disabled={countPending}>
              {countPending ? <Loader2 className="size-4 animate-spin mr-1" /> : null}
              Save count
            </Button>
          </form>
          {countState.error && (
            <p role="alert" className="text-xs text-error">{countState.error}</p>
          )}
          {countState.ok && countState.message && (
            <p role="status" className="text-xs text-success">{countState.message}</p>
          )}

          <form action={reqAction} className="space-y-4">
            <input type="hidden" name="school_id" value={schoolId} />
            {/* Still sent so requesting availability keeps honouring whatever the
                box currently shows, even if "Save count" was not pressed. */}
            <input type="hidden" name="required_volunteers" value={reqVolCount} />

            <div>
              <Label className="text-xs font-medium">Select Volunteers to Request</Label>
              {availableRoster.length === 0 ? (
                <p className="mt-1 text-xs text-muted-foreground">
                  All active campus volunteers are already requested/assigned to this school.
                </p>
              ) : (
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 border rounded-md bg-background">
                  {availableRoster.map((r) => {
                    const isSelected = selectedVolunteers.includes(r.id)
                    return (
                      <label
                        key={r.id}
                        className={`flex items-center justify-between p-2 rounded border text-xs cursor-pointer transition-all ${
                          isSelected
                            ? 'border-brand bg-brand/5 text-brand font-medium'
                            : 'border-border hover:bg-muted'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            name="volunteer_ids"
                            value={r.id}
                            checked={isSelected}
                            onChange={() => toggleVolunteer(r.id)}
                            className="rounded border-input text-brand"
                          />
                          <span>{r.full_name}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground">{r.role}</span>
                      </label>
                    )
                  })}
                </div>
              )}
            </div>

            {reqState.error && (
              <p className="text-xs text-error flex items-center gap-1">
                <AlertCircle className="size-3.5" /> {reqState.error}
              </p>
            )}
            {reqState.ok && <p className="text-xs text-success">{reqState.message}</p>}

            <Button
              type="submit"
              size="sm"
              disabled={reqPending || selectedVolunteers.length === 0}
            >
              {reqPending ? <Loader2 className="size-4 animate-spin mr-1" /> : <UserPlus className="size-4 mr-1" />}
              Send Availability Requests ({selectedVolunteers.length})
            </Button>
          </form>
        </div>
      )}
    </div>
  )
}
