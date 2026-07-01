import { Download } from 'lucide-react'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'

const EXPORTS: { view: string; label: string }[] = [
  { view: 'campuses', label: 'Campuses' },
  { view: 'sessions', label: 'Session funnel' },
  { view: 'schools', label: 'School pipeline' },
  { view: 'monthly', label: 'Monthly activity' },
]

/** CSV export links — hit the RLS-guarded /admin/analytics/export route (PRD §7.8). */
export function ExportMenu() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {EXPORTS.map((e) => (
        <a
          key={e.view}
          href={`/admin/analytics/export?view=${e.view}`}
          download
          className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'gap-1.5')}
        >
          <Download className="size-3.5" aria-hidden />
          {e.label}
        </a>
      ))}
    </div>
  )
}
