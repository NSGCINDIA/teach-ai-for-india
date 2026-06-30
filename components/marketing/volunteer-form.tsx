'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { submitVolunteerApplication } from '@/app/(public)/actions'

const formSchema = z.object({
  full_name: z.string().trim().min(2, 'Please enter your full name.').max(120),
  email: z.string().trim().email('Please enter a valid email address.').max(160),
  phone: z.string().trim().min(7, 'Please enter a valid phone number.').max(20),
  campus_slug: z.string().trim().optional(),
  motivation: z.string().trim().min(10, 'Tell us a little more (at least 10 characters).').max(2000),
})

type FormValues = z.infer<typeof formSchema>

export interface CampusOption {
  slug: string
  name: string
}

/** Volunteer application form — validated client-side, persisted via server action. */
export function VolunteerForm({ campuses }: { campuses: CampusOption[] }) {
  const [submitted, setSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { full_name: '', email: '', phone: '', campus_slug: '', motivation: '' },
  })

  const campusValue = watch('campus_slug')

  async function onSubmit(values: FormValues) {
    const result = await submitVolunteerApplication({
      ...values,
      campus_slug: values.campus_slug || '',
    })
    if (result.ok) {
      setSubmitted(true)
      reset()
      toast.success('Application received — thank you for stepping up!')
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
        <h2 className="mt-4 font-display text-xl font-bold">You&apos;re on the list</h2>
        <p className="mx-auto mt-2 max-w-md text-muted-foreground">
          Thank you for applying to volunteer. Our team will review your application and reach out by email soon.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button asChild variant="outline">
            <Link href="/">Back home</Link>
          </Button>
          <Button onClick={() => setSubmitted(false)}>Submit another</Button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="full_name">
            Full name <span className="text-error">*</span>
          </Label>
          <Input
            id="full_name"
            autoComplete="name"
            aria-invalid={!!errors.full_name}
            aria-describedby={errors.full_name ? 'full_name-error' : undefined}
            {...register('full_name')}
          />
          {errors.full_name && (
            <p id="full_name-error" className="text-sm text-error">{errors.full_name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">
            Email <span className="text-error">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'email-error' : undefined}
            {...register('email')}
          />
          {errors.email && (
            <p id="email-error" className="text-sm text-error">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">
            Phone <span className="text-error">*</span>
          </Label>
          <Input
            id="phone"
            type="tel"
            autoComplete="tel"
            aria-invalid={!!errors.phone}
            aria-describedby={errors.phone ? 'phone-error' : undefined}
            {...register('phone')}
          />
          {errors.phone && (
            <p id="phone-error" className="text-sm text-error">{errors.phone.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="campus_slug">Preferred campus</Label>
          <Select value={campusValue || ''} onValueChange={(v) => setValue('campus_slug', v)}>
            <SelectTrigger id="campus_slug" className="w-full">
              <SelectValue placeholder={campuses.length ? 'Select a campus' : 'No campuses yet'} />
            </SelectTrigger>
            <SelectContent>
              {campuses.map((c) => (
                <SelectItem key={c.slug} value={c.slug}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="motivation">
          Why do you want to join? <span className="text-error">*</span>
        </Label>
        <Textarea
          id="motivation"
          rows={5}
          placeholder="Tell us what draws you to the mission and what you'd bring to a campus team."
          aria-invalid={!!errors.motivation}
          aria-describedby={errors.motivation ? 'motivation-error' : undefined}
          {...register('motivation')}
        />
        {errors.motivation && (
          <p id="motivation-error" className="text-sm text-error">{errors.motivation.message}</p>
        )}
      </div>

      <Button type="submit" size="lg" disabled={isSubmitting} className="w-full bg-brand text-white hover:bg-brand/90 sm:w-auto">
        {isSubmitting && <Loader2 className="size-4 animate-spin" aria-hidden />}
        {isSubmitting ? 'Submitting…' : 'Submit application'}
      </Button>
    </form>
  )
}
