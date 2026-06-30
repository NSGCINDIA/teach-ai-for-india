import { CalendarDays, Receipt, School, Sparkles } from 'lucide-react'
import { requireUser } from '@/lib/auth/user'
import { roleLabel } from '@/lib/auth/roles'
import { Card } from '@/components/ui/card'

export const metadata = { title: 'Dashboard' }

export default async function DashboardOverview() {
  const user = await requireUser('/dashboard')

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm text-muted-foreground">{roleLabel(user.role)}</p>
        <h1 className="font-display text-2xl font-bold tracking-tight">
          Welcome back, {user.full_name.split(' ')[0]} 👋
        </h1>
        <p className="mt-1 text-muted-foreground">
          This is your home base. Your operational modules light up here as we roll them out.
        </p>
      </header>

      <Card className="flex items-start gap-4 border-brand/20 bg-brand/5 p-5">
        <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-brand text-primary-foreground">
          <Sparkles className="size-5" />
        </span>
        <div>
          <h2 className="font-display font-semibold">Phase 1 is live</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Authentication, role-based access, the public site, and the full database are in place.
            Sessions, schools, reimbursements, and evidence arrive in Phase 2.
          </p>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <UpcomingCard icon={CalendarDays} title="My Sessions" desc="See sessions you’re assigned to and file reports." />
        <UpcomingCard icon={School} title="My Schools" desc="Track outreach and move schools through the pipeline." />
        <UpcomingCard icon={Receipt} title="Reimbursements" desc="Submit travel claims and track payment status." />
      </div>
    </div>
  )
}

function UpcomingCard({ icon: Icon, title, desc }: { icon: typeof School; title: string; desc: string }) {
  return (
    <Card className="p-5">
      <span className="grid size-9 place-items-center rounded-lg bg-accent text-accent-foreground">
        <Icon className="size-5" />
      </span>
      <h3 className="mt-3 font-display font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
      <span className="mt-3 inline-block rounded bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        Phase 2
      </span>
    </Card>
  )
}
