'use client'

import { useActionState, useState, useRef, type KeyboardEvent } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { AlertCircle, Loader2, User, UserPlus, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { signIn, type ActionState } from '@/actions/auth'
import { fieldValue } from '@/lib/actions/form-values'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type Step = 'form' | 'google-email' | 'google-password'

export function LoginForm({ next, initialError }: { next?: string; initialError?: string }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(signIn, {
    error: initialError,
  })
  const formRef = useRef<HTMLFormElement>(null)
  const emailInputRef = useRef<HTMLInputElement>(null)
  const [step, setStep] = useState<Step>('form')
  const [emailVal, setEmailVal] = useState('')
  const [passwordVal, setPasswordVal] = useState('')
  const [customEmailError, setCustomEmailError] = useState('')
  const [customPassError, setCustomPassError] = useState('')
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

  const handleGoogleStart = () => {
    setEmailVal('')
    setPasswordVal('')
    setCustomEmailError('')
    setCustomPassError('')
    setStep('google-email')

    // Focus and programmatically trigger the browser's native email autocomplete selection
    setTimeout(() => {
      if (emailInputRef.current) {
        emailInputRef.current.focus()
        try {
          emailInputRef.current.showPicker()
        } catch (e) {
          console.warn('showPicker API fallback:', e)
        }
      }
    }, 100)
  }

  const handleEmailInputFocus = () => {
    try {
      emailInputRef.current?.showPicker()
    } catch (e) {
      // ignore
    }
  }

  const handleNextEmail = () => {
    if (!emailVal.trim()) {
      setCustomEmailError('Enter an email or phone number')
      return
    }
    setCustomEmailError('')
    setStep('google-password')
  }

  const handleNextPassword = () => {
    if (!passwordVal.trim()) {
      setCustomPassError('Enter your password')
      return
    }
    setCustomPassError('')
    // Submit the form programmatically to authenticate with Supabase in the background
    setTimeout(() => {
      formRef.current?.requestSubmit()
    }, 50)
  }

  const GoogleLogo = () => (
    <svg viewBox="0 0 24 24" width="24" height="24" className="mx-auto" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
    </svg>
  )

  // ── STEP 1: Standard Login Form (Glassmorphic Theme) ──
  if (step === 'form') {
    return (
      <div className="w-full max-w-[420px] rounded-2xl bg-white/95 dark:bg-zinc-900/90 border border-neutral-200/80 dark:border-zinc-800/80 p-8 md:p-10 shadow-2xl text-foreground dark:text-zinc-50 backdrop-blur-xl transition-all duration-300 hover:shadow-brand/5 dark:hover:shadow-brand/10 hover:border-brand/20 dark:hover:border-brand/30">
        <form ref={formRef} action={action} className="space-y-4" noValidate>
          {next && <input type="hidden" name="next" value={next} />}

          {/* Logo / Header */}
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
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">Welcome back</h1>
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
                className="h-12 pl-11 bg-transparent border-neutral-200 dark:border-zinc-800 focus-visible:border-brand dark:focus-visible:border-brand text-foreground dark:text-zinc-50 rounded-xl placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-brand/50"
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
                className="h-12 pl-11 pr-12 bg-transparent border-neutral-200 dark:border-zinc-800 focus-visible:border-brand dark:focus-visible:border-brand text-foreground dark:text-zinc-50 rounded-xl placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-brand/50"
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

          {/* Google Sign In Button */}
          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleStart}
            className="w-full h-12 border border-neutral-200 dark:border-zinc-800 hover:bg-neutral-50 dark:hover:bg-zinc-800/50 bg-transparent text-foreground dark:text-zinc-200 font-semibold rounded-xl flex items-center justify-center transition-colors mt-3"
          >
            <svg className="mr-2 h-4.5 w-4.5" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
              <path fill="#ea4335" d="M124.7 347.7c-5-15.5-7.7-32-7.7-49.1s2.7-33.6 7.7-49.1L32.6 150.3C11.8 191.6 0 238.9 0 298.6c0 59.6 11.8 107 32.6 148.3l92.1-71.2z"></path>
              <path fill="#4285f4" d="M293.3 118.5c38 0 72.1 13 98.9 38.6l73.6-73.6C420.5 35.5 362.4 12 293.3 12 181.6 12 85.2 76.2 32.6 170.3l92.1 71.2c22-66.2 83.9-123 168.6-123z"></path>
              <path fill="#fbbc05" d="M481.3 248.4c0-16.7-1.5-32.8-4.3-48.4H293.3v91.3h105.3c-4.5 24.3-18.3 44.9-38.9 58.7l60.7 47c35.6-32.8 56.2-81 56.2-148.6z"></path>
              <path fill="#34a853" d="M293.3 481.5c62.1 0 114.2-20.6 152.2-56l-60.7-47c-16.8 11.3-38.3 18-91.5 18-84.7 0-146.6-56.8-168.6-123l-92.1 71.2c52.6 94.1 149 158.3 260.7 158.3z"></path>
            </svg>
            Continue with Google
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

  // ── STEP 2 & 3: Mock Google 2-Column Account Selection Layout (Dark Theme) ──
  return (
    <div className="w-full max-w-[850px] rounded-[28px] bg-[#131314] border border-[#2f3030] p-10 md:p-12 shadow-2xl text-white font-sans">
      <form ref={formRef} action={action} noValidate>
        {next && <input type="hidden" name="next" value={next} />}
        <input type="hidden" name="email" value={emailVal} />
        <input type="hidden" name="password" value={passwordVal} />

        <div className="grid md:grid-cols-[1.1fr_0.9fr] gap-10">
          {/* Left Column */}
          <div className="flex flex-col justify-between">
            <div>
              {/* Header Google Logo & Text */}
              <div className="flex items-center gap-2">
                <GoogleLogo />
                <span className="text-sm font-medium text-[#e3e3e3]">Sign in with Google</span>
              </div>
                    {/* Main Heading & Subheading */}
              {step === 'google-email' ? (
                <>
                  <h2 className="text-[36px] font-normal leading-[44px] text-white mt-12 mb-4">Choose an account</h2>
                  <p className="text-base text-[#c4c7c5]">
                    to continue to <span className="text-[#a8c7fa] font-medium hover:underline cursor-pointer">teachaiforindia.org</span>
                  </p>
                </>
              ) : (
                <>
                  <h2 className="text-[36px] font-normal leading-[44px] text-white mt-12 mb-4">Welcome</h2>
                  {/* Selected Email Pill inside Left Column */}
                  <div
                    onClick={() => setStep('google-email')}
                    className="inline-flex items-center gap-1.5 mt-4 bg-[#202124] hover:bg-[#2d2e30] border border-[#2f3030] rounded-full px-3 py-1 text-xs text-[#c4c7c5] font-semibold cursor-pointer max-w-full"
                  >
                    <div className="w-4 h-4 rounded-full bg-zinc-600 text-white flex items-center justify-center">
                      <User size={10} />
                    </div>
                    <span className="truncate max-w-[150px]">{emailVal}</span>
                    <svg className="w-3 h-3 fill-current ml-0.5" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5H7z" /></svg>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="flex flex-col justify-between pt-1">
            {/* STEP 2: Email input & Native browser saved credential triggers */}
            {step === 'google-email' && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="relative">
                    <input
                      ref={emailInputRef}
                      type="email"
                      name="email-picker"
                      autoComplete="email"
                      onFocus={handleEmailInputFocus}
                      placeholder="Email or phone"
                      value={emailVal}
                      onChange={(e) => setEmailVal(e.target.value)}
                      className="w-full h-13 bg-transparent border border-[#8e918f] rounded-lg px-3.5 py-2.5 text-sm focus:border-[#a8c7fa] focus:ring-1 focus:ring-[#a8c7fa] outline-none transition-all placeholder:text-[#c4c7c5] text-white"
                    />
                    {customEmailError && (
                      <p className="text-xs text-[#f2b8b5] mt-1.5 flex items-center gap-1 font-medium">
                        <AlertCircle size={12} /> {customEmailError}
                      </p>
                    )}
                  </div>

                  <p className="text-xs text-[#c4c7c5] leading-relaxed">
                    Not your computer? Use a private browsing window to sign in.{' '}
                    <span className="text-[#a8c7fa] font-medium hover:underline cursor-pointer">Learn more</span>
                  </p>
                </div>

                {/* Privacy Terms Notice */}
                <p className="text-[11px] text-[#c4c7c5] leading-relaxed mt-6">
                  Before using this app, you can review Teach AI for India's{' '}
                  <span className="text-[#a8c7fa] hover:underline cursor-pointer">Privacy Policy</span> and{' '}
                  <span className="text-[#a8c7fa] hover:underline cursor-pointer">Terms of Service</span>.
                </p>

                {/* Nav buttons */}
                <div className="flex justify-between items-center mt-12">
                  <button
                    type="button"
                    onClick={() => setStep('form')}
                    className="text-sm text-[#a8c7fa] hover:text-[#c2e7ff] font-semibold py-2"
                  >
                    Back to Login
                  </button>
                  <button
                    type="button"
                    onClick={handleNextEmail}
                    className="bg-[#a8c7fa] text-[#001d35] hover:bg-[#c2e7ff] text-sm font-semibold py-2.5 px-6 rounded-full transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Password input */}
            {step === 'google-password' && (
              <div className="space-y-6">
                {state.error && (
                  <p role="alert" className="flex items-center gap-2 rounded-lg bg-[#8c1d18]/20 px-3 py-2 text-sm text-[#f2b8b5]">
                    <AlertCircle className="size-4 shrink-0" /> {state.error}
                  </p>
                )}

                <div className="space-y-4">
                  <div className="relative">
                    <input
                      type="password"
                      placeholder="Enter your password"
                      value={passwordVal}
                      onChange={(e) => setPasswordVal(e.target.value)}
                      className="w-full h-13 bg-transparent border border-[#8e918f] rounded-lg px-3.5 py-2.5 text-sm focus:border-[#a8c7fa] focus:ring-1 focus:ring-[#a8c7fa] outline-none transition-all placeholder:text-[#c4c7c5] text-white"
                    />
                    {customPassError && (
                      <p className="text-xs text-[#f2b8b5] mt-1.5 flex items-center gap-1 font-medium">
                        <AlertCircle size={12} /> {customPassError}
                      </p>
                    )}
                  </div>
                </div>

                {/* Privacy Terms Notice */}
                <p className="text-[11px] text-[#c4c7c5] leading-relaxed mt-6">
                  Before using this app, you can review Teach AI for India's{' '}
                  <span className="text-[#a8c7fa] hover:underline cursor-pointer">Privacy Policy</span> and{' '}
                  <span className="text-[#a8c7fa] hover:underline cursor-pointer">Terms of Service</span>.
                </p>

                {/* Nav buttons */}
                <div className="flex justify-between items-center mt-12">
                  <button
                    type="button"
                    onClick={() => setStep('google-email')}
                    className="text-sm text-[#a8c7fa] hover:text-[#c2e7ff] font-semibold py-2"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={handleNextPassword}
                    className="bg-[#a8c7fa] text-[#001d35] hover:bg-[#c2e7ff] text-sm font-semibold py-2.5 px-6 rounded-full transition-colors flex items-center gap-2"
                  >
                    {pending && <Loader2 className="size-4 animate-spin text-[#001d35]" />}
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        {/* Footer bar */}
        <div className="flex justify-between items-center mt-12 text-xs text-[#c4c7c5] pt-4 border-t border-[#2f3030]/30">
          <div className="flex items-center gap-1 cursor-pointer hover:text-white">
            <span>English (United States)</span>
            <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5H7z" /></svg>
          </div>
          <div className="flex gap-4">
            <span className="hover:text-white cursor-pointer">Help</span>
            <span className="hover:text-white cursor-pointer">Privacy</span>
            <span className="hover:text-white cursor-pointer">Terms</span>
          </div>
        </div>
      </form>
    </div>
  )
}
