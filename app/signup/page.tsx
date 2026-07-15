import { listCampusOptions } from '@/lib/data/schools'
import { SignupForm } from '@/components/auth/signup-form'
import { Background3D } from '@/components/marketing/bg-3d'

export const metadata = { title: 'Create Account' }

/**
 * Public self-registration (PRD §7.2). Submitting creates a *request* — an admin
 * is notified and the account only lands in the DB once approved.
 */
export default async function SignupPage() {
  const campuses = await listCampusOptions()

  return (
    <div className="min-h-dvh flex items-center justify-center bg-background relative overflow-hidden px-4 py-10">
      <Background3D />
      <div className="w-full flex justify-center z-10 relative">
        <SignupForm campuses={campuses} />
      </div>
    </div>
  )
}
