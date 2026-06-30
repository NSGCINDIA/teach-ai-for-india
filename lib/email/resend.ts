import { Resend } from 'resend'

let client: Resend | null = null

function getClient(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null
  return (client ??= new Resend(process.env.RESEND_API_KEY))
}

const FROM = process.env.EMAIL_FROM ?? 'Teach AI for India <noreply@teachaiforindia.org>'

/**
 * Sends a transactional email via Resend (PRD §11). If Resend isn't configured
 * yet, it no-ops with a warning so flows still work in local/dev.
 */
export async function sendEmail(opts: { to: string | string[]; subject: string; html: string }) {
  const resend = getClient()
  if (!resend) {
    console.warn('[email] RESEND_API_KEY not set — skipping email:', opts.subject)
    return { skipped: true as const }
  }
  const { data, error } = await resend.emails.send({ from: FROM, ...opts })
  if (error) {
    console.error('[email] send failed:', error)
    return { error }
  }
  return { data }
}
