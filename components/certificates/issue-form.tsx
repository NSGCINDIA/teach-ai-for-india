'use client'

import { useActionState, useEffect, useState } from 'react'
import { Award, AlertCircle, Loader2 } from 'lucide-react'
import { issueCertificate, type CertificateActionState } from '@/actions/certificates'
import { fieldValue } from '@/lib/actions/form-values'
import { CERTIFICATE_KIND_META } from '@/lib/constants/workspace'
import type { CertificateKind } from '@/types/database'
import type { TeamMember } from '@/lib/data/sessions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

const SELECT_CLASS =
  'border-input h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] dark:bg-input/30'

const KINDS = Object.entries(CERTIFICATE_KIND_META) as [CertificateKind, { label: string }][]

export function IssueCertificateForm({ volunteers }: { volunteers: TeamMember[] }) {
  const [state, action, pending] = useActionState<CertificateActionState, FormData>(issueCertificate, {})
  const [showMessage, setShowMessage] = useState(false)

  // useActionState's state never resets on its own, so the success banner
  // would otherwise stay on screen forever after the first issued certificate.
  useEffect(() => {
    if (!state.ok) return
    setShowMessage(true)
    const timer = setTimeout(() => setShowMessage(false), 4000)
    return () => clearTimeout(timer)
  }, [state])

  return (
    <form action={action} className="space-y-3" noValidate>
      {state.error && (
        <p role="alert" className="flex items-start gap-2 rounded-lg bg-error/10 px-3 py-2 text-sm text-error">
          <AlertCircle className="mt-0.5 size-4 shrink-0" /> {state.error}
        </p>
      )}
      {showMessage && state.ok && state.message && (
        <p role="status" className="rounded-lg bg-success/10 px-3 py-2 text-sm text-success">{state.message}</p>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="volunteer_id">Volunteer</Label>
          <select id="volunteer_id" name="volunteer_id" required className={SELECT_CLASS} defaultValue={fieldValue(state, 'volunteer_id', '')}>
            <option value="" disabled>— Select —</option>
            {volunteers.map((v) => (
              <option key={v.id} value={v.id}>{v.full_name}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="kind">Kind</Label>
          <select id="kind" name="kind" className={SELECT_CLASS} defaultValue={fieldValue(state, 'kind', 'participation')}>
            {KINDS.map(([value, meta]) => (
              <option key={value} value={value}>{meta.label}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" required placeholder="e.g. Outstanding Volunteer — Term 1" defaultValue={fieldValue(state, 'title', '')} />
      </div>
      <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
        <div className="space-y-1.5">
          <Label htmlFor="description">Description (optional)</Label>
          <Textarea id="description" name="description" rows={2} placeholder="What this recognises…" defaultValue={fieldValue(state, 'description', '')} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="sessions_count">Sessions</Label>
          <Input id="sessions_count" type="number" min={0} name="sessions_count" className="w-24" defaultValue={fieldValue(state, 'sessions_count', '')} />
        </div>
      </div>
      <Button type="submit" size="sm" disabled={pending || volunteers.length === 0}>
        {pending ? <Loader2 className="size-4 animate-spin" /> : <Award className="size-4" />} Issue certificate
      </Button>
    </form>
  )
}
