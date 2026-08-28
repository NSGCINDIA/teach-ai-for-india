import { BookOpen } from 'lucide-react'
import { requireUser } from '@/lib/auth/user'
import { BlogEditor } from '@/components/blogs/blog-editor'
import { PageHeader } from '@/components/dashboard/page-header'

export const metadata = { title: 'New Article · Dashboard' }

export default async function NewBlogPage() {
  await requireUser('/dashboard/blogs')

  return (
    <div className="space-y-6">
      <PageHeader
        icon={BookOpen}
        title="Write Impact Story"
        description="Create an article draft. You can preview and edit it anytime before submitting for review."
      />

      <BlogEditor />
    </div>
  )
}
