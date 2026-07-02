'use client'

import { useActionState } from 'react'
import { AlertCircle, Loader2 } from 'lucide-react'
import { saveCampusSettings, type CampusSettingsActionState } from '@/actions/campus-settings'
import type { CampusRow } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export function CampusSettingsForm({ campus }: { campus: CampusRow }) {
  const [state, action, pending] = useActionState<CampusSettingsActionState, FormData>(saveCampusSettings, {})

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="campus_id" value={campus.id} />

      {state.error && (
        <p role="alert" className="flex items-start gap-2 rounded-lg bg-error/10 px-3 py-2 text-sm text-error">
          <AlertCircle className="mt-0.5 size-4 shrink-0" /> {state.error}
        </p>
      )}
      {state.ok && state.message && (
        <p role="status" className="rounded-lg bg-success/10 px-3 py-2 text-sm text-success">{state.message}</p>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description" name="description" rows={5}
          defaultValue={campus.description ?? ''}
          placeholder="A short public-facing description of this campus's program…"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="hero_image_url">Hero image URL</Label>
        <Input
          id="hero_image_url" name="hero_image_url" type="url"
          defaultValue={campus.hero_image_url ?? ''}
          placeholder="https://…"
        />
      </div>

      <Button type="submit" disabled={pending}>
        {pending && <Loader2 className="size-4 animate-spin" />}
        Save settings
      </Button>
    </form>
  )
}
