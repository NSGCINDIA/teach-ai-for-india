import { test } from 'node:test'
import assert from 'node:assert'
import { sendMail } from '@/lib/email/mailer'

const mail = { to: 'student@example.com', subject: 'Hello', html: '<p>Hi</p>', text: 'Hi' }
const SMTP_KEYS = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_SECURE', 'SMTP_USER', 'SMTP_PASS', 'SMTP_FROM'] as const

function withSmtpEnv(values: Partial<Record<(typeof SMTP_KEYS)[number], string>>) {
  const saved = Object.fromEntries(SMTP_KEYS.map((k) => [k, process.env[k]]))
  for (const k of SMTP_KEYS) delete process.env[k]
  Object.assign(process.env, values)
  return () => {
    for (const k of SMTP_KEYS) {
      if (saved[k] === undefined) delete process.env[k]
      else process.env[k] = saved[k]
    }
  }
}

test('sendMail skips, without throwing, when SMTP is not configured', async () => {
  const restore = withSmtpEnv({})
  try {
    assert.deepEqual(await sendMail(mail), { sent: false, reason: 'not_configured' })
  } finally {
    restore()
  }
})

test('sendMail reports a failed send when the SMTP server is unreachable', async () => {
  // Port 1 on loopback refuses the connection immediately.
  const restore = withSmtpEnv({
    SMTP_HOST: '127.0.0.1',
    SMTP_PORT: '1',
    SMTP_USER: 'user',
    SMTP_PASS: 'pass',
    SMTP_FROM: 'Teach AI for India <noreply@example.com>',
  })
  try {
    assert.deepEqual(await sendMail(mail), { sent: false, reason: 'failed' })
  } finally {
    restore()
  }
})
