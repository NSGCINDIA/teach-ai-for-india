'use client'

import { useActionState, useState } from 'react'
import { AlertCircle, Loader2 } from 'lucide-react'
import { updatePassword, type ActionState } from '@/actions/auth'
import { useDebouncedValue } from '@/hooks/use-debounce'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
<<<<<<< HEAD
import { PwToggle } from './pw-toggle'

export function SetPasswordForm({ cta = 'Update password' }: { cta?: string }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(updatePassword, {})
  const [showPw, setShowPw] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
=======
import { PasswordMatch, PasswordStrength } from '@/components/auth/password-feedback'

export function SetPasswordForm({ cta = 'Update password' }: { cta?: string }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(updatePassword, {})
  const [pw, setPw] = useState('')
  const [confirm, setConfirm] = useState('')
  const debouncedPw = useDebouncedValue(pw)
  const debouncedConfirm = useDebouncedValue(confirm)
>>>>>>> upstream/main

  return (
    <form action={action} className="space-y-4" noValidate>
      {state.error && (
        <p role="alert" className="flex items-center gap-2 rounded-lg bg-error/10 px-3 py-2 text-sm text-error">
          <AlertCircle className="size-4 shrink-0" /> {state.error}
        </p>
      )}
      <div className="space-y-1.5">
        <Label htmlFor="password">New password</Label>
<<<<<<< HEAD
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPw ? 'text' : 'password'}
            autoComplete="new-password"
            required
            className="pr-10"
          />
          <PwToggle shown={showPw} onToggle={() => setShowPw((v) => !v)} />
        </div>
        <p className="text-xs text-muted-foreground">At least 8 characters, with a letter and a number.</p>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="confirm">Confirm password</Label>
        <div className="relative">
          <Input
            id="confirm"
            name="confirm"
            type={showConfirm ? 'text' : 'password'}
            autoComplete="new-password"
            required
            className="pr-10"
          />
          <PwToggle shown={showConfirm} onToggle={() => setShowConfirm((v) => !v)} />
        </div>
=======
        <Input
          id="password" name="password" type="password" autoComplete="new-password" required
          value={pw} onChange={(e) => setPw(e.target.value)}
        />
        {debouncedPw ? (
          <PasswordStrength value={debouncedPw} />
        ) : (
          <p className="text-xs text-muted-foreground">At least 8 characters, with a letter and a number.</p>
        )}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="confirm">Confirm password</Label>
        <Input
          id="confirm" name="confirm" type="password" autoComplete="new-password" required
          value={confirm} onChange={(e) => setConfirm(e.target.value)}
        />
        <PasswordMatch password={debouncedPw} confirm={debouncedConfirm} />
>>>>>>> upstream/main
      </div>
      <Button type="submit" className="w-full" disabled={pending}>
        {pending && <Loader2 className="size-4 animate-spin" />} {cta}
      </Button>
    </form>
  )
}
