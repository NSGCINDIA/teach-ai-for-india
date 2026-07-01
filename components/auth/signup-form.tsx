'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import {
  AlertCircle, ArrowRight, CheckCircle2, Eye, EyeOff, Hash, Loader2, Lock, Mail, MapPin, User,
} from 'lucide-react'
import { requestSignup, type ActionState } from '@/actions/auth'
import type { CampusRow } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const SELECT_CLASS =
  'border-input h-10 w-full rounded-md border bg-transparent pl-9 pr-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] dark:bg-input/30'

export function SignupForm({ campuses }: { campuses: Pick<CampusRow, 'id' | 'name'>[] }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(requestSignup, {})
  const [showPw, setShowPw] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

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
        <Input id="full_name" name="full_name" required placeholder="Your full name" className="h-10 pl-9" />
      </Field>

      <Field label="NIAT ID" htmlFor="niat_id" icon={<Hash className="size-4" />}>
        <Input id="niat_id" name="niat_id" required placeholder="Your NIAT student ID" className="h-10 pl-9" />
      </Field>

      <Field label="Campus" htmlFor="campus_id" icon={<MapPin className="size-4" />}>
        <select id="campus_id" name="campus_id" required defaultValue="" className={SELECT_CLASS}>
          <option value="" disabled>Select your campus</option>
          {campuses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </Field>

      <Field label="Email" htmlFor="email" icon={<Mail className="size-4" />}>
        <Input id="email" name="email" type="email" autoComplete="email" required placeholder="you@example.com" className="h-10 pl-9" />
      </Field>

      <Field label="Password" htmlFor="password" icon={<Lock className="size-4" />}>
        <Input
          id="password" name="password" type={showPw ? 'text' : 'password'} autoComplete="new-password"
          required placeholder="Min. 8 characters" className="h-10 pl-9 pr-10"
        />
        <PwToggle shown={showPw} onToggle={() => setShowPw((v) => !v)} />
      </Field>

      <Field label="Confirm Password" htmlFor="confirm" icon={<Lock className="size-4" />}>
        <Input
          id="confirm" name="confirm" type={showConfirm ? 'text' : 'password'} autoComplete="new-password"
          required placeholder="Re-enter password" className="h-10 pl-9 pr-10"
        />
        <PwToggle shown={showConfirm} onToggle={() => setShowConfirm((v) => !v)} />
      </Field>

      <Button type="submit" disabled={pending} className="h-11 w-full bg-brand-orange text-white hover:bg-brand-orange/90">
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

function PwToggle({ shown, onToggle }: { shown: boolean; onToggle: () => void }) {
  return (
    <button
      type="button" onClick={onToggle} tabIndex={-1}
      aria-label={shown ? 'Hide password' : 'Show password'}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
    >
      {shown ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
    </button>
  )
}
