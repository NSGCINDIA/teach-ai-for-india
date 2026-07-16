'use client'

import { useActionState, useState, type KeyboardEvent } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { AlertCircle, Loader2, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { signIn, type ActionState } from '@/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function LoginForm({ next, initialError }: { next?: string; initialError?: string }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(signIn, {
    error: initialError,
  })
  const [emailVal, setEmailVal] = useState('')
  const [passwordVal, setPasswordVal] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Track field values to gate the submit button (issue #22).
  const canSubmit = emailVal.trim().length > 0 && passwordVal.length > 0 && !pending

  // Enter on email moves to the password field instead of submitting (issue #22).
  function handleEmailKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      document.getElementById('password')?.focus()
    }
  }

  return (
    <div className="w-full max-w-[420px] rounded-2xl bg-white/95 border border-neutral-200/80 p-8 md:p-10 shadow-2xl text-foreground backdrop-blur-xl transition-all duration-300 hover:shadow-brand/5 hover:border-brand/20">
      <form action={action} className="space-y-4" noValidate>
        {next && <input type="hidden" name="next" value={next} />}

        {/* Logo / Header */}
        <div className="flex flex-col items-center mb-6">
          <Link href="/" className="flex items-center shrink-0 group focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none mb-3" aria-label="Teach AI For India home">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Teach_Ai_1_page-0001-removebg-preview-ZJzf3R1J38t7BLntCYEUuQMl2LbJdV.png"
              alt="Teach AI For India"
              width={180}
              height={60}
              className="object-contain"
              style={{ width: 'auto', height: '65px' }}
              priority
              loading="eager"
            />
          </Link>
          <h1 className="text-xl font-extrabold tracking-tight text-slate-900">Welcome back</h1>
          <p className="text-xs text-muted-foreground mt-1">Sign in to your volunteer portal</p>
        </div>

        {state.error && (
          <p role="alert" className="flex items-center gap-2 rounded-lg bg-error/10 px-3 py-2 text-sm text-error">
            <AlertCircle className="size-4 shrink-0" /> {state.error}
          </p>
        )}

        {/* Email Input */}
        <div className="space-y-1.5">
          <Label htmlFor="email" className="sr-only">Email</Label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4.5 text-muted-foreground pointer-events-none" />
            <Input
              id="email"
              name="email"
              type="email"
              value={emailVal}
              onChange={(e) => setEmailVal(e.target.value)}
              onKeyDown={handleEmailKeyDown}
              autoComplete="email"
              required
              placeholder="Email"
              className="h-12 pl-11 bg-transparent border-neutral-200 focus-visible:border-brand text-foreground rounded-xl placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-brand/50"
            />
          </div>
        </div>

        {/* Password Input */}
        <div className="space-y-1.5">
          <Label htmlFor="password" className="sr-only">Password</Label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-4.5 text-muted-foreground pointer-events-none" />
            <Input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={passwordVal}
              onChange={(e) => setPasswordVal(e.target.value)}
              autoComplete="current-password"
              required
              placeholder="Password"
              className="h-12 pl-11 pr-12 bg-transparent border-neutral-200 focus-visible:border-brand text-foreground rounded-xl placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-brand/50"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-muted-foreground hover:text-foreground outline-none focus-visible:ring-2 focus-visible:ring-brand rounded-md p-1"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="size-4.5" /> : <Eye className="size-4.5" />}
            </button>
          </div>
          <div className="flex justify-end">
            <Link href="/forgot-password" className="text-xs text-brand hover:text-brand/80 hover:underline font-semibold mt-1">
              Forgot?
            </Link>
          </div>
        </div>

        {/* Login Button */}
        <Button
          type="submit"
          className="w-full h-12 bg-brand hover:bg-brand/90 text-white font-semibold rounded-xl transition-colors mt-2 shadow-sm"
          disabled={!canSubmit}
        >
          {pending && <Loader2 className="size-4 animate-spin" />}
          Login
        </Button>

        {/* Footer link */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          Want to volunteer?{' '}
          <Link href="/join" className="font-semibold text-brand hover:underline">
            Apply to join
          </Link>
        </div>
      </form>
    </div>
  )
}
