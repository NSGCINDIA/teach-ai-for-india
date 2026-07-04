import { PageSkeleton } from '@/components/dashboard/page-skeleton'

// Streams instantly for /admin and every nested route while its page's
// server-side data loads (Next.js wraps the segment in a Suspense boundary).
export default function AdminLoading() {
  return <PageSkeleton />
}
