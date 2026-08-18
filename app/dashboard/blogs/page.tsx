import Link from 'next/link'
import { FileText, Plus, PenTool, ShieldAlert } from 'lucide-react'
import { requireUser } from '@/lib/auth/user'
import { isAdmin } from '@/lib/auth/rbac'
import { listBlogsForDashboard } from '@/lib/data/blogs'
import { deleteBlog } from '@/actions/blogs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/shared/states'
import { DeleteButton } from '@/components/shared/delete-button'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/shared/status-badge'
import { SubmitButton } from '@/components/blogs/submit-button'
import { formatDateTime } from '@/lib/format'
import { ImageWithFallback } from '@/components/shared/image-with-fallback'
import type { BlogStatus } from '@/types/database'
import type { StatusTone } from '@/lib/constants/status'

export const metadata = { title: 'Blogs & Stories' }

function getBlogStatusMeta(status: BlogStatus): { label: string; tone: StatusTone } {
  switch (status) {
    case 'draft': return { label: 'Draft', tone: 'neutral' }
    case 'submitted': return { label: 'Submitted', tone: 'pending' }
    case 'in_review': return { label: 'In Review', tone: 'pending' }
    case 'approved': return { label: 'Approved', tone: 'info' }
    case 'published': return { label: 'Published', tone: 'success' }
    case 'rejected': return { label: 'Changes Requested', tone: 'danger' }
  }
}

export default async function BlogsPage() {
  const user = await requireUser('/dashboard/blogs')
  const admin = isAdmin(user.role)
  const items = await listBlogsForDashboard()

  // Partition blogs into review queue and active lists
  const reviewQueue = admin ? items.filter((b) => b.status === 'submitted') : []
  const userBlogs = admin ? items.filter((b) => b.status !== 'submitted') : items.filter((b) => b.author_id === user.id)
  const campusBlogs = admin ? [] : items.filter((b) => b.author_id !== user.id)

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Blogs & Stories</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Document school visits, success stories, and volunteer journeys to showcase on the public site.
          </p>
        </div>
        <Link href="/dashboard/blogs/new">
          <Button className="bg-brand hover:bg-brand/90 text-white font-bold rounded-xl flex items-center gap-1.5 shrink-0">
            <Plus size={16} /> Write Article
          </Button>
        </Link>
      </div>

      {/* Admin Review Queue */}
      {admin && reviewQueue.length > 0 && (
        <Card className="border-warning/30 bg-warning/5">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ShieldAlert className="size-5 text-warning" /> Pending Admin Review ({reviewQueue.length})
            </CardTitle>
            <CardDescription className="text-xs">
              Review and publish submitted field stories to the public website.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {reviewQueue.map((b) => (
              <div key={b.id} className="flex flex-col sm:flex-row sm:items-center justify-between border border-border bg-card p-4 rounded-xl gap-4 shadow-soft">
                <div className="flex gap-4">
                  {b.cover_image && (
                    <div className="size-16 shrink-0 hidden sm:block">
                      <ImageWithFallback src={b.cover_image} alt={b.title} aspectRatio="1:1" className="rounded-lg overflow-hidden border border-border" />
                    </div>
                  )}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-brand uppercase">{b.category}</span>
                    <h3 className="font-bold text-sm text-foreground">{b.title}</h3>
                    <p className="text-xs text-muted-foreground">
                      By {b.author?.full_name ?? 'Team'} · {b.campus?.name ?? 'Organisation'} · Submitted {formatDateTime(b.updated_at)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link href={`/dashboard/blogs/${b.id}/edit`}>
                    <Button variant="outline" size="sm" className="rounded-lg text-xs font-semibold">
                      Review & Decide
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* User's Blogs section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {admin ? 'All Active Articles' : 'My Drafts & Submissions'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {userBlogs.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No articles written yet"
              description="Click 'Write Article' to start sharing your campus impact stories."
            />
          ) : (
            <div className="space-y-4">
              {userBlogs.map((b) => {
                const canEdit = b.status === 'draft' || b.status === 'rejected' || admin
                const canSubmit = b.status === 'draft' && b.author_id === user.id
                const canDelete = b.status === 'draft' || b.status === 'rejected' || admin
                const meta = getBlogStatusMeta(b.status)

                return (
                  <div key={b.id} className="flex flex-col sm:flex-row justify-between border border-border p-4 rounded-xl gap-4 hover:border-brand/20 transition-colors shadow-soft">
                    <div className="flex gap-4">
                      {b.cover_image && (
                        <div className="size-16 shrink-0 hidden sm:block">
                          <ImageWithFallback src={b.cover_image} alt={b.title} aspectRatio="1:1" className="rounded-lg overflow-hidden border border-border" />
                        </div>
                      )}
                      <div className="space-y-1.5 text-left">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-bold text-brand uppercase">{b.category}</span>
                          <StatusBadge label={meta.label} tone={meta.tone} />
                        </div>
                        <h3 className="font-bold text-sm text-foreground">{b.title}</h3>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {b.summary}
                        </p>
                        <div className="text-[10px] text-muted-foreground space-y-1">
                          <div>Created {formatDateTime(b.created_at)}</div>
                          {b.rejected_reason && b.status === 'rejected' && (
                            <span className="block text-error font-semibold mt-1 bg-error/5 p-2 rounded-lg border border-error/10">
                              Changes requested: {b.rejected_reason}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {canSubmit && (
                        <SubmitButton id={b.id} />
                      )}
                      {canEdit && (
                        <Link href={`/dashboard/blogs/${b.id}/edit`}>
                          <Button variant="outline" size="sm" className="rounded-lg text-xs font-semibold flex items-center gap-1">
                            <PenTool size={12} /> Edit
                          </Button>
                        </Link>
                      )}
                      {canDelete && (
                        <DeleteButton
                          action={deleteBlog}
                          fields={{ id: b.id }}
                          label="Delete"
                          confirm="Delete this article?"
                        />
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Campus Blogs (visible to other members) */}
      {!admin && campusBlogs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Other Campus Stories</CardTitle>
            <CardDescription className="text-xs">
              Stories from other chapter leads and volunteers on your campus.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {campusBlogs.map((b) => {
              const meta = getBlogStatusMeta(b.status)
              return (
                <div key={b.id} className="flex gap-4 border border-border p-4 rounded-xl shadow-soft">
                  {b.cover_image && (
                    <div className="size-16 shrink-0 hidden sm:block">
                      <ImageWithFallback src={b.cover_image} alt={b.title} aspectRatio="1:1" className="rounded-lg overflow-hidden border border-border" />
                    </div>
                  )}
                  <div className="space-y-1.5 text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-brand uppercase">{b.category}</span>
                      <StatusBadge label={meta.label} tone={meta.tone} />
                    </div>
                    <h3 className="font-bold text-sm text-foreground">{b.title}</h3>
                    <p className="text-xs text-muted-foreground">
                      By {b.author?.full_name} · Published {formatDateTime(b.updated_at)}
                    </p>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
