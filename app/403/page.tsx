import Link from 'next/link'
import { ShieldX } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata = { title: 'Access denied' }

/** 403 — shown (via middleware rewrite) when a role hits an unauthorized route. */
export default function ForbiddenPage() {
  return (
    <main className="grid min-h-dvh place-items-center px-6 text-center">
      <div className="max-w-md">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-error/10 text-error">
          <ShieldX className="size-7" aria-hidden />
        </span>
        <h1 className="mt-6 font-display text-2xl font-bold">Access denied</h1>
        <p className="mt-2 text-muted-foreground">
          You don’t have permission to view this page. If you think this is a mistake,
          contact your campus lead or an admin.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button asChild>
            <Link href="/dashboard">Go to dashboard</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/">Back to home</Link>
          </Button>
        </div>
      </div>
    </main>
  )
}
