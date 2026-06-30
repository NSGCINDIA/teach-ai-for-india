'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, CheckCircle2, Loader2, Upload } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { recordUpload } from '@/actions/evidence'
import {
  ACCEPT_ATTR, MEDIA_TYPES, MEDIA_TYPE_META, inferFileType, maxBytesFor, ACCEPTED_MIME,
} from '@/lib/constants/evidence'
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

function safeName(name: string) {
  return name.replace(/[^\w.-]+/g, '_').slice(-80)
}

export function EvidenceUploader({ entityType, entityId, campusId, schoolId, sessionId }: Props) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [fileType, setFileType] = useState<MediaFileType>('photo')
  const [caption, setCaption] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState<string | null>(null)

  async function onPick(file: File, type: MediaFileType) {
    setError(null)
    setDone(null)
    const mime = file.type || 'application/octet-stream'
    if (mime && !ACCEPTED_MIME.includes(mime)) {
      setError('Unsupported file type.')
      return
    }
    if (file.size > maxBytesFor(mime)) {
      setError(`File is too large (max ${mime.startsWith('video/') ? '200MB' : '25MB'}).`)
      return
    }

    setBusy(true)
    try {
      const supabase = createClient()
      const path = [campusId ?? 'unscoped', schoolId ?? '_', sessionId ?? '_', type,
        `${crypto.randomUUID()}-${safeName(file.name)}`].join('/')

      const { error: upErr } = await supabase.storage.from('evidence').upload(path, file, {
        contentType: mime,
        upsert: false,
      })
      if (upErr) throw new Error(upErr.message)

      const res = await recordUpload({
        storage_path: path,
        file_name: file.name,
        file_type: type,
        mime_type: mime,
        file_size_bytes: file.size,
        entity_type: entityType,
        entity_id: entityId,
        campus_id: campusId ?? '',
        school_id: schoolId ?? '',
        session_id: sessionId ?? '',
        caption,
      })
      if (res.error) throw new Error(res.error)

      setDone(file.name)
      setCaption('')
      if (fileRef.current) fileRef.current.value = ''
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed.')
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
          <CheckCircle2 className="size-3.5 shrink-0" /> Uploaded {done}
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

      <input
        ref={fileRef}
        type="file"
        accept={ACCEPT_ATTR}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) {
            // If the user left the default 'photo' but picked a non-image, infer.
            const type = fileType === 'photo' && !f.type.startsWith('image/') ? inferFileType(f.type) : fileType
            setFileType(type)
            void onPick(f, type)
          }
        }}
      />
      <Button type="button" variant="outline" size="sm" disabled={busy} onClick={() => fileRef.current?.click()}>
        {busy ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
        {busy ? 'Uploading…' : 'Upload file'}
      </Button>
    </div>
  )
}
