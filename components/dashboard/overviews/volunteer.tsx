import { NeuralNetworkBackground } from '@/components/shared/neural-network-background'
import { EmptyState } from '@/components/shared/states'
import { Badge } from '@/components/ui/badge'
import type { VolunteerData } from '@/lib/data/dashboard'
import { formatDate } from '@/lib/format'
import { ArrowRight, Award, CalendarClock, School, Timer } from 'lucide-react'
import Link from 'next/link'

// ─── Volunteer — My Teach AI Journey ─────────────────────────────────────────
export function VolunteerOverview({
  name,
  data,
  journeyData,
}: {
  name: string
  data: VolunteerData
  journeyData?: any
}) {
  const school = journeyData?.school
  const nextSess = journeyData?.nextSession
  const prog = journeyData?.progress
  const history = journeyData?.history ?? []

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Journey Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-deep/90 via-brand/80 to-brand-orange/70 text-white border border-brand/30">
        <NeuralNetworkBackground variant="prominent" />
        <div className="relative px-6 py-10 md:px-10 md:py-12">
          <p className="text-xs font-bold text-brand-gold uppercase tracking-widest mb-3">
            My Teach AI Journey
          </p>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
            Hello, {name} 👋
          </h1>
          <p className="text-base text-white/80 font-medium max-w-xl">
            Every session you teach brings AI education one step closer to another child across India.
          </p>

          {school && (
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Sessions Completed', value: `${prog?.completedSessions ?? 0} / 4` },
                { label: 'Attendance Rate', value: `${prog?.attendanceRate ?? 100}%` },
                { label: 'Evidence Uploaded', value: prog?.evidenceContributions ?? 0 },
                { label: 'Program Progress', value: `${prog?.schoolCompletionPercentage ?? 0}%` },
              ].map((m) => (
                <div key={m.label} className="bg-white/10 rounded-xl px-4 py-3 backdrop-blur-sm border border-white/20">
                  <p className="text-xs text-white/70 font-semibold uppercase tracking-wide mb-1">{m.label}</p>
                  <p className="text-2xl font-bold tabular-nums">{m.value}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Assigned School + Progress */}
      {school ? (
        <div className="rounded-xl border border-brand/20 bg-gradient-to-br from-cream-light to-secondary/20 shadow-soft overflow-hidden">
          <div className="px-6 py-5 border-b border-brand/10 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-brand-orange uppercase tracking-wide mb-1">Your Assigned School</p>
              <h2 className="text-xl font-bold text-foreground">{school.name}</h2>
              <p className="text-sm text-muted-foreground font-medium mt-0.5">{school.district} · Team Member</p>
            </div>
            <Badge variant="outline" className="border-success/40 bg-success/15 text-success font-bold shrink-0 mt-1">
              {school.team_status?.toUpperCase() ?? 'CONFIRMED'}
            </Badge>
          </div>
          <div className="px-6 py-5">
            <div className="flex items-center justify-between text-sm font-semibold mb-2">
              <span className="text-foreground">School Program Progress</span>
              <span className="text-brand-orange">{prog?.completedSessions ?? 0} of 4 sessions verified</span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-cream-warm border border-border/50">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand to-brand-orange animate-progress transition-all"
                style={{ width: `${prog?.schoolCompletionPercentage ?? 0}%` }}
              />
            </div>
          </div>
        </div>
      ) : (
        <EmptyState
          icon={School}
          title="No school assigned yet"
          description="You're not currently on an active school team. Your Volunteer Lead will request your availability when new school teams form."
        />
      )}

      {/* Next Session */}
      {nextSess && (
        <div className="rounded-xl border-2 border-brand/20 bg-card shadow-soft overflow-hidden">
          <div className="flex items-center justify-between gap-4 px-6 py-4 bg-brand/5 border-b border-brand/10">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-lg bg-brand/10 text-brand">
                <CalendarClock className="size-5" />
              </span>
              <div>
                <p className="text-xs font-bold text-brand-orange uppercase tracking-wide">Coming Up</p>
                <h3 className="font-bold text-base text-foreground">Next Scheduled Session</h3>
              </div>
            </div>
            <Badge variant="outline" className="border-brand/30 bg-brand/10 text-brand font-bold shrink-0">
              Session {nextSess.session_number}
            </Badge>
          </div>
          <div className="px-6 py-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Topic', value: nextSess.topic },
                { label: 'Date', value: formatDate(nextSess.scheduled_at) },
                { label: 'Meet at', value: `${nextSess.meeting_point} (${nextSess.departure_time})` },
                { label: 'Team Size', value: `${nextSess.team_size} volunteers` },
              ].map((d) => (
                <div key={d.label} className="bg-cream-light rounded-lg p-3 border border-border/50">
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-1">{d.label}</p>
                  <p className="text-sm font-bold text-foreground">{d.value}</p>
                </div>
              ))}
            </div>
            <div className="flex justify-end mt-4">
              <Link href={`/dashboard/sessions/${nextSess.id}`} className="inline-flex items-center gap-1.5 text-sm font-bold text-brand hover:underline">
                View full session details <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Certificate Card */}
      <div className="grid gap-5 sm:grid-cols-2">
        <div className={`rounded-xl border-2 p-5 space-y-4 ${prog?.certificate?.status === 'unlocked' ? 'border-success/40 bg-success/5' : 'border-border/50 bg-card shadow-soft'}`}>
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-foreground flex items-center gap-2">
              <Award className="size-5 text-brand-gold" /> Fellowship Certificate
            </h3>
            <Badge
              variant="outline"
              className={
                prog?.certificate?.status === 'unlocked'
                  ? 'border-success/40 bg-success/15 text-success font-bold'
                  : 'border-border text-muted-foreground'
              }
            >
              {prog?.certificate?.status === 'unlocked' ? 'Unlocked' : 'Locked'}
            </Badge>
          </div>

          {prog?.certificate?.status === 'unlocked' ? (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-success">
                🎉 Congratulations! Your fellowship certificate is ready to download.
              </p>
              <p className="text-xs text-muted-foreground font-mono">{prog.certificate.certificateNumber}</p>
              <Link href="/dashboard/certificates" className="inline-flex items-center gap-1.5 text-sm font-bold text-brand hover:underline mt-2">
                View Certificate <ArrowRight className="size-4" />
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground font-medium">
                Complete all 4 sessions in your school fellowship to unlock your official certificate.
              </p>
              <p className="text-sm font-bold text-brand-orange">
                {prog?.certificate?.missingSessions ?? 4} session{(prog?.certificate?.missingSessions ?? 4) !== 1 ? 's' : ''} remaining
              </p>
              <div className="h-2 w-full overflow-hidden rounded-full bg-cream-light border border-border/50 mt-3">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-brand-orange to-brand-gold"
                  style={{ width: `${((4 - (prog?.certificate?.missingSessions ?? 4)) / 4) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Teaching history timeline */}
        {history.length > 0 && (
          <div className="rounded-xl border border-border/50 bg-card shadow-soft p-5 space-y-4">
            <h3 className="font-bold text-base text-foreground flex items-center gap-2">
              <Timer className="size-5 text-brand-orange" /> My Teaching History
            </h3>
            <div className="grid grid-cols-2 gap-2.5">
              {history.map((h: any) => {
                const styles: Record<string, string> = {
                  present: 'border-success/30 bg-success/10 text-success',
                  absent: 'border-error/30 bg-error/10 text-error',
                  excused: 'border-brand-gold/30 bg-brand-gold/10 text-brand-gold',
                  upcoming: 'border-brand/30 bg-brand/10 text-brand',
                }
                const style = styles[h.status] ?? 'border-border/50 bg-cream-light text-muted-foreground'
                return (
                  <div key={h.session_number} className={`p-3 rounded-lg border space-y-1 ${style}`}>
                    <div className="flex items-center justify-between font-bold text-sm">
                      <span>Session {h.session_number}</span>
                      <span className="capitalize text-xs font-semibold">{h.status}</span>
                    </div>
                    <p className="text-xs truncate font-medium opacity-80">{h.topic}</p>
                    <p className="text-xs opacity-60">{formatDate(h.scheduled_at)}</p>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Finance Lead ─────────────────────────────────────────────────────────────
