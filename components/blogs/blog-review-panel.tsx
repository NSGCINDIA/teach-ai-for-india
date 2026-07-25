'use client'

import { useActionState, useState } from 'react'
import { AlertCircle, Check, X, Loader2, Calendar, User, Landmark, BookOpen } from 'lucide-react'
import { reviewBlog, type BlogActionState } from '@/actions/blogs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import type { BlogItem } from '@/lib/data/blogs'
import { formatDate } from '@/lib/format'

interface BlogReviewPanelProps {
  pendingBlogs: BlogItem[]
}

export function BlogReviewPanel({ pendingBlogs }: BlogReviewPanelProps) {
  const [state, action, pending] = useActionState<BlogActionState, FormData>(reviewBlog, {})
  const [expandedBlogId, setExpandedBlogId] = useState<string | null>(null)

  if (pendingBlogs.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-10 text-center">
          <BookOpen className="size-10 text-muted-foreground/50 mb-3" />
          <p className="font-semibold text-muted-foreground">Review Queue Clear</p>
          <p className="text-xs text-muted-foreground mt-1">There are no pending blogs or stories awaiting approval today.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {state.error && (
        <p role="alert" className="flex items-start gap-2 rounded-lg bg-error/10 px-3 py-2 text-sm text-error">
          <AlertCircle className="mt-0.5 size-4 shrink-0" /> {state.error}
        </p>
      )}
      {state.ok && state.message && (
        <p role="status" className="rounded-lg bg-success/10 px-3 py-2 text-sm text-success">{state.message}</p>
      )}

      {pendingBlogs.map((b) => {
        const isExpanded = expandedBlogId === b.id
        return (
          <Card key={b.id} className="border-warning/30 hover:border-warning/60 transition-colors">
            <CardHeader className="p-4 pb-2">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <span className="inline-flex items-center rounded-full bg-warning/10 px-2 py-0.5 text-xs font-medium text-warning mb-2">
                    Awaiting Review
                  </span>
                  <CardTitle className="text-base font-semibold leading-none">{b.title}</CardTitle>
                  <CardDescription className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <User className="size-3" /> {b.poster?.full_name || 'Author'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Landmark className="size-3" /> {b.campus?.name || 'All Campuses'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="size-3" /> {formatDate(b.created_at)}
                    </span>
                  </CardDescription>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setExpandedBlogId(isExpanded ? null : b.id)}
                >
                  {isExpanded ? 'Collapse' : 'Read Article'}
                </Button>
              </div>
            </CardHeader>

            {isExpanded && (
              <CardContent className="px-4 pb-4 pt-2 border-t border-border mt-3 bg-muted/20">
                <div className="prose dark:prose-invert max-w-none text-sm leading-relaxed whitespace-pre-wrap py-3">
                  {b.body}
                </div>

                <div className="flex items-center justify-end gap-2 border-t border-border pt-4 mt-3">
                  <form action={action} className="flex gap-2">
                    <input type="hidden" name="blog_id" value={b.id} />
                    
                    <Button
                      type="submit"
                      name="decision"
                      value="rejected"
                      variant="outline"
                      size="sm"
                      disabled={pending}
                      className="border-error/20 hover:bg-error/10 hover:text-error text-xs"
                    >
                      <X className="size-3.5 mr-1" /> Reject Draft
                    </Button>
                    
                    <Button
                      type="submit"
                      name="decision"
                      value="approved"
                      size="sm"
                      disabled={pending}
                      className="bg-success hover:bg-success/90 text-white text-xs"
                    >
                      <Check className="size-3.5 mr-1" /> Approve & Publish
                    </Button>
                  </form>
                </div>
              </CardContent>
            )}
          </Card>
        )
      })}
    </div>
  )
}
