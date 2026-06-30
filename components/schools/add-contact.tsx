'use client'

import { useActionState, useState } from 'react'
import { AlertCircle, Loader2, Plus } from 'lucide-react'
import { addSchoolContact, type SchoolActionState } from '@/actions/schools'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function AddContact({ schoolId }: { schoolId: string }) {
  const [open, setOpen] = useState(false)
  const [state, action, pending] = useActionState<SchoolActionState, FormData>(addSchoolContact, {})

  if (state.ok && open) setOpen(false)

  if (!open) {
    return (
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Plus className="size-4" /> Add contact
      </Button>
    )
  }

  return (
    <form action={action} className="space-y-3 rounded-lg border border-border p-3">
      <input type="hidden" name="school_id" value={schoolId} />
      {state.error && (
        <p role="alert" className="flex items-center gap-2 rounded bg-error/10 px-2 py-1.5 text-xs text-error">
          <AlertCircle className="size-3.5 shrink-0" /> {state.error}
        </p>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="c-name">Name *</Label>
          <Input id="c-name" name="name" required placeholder="Principal name" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="c-desig">Designation *</Label>
          <Input id="c-desig" name="designation" required placeholder="Principal" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="c-phone">Phone</Label>
          <Input id="c-phone" name="phone" inputMode="tel" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="c-email">Email</Label>
          <Input id="c-email" name="email" type="email" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="c-whatsapp">WhatsApp</Label>
          <Input id="c-whatsapp" name="whatsapp" inputMode="tel" />
        </div>
        <label className="flex items-center gap-2 self-end pb-2 text-sm">
          <input type="checkbox" name="is_primary" value="true" className="size-4 rounded border-input" />
          Primary contact
        </label>
      </div>
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={pending}>
          {pending && <Loader2 className="size-4 animate-spin" />} Save contact
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
      </div>
    </form>
  )
}
