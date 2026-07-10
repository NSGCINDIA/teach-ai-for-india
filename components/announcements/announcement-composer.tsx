'use client'

import { useActionState } from 'react'
import { AlertCircle, Loader2, Send } from 'lucide-react'
import { postAnnouncement, type AnnouncementActionState } from '@/actions/announcements'
import { fieldValue, fieldChecked } from '@/lib/actions/form-values'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

/** Composer for leads/admins. `orgWide` true → admin posts to the whole org. */
export function AnnouncementComposer({ orgWide }: { orgWide: boolean }) {
  const [state, action, pending] = useActionState<AnnouncementActionState, FormData>(postAnnouncement, {})

  return (
    <form action={action} className="space-y-3" noValidate>
      {state.error && (
        <p role="alert" className="flex items-start gap-2 rounded-lg bg-error/10 px-3 py-2 text-sm text-error">
          <AlertCircle className="mt-0.5 size-4 shrink-0" /> {state.error}
        </p>
      )}
      {state.ok && state.message && (
        <p role="status" className="rounded-lg bg-success/10 px-3 py-2 text-sm text-success">{state.message}</p>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" required placeholder="What's happening?" defaultValue={fieldValue(state, 'title', '')} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="body">Message</Label>
        <Textarea id="body" name="body" rows={3} required placeholder="Share the details with your team…" defaultValue={fieldValue(state, 'body', '')} />
      </div>
      <div className="flex items-center justify-between gap-3">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="pinned" defaultChecked={fieldChecked(state, 'pinned', undefined)} className="size-4 rounded border-input accent-brand" /> Pin to top
        </label>
        <span className="text-xs text-muted-foreground">
          {orgWide ? 'Posts organisation-wide' : 'Posts to your campus'}
        </span>
      </div>
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />} Post announcement
      </Button>
    </form>
  )
}
