import { Resend } from 'resend'

let client: Resend | null = null

function getClient(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null
  return (client ??= new Resend(process.env.RESEND_API_KEY))
}

const FROM = process.env.EMAIL_FROM ?? 'Teach AI for India <noreply@teachaiforindia.org>'

/** Extract clean email address if a display-name formatted string is provided */
function cleanEmail(addr: string): string {
  const match = addr.match(/<([^>]+)>/)
  return match ? match[1].trim() : addr.trim()
}

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

  const cleanTo = Array.isArray(opts.to)
    ? opts.to.map(cleanEmail)
    : cleanEmail(opts.to)

  const { data, error } = await resend.emails.send({ from: FROM, ...opts, to: cleanTo })
  if (error) {
    // If custom domain is not verified on Resend (HTTP 403), fallback to onboarding@resend.dev
    if (typeof error.message === 'string' && error.message.includes('domain is not verified')) {
      console.warn('[email] Domain not verified on Resend. Falling back to onboarding@resend.dev for:', opts.subject)
      const fallbackResult = await resend.emails.send({
        from: 'onboarding@resend.dev',
        ...opts,
        to: cleanTo,
      })
      if (fallbackResult.error) {
        console.error('[email] Fallback send failed:', fallbackResult.error)
      } else {
        console.log('[email] Fallback email sent successfully via onboarding@resend.dev')
      }
      return fallbackResult
    }

    console.error('[email] send failed:', error)
    return { error }
  }
  return { data }
}

