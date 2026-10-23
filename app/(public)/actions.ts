'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/email/resend'
import { sendMail } from '@/lib/email/mailer'
import { rateLimit } from '@/lib/security/rate-limit'
import { applicationReceivedEmail } from '@/lib/email/volunteer-application-emails'

/** Where form notifications are sent. Best-effort — flows succeed even if unset. */
function getNotifyEmail(): string | null {
  return process.env.ADMIN_NOTIFICATION_EMAIL ?? process.env.EMAIL_FROM ?? null
}

export type ActionResult = { ok: true } | { ok: false; error: string }

// ─── Volunteer application ───────────────────────────────────────────────────
const volunteerSchema = z.object({
  full_name: z.string().trim().min(2, 'Please enter your full name.').max(120),
  email: z.string().trim().email('Please enter a valid email address.').max(160),
  phone: z.string().trim().regex(/^\d{10}$/, 'Enter a 10-digit mobile number.'),
  // Required: the campus decides which Volunteer Lead receives the application.
  campus_slug: z.string().trim().min(1, 'Please select your preferred campus.').max(120),
  motivation: z.string().trim().min(10, 'Tell us a little more (at least 10 characters).').max(2000),
})

export type VolunteerInput = z.infer<typeof volunteerSchema>

export async function submitVolunteerApplication(input: VolunteerInput): Promise<ActionResult> {
  const parsed = volunteerSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Please check the form and try again.' }
  }
  const data = parsed.data

  try {
    const supabase = await createClient()
    const { error } = await supabase.from('volunteer_applications').insert({
      full_name: data.full_name,
      email: data.email,
      phone: data.phone,
      campus_slug: data.campus_slug,
      motivation: data.motivation,
      status: 'new',
    })
    if (error) {
      console.error('[volunteer] insert failed:', error.message)
      return { ok: false, error: 'We could not submit your application right now. Please try again.' }
    }
  } catch (err) {
    console.error('[volunteer] unexpected error:', err)
    return { ok: false, error: 'Something went wrong. Please try again in a moment.' }
  }

  // Step 3 of the volunteer pipeline: "Thanks for applying". Best-effort — the
  // application is already saved, so a mail failure must not fail the submission.
  // Throttled per address: this form is public, so without a cap it could be
  // used to flood someone else's inbox.
  try {
    if (rateLimit(`volunteer-thanks:${data.email.toLowerCase()}`, 2, 60 * 60 * 1000).allowed) {
      await sendMail({ to: data.email, ...applicationReceivedEmail({ fullName: data.full_name }) })
    }
  } catch (err) {
    console.error('[volunteer] thank-you email failed:', err)
  }

  // Best-effort admin notification — never blocks a successful submission.
  const notifyEmail = getNotifyEmail()
  if (notifyEmail) {
    try {
      await sendEmail({
        to: notifyEmail,
        subject: `New volunteer application — ${data.full_name}`,
        html: `
          <h2>New volunteer application</h2>
          <p><strong>Name:</strong> ${escapeHtml(data.full_name)}</p>
          <p><strong>Email:</strong> ${escapeHtml(data.email)}</p>
          <p><strong>Phone:</strong> ${escapeHtml(data.phone || '—')}</p>
          <p><strong>Preferred campus:</strong> ${escapeHtml(data.campus_slug || '—')}</p>
          <p><strong>Motivation:</strong><br/>${escapeHtml(data.motivation)}</p>
        `,
      })
    } catch (err) {
      console.error('[volunteer] notification email failed:', err)
    }
  }

  return { ok: true }
}

// ─── Contact message ─────────────────────────────────────────────────────────
const contactSchema = z.object({
  name: z.string().trim().min(2, 'Please enter your name.').max(120),
  email: z.string().trim().email('Please enter a valid email address.').max(160),
  subject: z.string().trim().max(160).optional().or(z.literal('')),
  message: z.string().trim().min(10, 'Please write a little more (at least 10 characters).').max(4000),
})

export type ContactInput = z.infer<typeof contactSchema>

export async function submitContactMessage(input: ContactInput): Promise<ActionResult> {
  const parsed = contactSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Please check the form and try again.' }
  }
  const data = parsed.data

  try {
    const supabase = await createClient()
    const { error } = await supabase.from('contact_messages').insert({
      name: data.name,
      email: data.email,
      subject: data.subject || null,
      message: data.message,
      is_handled: false,
    })
    if (error) {
      console.error('[contact] insert failed:', error.message)
      return { ok: false, error: 'We could not send your message right now. Please try again.' }
    }
  } catch (err) {
    console.error('[contact] unexpected error:', err)
    return { ok: false, error: 'Something went wrong. Please try again in a moment.' }
  }

  const notifyEmail = getNotifyEmail()
  if (notifyEmail) {
    try {
      await sendEmail({
        to: notifyEmail,
        subject: `New contact message${data.subject ? ` — ${data.subject}` : ''}`,
        html: `
          <h2>New contact message</h2>
          <p><strong>Name:</strong> ${escapeHtml(data.name)}</p>
          <p><strong>Email:</strong> ${escapeHtml(data.email)}</p>
          <p><strong>Subject:</strong> ${escapeHtml(data.subject || '—')}</p>
          <p><strong>Message:</strong><br/>${escapeHtml(data.message)}</p>
        `,
      })
    } catch (err) {
      console.error('[contact] notification email failed:', err)
    }
  }


  return { ok: true }
}

/** Minimal HTML escaping for values interpolated into notification emails. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/\n/g, '<br/>')
}
