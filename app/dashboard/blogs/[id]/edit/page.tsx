import { notFound, redirect } from 'next/navigation'
import { requireUser } from '@/lib/auth/user'
import { isAdmin } from '@/lib/auth/rbac'
import { getBlogDetail } from '@/lib/data/blogs'
import { BlogEditor } from '@/components/blogs/blog-editor'
import { BlogReviewPanel } from '@/components/blogs/blog-review-panel'

export const metadata = { title: 'Edit Article · Dashboard' }

interface EditBlogPageProps {
  params: { id: string }
}

export default async function EditBlogPage({ params }: EditBlogPageProps) {
  const user = await requireUser('/dashboard/blogs')
  const blog = await getBlogDetail(params.id)
  
  if (!blog) {
    notFound()
  }

  const admin = isAdmin(user.role)
  const isAuthor = blog.author_id === user.id

  if (!isAuthor && !admin) {
    redirect('/dashboard/blogs')
  }

  // Admin review mode for submitted items
  const showReviewPanel = admin && blog.status === 'submitted'

  return (
    <div className="space-y-6">
      <header className="text-left">
        <h1 className="font-display text-2xl font-bold tracking-tight">
          {showReviewPanel ? 'Review Impact Story' : 'Edit Impact Story'}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {showReviewPanel 
            ? 'Review the submitted draft below. You can make adjustments directly or decide on approval.'
            : 'Modify the draft fields and click save. Don\'t forget to submit for approval when finished.'}
        </p>
      </header>

      {showReviewPanel && <BlogReviewPanel blog={blog} />}

      <BlogEditor blog={blog} />
    </div>
  )
}
