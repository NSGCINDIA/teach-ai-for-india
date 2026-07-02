'use client'

import { useActionState } from 'react'
import { AlertCircle, Loader2 } from 'lucide-react'
import { updateProfile, type ProfileActionState } from '@/actions/profile'
import type { UserRow } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function ProfileForm({ user }: { user: UserRow }) {
  const [state, action, pending] = useActionState<ProfileActionState, FormData>(updateProfile, {})

  return (
    <form action={action} className="space-y-5">
      {state.error && (
        <p role="alert" className="flex items-start gap-2 rounded-lg bg-error/10 px-3 py-2 text-sm text-error">
          <AlertCircle className="mt-0.5 size-4 shrink-0" /> {state.error}
        </p>
      )}
      {state.ok && state.message && (
        <p role="status" className="rounded-lg bg-success/10 px-3 py-2 text-sm text-success">{state.message}</p>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="full_name">Full name</Label>
        <Input id="full_name" name="full_name" defaultValue={user.full_name} required />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="phone">Phone</Label>
        <Input id="phone" name="phone" defaultValue={user.phone ?? ''} placeholder="+91…" />
      </div>

      <Button type="submit" disabled={pending}>
        {pending && <Loader2 className="size-4 animate-spin" />}
        Save profile
      </Button>
    </form>
  )
}
