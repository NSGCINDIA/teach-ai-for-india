import { requireAccess } from '@/lib/auth/user'
import { isAdmin } from '@/lib/auth/rbac'
import { listBlogs } from '@/lib/data/blogs'
import { deleteBlog } from '@/actions/blogs'
import { DeleteButton } from '@/components/shared/delete-button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/shared/states'
import { BookOpen, FileText, Send, Calendar, User, CheckCircle2, AlertTriangle, FileEdit } from 'lucide-react'
import { formatDate } from '@/lib/format'
import { BlogComposer } from '@/components/blogs/blog-composer'
import { BlogReviewPanel } from '@/components/blogs/blog-review-panel'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export const metadata = { title: 'Blog Writing' }

export default async function BlogWritingPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string; create?: string }>
}) {
  const user = await requireAccess('/dashboard/blog-writing')
  const admin = isAdmin(user.role)
  const allBlogs = await listBlogs()
  const resolvedParams = await searchParams

  // Separate blogs based on role and status
  const pendingBlogs = allBlogs.filter((b) => b.status === 'pending')
  const publishedBlogs = allBlogs.filter((b) => b.status === 'published')
  
  // Non-admins only manage their own blogs
  const myBlogs = admin ? allBlogs : allBlogs.filter((b) => b.posted_by === user.id)
  
  const myDrafts = myBlogs.filter((b) => b.status === 'draft')
  const myPending = myBlogs.filter((b) => b.status === 'pending')
  const myPublished = myBlogs.filter((b) => b.status === 'published')
  const myRejected = myBlogs.filter((b) => b.status === 'rejected')

  // Handle edit / create state
  let activeEditBlog = null
  if (resolvedParams.edit) {
    activeEditBlog = myBlogs.find((b) => b.id === resolvedParams.edit) || null
  }

  const isWriting = resolvedParams.create === 'true' || activeEditBlog !== null

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Blog & Story Writing</h1>
          <p className="mt-1 text-muted-foreground">
            Share classroom success stories and reflections to improve SEO and inspire our community.
          </p>
        </div>
        {!isWriting && !admin && (
          <a
            href="/dashboard/blog-writing?create=true"
            className="inline-flex h-9 items-center justify-center rounded-md bg-brand px-4 text-sm font-medium text-white shadow transition-colors hover:bg-brand/90"
          >
            Create New Story
          </a>
        )}
        {isWriting && (
          <a
            href="/dashboard/blog-writing"
            className="inline-flex h-9 items-center justify-center rounded-md border border-border bg-background px-4 text-sm font-medium transition-colors hover:bg-muted"
          >
            Back to Dashboard
          </a>
        )}
      </header>

      {isWriting ? (
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>{activeEditBlog ? 'Edit Story' : 'Write a New Story'}</CardTitle>
            <CardDescription>
              {activeEditBlog ? 'Make updates to your draft.' : 'Draft a story about your campus, classrooms, or volunteer journey.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BlogComposer blog={activeEditBlog} />
          </CardContent>
        </Card>
      ) : admin ? (
        /* Super Admin Interface */
        <Tabs defaultValue="review" className="space-y-4">
          <TabsList className="bg-muted/50 p-1 border border-border">
            <TabsTrigger value="review" className="text-xs">
              Review Queue ({pendingBlogs.length})
            </TabsTrigger>
            <TabsTrigger value="published" className="text-xs">
              Published ({publishedBlogs.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="review" className="space-y-4">
            <BlogReviewPanel pendingBlogs={pendingBlogs} />
          </TabsContent>

          <TabsContent value="published" className="space-y-4">
            {publishedBlogs.length === 0 ? (
              <EmptyState icon={BookOpen} title="No articles published" description="Approved articles will show up here." />
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {publishedBlogs.map((b) => (
                  <Card key={b.id} className="flex flex-col justify-between">
                    <CardHeader className="p-4 pb-2">
                      <div className="flex justify-between items-start gap-3">
                        <span className="inline-flex items-center rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
                          Published
                        </span>
                        <DeleteButton
                          action={deleteBlog}
                          fields={{ id: b.id }}
                          label="Delete"
                          confirm="Are you sure you want to delete this published article?"
                        />
                      </div>
                      <CardTitle className="text-base font-semibold mt-2 line-clamp-2">{b.title}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-2 text-xs">
                        <User className="size-3" /> {b.poster?.full_name || 'Admin'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <p className="text-xs text-muted-foreground line-clamp-3 mb-4">{b.body}</p>
                      <div className="flex items-center justify-between border-t border-border pt-3 mt-auto">
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Calendar className="size-3" /> {formatDate(b.created_at)}
                        </span>
                        <a
                          href={`/stories`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-brand hover:underline font-medium"
                        >
                          View Public Site →
                        </a>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      ) : (
        /* Regular Team Member / Campus Lead Interface */
        <Tabs defaultValue="drafts" className="space-y-4">
          <TabsList className="bg-muted/50 p-1 border border-border">
            <TabsTrigger value="drafts" className="text-xs">
              Drafts ({myDrafts.length})
            </TabsTrigger>
            <TabsTrigger value="pending" className="text-xs">
              Pending Review ({myPending.length})
            </TabsTrigger>
            <TabsTrigger value="published" className="text-xs">
              Published ({myPublished.length})
            </TabsTrigger>
            {myRejected.length > 0 && (
              <TabsTrigger value="rejected" className="text-xs text-error">
                Needs Work ({myRejected.length})
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="drafts">
            {myDrafts.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="No draft stories"
                description="Click 'Create New Story' at the top to draft your first article."
              />
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {myDrafts.map((b) => (
                  <Card key={b.id} className="flex flex-col justify-between">
                    <CardHeader className="p-4 pb-2">
                      <div className="flex justify-between items-center">
                        <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                          Draft
                        </span>
                        <div className="flex gap-2">
                          <a
                            href={`/dashboard/blog-writing?edit=${b.id}`}
                            className="inline-flex size-7 items-center justify-center rounded-md border border-border bg-background text-muted-foreground hover:text-foreground transition-colors"
                            title="Edit draft"
                          >
                            <FileEdit className="size-3.5" />
                          </a>
                          <DeleteButton
                            action={deleteBlog}
                            fields={{ id: b.id }}
                            label="Delete"
                            confirm="Delete this draft?"
                          />
                        </div>
                      </div>
                      <CardTitle className="text-base font-semibold mt-2 line-clamp-2">{b.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <p className="text-xs text-muted-foreground line-clamp-3 mb-4">{b.body}</p>
                      <div className="flex items-center justify-between border-t border-border pt-3 text-[10px] text-muted-foreground mt-auto">
                        <span className="flex items-center gap-1">
                          <Calendar className="size-3" /> Saved {formatDate(b.updated_at)}
                        </span>
                        <a
                          href={`/dashboard/blog-writing?edit=${b.id}`}
                          className="text-brand hover:underline font-semibold"
                        >
                          Submit story →
                        </a>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="pending">
            {myPending.length === 0 ? (
              <EmptyState
                icon={Send}
                title="No pending reviews"
                description="Submitted drafts waiting for admin approval will show up here."
              />
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {myPending.map((b) => (
                  <Card key={b.id}>
                    <CardHeader className="p-4 pb-2">
                      <span className="self-start inline-flex items-center rounded-full bg-warning/10 px-2 py-0.5 text-[10px] font-medium text-warning">
                        Under Review
                      </span>
                      <CardTitle className="text-base font-semibold mt-2 line-clamp-2">{b.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <p className="text-xs text-muted-foreground line-clamp-3 mb-4">{b.body}</p>
                      <div className="flex items-center border-t border-border pt-3 text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="size-3" /> Submitted {formatDate(b.updated_at)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="published">
            {myPublished.length === 0 ? (
              <EmptyState
                icon={CheckCircle2}
                title="No published stories yet"
                description="Once an admin approves your story, it will be published to the public website."
              />
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {myPublished.map((b) => (
                  <Card key={b.id}>
                    <CardHeader className="p-4 pb-2">
                      <span className="self-start inline-flex items-center rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-medium text-success">
                        Live on Site
                      </span>
                      <CardTitle className="text-base font-semibold mt-2 line-clamp-2">{b.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <p className="text-xs text-muted-foreground line-clamp-3 mb-4">{b.body}</p>
                      <div className="flex items-center justify-between border-t border-border pt-3 text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="size-3" /> Published {formatDate(b.updated_at)}
                        </span>
                        <a
                          href="/stories"
                          target="_blank"
                          className="text-brand hover:underline font-semibold"
                        >
                          View public story
                        </a>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="rejected">
            <div className="grid gap-4 md:grid-cols-2">
              {myRejected.map((b) => (
                <Card key={b.id} className="border-error/30">
                  <CardHeader className="p-4 pb-2">
                    <div className="flex justify-between items-center">
                      <span className="inline-flex items-center gap-1 rounded-full bg-error/10 px-2 py-0.5 text-[10px] font-medium text-error">
                        <AlertTriangle className="size-3" /> Needs Work
                      </span>
                      <a
                        href={`/dashboard/blog-writing?edit=${b.id}`}
                        className="inline-flex size-7 items-center justify-center rounded-md border border-border bg-background text-muted-foreground hover:text-foreground transition-colors"
                        title="Edit draft"
                      >
                        <FileEdit className="size-3.5" />
                      </a>
                    </div>
                    <CardTitle className="text-base font-semibold mt-2 line-clamp-2">{b.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-xs text-muted-foreground line-clamp-3 mb-4">{b.body}</p>
                    <div className="flex items-center justify-between border-t border-border pt-3 text-[10px] text-muted-foreground mt-auto">
                      <span>Rejected {formatDate(b.updated_at)}</span>
                      <a
                        href={`/dashboard/blog-writing?edit=${b.id}`}
                        className="text-brand hover:underline font-semibold"
                      >
                        Revise & Resubmit →
                      </a>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
