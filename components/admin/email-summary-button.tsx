'use client'

import { useActionState } from 'react'
import { CheckCircle2, Loader2, Mail, AlertCircle } from 'lucide-react'
import { emailMonthlySummary, type AdminActionState } from '@/actions/admin'
import { Button } from '@/components/ui/button'

/** Trigger the monthly management-summary email on demand (PRD §7.8). */
export function EmailSummaryButton() {
  const [state, action, pending] = useActionState<AdminActionState, FormData>(emailMonthlySummary, {})

  return (
    <form action={action} className="flex flex-wrap items-center gap-2">
      <Button type="submit" variant="outline" size="sm" disabled={pending} className="gap-1.5">
        {pending ? <Loader2 className="size-4 animate-spin" /> : <Mail className="size-4" />} Email summary now
      </Button>
      {state.ok && <span className="flex items-center gap-1 text-sm text-success"><CheckCircle2 className="size-4" /> {state.message}</span>}
      {state.error && <span role="alert" className="flex items-center gap-1 text-sm text-error"><AlertCircle className="size-4" /> {state.error}</span>}
    </form>
  )
}
