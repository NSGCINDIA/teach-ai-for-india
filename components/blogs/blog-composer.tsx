'use client'

import { useActionState, useState } from 'react'
import { AlertCircle, Loader2, Send, Save, Eye, Edit } from 'lucide-react'
import { upsertBlog, type BlogActionState } from '@/actions/blogs'
import { fieldValue } from '@/lib/actions/form-values'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { BlogItem } from '@/lib/data/blogs'

interface BlogComposerProps {
  blog?: BlogItem | null
  onSuccess?: () => void
}

export function BlogComposer({ blog, onSuccess }: BlogComposerProps) {
  const [state, action, pending] = useActionState<BlogActionState, FormData>(async (prev, formData) => {
    const res = await upsertBlog(prev, formData)
    if (res.ok && onSuccess) {
      onSuccess()
    }
    return res
  }, {})

  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit')
  const [title, setTitle] = useState(blog?.title || fieldValue(state, 'title', ''))
  const [body, setBody] = useState(blog?.body || fieldValue(state, 'body', ''))

  return (
    <form action={action} className="space-y-4" noValidate>
      {blog?.id && <input type="hidden" name="id" value={blog.id} />}

      {state.error && (
        <p role="alert" className="flex items-start gap-2 rounded-lg bg-error/10 px-3 py-2 text-sm text-error">
          <AlertCircle className="mt-0.5 size-4 shrink-0" /> {state.error}
        </p>
      )}
      {state.ok && state.message && (
        <p role="status" className="rounded-lg bg-success/10 px-3 py-2 text-sm text-success">{state.message}</p>
      )}

      {/* Tabs */}
      <div className="flex border-b border-border">
        <button
          type="button"
          onClick={() => setActiveTab('edit')}
          className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'edit'
              ? 'border-brand text-brand'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Edit className="size-4" /> Write
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('preview')}
          className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'preview'
              ? 'border-brand text-brand'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Eye className="size-4" /> Preview
        </button>
      </div>

      {activeTab === 'edit' ? (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">Article Title</Label>
            <Input
              id="title"
              name="title"
              required
              placeholder="e.g. Bringing AI Literacy to Hyderabad Classrooms"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="body">Content (Markdown supported)</Label>
            <Textarea
              id="body"
              name="body"
              rows={12}
              required
              placeholder="Write your story here. Use markdown for styling..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="font-mono text-sm leading-relaxed"
            />
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-muted/30 p-6 min-h-[350px] space-y-4">
          {title ? (
            <h2 className="text-2xl font-bold font-display">{title}</h2>
          ) : (
            <p className="text-muted-foreground italic">Untitled Article</p>
          )}
          {body ? (
            <div className="prose dark:prose-invert max-w-none text-sm leading-relaxed whitespace-pre-wrap">
              {body}
            </div>
          ) : (
            <p className="text-muted-foreground italic">No content written yet.</p>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <span className="text-xs text-muted-foreground">
          Drafts are only visible to you. Pending blogs are reviewed by the Super Admin.
        </span>
        <div className="flex gap-2">
          <Button
            type="submit"
            name="submitAction"
            value="draft"
            variant="outline"
            size="sm"
            disabled={pending}
            className="flex items-center gap-1.5"
          >
            {pending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            Save Draft
          </Button>
          <Button
            type="submit"
            name="submitAction"
            value="submit"
            size="sm"
            disabled={pending}
            className="flex items-center gap-1.5"
          >
            {pending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
            Submit for Review
          </Button>
        </div>
      </div>
    </form>
  )
}
