'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import {
  AlertCircle, ArrowRight, CheckCircle2, Hash, Loader2, Lock, Mail, MapPin, User, UserCog,
} from 'lucide-react'
import { PwToggle } from './pw-toggle'
import { requestSignup, type ActionState } from '@/actions/auth'
import { SELF_SIGNUP_ROLES, roleLabel } from '@/lib/auth/roles'
import type { CampusRow } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

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

      <Field label="Full Name" htmlFor="full_name" icon={<User className="size-4" />} error={state.errors?.full_name?.[0]}>
        <Input
          id="full_name"
          name="full_name"
          required
          placeholder="Your full name"
          className="h-10 pl-9"
          defaultValue={state.values?.full_name ?? ''}
          aria-invalid={Boolean(state.errors?.full_name)}
        />
      </Field>

      <Field label="NIAT ID" htmlFor="niat_id" icon={<Hash className="size-4" />} error={state.errors?.niat_id?.[0]}>
        <Input
          id="niat_id"
          name="niat_id"
          required
          placeholder="Your NIAT student ID"
          className="h-10 pl-9"
          defaultValue={state.values?.niat_id ?? ''}
          aria-invalid={Boolean(state.errors?.niat_id)}
        />
      </Field>

      <Field label="Campus" htmlFor="campus_id" icon={<MapPin className="size-4" />} error={state.errors?.campus_id?.[0]}>
        <select
          id="campus_id"
          name="campus_id"
          required
          defaultValue={state.values?.campus_id ?? ''}
          className={cn(
            'border-input h-10 w-full rounded-md border bg-transparent pl-9 pr-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] dark:bg-input/30',
            state.errors?.campus_id && 'border-error focus-visible:border-error focus-visible:ring-error/20 dark:focus-visible:ring-error/40'
          )}
        >
          <option value="" disabled>Select your campus</option>
          {campuses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </Field>

      <Field label="Role" htmlFor="requested_role" icon={<UserCog className="size-4" />} error={state.errors?.requested_role?.[0]}>
        <select
          id="requested_role"
          name="requested_role"
          required
          defaultValue={state.values?.requested_role ?? 'volunteer'}
          className={cn(
            'border-input h-10 w-full rounded-md border bg-transparent pl-9 pr-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] dark:bg-input/30',
            state.errors?.requested_role && 'border-error focus-visible:border-error focus-visible:ring-error/20 dark:focus-visible:ring-error/40'
          )}
        >
          {SELF_SIGNUP_ROLES.map((r) => <option key={r} value={r}>{roleLabel(r)}</option>)}
        </select>
      </Field>

      <Field label="Email" htmlFor="email" icon={<Mail className="size-4" />} error={state.errors?.email?.[0]}>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
          className="h-10 pl-9"
          defaultValue={state.values?.email ?? ''}
          aria-invalid={Boolean(state.errors?.email)}
        />
      </Field>

      <Field label="Password" htmlFor="password" icon={<Lock className="size-4" />} error={state.errors?.password?.[0]}>
        <Input
          id="password"
          name="password"
          type={showPw ? 'text' : 'password'}
          autoComplete="new-password"
          required
          placeholder="Min. 8 characters"
          className="h-10 pl-9 pr-10"
          aria-invalid={Boolean(state.errors?.password)}
        />
        <PwToggle shown={showPw} onToggle={() => setShowPw((v) => !v)} />
      </Field>

      <Field label="Confirm Password" htmlFor="confirm" icon={<Lock className="size-4" />} error={state.errors?.confirm?.[0]}>
        <Input
          id="confirm"
          name="confirm"
          type={showConfirm ? 'text' : 'password'}
          autoComplete="new-password"
          required
          placeholder="Re-enter password"
          className="h-10 pl-9 pr-10"
          aria-invalid={Boolean(state.errors?.confirm)}
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
  label, htmlFor, icon, children, error,
}: {
  label: string; htmlFor: string; icon: React.ReactNode; children: React.ReactNode; error?: string
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{icon}</span>
        {children}
      </div>
      {error && <p className="text-xs text-error font-medium">{error}</p>}
    </div>
  )
}


