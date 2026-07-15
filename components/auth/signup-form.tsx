'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Hash,
  Loader2,
  Lock,
  Mail,
  MapPin,
  Phone,
  User,
  UserCog,
  ChevronDown,
} from 'lucide-react'
import { requestSignup, type ActionState } from '@/actions/auth'
import { fieldValue } from '@/lib/actions/form-values'
import { SELF_SIGNUP_ROLES, roleLabel } from '@/lib/auth/roles'
import { useDebouncedValue } from '@/hooks/use-debounce'
import type { CampusRow } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PasswordMatch, PasswordStrength } from '@/components/auth/password-feedback'

const SELECT_CLASS =
  'h-11 w-full rounded-xl border border-neutral-200 dark:border-zinc-800 bg-transparent pl-10 pr-10 text-sm outline-none focus-visible:border-brand dark:focus-visible:border-brand focus-visible:ring-1 focus-visible:ring-brand/50 text-foreground dark:text-zinc-50 appearance-none'

export function SignupForm({ campuses }: { campuses: Pick<CampusRow, 'id' | 'name'>[] }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(requestSignup, {})
  const [showPw, setShowPw] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [pw, setPw] = useState('')
  const [confirm, setConfirm] = useState('')
  const debouncedPw = useDebouncedValue(pw)
  const debouncedConfirm = useDebouncedValue(confirm)

  // Track field values to gate the submit button (issue #32), mirroring the
  // login form (issue #22).
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
      <div className="w-full max-w-[460px] rounded-2xl bg-white/95 dark:bg-zinc-900/90 border border-success/20 dark:border-success/30 p-8 md:p-10 shadow-2xl text-center backdrop-blur-xl">
        <CheckCircle2 className="mx-auto size-12 text-success animate-pulse" />
        <h2 className="mt-4 font-display text-xl font-extrabold text-slate-900 dark:text-white">Request submitted</h2>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{state.message}</p>
        <Button asChild className="mt-6 w-full h-11 bg-brand hover:bg-brand/90 text-white font-semibold rounded-xl shadow-sm">
          <Link href="/login">Back to login</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="w-full max-w-[460px] rounded-2xl bg-white/95 dark:bg-zinc-900/90 border border-neutral-200/80 dark:border-zinc-800/80 p-8 md:p-10 shadow-2xl text-foreground dark:text-zinc-50 backdrop-blur-xl transition-all duration-300 hover:shadow-brand/5 dark:hover:shadow-brand/10 hover:border-brand/20 dark:hover:border-brand/30">
      
      {/* Header */}
      <div className="flex flex-col items-center mb-6">
        <Link href="/" className="flex items-center shrink-0 group focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none mb-3" aria-label="Teach AI For India home">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Teach_Ai_1_page-0001-removebg-preview-ZJzf3R1J38t7BLntCYEUuQMl2LbJdV.png"
            alt="Teach AI For India"
            width={180}
            height={60}
            className="object-contain dark:brightness-110"
            style={{ width: 'auto', height: '65px' }}
            priority
            loading="eager"
          />
        </Link>
        <h1 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">Create Account</h1>
        <p className="text-xs text-muted-foreground mt-1 text-center">Join the Teach AI For India team</p>
      </div>

      <form action={action} className="space-y-4" noValidate>
        {state.error && (
          <p role="alert" className="flex items-center gap-2 rounded-lg bg-error/10 px-3 py-2.5 text-sm text-error">
            <AlertCircle className="size-4 shrink-0" /> {state.error}
          </p>
        )}

        <Field label="Full Name" htmlFor="full_name" icon={<User className="size-4" />}>
          <Input
            id="full_name"
            name="full_name"
            required
            placeholder="Your full name"
            className="h-11 pl-10 bg-transparent border-neutral-200 dark:border-zinc-800 focus-visible:border-brand dark:focus-visible:border-brand text-foreground dark:text-zinc-50 rounded-xl placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-brand/50"
            defaultValue={fieldValue(state, 'full_name', '')}
            onChange={(e) => setFullName(e.target.value)}
          />
        </Field>

        <Field label="NIAT ID" htmlFor="niat_id" icon={<Hash className="size-4" />}>
          <Input
            id="niat_id"
            name="niat_id"
            required
            placeholder="Your NIAT student ID"
            className="h-11 pl-10 bg-transparent border-neutral-200 dark:border-zinc-800 focus-visible:border-brand dark:focus-visible:border-brand text-foreground dark:text-zinc-50 rounded-xl placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-brand/50"
            defaultValue={fieldValue(state, 'niat_id', '')}
            onChange={(e) => setNiatId(e.target.value)}
          />
        </Field>

        <Field label="Phone" htmlFor="phone" icon={<Phone className="size-4" />}>
          <Input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            required
            placeholder="+91 98765 43210"
            className="h-11 pl-10 bg-transparent border-neutral-200 dark:border-zinc-800 focus-visible:border-brand dark:focus-visible:border-brand text-foreground dark:text-zinc-50 rounded-xl placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-brand/50"
            defaultValue={fieldValue(state, 'phone', '')}
            onChange={(e) => setPhone(e.target.value)}
          />
        </Field>

        <Field label="Campus" htmlFor="campus_id" icon={<MapPin className="size-4" />} isSelect>
          <select
            id="campus_id"
            name="campus_id"
            required
            defaultValue={fieldValue(state, 'campus_id', '')}
            className={SELECT_CLASS}
            onChange={(e) => setCampusId(e.target.value)}
          >
            <option value="" disabled className="dark:bg-zinc-900">Select your campus</option>
            {campuses.map((c) => <option key={c.id} value={c.id} className="dark:bg-zinc-900">{c.name}</option>)}
          </select>
        </Field>

        <Field label="Role" htmlFor="requested_role" icon={<UserCog className="size-4" />} isSelect>
          <select id="requested_role" name="requested_role" required defaultValue={fieldValue(state, 'requested_role', 'volunteer')} className={SELECT_CLASS}>
            {SELF_SIGNUP_ROLES.map((r) => (
              <option key={r} value={r} className="dark:bg-zinc-900">
                {roleLabel(r)}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Email" htmlFor="email" icon={<Mail className="size-4" />}>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@example.com"
            className="h-11 pl-10 bg-transparent border-neutral-200 dark:border-zinc-800 focus-visible:border-brand dark:focus-visible:border-brand text-foreground dark:text-zinc-50 rounded-xl placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-brand/50"
            defaultValue={fieldValue(state, 'email', '')}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>

        <Field label="Password" htmlFor="password" icon={<Lock className="size-4" />}>
          <Input
            id="password"
            name="password"
            type={showPw ? 'text' : 'password'}
            autoComplete="new-password"
            required
            placeholder="Min. 8 characters"
            className="h-11 pl-10 pr-10 bg-transparent border-neutral-200 dark:border-zinc-800 focus-visible:border-brand dark:focus-visible:border-brand text-foreground dark:text-zinc-50 rounded-xl placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-brand/50"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
          />
          <PwToggle shown={showPw} onToggle={() => setShowPw((v) => !v)} />
        </Field>
        <PasswordStrength value={debouncedPw} />

        <Field label="Confirm Password" htmlFor="confirm" icon={<Lock className="size-4" />}>
          <Input
            id="confirm"
            name="confirm"
            type={showConfirm ? 'text' : 'password'}
            autoComplete="new-password"
            required
            placeholder="Re-enter password"
            className="h-11 pl-10 pr-10 bg-transparent border-neutral-200 dark:border-zinc-800 focus-visible:border-brand dark:focus-visible:border-brand text-foreground dark:text-zinc-50 rounded-xl placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-brand/50"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
          <PwToggle shown={showConfirm} onToggle={() => setShowConfirm((v) => !v)} />
        </Field>
        <PasswordMatch password={debouncedPw} confirm={debouncedConfirm} />

        <Button
          type="submit"
          disabled={!canSubmit}
          className="w-full h-11 bg-brand hover:bg-brand/90 text-white font-semibold rounded-xl transition-colors mt-4 shadow-sm"
        >
          {pending && <Loader2 className="size-4 animate-spin mr-2" />}
          Create Account
          {!pending && <ArrowRight className="size-4 ml-2" />}
        </Button>

        <p className="text-center text-xs text-muted-foreground mt-4">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-brand hover:underline">
            Login
          </Link>
        </p>
      </form>
    </div>
  )
}

function Field({
  label, htmlFor, icon, children, isSelect,
}: {
  label: string; htmlFor: string; icon: React.ReactNode; children: React.ReactNode; isSelect?: boolean
}) {
  return (
    <div className="space-y-1">
      <Label htmlFor={htmlFor} className="text-xs font-semibold text-slate-700 dark:text-zinc-300 ml-1">
        {label}
      </Label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/80 z-10">
          {icon}
        </span>
        {children}
        {isSelect && (
          <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/80 z-10" />
        )}
      </div>
    </div>
  )
}

function PwToggle({ shown, onToggle }: { shown: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      tabIndex={-1}
      aria-label={shown ? 'Hide password' : 'Show password'}
      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground z-10 p-0.5 rounded focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand"
    >
      {shown ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
    </button>
  )
}
