import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { requireAccess } from '@/lib/auth/user'
import { getCertificate } from '@/lib/data/certificates'
import { CERTIFICATE_KIND_META } from '@/lib/constants/workspace'
import { formatDate } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { PrintButton } from '@/components/analytics/print-button'

export const metadata = { title: 'Certificate' }

export default async function CertificatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await requireAccess('/dashboard/certificates')
  const cert = await getCertificate(id)
  if (!cert) notFound()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between print:hidden">
        <Button asChild variant="ghost" size="sm" className="-ml-2 text-muted-foreground">
          <Link href="/dashboard/certificates"><ArrowLeft className="size-4" /> All certificates</Link>
        </Button>
        <PrintButton />
      </div>

      {/* The printable certificate. */}
      <div className="mx-auto max-w-3xl rounded-2xl border-4 border-double border-brand/40 bg-card p-10 text-center shadow-sm print:border-brand/60 print:shadow-none">
        <p className="font-display text-sm font-semibold uppercase tracking-[0.3em] text-brand">Teach AI for India</p>
        <p className="mt-8 text-sm uppercase tracking-widest text-muted-foreground">Certificate of {CERTIFICATE_KIND_META[cert.kind].label}</p>
        <h1 className="mt-6 font-display text-3xl font-bold tracking-tight">{cert.volunteer?.full_name ?? 'Volunteer'}</h1>
        <p className="mx-auto mt-6 max-w-xl text-base">
          {cert.description || `In recognition of your contribution to the AI-literacy movement — "${cert.title}".`}
        </p>
        {cert.sessions_count != null && (
          <p className="mt-4 text-sm text-muted-foreground">{cert.sessions_count} session{cert.sessions_count === 1 ? '' : 's'} contributed</p>
        )}
        <div className="mt-12 flex items-end justify-between text-left text-sm">
          <div>
            <p className="border-t border-border pt-1 font-medium">{cert.issuer?.full_name ?? 'Program Team'}</p>
            <p className="text-xs text-muted-foreground">Issued {formatDate(cert.issued_at)}{cert.campus?.name ? ` · ${cert.campus.name}` : ''}</p>
          </div>
          <p className="font-mono text-xs text-muted-foreground">{cert.serial}</p>
        </div>
      </div>
    </div>
  )
}
