import Link from 'next/link'
import { BarChart3, Download, FileBarChart, FileText } from 'lucide-react'
import { requireAccess } from '@/lib/auth/user'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ExportMenu } from '@/components/analytics/export-menu'
import { EmailSummaryButton } from '@/components/admin/email-summary-button'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export const metadata = { title: 'Reports · Admin' }

export default async function AdminReportsPage() {
  await requireAccess('/admin/reports')

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold tracking-tight">Reports</h1>
        <p className="mt-1 text-muted-foreground">Download operational data or open the live analytics dashboard.</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base"><Download className="size-4" /> CSV exports</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Export any analytics view as CSV. Exports respect your access scope.
          </p>
          <ExportMenu />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base"><FileText className="size-4" /> Management summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            A one-page program + campus summary. Save it as a PDF, or email it to all admins now.
            (Automated monthly via the <code className="rounded bg-muted px-1">/api/cron/monthly-summary</code> route.)
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/admin/analytics/summary" className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'gap-1.5')}>
              <FileText className="size-4" /> Open printable summary
            </Link>
            <EmailSummaryButton />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base"><BarChart3 className="size-4" /> Live analytics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Program-wide impact, campus performance vs target, and operational funnels.
          </p>
          <Link href="/admin/analytics" className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'gap-1.5')}>
            <FileBarChart className="size-4" /> Open analytics
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
