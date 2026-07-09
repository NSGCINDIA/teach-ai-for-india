'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, CheckCircle2, Link2, Loader2 } from 'lucide-react'
import { recordUpload } from '@/actions/evidence'
import { MEDIA_TYPES, MEDIA_TYPE_META } from '@/lib/constants/evidence'
import type { MediaEntityType, MediaFileType } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const SELECT_CLASS =
  'border-input h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] dark:bg-input/30'

interface Props {
  entityType: MediaEntityType
  entityId: string
  campusId: string | null
  schoolId?: string | null
  sessionId?: string | null
}

function isHttpUrl(value: string) {
  try {
    const u = new URL(value)
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch {
    return false
  }
}

export function EvidenceUploader({ entityType, entityId, campusId, schoolId, sessionId }: Props) {
  const router = useRouter()
  const [fileType, setFileType] = useState<MediaFileType>('photo')
  const [caption, setCaption] = useState('')
  const [url, setUrl] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState<string | null>(null)

  async function onAddLink() {
    setError(null)
    setDone(null)
    const trimmed = url.trim()
    if (!isHttpUrl(trimmed)) {
      setError('Enter a valid link (e.g. a Google Drive share link).')
      return
    }

    setBusy(true)
    try {
      const res = await recordUpload({
        external_url: trimmed,
        file_name: caption.trim() || 'Google Drive link',
        file_type: fileType,
        entity_type: entityType,
        entity_id: entityId,
        campus_id: campusId ?? '',
        school_id: schoolId ?? '',
        session_id: sessionId ?? '',
        caption,
      })
      if (res.error) throw new Error(res.error)

      setDone(trimmed)
      setCaption('')
      setUrl('')
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save the link.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-3 rounded-lg border border-dashed border-border p-3">
      {error && (
        <p role="alert" className="flex items-center gap-2 rounded bg-error/10 px-2 py-1.5 text-xs text-error">
          <AlertCircle className="size-3.5 shrink-0" /> {error}
        </p>
      )}
      {done && (
        <p role="status" className="flex items-center gap-2 rounded bg-success/10 px-2 py-1.5 text-xs text-success">
          <CheckCircle2 className="size-3.5 shrink-0" /> Link added
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="ev-type">Category</Label>
          <select id="ev-type" className={SELECT_CLASS} value={fileType} onChange={(e) => setFileType(e.target.value as MediaFileType)}>
            {MEDIA_TYPES.map((t) => <option key={t} value={t}>{MEDIA_TYPE_META[t].label}</option>)}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ev-caption">Caption (optional)</Label>
          <Input id="ev-caption" value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Short description" />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="ev-url">Google Drive link</Label>
        <div className="flex gap-2">
          <Input
            id="ev-url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://drive.google.com/..."
            className="flex-1"
          />
          <Button type="button" variant="outline" size="sm" disabled={busy || !url.trim()} onClick={onAddLink}>
            {busy ? <Loader2 className="size-4 animate-spin" /> : <Link2 className="size-4" />}
            {busy ? 'Saving…' : 'Add link'}
          </Button>
        </div>
        <p className="text-[11px] text-muted-foreground">Set sharing to "Anyone with the link can view" before pasting it here.</p>
      </div>
    </div>
  )
}
