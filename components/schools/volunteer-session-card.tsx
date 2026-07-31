'use client'

import { useActionState } from 'react'
import { School, MapPin, CheckCircle2, XCircle, Clock, Loader2 } from 'lucide-react'
import { respondSchoolTeamAvailability, type SchoolTeamActionState } from '@/actions/school-team'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface VolunteerSessionCardProps {
  memberId: string
  schoolId: string
  schoolName: string
  district: string
  status: string
  assignedAt: string
}

export function VolunteerSessionCard({
  memberId,
  schoolId,
  schoolName,
  district,
  status,
  assignedAt,
}: VolunteerSessionCardProps) {
  const [state, action, pending] = useActionState<SchoolTeamActionState, FormData>(
    respondSchoolTeamAvailability,
    {},
  )

  const isPending = status === 'requested'

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-brand/10 text-brand">
            <School className="size-5" />
          </div>
          <div>
            <h4 className="font-semibold text-sm leading-tight">{schoolName}</h4>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
              <MapPin className="size-3" /> {district}
            </p>
          </div>
        </div>

        <Badge
          variant="outline"
          className={
            status === 'confirmed'
              ? 'border-success/30 bg-success/10 text-success'
              : status === 'available'
                ? 'border-brand/30 bg-brand/10 text-brand'
                : status === 'unavailable'
                  ? 'border-destructive/30 bg-destructive/10 text-destructive'
                  : 'border-warning/30 bg-warning/10 text-warning'
          }
        >
          {status}
        </Badge>
      </div>

      {isPending && (
        <div className="rounded-lg border border-brand/30 bg-brand/5 p-3 space-y-2">
          <p className="text-xs text-brand font-medium">
            You have been requested to join the volunteer team for {schoolName}. Are you available?
          </p>

          <form action={action} className="flex gap-2">
            <input type="hidden" name="member_id" value={memberId} />

            <Button
              type="submit"
              name="available"
              value="true"
              size="sm"
              disabled={pending}
              className="bg-brand text-white text-xs h-8"
            >
              {pending ? <Loader2 className="size-3 animate-spin mr-1" /> : <CheckCircle2 className="size-3 mr-1" />}
              I'm Available
            </Button>

            <Button
              type="submit"
              name="available"
              value="false"
              variant="outline"
              size="sm"
              disabled={pending}
              className="text-xs h-8 border-error/30 text-error hover:bg-error/10"
            >
              <XCircle className="size-3 mr-1" />
              Unavailable
            </Button>
          </form>

          {state.error && <p className="text-xs text-error">{state.error}</p>}
          {state.ok && <p className="text-xs text-success">{state.message}</p>}
        </div>
      )}
    </div>
  )
}
