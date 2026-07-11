'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { AlertCircle, CheckCircle2, Info, Loader2 } from 'lucide-react'
import { requestPasswordReset, type ActionState } from '@/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function ForgotPasswordForm({ notice }: { notice?: string }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(requestPasswordReset, {})

  if (state.ok) {
    return (
      <p className="flex items-start gap-2 rounded-lg bg-success/10 px-3 py-3 text-sm text-success">
        <CheckCircle2 className="size-4 shrink-0" /> {state.message}
      </p>
    )
  }

  return (
    <form action={action} className="space-y-4" noValidate>
      {notice && (
        <p className="flex items-center gap-2 rounded-lg bg-brand/10 px-3 py-2 text-sm text-muted-foreground">
          <Info className="size-4 shrink-0 text-brand" /> {notice}
        </p>
      )}
      {state.error && (
        <p role="alert" className="flex items-start gap-2 rounded-lg bg-error/10 px-3 py-2 text-sm text-error">
          <AlertCircle className="size-4 shrink-0 mt-0.5" />
          <span>
            {state.error === "This email isn't registered. Please create an account first." ? (
              <>
                This email isn't registered. Please{' '}
                <Link href="/signup" className="underline font-semibold hover:text-error/80">
                  create an account
                </Link>{' '}
                first.
              </>
            ) : (
              state.error
            )}
          </span>
        </p>
      )}
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required placeholder="you@teachaiforindia.org" />
      </div>
      <Button type="submit" className="w-full" disabled={pending}>
        {pending && <Loader2 className="size-4 animate-spin" />} Send reset link
      </Button>
    </form>
  )
}
