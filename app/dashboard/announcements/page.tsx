import { Megaphone, Pin } from 'lucide-react'
import { requireAccess } from '@/lib/auth/user'
import { isAdmin } from '@/lib/auth/rbac'
import { listAnnouncements } from '@/lib/data/announcements'
import { deleteAnnouncement } from '@/actions/announcements'
import { formatDateTime } from '@/lib/format'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/shared/states'
import { DeleteButton } from '@/components/shared/delete-button'
import { AnnouncementComposer } from '@/components/announcements/announcement-composer'

export const metadata = { title: 'Announcements' }

const CAN_POST = new Set(['campus_lead', 'outreach_lead', 'exec_lead', 'volunteer_lead'])

export default async function AnnouncementsPage() {
  const user = await requireAccess('/dashboard/announcements')
  const admin = isAdmin(user.role)
  const canPost = admin || CAN_POST.has(user.role)
  const items = await listAnnouncements()

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold tracking-tight">Announcements</h1>
        <p className="mt-1 text-muted-foreground">Updates from your campus and the wider movement.</p>
      </header>

      {canPost && (
        <Card>
          <CardHeader><CardTitle className="text-base">Post an announcement</CardTitle></CardHeader>
          <CardContent><AnnouncementComposer orgWide={admin} /></CardContent>
        </Card>
      )}

      {items.length === 0 ? (
        <EmptyState icon={Megaphone} title="No announcements yet" description="When a lead posts an update, it shows up here." />
      ) : (
        <div className="space-y-4">
          {items.map((a) => {
            const canManage = admin || (canPost && a.campus_id === user.campus_id)
            return (
              <Card key={a.id} className={a.pinned ? 'border-brand/40' : undefined}>
                <CardHeader className="flex-row items-start justify-between space-y-0 gap-3">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-base">
                      {a.pinned && <Pin className="size-3.5 text-brand" />}
                      {a.title}
                    </CardTitle>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {a.poster?.full_name ?? 'Team'} · {a.campus?.name ?? 'Organisation-wide'} · {formatDateTime(a.created_at)}
                    </p>
                  </div>
                  {canManage && (
                    <DeleteButton
                      action={deleteAnnouncement}
                      fields={{ id: a.id }}
                      label="Delete"
                      confirm="Delete this announcement?"
                    />
                  )}
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap text-sm">{a.body}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
