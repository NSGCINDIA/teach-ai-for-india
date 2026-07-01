import Image from 'next/image'
import { listCampusOptions } from '@/lib/data/schools'
import { SignupForm } from '@/components/auth/signup-form'

export const metadata = { title: 'Create Account' }

/**
 * Public self-registration (PRD §7.2). Submitting creates a *request* — an admin
 * is notified and the account only lands in the DB once approved.
 */
export default async function SignupPage() {
  const campuses = await listCampusOptions()

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-muted/40 px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-border bg-background p-8 shadow-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Teach_Ai_1_page-0001-removebg-preview-ZJzf3R1J38t7BLntCYEUuQMl2LbJdV.png"
            alt="Teach AI For India"
            width={160}
            height={62}
            className="h-12 w-auto object-contain"
            priority
          />
          <h1 className="mt-4 font-display text-2xl font-bold tracking-tight">Create Account</h1>
          <p className="mt-1 text-sm text-muted-foreground">Join the Teach AI For India team</p>
        </div>

        <SignupForm campuses={campuses} />
      </div>
    </div>
  )
}
