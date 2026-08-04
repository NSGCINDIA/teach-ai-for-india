import { getSessionUpdates, getFinanceUpdates, getEvidenceUpdates, getVolunteerUpdates, getSchoolUpdates, UpdateItem } from '@/lib/data/context-updates'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { CalendarDays, Wallet, Images, Users, School } from 'lucide-react'
import Link from 'next/link'
import { relativeTime } from '@/lib/format'

const ICONS = {
  sessions: CalendarDays,
  finance: Wallet,
  evidence: Images,
  volunteers: Users,
  schools: School,
}

const MODULE_TITLES = {
  sessions: 'Session Updates',
  finance: 'Finance Updates',
  evidence: 'Evidence Updates',
  volunteers: 'Assignment Updates',
  schools: 'School Updates',
}

interface ContextualUpdatesProps {
  module: 'sessions' | 'finance' | 'evidence' | 'volunteers' | 'schools'
}

export async function ContextualUpdates({ module }: ContextualUpdatesProps) {
  let updates: UpdateItem[] = []
  try {
    if (module === 'sessions') updates = await getSessionUpdates()
    else if (module === 'finance') updates = await getFinanceUpdates()
    else if (module === 'evidence') updates = await getEvidenceUpdates()
    else if (module === 'volunteers') updates = await getVolunteerUpdates()
    else if (module === 'schools') updates = await getSchoolUpdates()
  } catch (e) {
    console.error('Failed to load contextual updates for', module, e)
  }

  if (updates.length === 0) return null

  const Icon = ICONS[module]

  return (
    <Card className="border border-border/60 bg-gradient-to-br from-card to-muted/20 shadow-soft backdrop-blur-xs transition-all duration-300 hover:shadow-medium">
      <CardHeader className="flex-row items-center gap-2 pb-3">
        <div className="rounded-lg bg-brand/10 p-1.5 text-brand">
          <Icon className="size-4" />
        </div>
        <div>
          <CardTitle className="text-base font-semibold">{MODULE_TITLES[module]}</CardTitle>
          <p className="text-xs text-muted-foreground">Recent events in this module</p>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {updates.map((item) => (
            <li key={item.id} className="rounded-lg border border-border/50 bg-background/80 p-3 shadow-2xs transition-colors hover:border-brand/30 hover:bg-background">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  {item.href ? (
                    <Link href={item.href} className="text-sm font-semibold text-foreground hover:text-brand hover:underline line-clamp-1">
                      {item.title}
                    </Link>
                  ) : (
                    <span className="text-sm font-semibold text-foreground line-clamp-1">{item.title}</span>
                  )}
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{item.description}</p>
                  <p className="mt-2 text-[10px] font-medium text-muted-foreground/80">{relativeTime(item.date)}</p>
                </div>
                {item.badgeText && (
                  <div className="shrink-0">
                    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold bg-brand/10 text-brand uppercase tracking-wider">
                      {item.badgeText}
                    </span>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
