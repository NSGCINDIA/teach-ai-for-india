'use client'

import { useActionState, useRef, useState } from 'react'
import {
  Calendar,
  CheckCircle2,
  Clock,
  Plus,
  FileText,
  ShieldCheck,
  Camera,
  FileCheck,
  AlertCircle,
  Loader2,
  Users,
  Lock,
  Link2,
} from 'lucide-react'
import type { SessionRow } from '@/types/database'
import { curriculumStageLabel } from '@/lib/constants/sessions'
import { getInitialScheduleDefaults } from '@/lib/validations/schedule'
import {
  createSessionDeliveryPlan,
  submitSessionDeliveryReport,
  verifySessionDelivery,
  type SessionDeliveryActionState,
} from '@/actions/session-delivery'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle,
} from '@/components/ui/sheet'
import type { SchoolTeamMemberDetail } from '@/lib/data/school-team'
import type { EvidenceListItem } from '@/lib/data/evidence'
import { useFormSuccess } from '@/hooks/use-form-success'

interface SessionHubProps {
  schoolId: string
  sessions: SessionRow[]
  /** Drive/Docs links and uploads recorded against this school's sessions. */
  evidence?: EvidenceListItem[]
  team: SchoolTeamMemberDetail[]
  canManage: boolean
  canVerify: boolean
  schoolStatus: string
  operationalPhase: string | null
  isExecPlanApproved?: boolean
}

const TOTAL_SESSIONS = 4

export function SessionHub({
  schoolId,
  sessions,
  evidence = [],
  team,
  canManage,
  canVerify,
  operationalPhase,
  isExecPlanApproved,
}: SessionHubProps) {
  const [createState, createAction, createPending] = useActionState<SessionDeliveryActionState, FormData>(
    createSessionDeliveryPlan,
    {},
  )
  const [reportState, reportAction, reportPending] = useActionState<SessionDeliveryActionState, FormData>(
    submitSessionDeliveryReport,
    {},
  )
  const [verifyState, verifyAction, verifyPending] = useActionState<SessionDeliveryActionState, FormData>(
    verifySessionDelivery,
    {},
  )

  // Map existing sessions by session_number (1..4)
  const sessionMap = new Map<number, SessionRow>()
  sessions.forEach((s) => sessionMap.set(s.session_number, s))

  // Determine current active session slot
  const verifiedCount = sessions.filter((s) => s.status === 'verified').length
  const nextSchedulableNum = Math.min(verifiedCount + 1, TOTAL_SESSIONS)

  // Open on the session that is actually live. This used to open on Session 1
  // always, so a school delivering Session 3 landed on a finished one and had to
  // be told where it was — the only card on the page that did not reflect the
  // school's real position.
  const [activeSessionNum, setActiveSessionNum] = useState<number>(nextSchedulableNum)
  const [isPlanFormOpen, setIsPlanFormOpen] = useState(false)
  const [isReportFormOpen, setIsReportFormOpen] = useState(false)

  const planFormRef = useRef<HTMLFormElement>(null)
  const reportFormRef = useRef<HTMLFormElement>(null)

  useFormSuccess(createState, { formRef: planFormRef, onSuccess: () => setIsPlanFormOpen(false) })
  useFormSuccess(reportState, { formRef: reportFormRef, onSuccess: () => setIsReportFormOpen(false) })
  useFormSuccess(verifyState)

  // Execution Plan completion gate: Execution & Budget Plan must be approved before unlocking session program
  const isPlanCompleted = isExecPlanApproved ?? (
    operationalPhase === 'execution_ready' ||
    (!!operationalPhase && operationalPhase.startsWith('session_'))
  )

  const selectedSession = sessionMap.get(activeSessionNum)
  const isReportable =
    selectedSession?.status === 'planned' || selectedSession?.status === 'in_progress'
  const isReviewable =
    selectedSession?.status === 'reported' || selectedSession?.status === 'campus_approved'
  const hasDelivered = isReviewable || selectedSession?.status === 'verified'

  // Evidence the Exec Lead attached to this session. The Campus Lead has to be
  // able to open these before verifying — that review IS the verification.
  const sessionEvidence = selectedSession
    ? evidence.filter((e) => e.session_id === selectedSession.id)
    : []

  return (
    <div className="space-y-5">
      {/* Session selector (1 to 4) */}
      <div className="grid grid-cols-4 gap-2">
        {[1, 2, 3, 4].map((num) => {
          const sess = sessionMap.get(num)
          const isVerified = sess?.status === 'verified'
          const isReported = sess?.status === 'reported' || sess?.status === 'campus_approved'
          const isPlanned = sess?.status === 'planned' || sess?.status === 'in_progress'
          const isUnlocked = isPlanCompleted && num <= nextSchedulableNum
          const isSelected = activeSessionNum === num

          return (
            <button
              key={num}
              type="button"
              aria-pressed={isSelected}
              onClick={() => setActiveSessionNum(num)}
              className={`flex flex-col items-center rounded-xl border p-2.5 text-center transition-all ${
                isSelected
                  ? 'border-brand bg-brand/5 ring-2 ring-brand/20'
                  : isVerified
                    ? 'border-success/30 bg-success/5 hover:bg-success/10'
                    : isUnlocked
                      ? 'border-border bg-card hover:bg-muted'
                      : 'border-border/40 bg-muted/20 opacity-60'
              }`}
            >
              <span className="flex items-center gap-1">
                {isVerified ? (
                  <CheckCircle2 aria-hidden className="size-4 text-success" />
                ) : isReported ? (
                  <Clock aria-hidden className="size-4 text-warning" />
                ) : isPlanned ? (
                  <Calendar aria-hidden className="size-4 text-brand" />
                ) : !isUnlocked ? (
                  <Lock aria-hidden className="size-4 text-muted-foreground/40" />
                ) : (
                  <Plus aria-hidden className="size-4 text-muted-foreground" />
                )}
                <span className="text-sm font-bold">Session {num}</span>
              </span>
              <span className="mt-0.5 max-w-full truncate text-[10px] text-muted-foreground">
                {curriculumStageLabel(num)}
              </span>
              <span className="mt-1 rounded bg-muted px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider">
                {sess ? sess.status : isUnlocked ? 'Ready to plan' : 'Locked'}
              </span>
            </button>
          )
        })}
      </div>

      {/* Selected session — no outer card: the tab body is already the container. */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-base font-bold">Session {activeSessionNum} delivery</h4>
              <Badge variant="outline">{curriculumStageLabel(activeSessionNum)}</Badge>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {selectedSession
                ? `Scheduled for ${selectedSession.date}`
                : activeSessionNum <= nextSchedulableNum
                  ? 'Ready to plan and schedule'
                  : `Complete Session ${activeSessionNum - 1} first to unlock`}
            </p>
          </div>

          {selectedSession && (
            <Badge
              variant="outline"
              className={
                selectedSession.status === 'verified'
                  ? 'border-success/30 bg-success/10 text-ink-green'
                  : isReviewable
                    ? 'border-warning/30 bg-warning/10 text-ink-orange'
                    : 'border-brand/30 bg-brand/10 text-brand'
              }
            >
              {selectedSession.status}
            </Badge>
          )}
        </div>

        {selectedSession ? (
          <div className="space-y-4">
            <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
              <div>
                <dt className="field-label">Topic</dt>
                <dd className="mt-0.5 font-semibold">{selectedSession.topic}</dd>
              </div>
              <div>
                <dt className="field-label">Schedule</dt>
                <dd className="mt-0.5 font-medium">
                  {selectedSession.date} {selectedSession.start_time ? `at ${selectedSession.start_time}` : ''}
                </dd>
              </div>
              {hasDelivered && (
                <>
                  <div>
                    <dt className="field-label">Students reached</dt>
                    <dd className="mt-0.5 font-display text-xl font-bold text-brand tabular-nums">{selectedSession.student_count ?? 0}</dd>
                  </div>
                  <div>
                    <dt className="field-label">Volunteers present</dt>
                    <dd className="mt-0.5 font-display text-xl font-bold text-brand tabular-nums">{selectedSession.volunteer_count ?? 0}</dd>
                  </div>
                </>
              )}
            </dl>

            {selectedSession.notes && (
              <div className="rounded-lg border border-border/60 p-3 text-xs">
                <strong className="text-foreground">Session notes:</strong>
                <p className="mt-0.5 text-muted-foreground">{selectedSession.notes}</p>
              </div>
            )}

            {/* Submitted evidence — the Campus Lead reviews these links before verifying. */}
            {hasDelivered && (
              <div className="space-y-2 rounded-lg border border-border/60 bg-paper p-3">
                <div className="flex items-center gap-2">
                  <Link2 aria-hidden className="size-3.5 text-brand" />
                  <span className="text-xs font-semibold">Submitted evidence</span>
                </div>

                {sessionEvidence.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    No evidence links recorded for this session.
                  </p>
                ) : (
                  <ul className="space-y-1.5">
                    {sessionEvidence.map((item) => {
                      const href = item.signed_url ?? item.external_url
                      const isDoc = item.file_type === 'document' || item.file_type === 'letter'
                      const label = isDoc
                        ? 'Attendance / Report Doc'
                        : item.file_type === 'photo'
                          ? 'Session Photos / Album'
                          : item.file_name || item.file_type
                      return (
                        <li key={item.id} className="flex items-center gap-2 text-xs">
                          {isDoc ? (
                            <FileText aria-hidden className="size-3.5 shrink-0 text-muted-foreground" />
                          ) : (
                            <Camera aria-hidden className="size-3.5 shrink-0 text-muted-foreground" />
                          )}
                          {href ? (
                            <a
                              href={href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="break-all font-medium text-brand underline underline-offset-2 hover:opacity-80"
                            >
                              {label}
                            </a>
                          ) : (
                            <span className="text-muted-foreground">{label} (no link)</span>
                          )}
                        </li>
                      )
                    })}
                  </ul>
                )}

                {canVerify && isReviewable && (
                  <p className="border-t border-border pt-1 text-[11px] text-muted-foreground">
                    Open each link and confirm the evidence before verifying.
                  </p>
                )}
              </div>
            )}

            {/* Action bar based on status */}
            {((canManage && isReportable) || (canVerify && isReviewable)) && (
              <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
                {canManage && isReportable && (
                  <Button size="sm" onClick={() => setIsReportFormOpen(true)}>
                    <FileText className="size-4" /> Submit delivery report &amp; evidence
                  </Button>
                )}

                {canVerify && isReviewable && (
                  <form action={verifyAction} className="inline">
                    <input type="hidden" name="session_id" value={selectedSession.id} />
                    <Button type="submit" size="sm" disabled={verifyPending} className="bg-success text-white hover:bg-success/90">
                      {verifyPending ? <Loader2 className="size-4 animate-spin" /> : <ShieldCheck className="size-4" />}
                      Verify session delivery
                    </Button>
                  </form>
                )}
              </div>
            )}

            {verifyState.error && <p className="text-xs text-error">{verifyState.error}</p>}
          </div>
        ) : !isPlanCompleted ? (
          /* Locked: Execution & Budget Plan not approved yet */
          <div className="space-y-3 rounded-lg border border-dashed border-warning/40 bg-warning/5 p-6 text-center">
            <Lock aria-hidden className="mx-auto size-8 text-warning" />
            <div>
              <h5 className="text-sm font-bold">Bounded 4-session program locked</h5>
              <p className="mx-auto mt-1 max-w-md text-xs text-muted-foreground">
                The Execution &amp; Budget Plan must be submitted by the Execution Lead and approved
                by both Campus Lead and Finance Lead before scheduling sessions.
              </p>
            </div>
            <a
              href="#execution"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand underline underline-offset-2"
            >
              Go to the execution plan
            </a>
          </div>
        ) : (
          /* No session record yet for this slot */
          <div className="space-y-3 rounded-lg border border-dashed border-border p-6 text-center">
            <Calendar aria-hidden className="mx-auto size-8 text-muted-foreground" />
            <div>
              <h5 className="text-sm font-semibold">Session {activeSessionNum} not scheduled</h5>
              <p className="text-xs text-muted-foreground">
                {activeSessionNum <= nextSchedulableNum
                  ? `Plan the delivery details for Session ${activeSessionNum} (${curriculumStageLabel(activeSessionNum)}).`
                  : `Session ${activeSessionNum - 1} must be verified before Session ${activeSessionNum} can be planned.`}
              </p>
            </div>

            {canManage && activeSessionNum <= nextSchedulableNum && (
              <Button size="sm" onClick={() => setIsPlanFormOpen(true)}>
                <Plus className="size-4" /> Schedule session {activeSessionNum}
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Schedule form */}
      {canManage && (
      <Sheet open={isPlanFormOpen} onOpenChange={setIsPlanFormOpen}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Schedule session {activeSessionNum}</SheetTitle>
            <SheetDescription>{curriculumStageLabel(activeSessionNum)}</SheetDescription>
          </SheetHeader>

          <form ref={planFormRef} action={createAction} className="space-y-4 px-4 pb-6">
            <input type="hidden" name="school_id" value={schoolId} />
            <input type="hidden" name="session_number" value={activeSessionNum} />

            <div>
              <Label htmlFor="topic" className="text-xs font-semibold">
                Session topic <span className="text-error">*</span>
              </Label>
              <Input
                id="topic"
                name="topic"
                required
                defaultValue={`${curriculumStageLabel(activeSessionNum)} - AI Workshop`}
                className="mt-1 text-sm"
              />
            </div>

            {(() => {
              const { todayStr, timeStr } = getInitialScheduleDefaults()
              return (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="planned_date" className="text-xs font-semibold">
                      Planned date <span className="text-error">*</span>
                    </Label>
                    <Input
                      id="planned_date"
                      name="planned_date"
                      type="date"
                      required
                      min={todayStr}
                      defaultValue={todayStr}
                      className="mt-1 text-sm"
                    />
                  </div>
                  <div>
                    <Label htmlFor="start_time" className="text-xs font-semibold">Start time</Label>
                    <Input
                      id="start_time"
                      name="start_time"
                      type="time"
                      defaultValue={timeStr}
                      className="mt-1 text-sm"
                    />
                  </div>
                </div>
              )
            })()}

            {createState.error && <p className="text-xs text-error">{createState.error}</p>}

            <div className="flex gap-2">
              <Button type="submit" size="sm" disabled={createPending}>
                {createPending ? <Loader2 className="size-4 animate-spin" /> : <Calendar className="size-4" />}
                Schedule session {activeSessionNum}
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => setIsPlanFormOpen(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      )}

      {/* Delivery report form */}
      {canManage && (
      <Sheet open={isReportFormOpen} onOpenChange={setIsReportFormOpen}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Delivery report &amp; evidence</SheetTitle>
            <SheetDescription>
              Session {activeSessionNum} — attendance, participants and the Drive links the Campus
              Lead reviews before verifying.
            </SheetDescription>
          </SheetHeader>

          {selectedSession && (
            <form ref={reportFormRef} action={reportAction} className="space-y-4 px-4 pb-6">
              <input type="hidden" name="session_id" value={selectedSession.id} />

              <div>
                <Label htmlFor="report_topic" className="text-xs font-semibold">
                  Topic delivered <span className="text-error">*</span>
                </Label>
                <Input
                  id="report_topic"
                  name="topic"
                  required
                  defaultValue={selectedSession.topic}
                  className="mt-1 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="student_count" className="text-xs font-semibold">
                    Student count <span className="text-error">*</span>
                  </Label>
                  <Input
                    id="student_count"
                    name="student_count"
                    type="number"
                    min={1}
                    required
                    defaultValue={selectedSession.student_count ?? 30}
                    className="mt-1 text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="volunteer_count" className="text-xs font-semibold">
                    Volunteer count <span className="text-error">*</span>
                  </Label>
                  <Input
                    id="volunteer_count"
                    name="volunteer_count"
                    type="number"
                    min={1}
                    required
                    defaultValue={selectedSession.volunteer_count ?? team.filter((t) => t.status === 'confirmed').length}
                    className="mt-1 text-sm"
                  />
                </div>
              </div>

              <div>
                <Label className="mb-1 flex items-center gap-1 text-xs font-semibold">
                  <Users className="size-3.5" /> Participating volunteers
                </Label>
                <div className="grid max-h-36 grid-cols-1 gap-1 overflow-y-auto rounded-md border border-border bg-background p-2 sm:grid-cols-2">
                  {team
                    .filter((t) => t.is_active && t.status === 'confirmed')
                    .map((t) => (
                      <label key={t.id} className="flex cursor-pointer items-center gap-2 p-1 text-xs">
                        <input
                          type="checkbox"
                          name="participant_ids"
                          value={t.volunteer_id}
                          defaultChecked
                          className="size-4 rounded border-input accent-brand"
                        />
                        <span>{t.volunteer?.full_name}</span>
                      </label>
                    ))}
                </div>
              </div>

              <div>
                <Label htmlFor="notes" className="text-xs">Delivery highlights / notes</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  rows={2}
                  placeholder="What went well during the session?"
                  className="mt-1 text-sm"
                />
              </div>

              <fieldset className="space-y-3 rounded-lg border border-border p-3">
                <legend className="flex items-center gap-2 px-1 text-xs font-semibold">
                  <Link2 className="size-3.5 text-brand" /> Evidence links
                </legend>
                <p className="text-[11px] text-muted-foreground">
                  To eliminate storage costs, share Google Drive links instead of uploading raw
                  files. Make sure permissions are set to &quot;Anyone with the link can view&quot;.
                </p>

                <div>
                  <Label htmlFor="photo_url" className="flex items-center gap-1 text-xs font-semibold">
                    <Camera className="size-3.5 text-brand" /> Session photo / album link <span className="text-error">*</span>
                  </Label>
                  <Input
                    id="photo_url"
                    name="photo_url"
                    type="url"
                    required
                    placeholder="https://drive.google.com/drive/folders/…"
                    className="mt-1 text-xs"
                  />
                </div>

                <div>
                  <Label htmlFor="document_url" className="flex items-center gap-1 text-xs font-semibold">
                    <FileText className="size-3.5 text-brand" /> Attendance / report doc link <span className="text-error">*</span>
                  </Label>
                  <Input
                    id="document_url"
                    name="document_url"
                    type="url"
                    required
                    placeholder="https://docs.google.com/document/d/…"
                    className="mt-1 text-xs"
                  />
                </div>
              </fieldset>

              {reportState.error && (
                <p className="flex items-center gap-1 text-xs text-error">
                  <AlertCircle className="size-3.5" /> {reportState.error}
                </p>
              )}

              <div className="flex gap-2">
                <Button type="submit" size="sm" disabled={reportPending}>
                  {reportPending ? <Loader2 className="size-4 animate-spin" /> : <FileCheck className="size-4" />}
                  Submit delivery report
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => setIsReportFormOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </SheetContent>
      </Sheet>
      )}
    </div>
  )
}
