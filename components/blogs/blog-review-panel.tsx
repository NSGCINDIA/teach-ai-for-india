'use client'

import { useState, useTransition } from 'react'
import { CheckCircle2, XCircle, AlertTriangle, Loader2, Sparkles } from 'lucide-react'
import { reviewBlog, type BlogActionState } from '@/actions/blogs'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { BlogItem } from '@/lib/data/blogs'

export function BlogReviewPanel({ blog }: { blog: BlogItem }) {
  const [isPending, startTransition] = useTransition()
  const [state, setState] = useState<BlogActionState>({})
  const [status, setStatus] = useState<'approved' | 'published' | 'rejected'>('approved')
  const [reason, setReason] = useState('')

  async function handleReview(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setState({})

    const fd = new FormData()
    fd.append('id', blog.id)
    fd.append('status', status)
    if (status === 'rejected') {
      fd.append('rejected_reason', reason)
    }

    startTransition(async () => {
      const res = await reviewBlog({}, fd)
      if (res?.error) {
        setState({ error: res.error })
      } else {
        setState({ ok: true, message: `Updated status to ${status} successfully.` })
      }
    })
  }

  return (
    <div className="rounded-2xl border border-warning/30 bg-warning/5 p-5 md:p-6 text-left max-w-4xl mx-auto my-6">
      <div className="flex items-start gap-3">
        <AlertTriangle className="size-5 text-warning shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h3 className="font-display font-bold text-base text-foreground">Admin Review Decision</h3>
          <p className="text-xs text-muted-foreground">
            This article was submitted by <span className="font-semibold">{blog.author?.full_name}</span> ({blog.campus?.name ?? 'Organisation-wide'}) for admin approval.
          </p>
        </div>
      </div>

      {state.error && (
        <div className="mt-4 rounded-xl bg-error/10 p-3 text-xs text-error">
          {state.error}
        </div>
      )}
      {state.ok && (
        <div className="mt-4 rounded-xl bg-success/10 p-3 text-xs text-success">
          {state.message}
        </div>
      )}

      <form onSubmit={handleReview} className="mt-4 space-y-4">
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setStatus('approved')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
              status === 'approved'
                ? 'bg-success text-white border-success'
                : 'bg-background hover:bg-muted text-muted-foreground border-border'
            }`}
          >
            <CheckCircle2 size={14} /> Approve (Set Approved)
          </button>
          
          <button
            type="button"
            onClick={() => setStatus('published')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
              status === 'published'
                ? 'bg-brand text-white border-brand'
                : 'bg-background hover:bg-muted text-muted-foreground border-border'
            }`}
          >
            <Sparkles size={14} /> Approve & Publish immediately
          </button>

          <button
            type="button"
            onClick={() => setStatus('rejected')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
              status === 'rejected'
                ? 'bg-error text-white border-error'
                : 'bg-background hover:bg-muted text-muted-foreground border-border'
            }`}
          >
            <XCircle size={14} /> Reject / Request Changes
          </button>
        </div>

        {status === 'rejected' && (
          <div className="space-y-1.5">
            <Label htmlFor="rejected_reason">Reason for rejection / requested modifications</Label>
            <Textarea
              id="rejected_reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required={status === 'rejected'}
              placeholder="Explain what edits the author needs to make before resubmitting..."
              className="rounded-xl min-h-20 text-xs focus-visible:border-brand"
            />
          </div>
        )}

        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            disabled={isPending || (status === 'rejected' && !reason.trim())}
            className={`font-bold rounded-xl text-xs ${
              status === 'published' ? 'bg-brand text-white hover:bg-brand/90' :
              status === 'approved' ? 'bg-success text-white hover:bg-success/90' :
              'bg-error text-white hover:bg-error/90'
            }`}
          >
            {isPending && <Loader2 className="size-3 animate-spin shrink-0" />}
            Submit Decision
          </Button>
        </div>
      </form>
    </div>
  )
}