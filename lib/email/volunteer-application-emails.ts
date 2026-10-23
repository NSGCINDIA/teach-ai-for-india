/**
 * Email templates for the volunteer-application pipeline (steps 3, 6, 8a, 8b).
 * Pure functions — no I/O — so they can be unit-tested. Every user-supplied
 * value is escaped before it reaches the HTML.
 */

export interface EmailContent {
  subject: string
  html: string
  text: string
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function firstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] || 'there'
}

function layout(body: string): string {
  return `<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.55;color:#1d2939;max-width:560px">
${body}
<p style="margin-top:28px">Warm regards,<br/>Team Teach AI for India</p>
</div>`
}

/** Interview time is shown in IST — every campus is in Telangana / Andhra Pradesh. */
export function formatInterviewTime(at: Date | string): string {
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: 'Asia/Kolkata',
  }).format(new Date(at)) + ' IST'
}

const isUrl = (v: string) => /^https?:\/\/\S+$/i.test(v.trim())

/** Step 3 — sent automatically the moment the application is saved. */
export function applicationReceivedEmail(p: { fullName: string }): EmailContent {
  const name = firstName(p.fullName)
  return {
    subject: 'Thanks for applying to volunteer with Teach AI for India',
    html: layout(`<p>Hi ${escapeHtml(name)},</p>
<p>Thanks for applying to volunteer with Teach AI for India. We have received your application.</p>
<p>The volunteer lead on your campus will review it and get in touch about the next step, which is a short interview.</p>`),
    text: `Hi ${name},

Thanks for applying to volunteer with Teach AI for India. We have received your application.

The volunteer lead on your campus will review it and get in touch about the next step, which is a short interview.

Warm regards,
Team Teach AI for India`,
  }
}

/** Step 6 — the lead clicks send on the invite. */
export function interviewInviteEmail(p: {
  fullName: string
  interviewAt: Date | string
  interviewer: string
  mode: string
}): EmailContent {
  const name = firstName(p.fullName)
  const when = formatInterviewTime(p.interviewAt)
  const where = p.mode.trim()
  const whereHtml = isUrl(where)
    ? `<a href="${escapeHtml(where)}">${escapeHtml(where)}</a>`
    : escapeHtml(where)
  return {
    subject: 'Your volunteer interview — Teach AI for India',
    html: layout(`<p>Hi ${escapeHtml(name)},</p>
<p>We would like to invite you to a short interview for the volunteer role.</p>
<table style="border-collapse:collapse;margin:12px 0">
<tr><td style="padding:4px 14px 4px 0;color:#667085">When</td><td><strong>${escapeHtml(when)}</strong></td></tr>
<tr><td style="padding:4px 14px 4px 0;color:#667085">Where</td><td>${whereHtml}</td></tr>
<tr><td style="padding:4px 14px 4px 0;color:#667085">Interviewer</td><td>${escapeHtml(p.interviewer)}</td></tr>
</table>
<p>If this time does not work for you, reply to this email and we will find another slot.</p>`),
    text: `Hi ${name},

We would like to invite you to a short interview for the volunteer role.

When: ${when}
Where: ${where}
Interviewer: ${p.interviewer}

If this time does not work for you, reply to this email and we will find another slot.

Warm regards,
Team Teach AI for India`,
  }
}

/** Step 8a — selected. Points the new volunteer at /signup to create their account. */
export function selectedEmail(p: { fullName: string; signupUrl: string }): EmailContent {
  const name = firstName(p.fullName)
  return {
    subject: 'Welcome to Teach AI for India — you are selected!',
    html: layout(`<p>Hi ${escapeHtml(name)},</p>
<p>Congratulations — you have been <strong>selected</strong> as a volunteer with Teach AI for India. Welcome to the team!</p>
<p>The next step is to create your volunteer account:</p>
<p><a href="${escapeHtml(p.signupUrl)}" style="display:inline-block;padding:10px 18px;background:#FF6B35;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">Create your account</a></p>
<p style="color:#667085;font-size:13px">Or open ${escapeHtml(p.signupUrl)} and request the Volunteer role. Use the same email address you applied with.</p>`),
    text: `Hi ${name},

Congratulations — you have been selected as a volunteer with Teach AI for India. Welcome to the team!

The next step is to create your volunteer account: ${p.signupUrl}
Request the Volunteer role and use the same email address you applied with.

Warm regards,
Team Teach AI for India`,
  }
}

/** Step 8b — rejected. */
export function rejectedEmail(p: { fullName: string }): EmailContent {
  const name = firstName(p.fullName)
  return {
    subject: 'Your Teach AI for India volunteer application',
    html: layout(`<p>Hi ${escapeHtml(name)},</p>
<p>Thank you for taking the time to interview with us and for your interest in Teach AI for India.</p>
<p>After careful consideration we are not able to offer you a volunteer place this time. This was a difficult decision, and we hope you will apply again in a future round.</p>`),
    text: `Hi ${name},

Thank you for taking the time to interview with us and for your interest in Teach AI for India.

After careful consideration we are not able to offer you a volunteer place this time. This was a difficult decision, and we hope you will apply again in a future round.

Warm regards,
Team Teach AI for India`,
  }
}
