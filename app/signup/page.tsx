import { redirect } from 'next/navigation'

/**
 * Public self-registration is disabled (PRD §7.2 — invite-only).
 * Prospective volunteers apply via /join; the rest join by admin invite.
 */
export default function SignupPage() {
  redirect('/join')
}
