'use client'

import { useMemo, useState, useTransition } from 'react'
import {
  Check, Download, FileText, Film, Globe, Image as ImageIcon, Receipt, ScrollText,
  Search, Trash2, X,
} from 'lucide-react'
import { approveEvidence, rejectEvidence, softDeleteEvidence, type EvidenceActionState } from '@/actions/evidence'
import type { EvidenceListItem } from '@/lib/data/evidence'
import { MEDIA_TYPE_META, MEDIA_TYPES, isPubliclyPromotable } from '@/lib/constants/evidence'
import type { MediaFileType, ApprovalStatus } from '@/types/database'
import { formatDate } from '@/lib/format'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/shared/status-badge'
import { EmptyState } from '@/components/shared/states'

const SELECT_CLASS =
  'border-input h-9 rounded-md border bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] dark:bg-input/30'

const ICON: Partial<Record<MediaFileType, typeof FileText>> = {
  photo: ImageIcon, video: Film, document: FileText, presentation: FileText, receipt: Receipt, letter: ScrollText,
}

interface FilterOptions {
  campuses: { id: string; name: string }[]
  schools: { id: string; name: string }[]
  sessions: { id: string; label: string }[]
}

interface Props {
  items: EvidenceListItem[]
  options: FilterOptions
  /** Show approve/reject/publish controls (admins + campus leads). */
  canModerate: boolean
  showCampusFilter?: boolean
}

export function EvidenceBrowser({ items, options, canModerate, showCampusFilter = true }: Props) {
  const [q, setQ] = useState('')
  const [type, setType] = useState<MediaFileType | ''>('')
  const [status, setStatus] = useState<ApprovalStatus | ''>('')
  const [campus, setCampus] = useState('')
  const [session, setSession] = useState('')
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase()
    return items.filter((m) => {
      if (type && m.file_type !== type) return false
      if (status && m.approval_status !== status) return false
      if (campus && m.campus_id !== campus) return false
      if (session && m.session_id !== session) return false
      if (term && !`${m.file_name} ${m.caption ?? ''}`.toLowerCase().includes(term)) return false
      return true
    })
  }, [items, q, type, status, campus, session])

  function run(
    action: (p: EvidenceActionState, fd: FormData) => Promise<EvidenceActionState>,
    id: string,
    makePublic?: boolean,
  ) {
    setError(null)
    const fd = new FormData()
    fd.set('id', id)
    if (makePublic) fd.set('make_public', 'true')
    startTransition(async () => {
      const res = await action({}, fd)
      if (res?.error) setError(res.error)
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-52 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search filename, caption…" className="pl-9" aria-label="Search evidence" />
        </div>
        <select className={SELECT_CLASS} value={type} onChange={(e) => setType(e.target.value as MediaFileType | '')} aria-label="Filter by type">
          <option value="">All types</option>
          {MEDIA_TYPES.map((t) => <option key={t} value={t}>{MEDIA_TYPE_META[t].label}</option>)}
        </select>
        <select className={SELECT_CLASS} value={status} onChange={(e) => setStatus(e.target.value as ApprovalStatus | '')} aria-label="Filter by approval">
          <option value="">All approval</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        {showCampusFilter && (
          <select className={SELECT_CLASS} value={campus} onChange={(e) => setCampus(e.target.value)} aria-label="Filter by campus">
            <option value="">All campuses</option>
            {options.campuses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        )}
        <select className={SELECT_CLASS} value={session} onChange={(e) => setSession(e.target.value)} aria-label="Filter by session">
          <option value="">All sessions</option>
          {options.sessions.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
      </div>

      {error && <p role="alert" className="rounded-lg bg-error/10 px-3 py-2 text-sm text-error">{error}</p>}
      <p className="text-sm text-muted-foreground">{filtered.length} of {items.length} file{items.length === 1 ? '' : 's'}</p>

      {filtered.length === 0 ? (
        <EmptyState icon={ImageIcon} title="No evidence" description={items.length === 0 ? 'Files uploaded against sessions show up here.' : 'Try clearing a filter.'} />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((m) => {
            const Icon = ICON[m.file_type] ?? FileText
            return (
              <div key={m.id} className="flex flex-col overflow-hidden rounded-xl border border-border bg-card">
                <div className="relative aspect-[4/3] bg-muted">
                  {m.file_type === 'photo' && m.signed_url && !m.external_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.signed_url} alt={m.caption ?? m.file_name} className="size-full object-cover" loading="lazy" />
                  ) : (
                    <span className="grid size-full place-items-center text-muted-foreground"><Icon className="size-8" /></span>
                  )}
                  <span className="absolute left-2 top-2"><StatusBadge kind="approval" status={m.approval_status} /></span>
                  {m.is_public && (
                    <span className="absolute right-2 top-2 grid size-6 place-items-center rounded-full bg-success text-white" title="Public">
                      <Globe className="size-3.5" />
                    </span>
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-2 p-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium" title={m.file_name}>{m.file_name}</p>
                    <p className="text-xs text-muted-foreground">{MEDIA_TYPE_META[m.file_type].label} · {formatDate(m.created_at)}</p>
                    {m.session && <p className="truncate text-xs text-muted-foreground">#{m.session.session_number} · {m.session.topic}</p>}
                  </div>
                  <div className="mt-auto flex flex-wrap gap-1.5">
                    {m.signed_url && (
                      <Button asChild size="sm" variant="ghost" className="h-7 px-2 text-xs">
                        <a href={m.signed_url} target="_blank" rel="noreferrer"><Download className="size-3.5" /> Open</a>
                      </Button>
                    )}
                    {canModerate && m.approval_status !== 'approved' && (
                      <Button size="sm" variant="outline" className="h-7 px-2 text-xs" disabled={pending} onClick={() => run(approveEvidence, m.id)}>
                        <Check className="size-3.5" /> Approve
                      </Button>
                    )}
                    {canModerate && isPubliclyPromotable(m.file_type, !!m.storage_path) && !m.is_public && (
                      <Button size="sm" variant="outline" className="h-7 px-2 text-xs" disabled={pending} onClick={() => run(approveEvidence, m.id, true)}>
                        <Globe className="size-3.5" /> Publish
                      </Button>
                    )}
                    {canModerate && m.approval_status !== 'rejected' && (
                      <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-error" disabled={pending} onClick={() => run(rejectEvidence, m.id)}>
                        <X className="size-3.5" /> Reject
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-muted-foreground" disabled={pending} onClick={() => run(softDeleteEvidence, m.id)}>
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
