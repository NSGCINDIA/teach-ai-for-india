'use client'

import { useActionState, useState } from 'react'
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
import type { SessionRow, MediaAssetRow, SessionParticipantRow, UserRow } from '@/types/database'
import { curriculumStageLabel } from '@/lib/constants/sessions'
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
import type { SchoolTeamMemberDetail } from '@/lib/data/school-team'

interface SessionHubProps {
  schoolId: string
  sessions: SessionRow[]
  team: SchoolTeamMemberDetail[]
  canManage: boolean
  canVerify: boolean
  schoolStatus: string
  operationalPhase: string | null
}

const TOTAL_SESSIONS = 4

export function SessionHub({
  schoolId,
  sessions,
  team,
  canManage,
  canVerify,
  schoolStatus,
  operationalPhase,
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

  const [activeSessionNum, setActiveSessionNum] = useState<number>(1)
  const [isPlanFormOpen, setIsPlanFormOpen] = useState(false)
  const [isReportFormOpen, setIsReportFormOpen] = useState(false)

  // Map existing sessions by session_number (1..4)
  const sessionMap = new Map<number, SessionRow>()
  sessions.forEach((s) => sessionMap.set(s.session_number, s))

  // Determine current active session slot
  const verifiedCount = sessions.filter((s) => s.status === 'verified').length
  const nextSchedulableNum = Math.min(verifiedCount + 1, TOTAL_SESSIONS)

  const selectedSession = sessionMap.get(activeSessionNum)

  return (
    <div className="space-y-6">
      {/* Session Navigation Tabs (1 to 4) */}
      <div className="grid grid-cols-4 gap-2">
        {[1, 2, 3, 4].map((num) => {
          const sess = sessionMap.get(num)
          const isVerified = sess?.status === 'verified'
          const isReported = sess?.status === 'reported'
          const isPlanned = sess?.status === 'planned' || sess?.status === 'in_progress'
          const isUnlocked = num <= nextSchedulableNum
          const isSelected = activeSessionNum === num

          return (
            <button
              key={num}
              type="button"
              onClick={() => setActiveSessionNum(num)}
              className={`flex flex-col items-center p-3 rounded-xl border text-center transition-all ${
                isSelected
                  ? 'border-brand bg-brand/5 ring-2 ring-brand/20'
                  : isVerified
                    ? 'border-success/30 bg-success/5 hover:bg-success/10'
                    : isUnlocked
                      ? 'border-border bg-card hover:bg-muted'
                      : 'border-border/40 bg-muted/20 opacity-60'
              }`}
            >
              <div className="flex items-center gap-1">
                {isVerified ? (
                  <CheckCircle2 className="size-4 text-success" />
                ) : isReported ? (
                  <Clock className="size-4 text-warning" />
                ) : isPlanned ? (
                  <Calendar className="size-4 text-brand" />
                ) : !isUnlocked ? (
                  <Lock className="size-4 text-muted-foreground/40" />
                ) : (
                  <Plus className="size-4 text-muted-foreground" />
                )}
                <span className="text-sm font-bold">Session {num}</span>
              </div>
              <span className="text-[10px] text-muted-foreground mt-0.5 truncate max-w-full">
                {curriculumStageLabel(num)}
              </span>
              <span className="mt-1 text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded font-semibold bg-muted">
                {sess ? sess.status : isUnlocked ? 'Ready to Plan' : 'Locked'}
              </span>
            </button>
          )
        })}
      </div>

      {/* Selected Session Details */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-base font-bold">Session {activeSessionNum} Delivery</h4>
              <Badge variant="outline">{curriculumStageLabel(activeSessionNum)}</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
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
                  ? 'border-success/30 bg-success/10 text-success'
                  : selectedSession.status === 'reported'
                    ? 'border-warning/30 bg-warning/10 text-warning'
                    : 'border-brand/30 bg-brand/10 text-brand'
              }
            >
              {selectedSession.status}
            </Badge>
          )}
        </div>

        {selectedSession ? (
          /* Render Selected Session Details */
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2 text-xs">
              <div className="rounded-lg border border-border p-3 space-y-1">
                <span className="text-muted-foreground uppercase tracking-wider text-[10px]">Topic</span>
                <p className="font-semibold text-sm">{selectedSession.topic}</p>
              </div>
              <div className="rounded-lg border border-border p-3 space-y-1">
                <span className="text-muted-foreground uppercase tracking-wider text-[10px]">Schedule</span>
                <p className="font-medium text-sm">
                  {selectedSession.date} {selectedSession.start_time ? `at ${selectedSession.start_time}` : ''}
                </p>
              </div>
            </div>

            {/* Delivery Stats if reported/verified */}
            {(selectedSession.status === 'reported' || selectedSession.status === 'verified') && (
              <div className="grid grid-cols-2 gap-3 rounded-lg bg-muted/20 p-3 text-xs">
                <div>
                  <span className="text-muted-foreground">Students Reached:</span>{' '}
                  <strong className="font-bold text-brand">{selectedSession.student_count ?? 0}</strong>
                </div>
                <div>
                  <span className="text-muted-foreground">Volunteers Present:</span>{' '}
                  <strong className="font-bold text-brand">{selectedSession.volunteer_count ?? 0}</strong>
                </div>
              </div>
            )}

            {selectedSession.notes && (
              <div className="text-xs rounded-lg border border-border p-3 bg-muted/10">
                <strong className="text-foreground">Session Notes:</strong>
                <p className="text-muted-foreground mt-0.5">{selectedSession.notes}</p>
              </div>
            )}

            {/* Action Bar based on Status */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border">
              {/* Submit Report Action */}
              {canManage && (selectedSession.status === 'planned' || selectedSession.status === 'in_progress') && (
                <Button size="sm" onClick={() => setIsReportFormOpen(!isReportFormOpen)}>
                  <FileText className="size-4 mr-1" />
                  {isReportFormOpen ? 'Cancel Report' : 'Submit Delivery Report & Evidence'}
                </Button>
              )}

              {/* Verify Action (Campus Lead) */}
              {canVerify && selectedSession.status === 'reported' && (
                <form action={verifyAction} className="inline">
                  <input type="hidden" name="session_id" value={selectedSession.id} />
                  <Button type="submit" size="sm" disabled={verifyPending} className="bg-success text-white">
                    {verifyPending ? <Loader2 className="size-4 animate-spin mr-1" /> : <ShieldCheck className="size-4 mr-1" />}
                    Verify Session Delivery
                  </Button>
                </form>
              )}
            </div>

            {verifyState.error && <p className="text-xs text-error">{verifyState.error}</p>}
            {verifyState.ok && <p className="text-xs text-success">{verifyState.message}</p>}

            {/* Session Report Submission Form */}
            {isReportFormOpen && (selectedSession.status === 'planned' || selectedSession.status === 'in_progress') && (
              <div className="rounded-lg border border-border p-4 bg-muted/10 space-y-4">
                <h5 className="text-sm font-semibold flex items-center gap-2">
                  <FileText className="size-4 text-brand" /> Delivery Report & Evidence Gate
                </h5>

                <form action={reportAction} className="space-y-4">
                  <input type="hidden" name="session_id" value={selectedSession.id} />

                  <div>
                    <Label htmlFor="topic" className="text-xs font-semibold">
                      Topic Delivered <span className="text-error">*</span>
                    </Label>
                    <Input
                      id="topic"
                      name="topic"
                      required
                      defaultValue={selectedSession.topic}
                      className="mt-1 text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="student_count" className="text-xs font-semibold">
                        Student Count <span className="text-error">*</span>
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
                        Volunteer Count <span className="text-error">*</span>
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
                    <Label className="text-xs font-semibold flex items-center gap-1 mb-1">
                      <Users className="size-3.5" /> Select Participating Volunteers
                    </Label>
                    <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto p-2 border rounded-md bg-background">
                      {team
                        .filter((t) => t.is_active && t.status === 'confirmed')
                        .map((t) => (
                          <label key={t.id} className="flex items-center gap-2 text-xs cursor-pointer p-1">
                            <input
                              type="checkbox"
                              name="participant_ids"
                              value={t.volunteer_id}
                              defaultChecked
                              className="rounded border-input text-brand"
                            />
                            <span>{t.volunteer?.full_name}</span>
                          </label>
                        ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="notes" className="text-xs">
                      Delivery Highlights / Notes
                    </Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      rows={2}
                      placeholder="What went well during the session?"
                      className="mt-1 text-sm"
                    />
                  </div>

                  {/* Evidence Section — Google Drive Links */}
                  <div className="rounded-lg border border-border bg-card p-3 space-y-3">
                    <div className="flex items-center gap-2 border-b border-border pb-2">
                      <Link2 className="size-4 text-brand" />
                      <span className="text-xs font-semibold">Evidence Links (Google Drive / Docs)</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      To eliminate storage costs, share Google Drive links instead of uploading raw files. Make sure permissions are set to &quot;Anyone with the link can view&quot;.
                    </p>

                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="photo_url" className="text-xs font-semibold flex items-center gap-1">
                          <Camera className="size-3.5 text-brand" /> Session Photo / Album Drive Link <span className="text-error">*</span>
                        </Label>
                        <Input
                          id="photo_url"
                          name="photo_url"
                          type="url"
                          placeholder="https://drive.google.com/drive/folders/... or photo link"
                          className="mt-1 text-xs"
                        />
                      </div>

                      <div>
                        <Label htmlFor="document_url" className="text-xs font-semibold flex items-center gap-1">
                          <FileText className="size-3.5 text-brand" /> Attendance / Report Google Doc Link <span className="text-error">*</span>
                        </Label>
                        <Input
                          id="document_url"
                          name="document_url"
                          type="url"
                          placeholder="https://docs.google.com/document/d/..."
                          className="mt-1 text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  {reportState.error && (
                    <p className="text-xs text-error flex items-center gap-1">
                      <AlertCircle className="size-3.5" /> {reportState.error}
                    </p>
                  )}
                  {reportState.ok && <p className="text-xs text-success">{reportState.message}</p>}

                  <div className="flex gap-2">
                    <Button type="submit" size="sm" disabled={reportPending}>
                      {reportPending ? <Loader2 className="size-4 animate-spin mr-1" /> : <FileCheck className="size-4 mr-1" />}
                      Submit Delivery Report
                    </Button>
                    <Button type="button" variant="ghost" size="sm" onClick={() => setIsReportFormOpen(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </div>
        ) : (
          /* No Session Record Yet for this slot */
          <div className="py-6 text-center space-y-3 border border-dashed rounded-lg">
            <Calendar className="size-8 text-muted-foreground mx-auto" />
            <div>
              <h5 className="text-sm font-semibold">Session {activeSessionNum} Not Scheduled</h5>
              <p className="text-xs text-muted-foreground">
                {activeSessionNum <= nextSchedulableNum
                  ? `Plan the delivery details for Session ${activeSessionNum} (${curriculumStageLabel(activeSessionNum)}).`
                  : `Session ${activeSessionNum - 1} must be verified before Session ${activeSessionNum} can be planned.`}
              </p>
            </div>

            {canManage && activeSessionNum <= nextSchedulableNum && (
              <Button size="sm" onClick={() => setIsPlanFormOpen(!isPlanFormOpen)}>
                <Plus className="size-4 mr-1" />
                {isPlanFormOpen ? 'Cancel' : `Schedule Session ${activeSessionNum}`}
              </Button>
            )}
          </div>
        )}

        {/* Schedule Form */}
        {canManage && isPlanFormOpen && !selectedSession && (
          <div className="rounded-lg border border-border p-4 bg-muted/10 space-y-4">
            <h5 className="text-sm font-semibold flex items-center gap-2">
              <Calendar className="size-4 text-brand" /> Schedule Session {activeSessionNum}
            </h5>

            <form action={createAction} className="space-y-4">
              <input type="hidden" name="school_id" value={schoolId} />
              <input type="hidden" name="session_number" value={activeSessionNum} />

              <div>
                <Label htmlFor="topic" className="text-xs font-semibold">
                  Session Topic <span className="text-error">*</span>
                </Label>
                <Input
                  id="topic"
                  name="topic"
                  required
                  defaultValue={`${curriculumStageLabel(activeSessionNum)} - AI Workshop`}
                  className="mt-1 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="planned_date" className="text-xs font-semibold">
                    Planned Date <span className="text-error">*</span>
                  </Label>
                  <Input
                    id="planned_date"
                    name="planned_date"
                    type="date"
                    required
                    defaultValue={new Date().toISOString().slice(0, 10)}
                    className="mt-1 text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="start_time" className="text-xs">Start Time</Label>
                  <Input id="start_time" name="start_time" type="time" defaultValue="10:00" className="mt-1 text-sm" />
                </div>
              </div>

              {createState.error && <p className="text-xs text-error">{createState.error}</p>}
              {createState.ok && <p className="text-xs text-success">{createState.message}</p>}

              <div className="flex gap-2">
                <Button type="submit" size="sm" disabled={createPending}>
                  {createPending ? <Loader2 className="size-4 animate-spin mr-1" /> : <Calendar className="size-4 mr-1" />}
                  Schedule Session {activeSessionNum}
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => setIsPlanFormOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
