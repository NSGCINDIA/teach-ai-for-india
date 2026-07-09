import { z } from 'zod'
import { INVITABLE_ROLES } from '@/lib/auth/roles'
import { sanitizeText } from '@/lib/security/sanitize'

/**
 * A trimmed, control-char-stripped, length-bounded free-text field (issue #11).
 * Sanitizes BEFORE length checks so limits apply to the cleaned value, and so
 * every action that parses through this schema stores normalized input.
 */
function freeText(opts: { min?: number; max: number; requiredMsg?: string; maxMsg?: string }) {
  const min = opts.min ?? 1
  return z
    .string()
    .transform((s) => sanitizeText(s))
    .refine((s) => s.length >= min, { message: opts.requiredMsg ?? 'This field is required' })
    .refine((s) => s.length <= opts.max, { message: opts.maxMsg ?? `Must be ${opts.max} characters or fewer` })
}

export const signInSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})

export const emailSchema = z.object({
  email: z.string().email('Enter a valid email'),
})

export const setPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'At least 8 characters')
      .regex(/[A-Za-z]/, 'Include a letter')
      .regex(/[0-9]/, 'Include a number'),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: 'Passwords do not match',
    path: ['confirm'],
  })

export const signupSchema = z
  .object({
    full_name: freeText({ min: 2, max: 80, requiredMsg: 'Enter your full name', maxMsg: 'That name looks too long' }),
    niat_id: freeText({ min: 1, max: 40, requiredMsg: 'Enter your NIAT ID', maxMsg: 'That NIAT ID looks too long' }),
    phone: z
      .string()
      .trim()
      .regex(/^[+\d][\d\s-]{6,14}$/, 'Enter a valid phone number'),
    campus_id: z.string().uuid('Select your campus'),
    requested_role: z.enum([
      'volunteer', 'volunteer_lead', 'exec_lead', 'outreach_lead', 'campus_lead',
    ], { errorMap: () => ({ message: 'Select a role' }) }),
    email: z.string().email('Enter a valid email'),
    password: z
      .string()
      .min(8, 'At least 8 characters')
      .regex(/[A-Za-z]/, 'Include a letter')
      .regex(/[0-9]/, 'Include a number'),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: 'Passwords do not match',
    path: ['confirm'],
  })

export const inviteSchema = z.object({
  email: z.string().email('Enter a valid email'),
  full_name: freeText({ min: 2, max: 80, requiredMsg: 'Enter a name', maxMsg: 'That name looks too long' }),
  role: z.enum(INVITABLE_ROLES as [string, ...string[]]),
  campus_id: z.string().uuid().optional().or(z.literal('')),
})

export type SignInInput = z.infer<typeof signInSchema>
export type SignupInput = z.infer<typeof signupSchema>
export type SetPasswordInput = z.infer<typeof setPasswordSchema>
export type InviteInput = z.infer<typeof inviteSchema>
