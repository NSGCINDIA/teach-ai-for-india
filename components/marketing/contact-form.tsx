'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { CheckCircle2, Loader2, AlertCircle, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { submitContactMessage } from '@/app/(public)/actions'

const formSchema = z.object({
  name: z.string().trim().min(2, 'Please enter your name.').max(120),
  email: z.string().trim().email('Please enter a valid email address.').max(160),
  subject: z.string().trim().max(160).optional(),
  message: z.string().trim().min(10, 'Please write a little more (at least 10 characters).').max(4000),
})

type FormValues = z.infer<typeof formSchema>

/** Contact form — validated client-side, persisted via server action. */
export function ContactForm() {
  const [submitted, setSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '', email: '', subject: '', message: '' },
  })

  async function onSubmit(values: FormValues) {
    const result = await submitContactMessage({ ...values, subject: values.subject || '' })
    if (result.ok) {
      setSubmitted(true)
      reset()
      toast.success('Message sent — we’ll be in touch soon!')
    } else {
      toast.error(result.error)
    }
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-success/30 bg-success/5 p-8 text-center shadow-soft-lg" role="status">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-success/10 text-success shadow-soft">
          <CheckCircle2 className="size-7 animate-bounce" aria-hidden />
        </span>
        <h2 className="mt-5 font-display text-2xl font-bold tracking-tight">Message sent</h2>
        <p className="mx-auto mt-2 max-w-md text-muted-foreground text-sm leading-relaxed">
          Thanks for reaching out. We read every message and our team will get back to you via email.
        </p>
        <Button 
          className="mt-6 shadow-soft hover:shadow-soft-lg transition-all" 
          variant="outline" 
          onClick={() => setSubmitted(false)}
        >
          Send another message
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-semibold">
            Name <span className="text-error">*</span>
          </Label>
          <div className="relative">
            <Input
              id="name"
              autoComplete="name"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? 'name-error' : undefined}
              className={`transition-all duration-200 border bg-background/50 hover:bg-background focus:bg-background ${
                errors.name ? 'border-error/50 focus-visible:ring-error/20' : 'border-border focus-visible:ring-brand/20'
              }`}
              placeholder="Your name"
              {...register('name')}
            />
          </div>
          {errors.name && (
            <p id="name-error" className="flex items-center gap-1.5 text-xs text-error font-medium mt-1">
              <AlertCircle className="size-3.5 shrink-0" />
              {errors.name.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="contact-email" className="text-sm font-semibold">
            Email <span className="text-error">*</span>
          </Label>
          <div className="relative">
            <Input
              id="contact-email"
              type="email"
              autoComplete="email"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'contact-email-error' : undefined}
              className={`transition-all duration-200 border bg-background/50 hover:bg-background focus:bg-background ${
                errors.email ? 'border-error/50 focus-visible:ring-error/20' : 'border-border focus-visible:ring-brand/20'
              }`}
              placeholder="you@example.com"
              {...register('email')}
            />
          </div>
          {errors.email && (
            <p id="contact-email-error" className="flex items-center gap-1.5 text-xs text-error font-medium mt-1">
              <AlertCircle className="size-3.5 shrink-0" />
              {errors.email.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="subject" className="text-sm font-semibold">Subject</Label>
        <Input 
          id="subject" 
          className="border-border bg-background/50 hover:bg-background focus:bg-background transition-all duration-200 focus-visible:ring-brand/20"
          placeholder="How can we help?"
          {...register('subject')} 
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="message" className="text-sm font-semibold">
          Message <span className="text-error">*</span>
        </Label>
        <Textarea
          id="message"
          rows={5}
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? 'message-error' : undefined}
          className={`transition-all duration-200 border bg-background/50 hover:bg-background focus:bg-background ${
            errors.message ? 'border-error/50 focus-visible:ring-error/20' : 'border-border focus-visible:ring-brand/20'
          }`}
          placeholder="Write your message here..."
          {...register('message')}
        />
        {errors.message && (
          <p id="message-error" className="flex items-center gap-1.5 text-xs text-error font-medium mt-1">
            <AlertCircle className="size-3.5 shrink-0" />
            {errors.message.message}
          </p>
        )}
      </div>

      <Button 
        type="submit" 
        size="lg" 
        disabled={isSubmitting} 
        className="w-full bg-brand text-white hover:bg-brand/90 shadow-soft hover:shadow-soft-lg transition-all gap-2 duration-200 sm:w-auto"
      >
        {isSubmitting ? (
          <Loader2 className="size-4 animate-spin" aria-hidden />
        ) : (
          <Send className="size-4" aria-hidden />
        )}
        {isSubmitting ? 'Sending…' : 'Send message'}
      </Button>
    </form>
  )
}
