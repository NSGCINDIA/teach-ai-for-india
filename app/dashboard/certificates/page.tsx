import Link from 'next/link'
import { Award, ExternalLink } from 'lucide-react'
import { requireAccess } from '@/lib/auth/user'
import { can } from '@/lib/auth/rbac'
import { listMyCertificates, listCampusCertificates, type CertificateItem } from '@/lib/data/certificates'
import { listTeamMembers } from '@/lib/data/sessions'
import { revokeCertificate } from '@/actions/certificates'
import { CERTIFICATE_KIND_META } from '@/lib/constants/workspace'
import { formatDate } from '@/lib/format'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/shared/states'
import { StatusBadge } from '@/components/shared/status-badge'
import { DeleteButton } from '@/components/shared/delete-button'
import { IssueCertificateForm } from '@/components/certificates/issue-form'

export const metadata = { title: 'Certificates' }

export default async function CertificatesPage() {
  const user = await requireAccess('/dashboard/certificates')
  const canIssue = can(user.role, 'assign_volunteers') !== false

  if (!canIssue) {
    const mine = await listMyCertificates()
    return <Layout title="My certificates" subtitle="Recognition you’ve earned. Open one to print or save as PDF.">
      <CertificateList items={mine} canManage={false} showVolunteer={false} />
    </Layout>
  }

  const [issued, members] = await Promise.all([
    listCampusCertificates(user.campus_id),
    listTeamMembers(user.campus_id),
  ])
  const volunteers = members.filter((m) => m.role === 'volunteer')

  return (
    <Layout title="Certificates" subtitle="Issue recognition to your campus volunteers.">
      <Card>
        <CardHeader><CardTitle className="text-base">Issue a certificate</CardTitle></CardHeader>
        <CardContent><IssueCertificateForm volunteers={volunteers} /></CardContent>
      </Card>
      <CertificateList items={issued} canManage showVolunteer />
    </Layout>
  )
}

function Layout({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold tracking-tight">{title}</h1>
        <p className="mt-1 text-muted-foreground">{subtitle}</p>
      </header>
      {children}
    </div>
  )
}

function CertificateList({
  items, canManage, showVolunteer,
}: { items: CertificateItem[]; canManage: boolean; showVolunteer: boolean }) {
  if (items.length === 0) {
    return <EmptyState icon={Award} title="No certificates yet" description={canManage ? 'Issue one above to recognise a volunteer.' : 'Certificates issued to you will appear here.'} />
  }
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {items.map((c) => (
        <Card key={c.id}>
          <CardHeader className="flex-row items-start justify-between space-y-0 gap-2">
            <div>
              <CardTitle className="text-base">{c.title}</CardTitle>
              <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <StatusBadge label={CERTIFICATE_KIND_META[c.kind].label} tone="info" />
                {showVolunteer && <span>{c.volunteer?.full_name}</span>}
                <span>· {formatDate(c.issued_at)}</span>
              </p>
            </div>
            {canManage && (
              <DeleteButton action={revokeCertificate} fields={{ id: c.id }} label="Revoke" confirm="Revoke this certificate?" />
            )}
          </CardHeader>
          <CardContent className="flex items-center justify-between gap-2">
            <span className="font-mono text-xs text-muted-foreground">{c.serial}</span>
            <Link href={`/dashboard/certificates/${c.id}`} className="flex items-center gap-1.5 text-sm text-brand hover:underline">
              <ExternalLink className="size-3.5" /> View / print
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
