'use client'

import { useActionState } from 'react'
import { Check, Loader2, UserPlus, X } from 'lucide-react'
import type { VolunteerApplicationRow } from '@/types/database'
import { reviewVolunteerApplication, type AdminActionState } from '@/actions/admin'
import { formatDate } from '@/lib/format'
import { Button } from '@/components/ui/button'

/** Public "Join as a Volunteer" applications awaiting triage (PRD §7.1/§11). Admin-only. */
export function VolunteerApplications({ applications }: { applications: VolunteerApplicationRow[] }) {
  if (applications.length === 0) return null

  return (
    <section className="rounded-xl border border-brand-teal/30 bg-brand-teal/5">
      <header className="flex items-center gap-2 border-b border-brand-teal/20 px-4 py-3">
        <UserPlus className="size-4 text-brand-teal" />
        <h2 className="font-display text-sm font-semibold">
          Volunteer applications awaiting review
          <span className="ml-2 rounded-full bg-brand-teal/15 px-2 py-0.5 text-xs font-medium text-brand-teal">
            {applications.length}
          </span>
        </h2>
      </header>
      <ul className="divide-y divide-brand-teal/10">
        {applications.map((a) => <ApplicationRow key={a.id} application={a} />)}
      </ul>
    </section>
  )
}

function ApplicationRow({ application }: { application: VolunteerApplicationRow }) {
  const [state, action, pending] = useActionState<AdminActionState, FormData>(reviewVolunteerApplication, {})
  if (state.ok) return null

  return (
    <li className="p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium">{application.full_name}</p>
          <p className="text-xs text-muted-foreground">
            {application.email}
            {application.phone ? ` · ${application.phone}` : ''} · {formatDate(application.created_at)}
          </p>
          {application.campus_slug && (
            <p className="mt-1 text-xs text-muted-foreground">Preferred campus: {application.campus_slug}</p>
          )}
          {application.motivation && <p className="mt-1.5 whitespace-pre-wrap text-sm">{application.motivation}</p>}
          {state.error && <p role="alert" className="mt-1 text-xs text-error">{state.error}</p>}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <form action={action}>
            <input type="hidden" name="id" value={application.id} />
            <input type="hidden" name="decision" value="rejected" />
            <Button type="submit" size="sm" variant="ghost" className="text-error" disabled={pending}>
              {pending ? <Loader2 className="size-3.5 animate-spin" /> : <X className="size-3.5" />} Reject
            </Button>
          </form>
          <form action={action}>
            <input type="hidden" name="id" value={application.id} />
            <input type="hidden" name="decision" value="invited" />
            <Button type="submit" size="sm" disabled={pending}>
              {pending ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />} Accept
            </Button>
          </form>
        </div>
      </div>
    </li>
  )
}
