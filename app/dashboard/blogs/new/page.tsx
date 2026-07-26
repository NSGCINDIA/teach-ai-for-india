import { requireUser } from '@/lib/auth/user'
import { BlogEditor } from '@/components/blogs/blog-editor'

export const metadata = { title: 'New Article · Dashboard' }

export default async function NewBlogPage() {
  await requireUser('/dashboard/blogs')

  return (
    <div className="space-y-6">
      <header className="text-left">
        <h1 className="font-display text-2xl font-bold tracking-tight">Write Impact Story</h1>
        <p className="mt-1 text-muted-foreground">
          Create an article draft. You can preview and edit it anytime before submitting for review.
        </p>
      </header>

      <BlogEditor />
    </div>
  )
}
