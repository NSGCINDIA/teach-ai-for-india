import { z } from 'zod'
import { INVITABLE_ROLES } from '@/lib/auth/roles'

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
    full_name: z.string().min(2, 'Enter your full name'),
    niat_id: z.string().min(1, 'Enter your NIAT ID').max(40, 'That NIAT ID looks too long'),
    campus_id: z.string().uuid('Select your campus'),
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
  full_name: z.string().min(2, 'Enter a name'),
  role: z.enum(INVITABLE_ROLES as [string, ...string[]]),
  campus_id: z.string().uuid().optional().or(z.literal('')),
})

export type SignInInput = z.infer<typeof signInSchema>
export type SignupInput = z.infer<typeof signupSchema>
export type SetPasswordInput = z.infer<typeof setPasswordSchema>
export type InviteInput = z.infer<typeof inviteSchema>
