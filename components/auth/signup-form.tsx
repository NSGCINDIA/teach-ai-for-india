'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import {
  AlertCircle, ArrowRight, CheckCircle2, Hash, Loader2, Lock, Mail, MapPin, Phone, User, UserCog,
} from 'lucide-react'
import { requestSignup, type ActionState } from '@/actions/auth'
import { SELF_SIGNUP_ROLES, roleLabel } from '@/lib/auth/roles'
import { useDebouncedValue } from '@/hooks/use-debounce'
import type { CampusRow } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PwToggle } from '@/components/auth/pw-toggle'
import { PasswordMatch, PasswordStrength } from '@/components/auth/password-feedback'

const SELECT_CLASS =
  'border-input h-10 w-full rounded-md border bg-transparent pl-9 pr-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] dark:bg-input/30'

export function SignupForm({ campuses }: { campuses: Pick<CampusRow, 'id' | 'name'>[] }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(requestSignup, {})
  const [showPw, setShowPw] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [pw, setPw] = useState('')
  const [confirm, setConfirm] = useState('')
  const debouncedPw = useDebouncedValue(pw)
  const debouncedConfirm = useDebouncedValue(confirm)

  // Track field values to gate the submit button (issue #32), mirroring the
  // login form (issue #22). Inputs stay uncontrolled so browser/password-manager
  // autofill keeps working — we only read values via onChange, which fires on
  // autofill too. `requested_role` is omitted: it defaults to a valid value.
  const [fullName, setFullName] = useState('')
  const [niatId, setNiatId] = useState('')
  const [phone, setPhone] = useState('')
  const [campusId, setCampusId] = useState('')
  const [email, setEmail] = useState('')

  const canSubmit =
    fullName.trim().length > 0 &&
    niatId.trim().length > 0 &&
    phone.trim().length > 0 &&
    campusId.length > 0 &&
    email.trim().length > 0 &&
    pw.length > 0 &&
    confirm.length > 0 &&
    pw === confirm &&
    !pending

  if (state.ok) {
    return (
      <div className="rounded-xl border border-success/30 bg-success/5 p-6 text-center">
        <CheckCircle2 className="mx-auto size-10 text-success" />
        <h2 className="mt-3 font-display text-lg font-semibold">Request submitted</h2>
        <p className="mt-1 text-sm text-muted-foreground">{state.message}</p>
        <Link href="/login" className="mt-4 inline-block text-sm font-medium text-brand-orange hover:underline">
          Back to login
        </Link>
      </div>
    )
  }

  return (
    <form action={action} className="space-y-4" noValidate>
      {state.error && (
        <p role="alert" className="flex items-center gap-2 rounded-lg bg-error/10 px-3 py-2 text-sm text-error">
          <AlertCircle className="size-4 shrink-0" /> {state.error}
        </p>
      )}

      <Field label="Full Name" htmlFor="full_name" icon={<User className="size-4" />}>
        <Input id="full_name" name="full_name" required placeholder="Your full name" className="h-10 pl-9" onChange={(e) => setFullName(e.target.value)} />
      </Field>

      <Field label="NIAT ID" htmlFor="niat_id" icon={<Hash className="size-4" />}>
        <Input id="niat_id" name="niat_id" required placeholder="Your NIAT student ID" className="h-10 pl-9" onChange={(e) => setNiatId(e.target.value)} />
      </Field>

      <Field label="Phone" htmlFor="phone" icon={<Phone className="size-4" />}>
        <Input id="phone" name="phone" type="tel" autoComplete="tel" required placeholder="+91 98765 43210" className="h-10 pl-9" onChange={(e) => setPhone(e.target.value)} />
      </Field>

      <Field label="Campus" htmlFor="campus_id" icon={<MapPin className="size-4" />}>
        <select id="campus_id" name="campus_id" required defaultValue="" className={SELECT_CLASS} onChange={(e) => setCampusId(e.target.value)}>
          <option value="" disabled>Select your campus</option>
          {campuses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </Field>

      <Field label="Role" htmlFor="requested_role" icon={<UserCog className="size-4" />}>
        <select id="requested_role" name="requested_role" required defaultValue="volunteer" className={SELECT_CLASS}>
          {SELF_SIGNUP_ROLES.map((r) => <option key={r} value={r}>{roleLabel(r)}</option>)}
        </select>
      </Field>

      <Field label="Email" htmlFor="email" icon={<Mail className="size-4" />}>
        <Input id="email" name="email" type="email" autoComplete="email" required placeholder="you@example.com" className="h-10 pl-9" onChange={(e) => setEmail(e.target.value)} />
      </Field>

      <Field label="Password" htmlFor="password" icon={<Lock className="size-4" />}>
        <Input
          id="password" name="password" type={showPw ? 'text' : 'password'} autoComplete="new-password"
          required placeholder="Min. 8 characters" className="h-10 pl-9 pr-10"
          value={pw} onChange={(e) => setPw(e.target.value)}
        />
        <PwToggle shown={showPw} onToggle={() => setShowPw((v) => !v)} />
      </Field>
      <PasswordStrength value={debouncedPw} />

      <Field label="Confirm Password" htmlFor="confirm" icon={<Lock className="size-4" />}>
        <Input
          id="confirm" name="confirm" type={showConfirm ? 'text' : 'password'} autoComplete="new-password"
          required placeholder="Re-enter password" className="h-10 pl-9 pr-10"
          value={confirm} onChange={(e) => setConfirm(e.target.value)}
        />
        <PwToggle shown={showConfirm} onToggle={() => setShowConfirm((v) => !v)} />
      </Field>
      <PasswordMatch password={debouncedPw} confirm={debouncedConfirm} />

      <Button type="submit" disabled={!canSubmit} className="h-11 w-full bg-brand-orange text-white hover:bg-brand-orange/90">
        {pending ? <Loader2 className="size-4 animate-spin" /> : null}
        Create Account
        {!pending && <ArrowRight className="size-4" />}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-brand-orange hover:underline">Login</Link>
      </p>
    </form>
  )
}

function Field({
  label, htmlFor, icon, children,
}: {
  label: string; htmlFor: string; icon: React.ReactNode; children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{icon}</span>
        {children}
      </div>
    </div>
  )
}
