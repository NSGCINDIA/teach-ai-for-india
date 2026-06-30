import Link from 'next/link'
import { Plus } from 'lucide-react'
import { requireAccess } from '@/lib/auth/user'
import { listSessions } from '@/lib/data/sessions'
import { listCampusOptions } from '@/lib/data/schools'
import { Button } from '@/components/ui/button'
import { SessionsView } from '@/components/sessions/sessions-view'

export const metadata = { title: 'Sessions · Admin' }

export default async function AdminSessionsPage() {
  await requireAccess('/admin/sessions')
  const [sessions, campuses] = await Promise.all([listSessions(), listCampusOptions()])

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Sessions</h1>
          <p className="mt-1 text-muted-foreground">Every session across all campuses — verify reports here.</p>
        </div>
        <Button asChild><Link href="/admin/sessions/new"><Plus className="size-4" /> Plan session</Link></Button>
      </header>

      <SessionsView sessions={sessions} campuses={campuses} basePath="/admin/sessions" />
    </div>
  )
}
