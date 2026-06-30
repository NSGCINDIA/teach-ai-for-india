'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { CheckCircle2, Loader2 } from 'lucide-react'
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
      <div className="rounded-2xl border border-success/30 bg-success/5 p-8 text-center" role="status">
        <span className="mx-auto grid size-12 place-items-center rounded-xl bg-success/10 text-success">
          <CheckCircle2 className="size-6" aria-hidden />
        </span>
        <h2 className="mt-4 font-display text-xl font-bold">Message sent</h2>
        <p className="mx-auto mt-2 max-w-md text-muted-foreground">
          Thanks for reaching out. We read every message and will get back to you by email.
        </p>
        <Button className="mt-6" variant="outline" onClick={() => setSubmitted(false)}>
          Send another message
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">
            Name <span className="text-error">*</span>
          </Label>
          <Input
            id="name"
            autoComplete="name"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? 'name-error' : undefined}
            {...register('name')}
          />
          {errors.name && <p id="name-error" className="text-sm text-error">{errors.name.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="contact-email">
            Email <span className="text-error">*</span>
          </Label>
          <Input
            id="contact-email"
            type="email"
            autoComplete="email"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'contact-email-error' : undefined}
            {...register('email')}
          />
          {errors.email && <p id="contact-email-error" className="text-sm text-error">{errors.email.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="subject">Subject</Label>
        <Input id="subject" {...register('subject')} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">
          Message <span className="text-error">*</span>
        </Label>
        <Textarea
          id="message"
          rows={6}
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? 'message-error' : undefined}
          {...register('message')}
        />
        {errors.message && <p id="message-error" className="text-sm text-error">{errors.message.message}</p>}
      </div>

      <Button type="submit" size="lg" disabled={isSubmitting} className="w-full bg-brand text-white hover:bg-brand/90 sm:w-auto">
        {isSubmitting && <Loader2 className="size-4 animate-spin" aria-hidden />}
        {isSubmitting ? 'Sending…' : 'Send message'}
      </Button>
    </form>
  )
}
