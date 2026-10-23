import nodemailer, { type Transporter } from 'nodemailer'

/**
 * Nodemailer (SMTP) transport for the volunteer-application emails.
 *
 * Config comes from env — see .env.example:
 *   SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, SMTP_FROM
 * With SMTP unset, sending is skipped (not thrown) so local/dev flows still run,
 * matching how lib/email/resend.ts degrades. Callers decide whether a skipped
 * send is acceptable: the automatic "Thanks for applying" email is best-effort,
 * while a lead clicking "send" needs to know it did not go out.
 */

export type MailResult =
  | { sent: true }
  | { sent: false; reason: 'not_configured' | 'failed' }

let transporter: Transporter | null = null

function smtpConfigured(): boolean {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS)
}

function getTransporter(): Transporter {
  if (transporter) return transporter
  const port = Number(process.env.SMTP_PORT) || 587
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    // Port 465 is implicit TLS; 587/25 upgrade via STARTTLS.
    secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : port === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  })
  return transporter
}

function fromAddress(): string {
  return (
    process.env.SMTP_FROM ??
    process.env.EMAIL_FROM ??
    'Teach AI for India <noreply@teachaiforindia.org>'
  )
}

export async function sendMail(opts: {
  to: string
  subject: string
  html: string
  text: string
}): Promise<MailResult> {
  if (!smtpConfigured()) {
    console.warn('[mail] SMTP_HOST/SMTP_USER/SMTP_PASS not set — skipping email:', opts.subject)
    return { sent: false, reason: 'not_configured' }
  }

  try {
    await getTransporter().sendMail({ from: fromAddress(), ...opts })
    return { sent: true }
  } catch (err) {
    console.error('[mail] send failed:', opts.subject, err instanceof Error ? err.message : err)
    return { sent: false, reason: 'failed' }
  }
}
