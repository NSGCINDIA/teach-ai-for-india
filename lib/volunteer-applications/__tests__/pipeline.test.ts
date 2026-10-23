import { test } from 'node:test'
import assert from 'node:assert'
import { applicationStage } from '@/lib/volunteer-applications/stage'
import {
  applicationReceivedEmail,
  escapeHtml,
  interviewInviteEmail,
  selectedEmail,
} from '@/lib/email/volunteer-application-emails'
import { scheduleInterviewSchema } from '@/lib/validations/volunteer-applications'

const base = { status: 'new' as const, interview_at: null, interview_result: null }

test('applicationStage follows the pipeline columns', () => {
  assert.equal(applicationStage(base), 'applied')
  assert.equal(applicationStage({ ...base, status: 'reviewing' }), 'picked_up')
  assert.equal(applicationStage({ ...base, status: 'reviewing', interview_at: '2030-01-01T10:00:00Z' }), 'interview_scheduled')
  assert.equal(
    applicationStage({ ...base, status: 'reviewing', interview_at: '2030-01-01T10:00:00Z', interview_result: 'selected' }),
    'interview_done',
  )
  assert.equal(applicationStage({ ...base, status: 'invited' }), 'selected')
  assert.equal(applicationStage({ ...base, status: 'rejected' }), 'rejected')
})

test('emails escape user-supplied values', () => {
  const evil = '<script>alert(1)</script>'
  const mail = applicationReceivedEmail({ fullName: evil })
  assert.ok(!mail.html.includes('<script>'))
  const invite = interviewInviteEmail({
    fullName: 'Asha Rao',
    interviewAt: '2030-01-01T10:00:00Z',
    interviewer: evil,
    mode: 'https://meet.example.com/abc?x=1&y="2"',
  })
  assert.ok(!invite.html.includes('<script>'))
  assert.ok(invite.html.includes('href="https://meet.example.com/abc?x=1&amp;y=&quot;2&quot;"'))
  assert.equal(escapeHtml(`a&b<'"`), 'a&amp;b&lt;&#39;&quot;')
})

test('invite shows the interview time in IST', () => {
  const invite = interviewInviteEmail({
    fullName: 'Asha Rao',
    interviewAt: '2030-06-15T04:30:00Z', // 10:00 IST
    interviewer: 'Coach',
    mode: 'Room 4',
  })
  assert.match(invite.text, /10:00/)
  assert.match(invite.text, /IST/)
})

test('selected email links to signup', () => {
  const mail = selectedEmail({ fullName: 'Asha Rao', signupUrl: 'https://tai.example/signup' })
  assert.ok(mail.html.includes('https://tai.example/signup'))
  assert.ok(mail.text.includes('https://tai.example/signup'))
})

test('scheduleInterviewSchema reads datetime-local as IST and rejects the past', () => {
  const id = '11111111-1111-4111-8111-111111111111'
  const ok = scheduleInterviewSchema.safeParse({
    id, interview_at: '2099-06-15T10:00', interviewer: 'Coach', mode: 'Room 4',
  })
  assert.ok(ok.success)
  if (ok.success) assert.equal(ok.data.interview_at.toISOString(), '2099-06-15T04:30:00.000Z')

  const past = scheduleInterviewSchema.safeParse({
    id, interview_at: '2001-01-01T10:00', interviewer: 'Coach', mode: 'Room 4',
  })
  assert.ok(!past.success)

  const missing = scheduleInterviewSchema.safeParse({ id, interview_at: '', interviewer: 'Coach', mode: 'Room 4' })
  assert.ok(!missing.success)
})
