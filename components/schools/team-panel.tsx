'use client'

import { useActionState, useRef, useState } from 'react'
import {
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
import {
  Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger,
} from '@/components/ui/sheet'
import { ReadinessStrip } from '@/components/schools/readiness-strip'

import { validateSchoolTeamReadiness } from '@/lib/validations/team-readiness'
import { useFormSuccess } from '@/hooks/use-form-success'

interface TeamPanelProps {
  schoolId: string
  team: SchoolTeamMemberDetail[]
  roster: TeamMember[]
  requiredVolunteers: number
  canManage: boolean
  schoolStatus: string
}

const MEMBER_STATUS_META = {
  requested: { label: 'Awaiting Response', style: 'border-warning/30 bg-warning/10 text-ink-orange', icon: Clock },
  available: { label: 'Available', style: 'border-brand/30 bg-brand/10 text-brand', icon: CheckCircle2 },
  unavailable: { label: 'Unavailable', style: 'border-error/30 bg-error/10 text-ink-red', icon: XCircle },
  confirmed: { label: 'Confirmed', style: 'border-success/30 bg-success/10 text-ink-green', icon: ShieldCheck },
  replaced: { label: 'Replaced', style: 'border-border text-muted-foreground', icon: RefreshCw },
  completed: { label: 'Completed', style: 'border-success/30 bg-success/10 text-ink-green', icon: CheckCircle2 },
} as const

export function TeamPanel({
  schoolId,
  team,
  roster,
  requiredVolunteers,
  canManage,
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
  const [requestOpen, setRequestOpen] = useState(false)

  const reqFormRef = useRef<HTMLFormElement>(null)
  const countFormRef = useRef<HTMLFormElement>(null)
  const repFormRef = useRef<HTMLFormElement>(null)

  useFormSuccess(reqState, {
    formRef: reqFormRef,
    onSuccess: () => {
      setSelectedVolunteers([])
      setRequestOpen(false)
    },
  })
  useFormSuccess(countState, { formRef: countFormRef })
  useFormSuccess(confState)
  useFormSuccess(repState, {
    formRef: repFormRef,
    onSuccess: () => {
      setReplacingMemberId(null)
      setReplacementVolunteerId('')
      setReplacementReason('')
    },
  })

  const activeMembers = team.filter((m) => m.is_active)
  // A member flips 'confirmed' → 'completed' when the school program closes
  // out; they are still a confirmed member of the delivered team.
  const confirmedMembers = activeMembers.filter((m) => m.status === 'confirmed' || m.status === 'completed')
  const availableMembers = activeMembers.filter((m) => m.status === 'available')
  const requestedMembers = activeMembers.filter((m) => m.status === 'requested')
  const unavailableMembers = activeMembers.filter((m) => m.status === 'unavailable')

  const required = requiredVolunteers || 2
  const teamReadiness = validateSchoolTeamReadiness(required, activeMembers)
  const isOversized = confirmedMembers.length > required

  // Volunteers on roster not yet on the active team
  const activeVolIds = new Set(activeMembers.map((m) => m.volunteer_id))
  const availableRoster = roster.filter((r) => !activeVolIds.has(r.id))

  const toggleVolunteer = (id: string) => {
    setSelectedVolunteers((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id],
    )
  }

  return (
    <div className="space-y-5">
      <ReadinessStrip title="Team readiness" gate={teamReadiness}>
        {/* The five-tile stat grid this replaces spent a whole row restating one
            fraction. The counts that matter are the ones still moving. */}
        <p className="text-xs text-muted-foreground">
          <strong className="text-foreground">{confirmedMembers.length}</strong> confirmed of {required} required
          {availableMembers.length > 0 && <> · {availableMembers.length} available to confirm</>}
          {requestedMembers.length > 0 && <> · {requestedMembers.length} awaiting a reply</>}
          {unavailableMembers.length > 0 && <> · {unavailableMembers.length} unavailable</>}
        </p>
        {isOversized && (
          <p className="flex items-start gap-1.5 text-xs font-medium text-ink-orange">
            <AlertCircle aria-hidden className="mt-px size-3.5 shrink-0" />
            {confirmedMembers.length} volunteers confirmed — {confirmedMembers.length - required} above
            the required count of {required}.
          </p>
        )}
      </ReadinessStrip>

      {/* Confirm Team Action (if available members ready to confirm) */}
      {canManage && availableMembers.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-brand/30 bg-brand/5 p-3">
          <p className="text-sm">
            <strong className="font-semibold text-brand">{availableMembers.length} responded Available.</strong>{' '}
            <span className="text-muted-foreground">Confirm them onto the school team.</span>
          </p>
          <form action={confAction}>
            <input type="hidden" name="school_id" value={schoolId} />
            {availableMembers.map((m) => (
              <input key={m.id} type="hidden" name="member_ids" value={m.id} />
            ))}
            <Button type="submit" size="sm" disabled={confPending}>
              {confPending ? <Loader2 className="size-4 animate-spin" /> : <ShieldCheck className="size-4" />}
              Confirm team ({availableMembers.length})
            </Button>
          </form>
          {confState.error && <p className="w-full text-xs text-error">{confState.error}</p>}
        </div>
      )}

      {/* Active Team List */}
      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Assigned volunteers ({activeMembers.length})
          </h4>

          {canManage && (
            <Sheet open={requestOpen} onOpenChange={setRequestOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm">
                  <UserPlus className="size-4" /> Request availability
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
                <SheetHeader>
                  <SheetTitle>Request volunteer availability</SheetTitle>
                  <SheetDescription>
                    Set how many volunteers this school needs, then ask campus volunteers whether
                    they are free. Confirming the final team happens back on the Team tab.
                  </SheetDescription>
                </SheetHeader>

                <div className="space-y-5 px-4 pb-6">
                  {/* Target team size saves on its own. It used to be a field of the
                      availability request below, which the database rejects unless at
                      least one volunteer is also ticked — so the count could not be
                      corrected by itself, and could not be corrected at all once every
                      campus volunteer had already been requested. */}
                  <form ref={countFormRef} action={countAction} className="flex flex-wrap items-end gap-2">
                    <input type="hidden" name="school_id" value={schoolId} />
                    <div className="w-40">
                      <Label htmlFor="required_volunteers" className="text-xs font-medium">
                        Required volunteers
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
                      {countPending ? <Loader2 className="size-4 animate-spin" /> : null}
                      Save count
                    </Button>
                    {countState.error && (
                      <p role="alert" className="w-full text-xs text-error">{countState.error}</p>
                    )}
                  </form>

                  <form ref={reqFormRef} action={reqAction} className="space-y-3 border-t border-border pt-4">
                    <input type="hidden" name="school_id" value={schoolId} />
                    {/* Still sent so requesting availability keeps honouring whatever the
                        box currently shows, even if "Save count" was not pressed. */}
                    <input type="hidden" name="required_volunteers" value={reqVolCount} />

                    <Label className="text-xs font-medium">Select volunteers to request</Label>
                    {availableRoster.length === 0 ? (
                      <p className="text-xs text-muted-foreground">
                        All active campus volunteers are already requested/assigned to this school.
                      </p>
                    ) : (
                      <div className="grid max-h-72 grid-cols-1 gap-1.5 overflow-y-auto rounded-md border border-border bg-background p-2">
                        {availableRoster.map((r) => {
                          const isSelected = selectedVolunteers.includes(r.id)
                          return (
                            <label
                              key={r.id}
                              className={`flex cursor-pointer items-center justify-between rounded border p-2 text-xs transition-colors ${
                                isSelected
                                  ? 'border-brand bg-brand/5 font-medium text-brand'
                                  : 'border-border hover:bg-muted'
                              }`}
                            >
                              <span className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  name="volunteer_ids"
                                  value={r.id}
                                  checked={isSelected}
                                  onChange={() => toggleVolunteer(r.id)}
                                  className="size-4 rounded border-input accent-brand"
                                />
                                {r.full_name}
                              </span>
                              <span className="text-[10px] text-muted-foreground">{r.role}</span>
                            </label>
                          )
                        })}
                      </div>
                    )}

                    {reqState.error && (
                      <p className="flex items-center gap-1 text-xs text-error">
                        <AlertCircle className="size-3.5" /> {reqState.error}
                      </p>
                    )}

                    <Button
                      type="submit"
                      size="sm"
                      disabled={reqPending || selectedVolunteers.length === 0}
                    >
                      {reqPending ? <Loader2 className="size-4 animate-spin" /> : <UserPlus className="size-4" />}
                      Send requests ({selectedVolunteers.length})
                    </Button>
                  </form>
                </div>
              </SheetContent>
            </Sheet>
          )}
        </div>

        {activeMembers.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border bg-paper/60 py-6 text-center text-sm text-muted-foreground">
            No volunteers assigned to this school team yet.
          </p>
        ) : (
          <ul className="divide-y divide-border/60 rounded-xl border border-border/60 bg-paper">
            {activeMembers.map((m) => {
              const meta = MEMBER_STATUS_META[m.status as keyof typeof MEMBER_STATUS_META]
              const Icon = meta?.icon ?? Clock

              return (
                <li key={m.id} className="flex flex-wrap items-center justify-between gap-3 px-3 py-2.5">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand/10 text-sm font-semibold text-brand">
                      {m.volunteer?.full_name?.slice(0, 2).toUpperCase() ?? 'VO'}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium leading-tight">
                        {m.volunteer?.full_name ?? 'Volunteer'}
                      </p>
                      <div className="mt-0.5 flex flex-wrap items-center gap-x-3 text-xs text-muted-foreground">
                        {m.volunteer?.phone && (
                          <a href={`tel:${m.volunteer.phone}`} className="flex items-center gap-1 hover:text-brand">
                            <Phone aria-hidden className="size-3" /> {m.volunteer.phone}
                          </a>
                        )}
                        {m.volunteer?.email && (
                          <a href={`mailto:${m.volunteer.email}`} className="flex items-center gap-1 truncate hover:text-brand">
                            <Mail aria-hidden className="size-3" /> {m.volunteer.email}
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={`flex items-center gap-1 ${meta?.style}`}>
                      <Icon className="size-3" /> {meta?.label}
                    </Badge>

                    {canManage && m.status !== 'replaced' && m.status !== 'completed' && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setReplacingMemberId(replacingMemberId === m.id ? null : m.id)}
                        className="text-xs text-muted-foreground hover:text-foreground"
                      >
                        <RefreshCw className="size-3" /> Replace
                      </Button>
                    )}
                  </div>

                  {/* Inline Replacement Form — small, and about this one row, so it
                      belongs next to the row rather than behind a drawer. */}
                  {replacingMemberId === m.id && (
                    <form
                      ref={repFormRef}
                      action={repAction}
                      className="mt-1 w-full space-y-3 rounded-lg bg-muted/30 p-3"
                    >
                      <p className="text-xs font-semibold">
                        Replace {m.volunteer?.full_name} with another volunteer
                      </p>
                      <input type="hidden" name="member_id" value={m.id} />

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <Label htmlFor={`replacement-${m.id}`} className="text-xs">Replacement</Label>
                          <select
                            id={`replacement-${m.id}`}
                            name="replacement_volunteer_id"
                            required
                            value={replacementVolunteerId}
                            onChange={(e) => setReplacementVolunteerId(e.target.value)}
                            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm"
                          >
                            <option value="">-- Choose volunteer --</option>
                            {availableRoster.map((r) => (
                              <option key={r.id} value={r.id}>
                                {r.full_name} ({r.role})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <Label htmlFor={`reason-${m.id}`} className="text-xs">Reason</Label>
                          <Input
                            id={`reason-${m.id}`}
                            name="reason"
                            required
                            placeholder="e.g. Schedule conflict, illness"
                            value={replacementReason}
                            onChange={(e) => setReplacementReason(e.target.value)}
                            className="mt-1 text-sm"
                          />
                        </div>
                      </div>

                      {repState.error && <p className="text-xs text-error">{repState.error}</p>}

                      <div className="flex gap-2">
                        <Button type="submit" size="sm" disabled={repPending}>
                          {repPending && <Loader2 className="size-3.5 animate-spin" />}
                          Confirm replacement
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
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}
